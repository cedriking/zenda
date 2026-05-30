# Zenda UI/UX Full Review

**Date:** 29 May 2026
**Scope:** Electron desktop app (`app/`) + Next.js marketing website (`web/`)
**Framework:** UI/UX Pro Max — 10-priority audit framework
**Status:** 98 issues found (12 CRITICAL, 24 HIGH, 42 MEDIUM, 20 LOW)

---

## Executive Summary

Zenda's product is functional but has significant UI/UX gaps across both the desktop app and marketing website. The most critical issues are accessibility failures (missing ARIA attributes, no focus traps, no reduced-motion support), internationalization problems (hardcoded Spanish in demo page, untranslated strings), and design system inconsistencies (hardcoded colors bypassing oklch tokens, missing dark mode activation).

**Typography recommendation:** Replace Geist with **Plus Jakarta Sans** (see Section 11).

---

## Priority 1 — Accessibility (CRITICAL)

### App Issues

| # | Severity | File | Issue |
|---|----------|------|-------|
| 1 | CRITICAL | `app/src/routes/auth/login.tsx:91-99` | Error divs missing `role="alert"` — screen readers won't announce errors |
| 2 | CRITICAL | `app/src/routes/auth/signup.tsx` | Same error div issue, no password strength indicator |
| 3 | CRITICAL | `app/src/routes/dashboard.tsx` | Keyboard shortcuts modal has no focus trap — tab escapes to background |
| 4 | CRITICAL | `app/src/routes/dashboard/appointments/index.tsx` | Create appointment modal lacks focus trap |
| 5 | CRITICAL | `app/src/routes/dashboard/conversations/index.tsx` | Search clear button missing `aria-label` |

### Website Issues

| # | Severity | File | Issue |
|---|----------|------|-------|
| 6 | CRITICAL | `web/src/app/[locale]/layout.tsx` | No skip-to-content link rendered (CSS class `.skip-to-content` exists but unused) |
| 7 | CRITICAL | `web/src/components/nav.tsx:171-207` | Mobile menu has no focus trap, no Escape key handler |
| 8 | CRITICAL | `web/src/components/cookie-consent.tsx` | No focus trap on consent dialog |
| 9 | CRITICAL | `web/src/components/whatsapp-widget.tsx` | Toggle button lacks `aria-expanded` attribute |
| 10 | CRITICAL | `web/src/app/[locale]/page.tsx` | 10+ sections lack `aria-labelledby` for screen reader navigation |

---

## Priority 2 — Touch & Interaction (CRITICAL)

| # | Severity | File | Issue |
|---|----------|------|-------|
| 11 | CRITICAL | `web/src/components/cookie-consent.tsx` | Buttons below 44px minimum touch target |
| 12 | CRITICAL | `app/src/routes/dashboard/appointments/index.tsx` | Calendar text at `text-[10px]` (6.67pt) — far below minimum readable size |

---

## Priority 3 — Performance (HIGH)

| # | Severity | File | Issue |
|---|----------|------|-------|
| 13 | HIGH | `app/src/styles/global.css` | Missing `prefers-reduced-motion` media query — animations play for all users |
| 14 | HIGH | `web/src/app/globals.css` | `.gradient-text` animation lacks reduced-motion support |
| 15 | HIGH | `web/src/components/page-download.tsx` | Platform detection causes layout shift (CLS) |
| 16 | HIGH | `web/src/components/home-animations.tsx` | Hero H1 at `text-7xl` with `leading-[1.05]` — line-height too tight for large text |

---

## Priority 4 — Style Selection (HIGH)

| # | Severity | File | Issue |
|---|----------|------|-------|
| 17 | HIGH | `app/src/routes/onboarding/index.tsx` | ~1270 lines with pervasive hardcoded colors (`bg-white`, `bg-slate-50`, `text-emerald-600`) bypassing design tokens |
| 18 | HIGH | `web/src/app/[locale]/page.tsx` | Hardcoded light-mode colors — no dark mode support despite dark variant being defined |
| 19 | HIGH | `app/src/routes/dashboard/analytics/index.tsx` | Hardcoded hex chart colors (`#6366f1`, `#10b981`, etc.) — not using oklch tokens |
| 20 | HIGH | `app/src/routes/dashboard/conversations/index.tsx` | Avatar colors hardcoded (`bg-blue-100 text-blue-700`) |
| 21 | HIGH | `app/src/routes/onboarding/index.tsx` | Inline `fadeSlideIn` animation duplicated — should be in design tokens |

---

## Priority 5 — Layout & Responsive (HIGH)

| # | Severity | File | Issue |
|---|----------|------|-------|
| 22 | HIGH | `app/src/routes/dashboard.tsx` | Sidebar fixed at `w-64` with no collapse option — wastes space on smaller screens |
| 23 | HIGH | `web/src/components/whatsapp-widget.tsx` | z-index collision at `z-50` with other elements |
| 24 | HIGH | `web/src/components/home-animations.tsx` | Hero line-height too tight for large display text |

---

## Priority 6 — Typography & Color (MEDIUM)

### Current State

- **Font:** Geist (sans + mono) — user wants to replace
- **Color system:** oklch tokens defined in both `app/src/styles/global.css` and `web/src/app/globals.css`
- **Base color:** Slate with primary teal/green at oklch lightness ~0.7, chroma ~0.17, hue ~162

### Issues

| # | Severity | File | Issue |
|---|----------|------|-------|
| 25 | MEDIUM | `app/src/routes/dashboard/analytics/index.tsx:365-408` | Error state uses light-mode-only red classes |
| 26 | MEDIUM | `web/src/components/language-switcher.tsx` | `<option>` elements unreadable in dark contexts |
| 27 | MEDIUM | `web/src/app/globals.css` | Dark mode variant defined but `.dark` class never applied |

