'use client';

import { useState, useEffect, useRef } from 'react';
import { Zap, Inbox, Cpu, Tag, Send, ExternalLink, Mail } from 'lucide-react';
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
type EmailPreview = { subject: string; body: string };
type SubmitState =
  | { status: 'idle' }
  | { status: 'sending' }
  | { status: 'sent'; result: ScoreResult; email: string; emailPreview: EmailPreview }
  | { status: 'error'; message: string };

/* ─── Constants ──────────────────────────────────────────────── */
const PIPELINE: { idx: string; title: string; desc: string; Icon: LucideIcon }[] = [
  { idx: '01', title: 'Receive',  desc: 'A potential client fills out your contact form. SmartLeads captures every detail instantly.', Icon: Inbox },
  { idx: '02', title: 'Qualify',  desc: 'Groq AI reads the message and scores intent, budget fit, and urgency from 0 to 100.',          Icon: Cpu   },
  { idx: '03', title: 'Classify', desc: 'Scored ≥70 = HOT · 40–69 = WARM · <40 = COLD. Logged to your private dashboard.',            Icon: Tag   },
  { idx: '04', title: 'Dispatch', desc: 'The right reply fires via Gmail through Make.com — under 10 seconds from first contact.',     Icon: Send  },
];

const SCORE_THEME: Record<ScoreLabel, { bar: string; bg: string; border: string }> = {
  HOT:  { bar: '#ef4444', bg: 'rgba(239,68,68,0.06)',   border: 'rgba(239,68,68,0.2)'   },
  WARM: { bar: '#f59e0b', bg: 'rgba(245,158,11,0.06)',  border: 'rgba(245,158,11,0.2)'  },
  COLD: { bar: '#71717a', bg: 'rgba(113,113,122,0.06)', border: 'rgba(113,113,122,0.2)' },
};

