'use client';

import { useState, useEffect, useRef } from 'react';
import { Zap, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { BackgroundPaths } from '@/components/ui/background-paths';

/* ─── Types ─────────────────────────────────────────────────── */
type ScoreLabel = 'HOT' | 'WARM' | 'COLD';
type ScoreResult = { score: number; label: ScoreLabel; reason: string };
type SubmitState =
  | { status: 'idle' }
  | { status: 'sending' }
  | { status: 'sent'; result: ScoreResult }
  | { status: 'error'; message: string };

/* ─── Constants ──────────────────────────────────────────────── */
const PIPELINE = [
  { idx: '01', title: 'Receive',  desc: 'Inquiry hits the API and is parsed for key signals.' },
  { idx: '02', title: 'Qualify',  desc: 'Groq AI scores intent, budget fit, and urgency 0–100.' },
  { idx: '03', title: 'Classify', desc: 'Lead tagged HOT / WARM / COLD and stored in Supabase.' },
  { idx: '04', title: 'Dispatch', desc: 'Make.com fires the right automated reply via Gmail.' },
];

const SCORE_THEME: Record<ScoreLabel, { bar: string; bg: string; border: string }> = {
  HOT:  { bar: '#ef4444', bg: 'rgba(239,68,68,0.07)',  border: 'rgba(239,68,68,0.22)'  },
  WARM: { bar: '#f59e0b', bg: 'rgba(245,158,11,0.07)', border: 'rgba(245,158,11,0.22)' },
  COLD: { bar: '#60a5fa', bg: 'rgba(96,165,250,0.07)', border: 'rgba(96,165,250,0.22)' },
};

const BADGE_VARIANT: Record<ScoreLabel, 'hot' | 'warm' | 'cold'> = {
  HOT: 'hot', WARM: 'warm', COLD: 'cold',
};

/* ─── Component ──────────────────────────────────────────────── */
export default function Home() {
  const formRef = useRef<HTMLElement>(null);

  const [form, setForm] = useState({
    name: '', email: '', businessType: '', budget: '', message: '',
  });
  const [state, setState] = useState<SubmitState>({ status: 'idle' });

  /* Warm the server silently as soon as the page loads.
     Render free tier spins down after inactivity — pinging /api/health
     gives it ~30-60s head-start before the user hits Submit. */
  useEffect(() => {
    fetch('/api/health').catch(() => {});
  }, []);

  function set(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  /* Auto-retry once on failure (handles Render cold-start).
     The retry is silent — the user just sees "Qualifying…" the whole time. */
  async function submit() {
    setState({ status: 'sending' });

    const attempt = async () =>
      fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
        signal: AbortSignal.timeout(14_000),
      });

    let res: Response | null = null;

    try {
      res = await attempt();
    } catch {
      // First attempt failed (cold start timeout) — wait then retry once
      await new Promise(r => setTimeout(r, 1800));
      try {
        res = await attempt();
      } catch {
        setState({ status: 'error', message: 'Server is taking too long. Please try again in a moment.' });
        return;
      }
    }

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.success) {
      // If first attempt returned an error response, silently retry once
      if (res.status >= 500) {
        await new Promise(r => setTimeout(r, 1800));
        try {
          res = await attempt();
          const retryData = await res.json().catch(() => null);
          if (res.ok && retryData?.success) {
            setState({
              status: 'sent',
              result: { score: retryData.score, label: retryData.label, reason: retryData.reason },
            });
            return;
          }
        } catch { /* fall through to error */ }
      }

      setState({
        status: 'error',
        message: data?.error ?? 'Something went wrong. Please try again.',
      });
      return;
    }

    setState({
      status: 'sent',
      result: { score: data.score, label: data.label, reason: data.reason },
    });
  }

  const canSubmit = state.status !== 'sending'
    && form.name.trim() !== ''
    && form.email.trim() !== '';

  return (
    <main className="min-h-screen bg-background text-foreground">

      {/* ── Nav ────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-background/80 px-6 py-4 backdrop-blur-md sm:px-8">
        <span className="flex items-center gap-2.5 font-mono text-sm font-bold tracking-tight">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          SmartLeads
        </span>
        {/* Stack label — shows what it's built with, no admin link visible */}
        <span className="hidden items-center gap-1.5 font-mono text-[10px] text-muted-foreground/40 sm:flex">
          Next.js · Groq · Supabase · Make.com
        </span>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative flex min-h-[56vh] items-center justify-center overflow-hidden px-6 pb-16 pt-20">
        <BackgroundPaths />

        {/* Radial glow */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
          <div
            className="h-96 w-96 rounded-full opacity-[0.18] blur-3xl"
            style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)' }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
          >
            <Badge className="mb-6 gap-2">
              <Bot className="h-3 w-3" />
              AI-powered lead qualification
            </Badge>

            <h1 className="mb-5 font-display text-4xl font-bold leading-[1.07] tracking-tight sm:text-5xl lg:text-[3.5rem]">
              Every inquiry scored
              <br />
              <span
                style={{
                  background: 'linear-gradient(135deg, #a78bfa 0%, #818cf8 50%, #c4b5fd 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                in under ten seconds.
              </span>
            </h1>

            <p className="mx-auto max-w-md text-base leading-relaxed text-muted-foreground">
              SmartLeads reads an incoming project inquiry, scores the lead
              against intent, budget, and urgency, then fires the right
              automated reply — no human in the loop.
            </p>
          </motion.div>

          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.4 }}
            onClick={() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="mt-8 inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-accent"
          >
            see it live <span className="animate-bounce">↓</span>
          </motion.button>
        </div>
      </section>

      {/* ── Pipeline ───────────────────────────────────────────── */}
      <section className="mx-auto max-w-4xl px-6 pb-12">
        <div className="grid grid-cols-1 gap-px rounded-xl border border-border bg-border sm:grid-cols-4">
          {PIPELINE.map((step, i) => (
            <motion.div
              key={step.idx}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="flex flex-col gap-2.5 bg-background p-5
                first:rounded-tl-xl first:rounded-bl-xl
                last:rounded-tr-xl  last:rounded-br-xl
                sm:first:rounded-l-xl sm:first:rounded-bl-xl
                sm:last:rounded-r-xl  sm:last:rounded-br-xl"
            >
              <span className="font-mono text-xs font-semibold text-accent/60">{step.idx}</span>
              <span className="font-mono text-sm font-bold text-foreground">{step.title}</span>
              <span className="text-xs leading-relaxed text-muted-foreground">{step.desc}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Form ───────────────────────────────────────────────── */}
      <section ref={formRef} className="mx-auto max-w-lg scroll-mt-20 px-6 pb-28 pt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="overflow-hidden rounded-xl border border-border bg-card"
        >
          {/* Code-editor chrome */}
          <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2.5">
            <span className="font-mono text-xs text-muted-foreground/35">live_demo.tsx</span>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-border" />
              <span className="h-2.5 w-2.5 rounded-full bg-border" />
              <span className="h-2.5 w-2.5 rounded-full bg-accent/30" />
            </div>
          </div>

          <div className="p-6">
            <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
              Submit a real inquiry. The engine scores it live and shows its
              reasoning below.
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" name="name" type="text"
                  placeholder="Jane Okafor" value={form.name} onChange={set} autoComplete="off" />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email address</Label>
                <Input id="email" name="email" type="email"
                  placeholder="jane@company.com" value={form.email} onChange={set} autoComplete="off" />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="businessType">Business type</Label>
                <Select id="businessType" name="businessType" value={form.businessType} onChange={set}>
                  <option value="">— select —</option>
                  <option>E-commerce Store</option>
                  <option>SaaS / Software</option>
                  <option>Agency / Consultancy</option>
                  <option>Real Estate</option>
                  <option>Healthcare</option>
                  <option>Other</option>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="budget">Budget range</Label>
                <Select id="budget" name="budget" value={form.budget} onChange={set}>
                  <option value="">— select —</option>
                  <option>Under $100</option>
                  <option>$100 – $500</option>
                  <option>$500 – $1,000</option>
                  <option>$1,000 – $5,000</option>
                  <option>$5,000+</option>
                </Select>
              </div>

              <div className="col-span-full flex flex-col gap-2">
                <Label htmlFor="message">Project description</Label>
                <Textarea id="message" name="message"
                  placeholder="Describe what you're trying to build or solve…"
                  value={form.message} onChange={set} rows={3} />
                <p className="text-xs text-muted-foreground/45">
                  More detail → more accurate score.
                </p>
              </div>
            </div>

            {/* Submit + result */}
            <div className="mt-5 flex flex-col gap-3">
              <Button type="button" size="lg" className="w-full"
                disabled={!canSubmit} onClick={submit}>
                {state.status === 'sending' ? (
                  <>
                    <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Qualifying…
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Run qualification
                  </>
                )}
              </Button>

              <AnimatePresence mode="wait">
                {state.status === 'sent' && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 10, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0,  scale: 1 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.32, ease: 'easeOut' }}
                    role="status"
                    style={{
                      background: SCORE_THEME[state.result.label].bg,
                      border: `1px solid ${SCORE_THEME[state.result.label].border}`,
                    }}
                    className="rounded-lg px-4 py-3.5"
                  >
                    <div className="flex items-center justify-between gap-3 font-mono text-sm">
                      <span className="text-muted-foreground">LEAD_SCORE</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">
                          {state.result.score}
                          <span className="text-xs font-normal text-muted-foreground">/100</span>
                        </span>
                        <Badge variant={BADGE_VARIANT[state.result.label]}>
                          {state.result.label}
                        </Badge>
                      </div>
                    </div>

                    {/* Animated score bar */}
                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-border">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: SCORE_THEME[state.result.label].bar }}
                        initial={{ width: 0 }}
                        animate={{ width: `${state.result.score}%` }}
                        transition={{ duration: 1.1, ease: 'easeOut', delay: 0.12 }}
                      />
                    </div>

                    <p className="mt-2.5 font-mono text-xs leading-relaxed text-muted-foreground">
                      <span className="text-muted-foreground/40">// </span>
                      {state.result.reason}
                    </p>
                  </motion.div>
                )}

                {state.status === 'error' && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    role="alert"
                    className="rounded-lg border border-destructive/25 bg-destructive/10 px-4 py-3"
                  >
                    <div className="flex items-center gap-2 font-mono text-sm text-destructive">
                      <span className="text-xs">●</span> inquiry.failed
                    </div>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      // {state.message}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <p className="text-center font-mono text-[10px] text-muted-foreground/30">
                no spam · no sales calls · automated reply only
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-border py-8 text-center">
        <p className="font-mono text-[10px] text-muted-foreground/30">
          Built with Next.js · TypeScript · Supabase · Groq AI · Make.com
        </p>
      </footer>

    </main>
  );
}
