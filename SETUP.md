# SmartLeads v2 — Setup Guide

## Step 1 — Install the one new dependency

```bash
npm install framer-motion@^11
```

---

## Step 2 — Drop in the files

Copy every file from this package into your project, replacing the originals:

```
app/
├── page.tsx                    ← Updated public page (auto-retry, warm-up, no admin link)
├── api/
│   ├── health/
│   │   └── route.ts            ← NEW: UptimeRobot ping target
│   └── admin/
│       └── login/
│           └── route.ts        ← NEW: Admin auth API
└── admin/
    ├── page.tsx                ← Dashboard moved here (was /dashboard)
    └── login/
        └── page.tsx            ← NEW: Admin login UI

middleware.ts                   ← NEW: Protects /admin routes
components/ui/
├── background-paths.tsx        ← NEW: Animated SVG paths
├── badge.tsx                   ← Updated HOT/WARM/COLD colours
├── button.tsx                  ← Updated violet primary
├── input.tsx                   ← Updated focus ring
├── label.tsx                   ← Updated field.tsx style
├── select.tsx                  ← Updated chevron icon
└── textarea.tsx                ← Updated consistent styling
app/globals.css                 ← Updated deep violet-dark theme
```

> If you still have an `app/dashboard/` folder, delete it.
> The dashboard now lives at `/admin` and is password-protected.

---

## Step 3 — Add the ADMIN_TOKEN on Render

1. Go to your app on **render.com**
2. Click **Environment** in the left sidebar
3. Click **Add Environment Variable**
4. Set:
   - **Key:** `ADMIN_TOKEN`
   - **Value:** a strong password you choose (e.g. `sl-admin-2026-xK9q`)
5. Click **Save Changes** — Render will redeploy automatically

> Keep this value somewhere safe. You'll need it every time you visit `/admin`.

---

## Step 4 — Fix the cold-start error with UptimeRobot (free)

Render's free tier spins down after 15 minutes of inactivity. That's the
root cause of the "works on second try" error. UptimeRobot pings your app
every 5 minutes to keep it awake — completely free.

### Setup (takes 3 minutes):

1. Sign up at **uptimerobot.com** (free plan is enough)
2. Click **Add New Monitor**
3. Set:
   - **Monitor Type:** HTTP(s)
   - **Friendly Name:** SmartLeads Keep-Alive
   - **URL:** `https://YOUR-APP.onrender.com/api/health`
   - **Monitoring Interval:** 5 minutes
4. Click **Create Monitor**

That's it. Within 5 minutes, your app will stay warm permanently.

> The `/api/health` endpoint returns `{ "status": "ok", "ts": 1234567890 }`
> — a fast, no-DB, no-AI response purpose-built for this ping.

**Note:** The page itself also silently pings `/api/health` on load as a
secondary warm-up, so even if UptimeRobot hasn't pinged recently, the server
gets a head start the moment someone opens the page.

---

## Step 5 — Access the admin dashboard

1. Visit `https://YOUR-APP.onrender.com/admin`
2. You'll be redirected to `/admin/login`
3. Enter the `ADMIN_TOKEN` password you set in Step 3
4. You're in — session lasts 7 days

> The `/admin` route is completely invisible from the public page.
> There is no link to it anywhere a visitor can see.

---

## Step 6 — Delete the old /dashboard route

If your project still has `app/dashboard/page.tsx`, delete that file and
folder. The route no longer exists in this version.

```bash
rm -rf app/dashboard
```

---

## What changed from v1

| Issue                            | Fix                                                  |
|----------------------------------|------------------------------------------------------|
| Error on first submit            | Auto-retry + server warm-up on page load             |
| Dashboard publicly accessible    | Moved to `/admin` with password gate + middleware    |
| Dashboard queried wrong table    | `'leads'` → `'inquiries'` (was a critical bug)      |
| Hot leads stat used wrong scale  | `ai_score >= 7` → `priority === 'HOT'`              |
| Auto-replied count was wrong     | Now filters `ai_email_sent === 'true'`               |
| Dashboard link visible in nav    | Removed — only stack label shown to visitors         |
| No way to sign out of admin      | Sign out link in admin nav clears the cookie         |

---

## Environment variables checklist

Make sure all of these are set on Render:

| Variable                      | Where to get it                    |
|-------------------------------|------------------------------------|
| `NEXT_PUBLIC_SUPABASE_URL`    | Supabase → Settings → API          |
| `SUPABASE_SERVICE_KEY`        | Supabase → Settings → API          |
| `GROQ_API_KEY`                | console.groq.com → API Keys        |
| `MAKE_WEBHOOK_URL`            | Make.com → your scenario webhook   |
| `ADMIN_TOKEN`                 | You choose this (Step 3 above)     |
