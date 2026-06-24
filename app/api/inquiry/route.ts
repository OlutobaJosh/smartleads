import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

type Inquiry = {
  name: string;
  email: string;
  businessType: string;
  budget: string;
  message: string;
};

type ScoreResult = {
  score: number;
  label: 'HOT' | 'WARM' | 'COLD';
  reason: string;
};

const SYSTEM_PROMPT = `You are a B2B lead-qualification engine. Given a business inquiry, return a JSON object scoring how promising the lead is.

Score 0-100 based on:
- Budget signal (higher budget range = higher score)
- Clarity and specificity of the project description (vague = lower score)
- Urgency or buying-intent language in the message
- Business type fit for a freelance/agency dev or automation service

Respond with ONLY a JSON object of this exact shape, no other text:
{"score": <integer 0-100>, "label": "HOT" | "WARM" | "COLD", "reason": "<one short sentence, under 18 words, explaining the score>"}

Label thresholds: score >= 70 is HOT, 40-69 is WARM, below 40 is COLD.`;

async function scoreInquiry(inquiry: Inquiry): Promise<ScoreResult> {
  const userPrompt = `Business type: ${inquiry.businessType || 'Not specified'}
Budget range: ${inquiry.budget || 'Not specified'}
Project description: ${inquiry.message || 'Not specified'}`;

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'openai/gpt-oss-120b',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_completion_tokens: 200,
      response_format: { type: 'json_object' },
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Groq API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const raw = data?.choices?.[0]?.message?.content;
  if (!raw) throw new Error('Groq returned no content');

  const parsed = JSON.parse(raw);

  const score = Math.max(0, Math.min(100, Math.round(Number(parsed.score))));
  const label: ScoreResult['label'] =
    score >= 70 ? 'HOT' : score >= 40 ? 'WARM' : 'COLD';

  return {
    score: Number.isFinite(score) ? score : 0,
    label,
    reason: typeof parsed.reason === 'string' ? parsed.reason : 'Scored by automated review.',
  };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, businessType, budget, message } = body as Inquiry;

  if (!name || !email) {
    return NextResponse.json(
      { error: 'name and email are required' },
      { status: 400 }
    );
  }

  if (!EMAIL_RE.test(email.trim())) {
    return NextResponse.json(
      { error: 'A valid email address is required' },
      { status: 400 }
    );
  }

  let result: ScoreResult;
  try {
    result = await scoreInquiry({ name, email, businessType, budget, message });
  } catch (err) {
    console.error('Scoring failed:', err);
    return NextResponse.json(
      { error: 'Scoring failed. Please try again shortly.' },
      { status: 502 }
    );
  }

  // Log the lead to Supabase (awaited so failures are visible in server
  // logs rather than silently dropped).
  let leadId: string | null = null;
  try {
    const { data: inserted, error } = await supabase
      .from('inquiries')
      .insert({
        name,
        email,
        business_type: businessType,
        budget,
        message,
        ai_score: result.score,
        ai_summary: result.reason,
        priority: result.label,
        status: 'new',
        ai_email_sent: 'false',
      })
      .select('id')
      .single();

    if (error) throw error;
    leadId = inserted?.id ?? null;
  } catch (err) {
    console.error('Supabase insert failed:', err);
  }

  // Notify Make.com for downstream automation (CRM, email, etc).
  // Failures here should not block the response to the user.
  let webhookOk = false;
  try {
    if (process.env.MAKE_WEBHOOK_URL) {
      const webhookRes = await fetch(process.env.MAKE_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          businessType,
          budget,
          message,
          score: result.score,
          label: result.label,
          reason: result.reason,
        }),
      });
      webhookOk = webhookRes.ok;
    }
  } catch (err) {
    console.error('Make.com webhook failed:', err);
  }

  // Reflect whether the automated reply was actually dispatched.
  if (leadId) {
    try {
      await supabase
        .from('inquiries')
        .update({ ai_email_sent: webhookOk ? 'true' : 'false' })
        .eq('id', leadId);
    } catch (err) {
      console.error('Supabase ai_email_sent update failed:', err);
    }
  }

  return NextResponse.json({
    success: true,
    score: result.score,
    label: result.label,
    reason: result.reason,
  });
}