const LABEL_COPY: Record<ScoreLabel, { emoji: string; headline: string; detail: string }> = {
  HOT:  { emoji: '🔴', headline: 'Priority reply sent.',  detail: 'Scored ≥70 — a high-priority reply was sent to move things forward fast.'      },
  WARM: { emoji: '🟡', headline: 'Nurture email sent.',   detail: 'Scored 40–69 — a follow-up email keeps you warm without over-committing.'      },
  COLD: { emoji: '⚪', headline: 'Polite decline sent.',  detail: 'Scored below 40 — a respectful no was sent so you can focus on better leads.'  },
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

const SOCIALS = [
  { label: 'Upwork',    href: 'https://www.upwork.com/freelancers/~01119b32ca7911f5c3?mp_source=share' },
  { label: 'GitHub',    href: 'https://github.com/olutobajosh'                                         },
  { label: 'LinkedIn',  href: 'https://linkedin.com/in/joshuaasiribo'                                  },
  { label: 'Portfolio', href: 'https://joshua-asiribo.vercel.app/'                                     },
];

/* ─── Page ───────────────────────────────────────────────────── */
export default function Home() {
  const formRef = useRef<HTMLElement>(null);
  const [form, setForm] = useState({ name: '', email: '', businessType: '', budget: '', message: '' });
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
    try { res = await attempt(); }
    catch {
      await new Promise(r => setTimeout(r, 1800));
      try { res = await attempt(); }
      catch {
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
            setState({
              status: 'sent',
              email: form.email,
              result: { score: d2.score, label: d2.label, reason: d2.reason },
              emailPreview: d2.emailPreview ?? { subject: 'Re: Your project inquiry', body: '' },
            });
            return;
          }
        } catch { /* fall through */ }
      }
      setState({ status: 'error', message: data?.error ?? 'Something went wrong. Please try again.' });
      return;
    }

    setState({
      status: 'sent',
      email: form.email,
      result: { score: data.score, label: data.label, reason: data.reason },
      emailPreview: data.emailPreview ?? { subject: 'Re: Your project inquiry', body: '' },
    });
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

      {/* ── Pipeline ─────────────────────────────────────────── */}
      <section className="bg-white px-6 pb-28 pt-20">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.4 }}
            className="mb-16 text-center"
          >
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">How it works</p>
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">Four steps. Zero delay.</h2>
            <p className="mx-auto mt-3 max-w-sm text-sm text-zinc-500">
              From first contact to automated reply in under 10 seconds — no manual input from you.
            </p>
          </motion.div>

          <div className="relative">
            <motion.div
              className="pointer-events-none absolute hidden h-px lg:block"
              style={{ top: 44, left: '12.5%', right: '12.5%', background: 'linear-gradient(to right, transparent, rgba(0,0,0,0.08) 15%, rgba(0,0,0,0.08) 85%, transparent)' }}
              initial={{ scaleX: 0, originX: 0 }} whileInView={{ scaleX: 1 }}
              viewport={{ once: true }} transition={{ duration: 1.6, ease: 'easeOut', delay: 0.1 }}
            />
            {[0.125, 0.375, 0.625, 0.875].map((pos, i) => (
              <motion.div key={i}
                className="pointer-events-none absolute hidden h-2 w-2 rounded-full border border-black/12 bg-white shadow-sm lg:block"
                style={{ top: 36, left: `${pos * 100}%`, transform: 'translateX(-50%)' }}
                initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }}
                transition={{ delay: i * 0.18 + 0.6, type: 'spring', stiffness: 400, damping: 18 }}
              />
            ))}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {PIPELINE.map((step, i) => (
                <motion.div key={step.idx} className="group cursor-pointer"
                  animate={{ y: [0, -9, 0] }}
                  transition={{ duration: 3 + i * 0.35, repeat: Infinity, ease: 'easeInOut', delay: i * 0.55 + 0.75 }}
                  whileHover={{ y: -20, scale: 1.04, transition: { duration: 0.22, ease: 'easeOut' } }}
                  style={{ willChange: 'transform' }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-20px' }}
                    transition={{ delay: i * 0.12, duration: 0.55, ease: [0.21, 1.02, 0.73, 1] }}
                    className="relative overflow-hidden rounded-2xl border border-black/[0.06] bg-white p-6 transition-shadow duration-300 group-hover:shadow-[0_24px_60px_rgba(0,0,0,0.13),_0_6px_14px_rgba(0,0,0,0.07)]"
                    style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.07), 0 1px 5px rgba(0,0,0,0.04)' }}
                  >
                    <span className="pointer-events-none absolute -bottom-2 -right-1 select-none font-black leading-none text-black/[0.04] transition-all duration-500 group-hover:text-black/[0.08]"
                      style={{ fontSize: '6rem' }} aria-hidden>{step.idx}</span>
                    <div className="relative mb-5 inline-flex">
                      <motion.div className="absolute inset-0 rounded-xl border border-black/18"
                        initial={{ scale: 1, opacity: 0 }}
                        whileInView={{ scale: [1, 2.3, 3.4], opacity: [0.45, 0.15, 0] }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.22 + 0.75, duration: 0.95, ease: 'easeOut' }}
                      />
                      <motion.div
                        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-black/8 bg-zinc-50 transition-all duration-300 group-hover:border-zinc-900 group-hover:bg-zinc-900"
                        initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }}
                        transition={{ delay: i * 0.12 + 0.25, type: 'spring', stiffness: 320, damping: 14 }}
                      >
                        <step.Icon className="h-4 w-4 text-zinc-500 transition-colors duration-300 group-hover:text-white" />
                      </motion.div>
                    </div>
                    <h3 className="mb-2 font-mono text-sm font-bold text-zinc-900">{step.title}</h3>
                    <p className="text-[13px] leading-relaxed text-zinc-500">{step.desc}</p>
                    <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-zinc-900 transition-all duration-500 group-hover:w-full" />
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-black/8 to-transparent" />

      {/* ── Form section ─────────────────────────────────────── */}
      <section ref={formRef} className="relative scroll-mt-0 overflow-hidden bg-zinc-50 pb-28 pt-16">
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />

        <div className="relative z-10 mx-auto max-w-lg px-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.4 }}
            className="mb-8 text-center"
          >
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">Live demo</p>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Try it yourself.</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-500">
              Act like a potential client reaching out — use your real email to receive the automated reply.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.5, delay: 0.1 }}
            className="overflow-hidden rounded-2xl border border-black/[0.06] bg-zinc-100"
            style={{ boxShadow: '0 12px 48px rgba(0,0,0,0.1), 0 3px 10px rgba(0,0,0,0.06)' }}
          >
            <div className="p-7">
              <p className="mb-6 text-sm leading-relaxed text-zinc-500">
                Fill in your details as if you were enquiring about a project.
                SmartLeads will score you and send a reply to your inbox.
              </p>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name">Your name</Label>
                  <Input id="name" name="name" type="text" placeholder="Jane Okafor"
                    value={form.name} onChange={set} autoComplete="off"
                    className="border-black/10 bg-white shadow-sm hover:border-black/20 focus-visible:border-black/25 focus-visible:ring-black/8" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">
                    Your email <span className="font-normal text-zinc-400">(gets the reply)</span>
                  </Label>
                  <Input id="email" name="email" type="email" placeholder="jane@company.com"
                    value={form.email} onChange={set} autoComplete="off"
                    className="border-black/10 bg-white shadow-sm hover:border-black/20 focus-visible:border-black/25 focus-visible:ring-black/8" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="businessType">Your business type</Label>
                  <CustomSelect id="businessType" value={form.businessType}
                    onChange={val => setField('businessType', val)} options={BUSINESS_OPTIONS} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="budget">Your budget</Label>
                  <CustomSelect id="budget" value={form.budget}
                    onChange={val => setField('budget', val)} options={BUDGET_OPTIONS} />
                </div>
                <div className="col-span-full flex flex-col gap-2">
                  <Label htmlFor="message">Describe your project</Label>
                  <Textarea id="message" name="message"
                    placeholder="e.g. I need a booking website for my hair salon with online payments and appointment reminders…"
                    value={form.message} onChange={set} rows={3}
                    className="border-black/10 bg-white shadow-sm hover:border-black/20 focus-visible:border-black/25 focus-visible:ring-black/8 resize-none" />
                  <p className="text-xs text-zinc-400">More detail → more accurate score.</p>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3">
                <Button type="button" size="lg" disabled={!canSubmit} onClick={submit}
                  className="w-full border border-black/10 bg-white text-zinc-900 shadow-sm hover:bg-zinc-50 hover:shadow-md"
                  style={{ background: canSubmit ? '#ffffff' : 'rgba(255,255,255,0.6)' }}
                >
                  {state.status === 'sending' ? (
                    <>
                      <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-700" />
                      Scoring your inquiry…
                    </>
                  ) : (
                    <><Zap className="h-4 w-4" /> Run qualification</>
                  )}
                </Button>

                <AnimatePresence mode="wait">
                  {state.status === 'sent' && (
                    <motion.div key="result" className="flex flex-col gap-3"
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.32, ease: 'easeOut' }}
                    >
                      {/* ── Score card ── */}
                      <div role="status"
                        style={{ background: SCORE_THEME[state.result.label].bg, border: `1px solid ${SCORE_THEME[state.result.label].border}` }}
                        className="rounded-xl px-4 py-4"
                      >
                        <div className="flex items-center justify-between gap-3 font-mono text-sm">
                          <span className="text-zinc-500">LEAD_SCORE</span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-zinc-900">
                              {state.result.score}<span className="text-xs font-normal text-zinc-400">/100</span>
                            </span>
                            <Badge variant={BADGE_VARIANT[state.result.label]}>{state.result.label}</Badge>
                          </div>
                        </div>
                        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-black/8">
                          <motion.div className="h-full rounded-full"
                            style={{ background: SCORE_THEME[state.result.label].bar }}
                            initial={{ width: 0 }} animate={{ width: `${state.result.score}%` }}
                            transition={{ duration: 1.1, ease: 'easeOut', delay: 0.12 }}
                          />
                        </div>
                        <p className="mt-2.5 font-mono text-xs leading-relaxed text-zinc-500">
                          <span className="text-zinc-300">// </span>{state.result.reason}
                        </p>
                        <div className="mt-3 rounded-lg border border-black/6 bg-white/70 px-3.5 py-3">
                          <p className="text-xs font-semibold text-zinc-800">
                            {LABEL_COPY[state.result.label].emoji}&nbsp; {LABEL_COPY[state.result.label].headline}
                          </p>
                          <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">
                            {LABEL_COPY[state.result.label].detail}
                          </p>
                        </div>
                      </div>

                      {/* ── Email preview card — the key addition ── */}
                      <motion.div
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35, duration: 0.4 }}
                        className="overflow-hidden rounded-xl border border-black/8 bg-white"
                        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
                      >
                        {/* Email client top bar */}
                        <div className="flex items-center gap-2 border-b border-black/6 bg-zinc-50 px-4 py-2.5">
                          <Mail className="h-3.5 w-3.5 text-zinc-400" />
                          <span className="font-mono text-[10px] text-zinc-400">automated reply sent to {state.email}</span>
                        </div>

                        {/* Email headers */}
                        <div className="border-b border-black/5 px-4 py-3 space-y-1.5">
                          <div className="flex gap-3 text-xs">
                            <span className="w-14 flex-shrink-0 text-zinc-400">From</span>
                            <span className="text-zinc-700">Joshua Asiribo</span>
                          </div>
                          <div className="flex gap-3 text-xs">
                            <span className="w-14 flex-shrink-0 text-zinc-400">To</span>
                            <span className="text-zinc-700">{state.email}</span>
                          </div>
                          <div className="flex gap-3 text-xs">
                            <span className="w-14 flex-shrink-0 text-zinc-400">Subject</span>
                            <span className="font-medium text-zinc-900">{state.emailPreview.subject}</span>
                          </div>
                        </div>

                        {/* Email body */}
                        <div className="px-4 py-4">
                          <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-zinc-600">
                            {state.emailPreview.body}
                          </pre>
                        </div>

                        {/* Spam notice */}
                        <div className="border-t border-black/5 bg-zinc-50 px-4 py-2.5">
                          <p className="font-mono text-[10px] text-zinc-400">
                            📬 Check your spam / junk folder if you don&apos;t see it in your inbox
                          </p>
                        </div>
                      </motion.div>
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

                <p className="text-center font-mono text-[10px] text-zinc-400">
                  no spam · no sales calls · automated reply only
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="bg-white px-6 pb-0 pt-16">
        <div className="mx-auto max-w-6xl">
          <div className="relative overflow-visible rounded-2xl border border-black/[0.06] bg-zinc-50/70 px-8 pb-12 pt-14 sm:px-12"
            style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.07), 0 2px 10px rgba(0,0,0,0.04)' }}
          >
            <div className="absolute -top-[22px] left-10 z-10 h-10 w-[70px] rounded-lg bg-zinc-900"
              style={{ transform: 'rotate(-22deg)', boxShadow: '0 4px 12px rgba(0,0,0,0.25)' }} aria-hidden />
            <div className="absolute -top-[22px] right-10 z-10 h-10 w-[70px] rounded-lg bg-zinc-900"
              style={{ transform: 'rotate(22deg)', boxShadow: '0 4px 12px rgba(0,0,0,0.25)' }} aria-hidden />

            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
              <div className="sm:col-span-2 lg:col-span-1">
                <div className="mb-3 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-zinc-900" />
                  <span className="font-mono text-sm font-bold text-zinc-900">SmartLeads</span>
                </div>
                <p className="max-w-[190px] text-[13px] leading-relaxed text-zinc-500">
                  AI lead qualification for freelancers & agencies. Score every inquiry before it goes cold.
                </p>
              </div>
              <div>
                <h4 className="mb-5 text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-400">Product</h4>
                <ul className="space-y-3.5">
                  {[{ label: 'How it works', href: '#' }, { label: 'Live demo', href: '#' }, { label: 'Admin login', href: '/admin/login' }].map(l => (
                    <li key={l.label}><a href={l.href} className="text-[13px] text-zinc-500 transition-colors hover:text-zinc-900">{l.label}</a></li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="mb-5 text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-400">Built with</h4>
                <ul className="space-y-3.5">
                  {['Next.js 15', 'TypeScript', 'Groq AI', 'Supabase', 'Make.com'].map(s => (
                    <li key={s} className="text-[13px] text-zinc-500">{s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="mb-5 text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-400">Connect</h4>
                <ul className="space-y-3.5">
                  {SOCIALS.map(s => (
                    <li key={s.label}>
                      <a href={s.href} target="_blank" rel="noopener noreferrer"
                        className="group inline-flex items-center gap-1.5 text-[13px] text-zinc-500 transition-colors hover:text-zinc-900">
                        {s.label}
                        <ExternalLink className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 py-8 text-[11px] text-zinc-400 sm:flex-row">
            <p>© {new Date().getFullYear()} SmartLeads. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="https://joshua-asiribo.vercel.app/" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-zinc-700">Joshua Asiribo</a>
              <span>·</span>
              <a href="https://www.upwork.com/freelancers/~01119b32ca7911f5c3?mp_source=share" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-zinc-700">Upwork</a>
            </div>
            <div className="flex items-center gap-4">
              <a href="https://github.com/olutobajosh" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-zinc-900" aria-label="GitHub">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
              </a>
              <a href="https://linkedin.com/in/joshuaasiribo" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-zinc-900" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

    </main>
  );
}
