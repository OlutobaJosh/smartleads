'use client';
import { useState } from 'react';
import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardHeader,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

type ScoreResult = { score: number; label: 'HOT' | 'WARM' | 'COLD'; reason: string };
type SubmitState =
  | { status: 'idle' }
  | { status: 'sending' }
  | { status: 'sent'; result: ScoreResult }
  | { status: 'error'; message: string };

const FIELDS = [
  { label: 'name', name: 'name' as const, type: 'text', placeholder: 'Jane Okafor' },
  { label: 'email', name: 'email' as const, type: 'email', placeholder: 'jane@company.com' },
];

const PIPELINE = [
  { idx: '00', title: 'inquiry.received', desc: 'Raw form payload hits the inquiry endpoint.' },
  { idx: '01', title: 'llm.qualify()', desc: 'Groq model scores intent, budget, and urgency.' },
  { idx: '02', title: 'score.assign', desc: 'Lead scored 0–100, tagged hot / warm / cold.' },
  { idx: '03', title: 'reply.dispatch', desc: 'Logged and routed to the automation pipeline.' },
];

export default function Home() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    businessType: '',
    budget: '',
    message: '',
  });
  const [state, setState] = useState<SubmitState>({ status: 'idle' });

  const set = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  async function submit(e: React.FormEvent<HTMLButtonElement>) {
    e.preventDefault();
    setState({ status: 'sending' });
    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
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
    } catch {
      setState({ status: 'error', message: 'Could not reach the server. Please try again.' });
    }
  }

  const tagVariant =
    state.status === 'sent'
      ? state.result.label === 'HOT'
        ? 'hot'
        : state.result.label === 'WARM'
        ? 'warm'
        : 'cold'
      : 'cold';

  return (
    <main className="min-h-screen bg-background text-foreground">
      <nav className="flex items-center justify-between border-b border-border px-10 py-5">
        <span className="flex items-center gap-2 font-mono text-sm font-semibold">
          <span className="inline-block h-1.5 w-1.5 bg-accent" />
          SmartLeads
        </span>
        <a
          href="/dashboard"
          className="group flex items-center gap-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          dashboard
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </a>
      </nav>

      <section className="mx-auto max-w-3xl px-6 py-20">
        <Badge className="mb-7">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_0_3px_rgba(245,166,35,0.15)]" />
          lead-qualification engine · v2
        </Badge>

        <h1 className="mb-5 text-[2.4rem] font-bold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          Score every inquiry
          <br />
          before it goes cold.
        </h1>

        <p className="mb-14 max-w-xl text-base leading-relaxed text-muted-foreground">
          SmartLeads parses incoming form submissions, scores intent against budget and
          urgency, and fires a qualified reply — automatically, in under ten seconds.
        </p>

        <div className="mb-16 overflow-hidden rounded-md border border-border bg-card/40">
          {PIPELINE.map(s => (
            <div key={s.idx} className="flex gap-4 border-b border-border px-5 py-4 last:border-b-0">
              <span className="w-6 shrink-0 pt-0.5 font-mono text-xs text-muted-foreground/60">
                {s.idx}
              </span>
              <div>
                <div className="mb-1 font-mono text-sm text-accent">{s.title}</div>
                <div className="text-sm leading-relaxed text-muted-foreground">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2.5">
            <span className="font-mono text-xs text-muted-foreground/60">live_demo.tsx</span>
            <span className="flex gap-1.5">
              <span className="h-2 w-2 rounded-full bg-white/15" />
              <span className="h-2 w-2 rounded-full bg-white/15" />
              <span className="h-2 w-2 rounded-full bg-white/15" />
            </span>
          </div>

          <CardHeader className="pt-6">
            <CardDescription>
              Submit a real inquiry below — the engine scores it live and shows its reasoning.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              {FIELDS.map(f => (
                <div key={f.name} className="flex flex-col gap-1.5">
                  <Label htmlFor={f.name}>{f.label}</Label>
                  <Input
                    id={f.name}
                    name={f.name}
                    type={f.type}
                    placeholder={f.placeholder}
                    value={form[f.name]}
                    onChange={set}
                    autoComplete="off"
                  />
                </div>
              ))}

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="businessType">business_type</Label>
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

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="budget">budget_range</Label>
                <Select id="budget" name="budget" value={form.budget} onChange={set}>
                  <option value="">— select —</option>
                  <option>Under $100</option>
                  <option>$100 – $500</option>
                  <option>$500 – $1,000</option>
                  <option>$1,000 – $5,000</option>
                  <option>$5,000+</option>
                </Select>
              </div>

              <div className="col-span-full flex flex-col gap-1.5">
                <Label htmlFor="message">project_description</Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="What are you trying to build?"
                  value={form.message}
                  onChange={set}
                  rows={3}
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button
              onClick={submit}
              disabled={state.status === 'sending' || !form.name || !form.email}
              size="lg"
              className="w-full"
            >
              {state.status === 'sending' ? 'scoring…' : 'run qualification →'}
            </Button>

            {state.status === 'sent' && (
              <div
                role="status"
                className="w-full rounded-md border border-border border-l-2 border-l-accent bg-muted/30 px-4 py-3 font-mono"
              >
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="text-muted-foreground">LEAD_SCORE</span>
                  <span className="font-semibold text-foreground">{state.result.score}/100</span>
                  <Badge variant={tagVariant}>{state.result.label}</Badge>
                </div>
                <div className="mt-1.5 text-xs text-muted-foreground">
                  // {state.result.reason}
                </div>
              </div>
            )}

            {state.status === 'error' && (
              <div
                role="status"
                className="w-full rounded-md border border-border border-l-2 border-l-destructive bg-muted/30 px-4 py-3 font-mono"
              >
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-destructive">●</span>
                  <span className="text-foreground">inquiry.failed</span>
                </div>
                <div className="mt-1.5 text-xs text-muted-foreground">// {state.message}</div>
              </div>
            )}

            <p className="w-full text-center text-xs text-muted-foreground/60">
              no spam · no sales calls · reply hits your inbox directly
            </p>
          </CardFooter>
        </Card>
      </section>
    </main>
  );
}
