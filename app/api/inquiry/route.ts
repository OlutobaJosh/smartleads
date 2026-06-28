import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/* ─── Email templates — generated server-side ────────────────── */
// These match exactly what Make.com sends so the UI preview is accurate.
function buildEmailPreview(name: string, label: string) {
  const first = name.trim().split(' ')[0] || name;

  const templates: Record<string, { subject: string; body: string }> = {
    HOT: {
      subject: 'Re: Your project inquiry',
      body: [
        `Hi ${first},`,
        '',
        `Thanks for reaching out — I've reviewed your inquiry and I'm genuinely interested.`,
        '',
        `Your project sounds like a strong fit for what I do. I'd love to set up a quick call to discuss the details and see how I can help.`,
        '',
        `What does your availability look like this week?`,
        '',
        `Joshua Asiribo`,
        `https://joshua-asiribo.vercel.app`,
      ].join('\n'),
    },
    WARM: {
      subject: 'Re: Your project inquiry',
      body: [
        `Hi ${first},`,
        '',
        `Thanks for getting in touch. I've had a look at your inquiry — there's definitely something interesting here.`,
        '',
        `I'd like to learn a bit more before we dive in. Could you share more about your timeline and what success looks like for this project?`,
        '',
        `Looking forward to hearing from you.`,
        '',
        `Joshua Asiribo`,
        `https://joshua-asiribo.vercel.app`,
      ].join('\n'),
    },
    COLD: {
      subject: 'Re: Your project inquiry',
      body: [
        `Hi ${first},`,
        '',
        `Thanks for reaching out. After reviewing your inquiry, I don't think I'm the right fit for this particular project right now.`,
        '',
        `I wish you all the best finding the right person for it.`,
        '',
        `Joshua Asiribo`,
      ].join('\n'),
    },
  };

  return templates[label] ?? templates.COLD;
}

/* ─── POST /api/inquiry ──────────────────────────────────────── */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, businessType, budget, message } = body;

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json(
        { error: 'Name and email are required.' },
        { status: 400 }
      );
    }

    /* ── Score with Groq ──────────────────────────────────── */
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: `You are a lead qualification AI for a freelance web developer.
Score the following client inquiry from 0 to 100 based on three signals:
1. Intent clarity — how specific and serious is the request?
2. Budget fit — does the budget match professional web development rates?
3. Urgency — is there a timeline or sense of urgency?

Return ONLY valid JSON, no markdown, no explanation outside the JSON:
{"score": <number 0-100>, "label": "<HOT|WARM|COLD>", "reason": "<one clear sentence explaining the score>"}

HOT = score >= 70 (clear intent, reasonable budget, urgent)
WARM = score 40-69 (some signals but missing details)
COLD = score < 40 (vague, very low budget, or not a good fit)`,
        },
        {
          role: 'user',
          content: `Name: ${name}
Email: ${email}
Business type: ${businessType || 'Not specified'}
Budget: ${budget || 'Not specified'}
Project description: ${message || 'No description provided'}`,
        },
      ],
      temperature: 0.2,
      max_tokens: 200,
    });

    const raw = completion.choices[0]?.message?.content ?? '';

    let result = {
      score: 0,
      label: 'COLD',
      reason: 'Unable to parse AI response.',
    };

    try {
      const clean = raw.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);
      result = {
        score: Number(parsed.score) || 0,
        label: parsed.label ?? 'COLD',
        reason: parsed.reason ?? 'No reason provided.',
      };
    } catch {
      // Keep defaults — don't break the response
    }

    /* ── Save to Supabase ─────────────────────────────────── */
    await supabase.from('inquiries').insert({
      name,
      email,
      business_type: businessType || null,
      budget: budget || null,
      message: message || null,
      ai_score: result.score,
      ai_summary: result.reason,
      priority: result.label,
      status: 'new',
      ai_email_sent: 'false',
    });

    /* ── Fire Make.com webhook (non-blocking) ─────────────── */
    if (process.env.MAKE_WEBHOOK_URL) {
      fetch(process.env.MAKE_WEBHOOK_URL, {
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
      })
        .then(async (webhookRes) => {
          if (webhookRes.ok) {
            await supabase
              .from('inquiries')
              .update({ ai_email_sent: 'true' })
              .eq('email', email)
              .order('created_at', { ascending: false })
              .limit(1);
          }
        })
        .catch(() => {
          // Webhook failure is silent — don't break the user experience
        });
    }

    /* ── Build email preview for on-page display ──────────── */
    // This lets the UI show exactly what email was sent regardless of
    // whether it lands in inbox or spam — the demo works either way.
    const emailPreview = buildEmailPreview(name, result.label);

    return NextResponse.json({
      success: true,
      score: result.score,
      label: result.label,
      reason: result.reason,
      emailPreview,
    });
  } catch (error) {
    console.error('[inquiry] error:', error);
    return NextResponse.json(
      { error: 'Something went wrong on our end. Please try again.' },
      { status: 500 }
    );
  }
}
