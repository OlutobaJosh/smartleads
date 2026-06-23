# SmartLeads — Upwork Portfolio Packaging Guide

---

## 1. THE CORE INSIGHT

Your portfolio entry is not a project description. It is a **sales asset**.
The client asking for an AI automation developer is not thinking:
*"I wonder what tools this dev knows."*
They are thinking:
*"I have a problem. Can this person solve it?"*

Every word in your portfolio entry should answer that question.

---

## 2. PORTFOLIO TITLE (copy this exactly)

> **AI Lead Qualification Engine — Groq + Make.com + Supabase (live demo)**

Why this works:
- "AI Lead Qualification" — matches exact keywords clients type in search
- "Groq + Make.com + Supabase" — tech credibility in 3 words, matches skill tags
- "(live demo)" — rare on Upwork. Immediately sets you apart. Clients can TEST it.

---

## 3. PORTFOLIO DESCRIPTION (copy and customise)

**Problem**
Freelancers and agencies respond to every inquiry manually — hours later, if at all.
Hot leads go cold. Revenue leaks out of delayed follow-ups.

**What I built**
SmartLeads is an AI-powered lead qualification engine that processes inbound
project inquiries in real time. It scores each lead 0–100 against three signals —
intent clarity, budget fit, and urgency — then automatically fires the right
follow-up email via Gmail, with zero human input.

**Stack**
- **Frontend:** Next.js 15 + TypeScript + Tailwind CSS
- **AI:** Groq (LLaMA 3.1) for sub-second lead scoring
- **Database:** Supabase (PostgreSQL) for lead storage and audit trail
- **Automation:** Make.com 7-module webhook pipeline
  (Webhook → Groq → JSON Parser → Router → Gmail HOT path → Gmail WARM path → Supabase save)
- **Deployment:** Render (live, with health monitoring)

**Outcome**
Lead response time: hours → under 10 seconds.
Every inquiry gets a scored, personalised reply automatically.
The system classifies leads as HOT / WARM / COLD with a written AI rationale.

**Live demo:** [your-app.onrender.com]

---

## 4. SCREENSHOTS TO TAKE (take these in order)

Take all screenshots in a clean browser window, dark mode, 1440px width.

### Screenshot 1 — Hero + pipeline (the hook)
Scroll to show the hero headline and the 4-step pipeline grid together.
Label it: **"Live app — public landing page"**

### Screenshot 2 — Form filled out
Fill in the form with a realistic inquiry:
- Name: "James Adeyemi"
- Email: "james@retailbrand.ng"
- Business: "E-commerce Store"
- Budget: "$1,000 – $5,000"
- Description: "I need a product recommendation engine for my fashion store"

DO NOT submit yet. Screenshot the filled form.
Label it: **"Inquiry intake form"**

### Screenshot 3 — Score result (the money shot)
Now submit and screenshot the animated result.
You want a HOT score (70+) — the red bar and HOT badge look best.
Label it: **"AI score result — HOT lead, 84/100 with reasoning"**

### Screenshot 4 — Make.com flow
Open your Make.com scenario. Screenshot the full 7-module flow.
Label it: **"Make.com automation — webhook to Gmail pipeline"**

### Screenshot 5 — Admin dashboard
Log into /admin and screenshot the leads table with at least 3–4 rows.
Label it: **"Admin dashboard — lead history with scores and AI summaries"**

---

## 5. PROPOSAL TEMPLATE (for AI automation jobs)

Use this when responding to Upwork job posts about lead generation,
AI integration, Make.com, or workflow automation:

---

Hi [Name],

I've built exactly what you're describing — here's a live example:
**[your-app.onrender.com]**

SmartLeads scores inbound project inquiries using Groq AI and fires
automated Gmail replies via Make.com, all in under 10 seconds.
The stack is Next.js + Supabase + Make.com — which maps directly to your project.

Here's what I'd do for you:
1. [Specific thing 1 based on their job post]
2. [Specific thing 2]
3. [Timeline estimate]

I'm happy to walk through the SmartLeads code on a quick call to show
how I'd apply the same approach to your use case.

[Your name]

---

**Why this works:**
- Opens with proof, not claims
- Live URL = instant credibility (they can test it in 30 seconds)
- Direct stack match reduces hiring risk in their mind
- Specific numbered plan shows you read their job post
- Call offer shows confidence

---

## 6. SKILL TAGS TO PAIR WITH THIS PROJECT

When a client views SmartLeads in your portfolio, these are the skills
it directly validates. Make sure these are active in your Upwork profile:

✅ Make.com
✅ AI Development
✅ Next.js
✅ Supabase
✅ API Integration
✅ Workflow Automation
✅ TypeScript
✅ Groq / LLM API Integration
✅ Webhook Development
✅ Full-Stack Development

---

## 7. WHAT TO SAY IN A CLIENT CALL

If a client asks you to walk them through SmartLeads:

1. **Start with the problem** — "Most freelancers and agencies reply to leads manually,
   hours later. I built a system that handles that automatically."

2. **Open the live URL** — "Here's the live app — let me submit an inquiry in real time."
   Submit the form while they watch.

3. **Show the score result** — "Groq scores this inquiry and tells me exactly
   why it's hot or cold. That reasoning is the AI's output."

4. **Show Make.com** — "While the score appeared, this Make.com flow already
   ran — it routed the lead to the right email template and sent it."

5. **Show the dashboard** — "And here's where every lead is stored with its
   score, classification, and AI summary."

Total demo time: 3 minutes. Leaves them with nothing left to doubt.

---

## 8. HOW TO POSITION IT BY JOB TYPE

| Client says…               | You frame SmartLeads as…                                      |
|----------------------------|---------------------------------------------------------------|
| "I need Make.com help"     | "Here's a live Make.com pipeline I built end-to-end"         |
| "I need AI integration"    | "I've shipped a Groq AI scoring system — here's the demo"    |
| "I need a CRM automation"  | "I built lead capture + scoring + auto-reply — same pattern" |
| "I need a Next.js dev"     | "Full-stack Next.js 15 app, live on Render, here's the code" |
| "I need a Supabase dev"    | "Real-time DB writes, RLS-ready schema, audit trail built in"|
| "I need workflow automation"| "7-module Make.com webhook flow, routing + Gmail integration"|

---

## 9. UPWORK PROFILE "OVERVIEW" PARAGRAPH TO ADD

Add this paragraph to your Upwork bio (after your opening hook):

> One of my recent builds is SmartLeads — a live AI lead qualification engine
> that scores inbound inquiries in under 10 seconds using Groq AI and fires
> automated replies via Make.com. You can test it at [your-url.onrender.com].
> It's the kind of end-to-end AI automation I build for clients: API integration,
> real-time data pipelines, and intelligent workflow automation that saves hours
> of manual work every week.

---

## 10. ONE THING THAT WOULD MAKE IT EVEN STRONGER

The single highest-value upgrade after this: **add a real testimonial or outcome.**

Even if you use SmartLeads yourself for a week and track the result, you can
write: *"Used on my own freelance workflow — average lead response time dropped
from 4 hours to under 30 seconds."*

That one sentence does more work than the entire tech stack description.
Quantified outcomes beat everything else on Upwork.
