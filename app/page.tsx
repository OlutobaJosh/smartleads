'use client';

import { useState, useEffect, useRef } from 'react';
import { Zap, Inbox, Cpu, Tag, Send, ArrowRight, Github, Linkedin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

import { Button }           from '@/components/ui/button';
import { Badge }            from '@/components/ui/badge';
import { Input }            from '@/components/ui/input';
import { Textarea }         from '@/components/ui/textarea';
import { Label }            from '@/components/ui/label';
import { WovenHeroSection } from '@/components/ui/woven-hero';
import { CustomSelect }     from '@/components/ui/custom-select';
import { FloatingPaths }    from '@/components/ui/background-paths';

/* ─── Types ──────────────────────────────────────────────────── */
type ScoreLabel = 'HOT' | 'WARM' | 'COLD';
type ScoreResult = { score: number; label: ScoreLabel; reason: string };
type SubmitState =
  | { status: 'idle' }
  | { status: 'sending' }
  | { status: 'sent'; result: ScoreResult }
  | { status: 'error'; message: string };

/* ─── Constants ──────────────────────────────────────────────── */
const PIPELINE: { idx: string; title: string; desc: string; Icon: LucideIcon }[] = [
  { idx: '01', title: 'Receive',  desc: 'Inquiry hits the API and is parsed for key signals.',          Icon: Inbox },
  { idx: '02', title: 'Qualify',  desc: 'Groq AI scores intent, budget fit, and urgency 0–100.',       Icon: Cpu   },
  { idx: '03', title: 'Classify', desc: 'Lead tagged HOT / WARM / COLD and stored in Supabase.',       Icon: Tag   },
  { idx: '04', title: 'Dispatch', desc: 'Make.com fires the right automated reply via Gmail.',         Icon: Send  },
];

const SCORE_THEME: Record<ScoreLabel, { bar: string; bg: string; border: string }> = {
  HOT:  { bar: '#ef4444', bg: 'rgba(239,68,68,0.06)',  border: 'rgba(239,68,68,0.18)'  },
  WARM: { bar: '#f59e0b', bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.18)' },
  COLD: { bar: '#525252', bg: 'rgba(82,82,82,0.06)',   border: 'rgba(82,82,82,0.18)'   },
};

const BADGE_VARIANT: Record<ScoreLabel, 'hot' | 'warm' | 'cold'> = {
  HOT: 'hot', WARM: 'warm', COLD: 'cold',
};

const BUSINESS_OPTIONS = [
  { label: 'E-commerce Store',     value: 'E-commerce Store'     },
  { label: 'SaaS / Software',      value: 'SaaS / Software'      },
  { label: 'Agency / Consultancy', value: 'Agency / Consultancy' },
  { label: 'Real Estate',          value: 'Real Estate'          },
  { label: 'Healthcare',           value: 'Healthcare'           },
  { label: 'Other',                value: 'Other'                },
];

const BUDGET_OPTIONS = [
  { label: 'Under $100',      value: 'Under $100'      },
  { label: '$100 – $500',     value: '$100 – $500'     },
  { label: '$500 – $1,000',   value: '$500 – $1,000'   },
  { label: '$1,000 – $5,000', value: '$1,000 – $5,000' },
  { label: '$5,000+',         value: '$5,000+'         },
];

/* ─── Page ───────────────────────────────────────────────────── */
export default function Home() {
  const formRef = useRef<HTMLElement>(null);

  const [form, setForm] = useState({
    name: '', email: '', businessType: '', budget: '', message: '',
  });
  const [state, setState] = useState<SubmitState>({ status: 'idle' });

  useEffect(() => { fetch('/api/health').catch(() => {}); }, []);

  function set(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  function setField(field: 'businessType' | 'budget', value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function submit() {
    setState({ status: 'sending' });
    const attempt = () => fetch('/api/inquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
      signal: AbortSignal.timeout(14_000),
    });

    let res: Response | null = null;
    try {
      res = await attempt();
    } catch {
      await new Promise(r => setTimeout(r, 1800));
      try { res = await attempt(); } catch {
        setState({ status: 'error', message: 'Server is warming up — please try again in a moment.' });
        return;
      }
    }

    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.success) {
      if (res.status >= 500) {
        await new Promise(r => setTimeout(r, 1800));
        try {
          const r2 = await attempt();
          const d2 = await r2.json().catch(() => null);
          if (r2.ok && d2?.success) {
            setState({ status: 'sent', result: { score: d2.score, label: d2.label, reason: d2.reason } });
            return;
          }
        } catch { /* fall through */ }
      }
      setState({ status: 'error', message: data?.error ?? 'Something went wrong. Please try again.' });
      return;
    }
    setState({ status: 'sent', result: { score: data.score, label: data.label, reason: data.reason } });
  }

  const canSubmit = state.status !== 'sending' && form.name.trim() !== '' && form.email.trim() !== '';

  return (
    <main className="min-h-screen bg-background text-foreground">

      {/* ── Nav ──────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-white/8 bg-black/90 px-6 py-4 backdrop-blur-md sm:px-8">
        <span className="flex items-center gap-2.5 font-mono text-sm font-bold tracking-tight text-white">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-50" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
          </span>
          SmartLeads
        </span>
        <span className="hidden items-center gap-1.5 font-mono text-[10px] text-white/25 sm:flex">
          Next.js · Groq · Supabase · Make.com
        </span>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <WovenHeroSection
        onScrollToForm={() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
      />

      {/* ── Pipeline — redesigned with icons + hover effects ── */}
      <section className="bg-white px-6 pb-20 pt-16">
        <div className="mx-auto max-w-5xl">

          {/* Section label */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="mb-12 text-center"
          >
            <p className="mb-3 font-mono text-xs uppercase tracking-widest text-zinc-400">
              How it works
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
              Four steps. Zero delay.
            </h2>
          </motion.div>

          {/* Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PIPELINE.map((step, i) => (
              <motion.div
                key={step.idx}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="group relative overflow-hidden rounded-2xl border border-black/8 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/8 hover:border-black/15"
              >
                {/* Large ghost number — background element */}
                <span
                  className="pointer-events-none absolute -bottom-2 -right-1 select-none font-black leading-none text-black/[0.045] transition-all duration-300 group-hover:text-black/[0.08]"
                  style={{ fontSize: '6rem' }}
                >
                  {step.idx}
                </span>

                {/* Icon container — fills black on hover */}
                <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl border border-black/8 bg-zinc-50 transition-all duration-300 group-hover:bg-zinc-900 group-hover:border-zinc-900 group-hover:shadow-md">
                  <step.Icon className="h-4 w-4 text-zinc-500 transition-colors duration-300 group-hover:text-white" />
                </div>

                <h3 className="mb-2 font-mono text-sm font-bold text-zinc-900">{step.title}</h3>
                <p className="text-[13px] leading-relaxed text-zinc-500">{step.desc}</p>

                {/* Bottom accent line — sweeps in on hover */}
                <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-zinc-900 transition-all duration-500 group-hover:w-full" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section divider — white to light gray ────────────── */}
      <div className="h-px bg-gradient-to-r from-transparent via-black/8 to-transparent" />

      {/* ── Form section ─────────────────────────────────────── */}
      <section
        ref={formRef}
        className="relative scroll-mt-0 overflow-hidden bg-zinc-50 pb-28 pt-16"
      >
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />

        <div className="relative z-10 mx-auto max-w-lg px-6">

          {/* Section intro */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="mb-8 text-center"
          >
            <p className="mb-2 font-mono text-xs uppercase tracking-widest text-zinc-400">
              Live demo
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
              Try it right now.
            </h2>
          </motion.div>

          {/* Form card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="overflow-hidden rounded-2xl border border-black/8 bg-white shadow-2xl shadow-black/6"
          >
            {/* Editor chrome */}
            <div className="flex items-center justify-between border-b border-black/6 bg-zinc-50/80 px-4 py-2.5">
              <span className="font-mono text-xs text-zinc-400">live_demo.tsx</span>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-zinc-200" />
                <span className="h-2.5 w-2.5 rounded-full bg-zinc-200" />
                <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
              </div>
            </div>

            <div className="p-6">
              <p className="mb-6 text-sm leading-relaxed text-zinc-500">
                Submit a real inquiry. The engine scores it live and shows its
                reasoning below.
              </p>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div className="flex flex-col gap-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" name="name" type="text" placeholder="Jane Okafor"
                    value={form.name} onChange={set} autoComplete="off" />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input id="email" name="email" type="email" placeholder="jane@company.com"
                    value={form.email} onChange={set} autoComplete="off" />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="businessType">Business type</Label>
                  <CustomSelect id="businessType" value={form.businessType}
                    onChange={val => setField('businessType', val)} options={BUSINESS_OPTIONS} />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="budget">Budget range</Label>
                  <CustomSelect id="budget" value={form.budget}
                    onChange={val => setField('budget', val)} options={BUDGET_OPTIONS} />
                </div>

                <div className="col-span-full flex flex-col gap-2">
                  <Label htmlFor="message">Project description</Label>
                  <Textarea id="message" name="message"
                    placeholder="Describe what you're trying to build or solve…"
                    value={form.message} onChange={set} rows={3} />
                  <p className="text-xs text-zinc-400">More detail → more accurate score.</p>
                </div>

              </div>

              <div className="mt-5 flex flex-col gap-3">
                <Button type="button" size="lg" className="w-full" disabled={!canSubmit} onClick={submit}>
                  {state.status === 'sending' ? (
                    <>
                      <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Qualifying…
                    </>
                  ) : (
                    <><Zap className="h-4 w-4" /> Run qualification</>
                  )}
                </Button>

                <AnimatePresence mode="wait">
                  {state.status === 'sent' && (
                    <motion.div key="result"
                      initial={{ opacity: 0, y: 10, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.32, ease: 'easeOut' }}
                      role="status"
                      style={{ background: SCORE_THEME[state.result.label].bg, border: `1px solid ${SCORE_THEME[state.result.label].border}` }}
                      className="rounded-xl px-4 py-3.5"
                    >
                      <div className="flex items-center justify-between gap-3 font-mono text-sm">
                        <span className="text-zinc-500">LEAD_SCORE</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-zinc-900">
                            {state.result.score}
                            <span className="text-xs font-normal text-zinc-400">/100</span>
                          </span>
                          <Badge variant={BADGE_VARIANT[state.result.label]}>{state.result.label}</Badge>
                        </div>
                      </div>
                      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-black/8">
                        <motion.div className="h-full rounded-full"
                          style={{ background: SCORE_THEME[state.result.label].bar }}
                          initial={{ width: 0 }}
                          animate={{ width: `${state.result.score}%` }}
                          transition={{ duration: 1.1, ease: 'easeOut', delay: 0.12 }}
                        />
                      </div>
                      <p className="mt-2.5 font-mono text-xs leading-relaxed text-zinc-500">
                        <span className="text-zinc-300">// </span>{state.result.reason}
                      </p>
                    </motion.div>
                  )}

                  {state.status === 'error' && (
                    <motion.div key="error"
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3"
                    >
                      <div className="flex items-center gap-2 font-mono text-sm text-red-600">
                        <span className="text-xs">●</span> inquiry.failed
                      </div>
                      <p className="mt-1 font-mono text-xs text-zinc-500">// {state.message}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <p className="text-center font-mono text-[10px] text-zinc-300">
                  no spam · no sales calls · automated reply only
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer — black bookend matching the hero ──────────── */}
      <footer className="bg-black text-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">

            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="mb-4 flex items-center gap-2.5">
                <span className="relative flex h-2 w-2">
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                </span>
                <span className="font-mono text-sm font-bold text-white">SmartLeads</span>
              </div>
              <p className="max-w-xs text-sm leading-relaxed text-zinc-500">
                AI-powered lead qualification engine. Score every inquiry
                before it goes cold.
              </p>
              {/* Social links — replace # with your actual URLs */}
              <div className="mt-6 flex items-center gap-3">
                <a href="#" aria-label="GitHub"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-zinc-500 transition-all hover:border-white/25 hover:text-white">
                  <Github className="h-3.5 w-3.5" />
                </a>
                <a href="#" aria-label="LinkedIn"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-zinc-500 transition-all hover:border-white/25 hover:text-white">
                  <Linkedin className="h-3.5 w-3.5" />
                </a>
                <a href="#" aria-label="Upwork"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 transition-all hover:border-white/25">
                  <span className="font-mono text-[10px] font-bold text-zinc-500 transition-colors hover:text-white">UP</span>
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="mb-5 font-mono text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
                Product
              </h4>
              <ul className="space-y-3">
                {[
                  { label: 'How it works', href: '#' },
                  { label: 'Live demo', href: '#' },
                  { label: 'Admin login', href: '/admin/login' },
                ].map(l => (
                  <li key={l.label}>
                    <a href={l.href}
                      className="group flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-white">
                      {l.label}
                      <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Stack */}
            <div>
              <h4 className="mb-5 font-mono text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
                Built with
              </h4>
              <ul className="space-y-3">
                {['Next.js 15', 'TypeScript', 'Groq AI', 'Supabase', 'Make.com'].map(s => (
                  <li key={s} className="text-sm text-zinc-500">{s}</li>
                ))}
              </ul>
            </div>

            {/* Developer */}
            <div>
              <h4 className="mb-5 font-mono text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
                Developer
              </h4>
              <ul className="space-y-3">
                {[
                  { label: 'Upwork Profile', href: 'https://www.upwork.com/freelancers/joshuaasiribo' },
                  { label: 'Portfolio', href: '#' },
                ].map(l => (
                  <li key={l.label}>
                    <a href={l.href} target="_blank" rel="noopener noreferrer"
                      className="group flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-white">
                      {l.label}
                      <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Bottom bar */}
          <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/6 pt-8 sm:flex-row">
            <p className="font-mono text-xs text-zinc-700">
              © {new Date().getFullYear()} SmartLeads. All rights reserved.
            </p>
            <p className="font-mono text-xs text-zinc-700">
              {/* Replace with your name */}
              Built by Joshua Asiribo
            </p>
          </div>
        </div>
      </footer>

    </main>
  );
}