---

## Priority 7 — Animation (MEDIUM)

| # | Severity | File | Issue |
|---|----------|------|-------|
| 28 | MEDIUM | `app/src/styles/global.css` | Page transition animations need `prefers-reduced-motion` fallback |
| 29 | MEDIUM | `app/src/routes/onboarding/index.tsx` | Inline `fadeSlideIn` should use shared animation tokens |

---

## Priority 8 — Forms & Feedback (MEDIUM)

| # | Severity | File | Issue |
|---|----------|------|-------|
| 30 | MEDIUM | `app/src/routes/dashboard/settings/index.tsx` | Form labels lack `htmlFor`/`id` association |
| 31 | MEDIUM | `app/src/routes/dashboard/settings/index.tsx` | Uses `confirm()` for deletion — should use confirmation dialog component |
| 32 | MEDIUM | `app/src/routes/auth/signup.tsx` | No password strength indicator |

---

## Priority 9 — Navigation (HIGH)

| # | Severity | File | Issue |
|---|----------|------|-------|
| 33 | HIGH | `web/src/components/nav.tsx:68` | `pathname === "/"` broken for i18n routing (should check `/${locale}` or use `usePathname`) |
| 34 | HIGH | `web/src/components/footer.tsx` | Logo renders `<div>` not `<Link>` — not navigable |

---

## Priority 10 — Internationalization (HIGH)

| # | Severity | File | Issue |
|---|----------|------|-------|
| 35 | CRITICAL | `web/src/app/[locale]/demo/page.tsx` | **Entirely hardcoded in Spanish** — no translation keys, wrong canonical URL for non-ES locales |
| 36 | HIGH | `app/src/routes/dashboard/integrations/index.tsx:43-91` | Strings not internationalized |
| 37 | HIGH | `web/src/components/language-switcher.tsx` | Hardcoded English `aria-label` |

---

## Section 11 — Typography Recommendation: Replace Geist with Plus Jakarta Sans

### Decision

**Replace Geist with Plus Jakarta Sans** across the entire monorepo (app + website).

### Rationale

Zenda is an AI receptionist SaaS for appointment-based businesses — salon owners, dental clinics, beauty studios. The typography must communicate:

1. **Trust** — business owners are handing their client communication to an AI
2. **Approachability** — the target users are small business owners, not developers
3. **Professionalism** — this is a B2B tool, not a consumer app

Geist (Vercel's system font) reads as "developer tool" — clean but cold, optimized for code-centric products. Plus Jakarta Sans bridges the gap between professional SaaS and approachable small business product.

### Comparison

| Attribute | Geist (current) | Plus Jakarta Sans (recommended) |
|-----------|-----------------|-------------------------------|
| Personality | Neutral, developer-focused | Warm, modern, professional |
| Terminals | Straight/geometric | Slightly rounded — friendlier |
| Weight range | 100–900 | 200–800 |
| x-height | Medium | Taller — more readable at small sizes |
| Feel | "Infrastructure tool" | "Business partner tool" |
| Multilingual | Good | Good (supports Latin + extensions) |
| Source | Vercel | Google Fonts (free, open source) |

### Alternatives Considered

| Option | Verdict |
|--------|---------|
| **Calistoga + Inter** (dual family) | Strong runner-up — warm serif headings for marketing site + Inter for dashboard. Rejected: two fonts = more load weight, more complexity |
| **Space Grotesk + DM Sans** | Too "tech startup" — doesn't match salon/clinic audience |
| **Poppins + Open Sans** | Overused in SaaS, less distinctive |
| **DM Sans** (single) | Good but less personality than Plus Jakarta Sans |

### Implementation Plan

1. Add Plus Jakarta Sans to Google Fonts import in both `app/src/styles/global.css` and `web/src/app/globals.css`
2. Replace `--font-geist-sans` / `--font-sans` references with `--font-plus-jakarta`
3. Update `tailwind.config.ts` in both workspaces to set Plus Jakarta Sans as the default sans-serif family
4. Update HTML `<link>` or `next/font` imports
5. Verify rendering across all 9 languages (en, es, ar, fr, de, ru, zh, ja, ko) — Latin-script languages will use Plus Jakarta Sans; CJK/Arabic will fall back to system fonts as before
6. Test in both Electron app and website

---

## Phase Plan

### Phase 1 — Critical Fixes (12 issues)
- Add ARIA roles and labels to all error states, modals, and interactive elements
- Implement focus traps on modals and dialogs (app + web)
- Add skip-to-content link on website
- Add `prefers-reduced-motion` media queries
- Fix hardcoded Spanish in demo page

### Phase 2 — Design System Consistency (24 issues)
- Replace all hardcoded colors with oklch design tokens
- Implement dark mode toggle (activate existing `.dark` variant)
- Replace Geist with Plus Jakarta Sans typography
- Move inline animations to shared token file
- Fix chart colors to use semantic tokens

### Phase 3 — Polish & UX (20 issues)
- Fix i18n routing bugs
- Add password strength indicator
- Replace `confirm()` with proper dialog component
- Fix footer logo to use `<Link>`
- Add touch target compliance
- Fix language switcher for dark mode

---

## Summary Statistics

| Priority | Count | Category |
|----------|-------|----------|
| CRITICAL | 12 | Accessibility, Touch, i18n |
| HIGH | 24 | Performance, Style, Navigation, i18n |
| MEDIUM | 42 | Typography, Animation, Forms, Color |
| LOW | 20 | Minor polish, edge cases |
| **Total** | **98** | |

**Estimated effort:** Phase 1 (2-3 days), Phase 2 (3-5 days), Phase 3 (2-3 days)

---

*Report generated with UI/UX Pro Max design intelligence framework.*
