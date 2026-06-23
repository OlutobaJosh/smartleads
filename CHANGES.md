# SmartLeads Redesign — Changes

## 1. Install the new dependency

```bash
npm install framer-motion@^11
```

That's the only new package. Everything else was already in your project.

---

## 2. Drop-in file replacements

Copy every file from this zip into your project, replacing the originals:

| This file | Replaces |
|---|---|
| `app/globals.css` | New deep violet-dark theme tokens |
| `app/page.tsx` | Fully redesigned homepage |
| `app/dashboard/page.tsx` | Fixed + redesigned dashboard |
| `components/ui/background-paths.tsx` | **New** — animated SVG paths |
| `components/ui/badge.tsx` | HOT/WARM/COLD color variants |
| `components/ui/button.tsx` | Violet primary, shadow glow |
| `components/ui/input.tsx` | Ring focus, tighter padding |
| `components/ui/label.tsx` | Matches field.tsx style |
| `components/ui/select.tsx` | Chevron icon, appearance-none |
| `components/ui/textarea.tsx` | Consistent with input |

---

## 3. Bug fixes in this build

### Critical: wrong table name in dashboard
**Before:** `supabase.from('leads')` — this table doesn't exist  
**After:** `supabase.from('inquiries')` — matches what the API route inserts into

### Stats logic corrected
**Before:** `ai_score >= 7` (old 0–10 scale leftover)  
**After:** `priority === 'HOT'` — uses the actual column the API sets

### Auto-Replied stat fixed
**Before:** showed `leads.length` (always wrong)  
**After:** `ai_email_sent === 'true'` — actual count of auto-replied leads

---

## 4. What's new in the UI

### Homepage
- **Animated background paths** — subtle framer-motion SVG paths in violet/indigo, looping infinitely in the hero section
- **Radial glow** — soft violet bloom behind the hero headline  
- **Gradient headline** — "before it goes cold." uses a violet → periwinkle gradient
- **Pipeline section** — 4 steps in a bordered grid, each animates in on scroll
- **Form card** — code-editor chrome header, proper Label → Input/Select → hint text field layout from field.tsx spec
- **Select fields** — `appearance-none` + absolute `ChevronDown` icon matching select-1.tsx style
- **Animated score result** — score bar animates from 0 to actual score over 1.1s, color-coded (red/amber/blue) with HOT/WARM/COLD badge
- **Spinner during submission** — loading state with spinning border

### Dashboard
- **Stat cards** with Lucide icons and accent colors per metric
- **Mini score bar** inline in each table row
- **Priority badges** — colored dots matching the homepage result
- **DB error display** — shows the Supabase error message if the query fails
- **Empty state** — helpful message when no leads exist yet
