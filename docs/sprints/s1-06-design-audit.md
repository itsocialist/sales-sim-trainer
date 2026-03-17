# S1-06: Design System Audit Report
**Auditor:** Maya Chen (UI/UX Lead)  
**Date:** March 17, 2026  
**Status:** ✅ Complete

---

## Executive Summary

The SalesSim app uses an "Iron Bank" design system with a dark theme, sharp edges (0px border radius), and a green accent palette. The aesthetic is distinctive and recognizable, but requires hardening for production readiness. This audit identifies strengths, gaps, and recommendations.

---

## 1. Current Strengths

### ✅ Strong Foundation
- **Custom CSS Variables** — All colors, fonts, and border radii in `:root`, enabling quick theming
- **Space Grotesk** typography — Distinctive, memorable, professional
- **Dark-first design** — Matches the "command center" feel for sales professionals
- **Accent consistency** — `#3FD497` (green) used uniformly for primary actions

### ✅ Component Library (13 components)
| Component | Quality | Notes |
|-----------|---------|-------|
| PackSelector | Good | Clear 3-step flow, labels, preview |
| SimulationChat | Good | Streaming, meters, behavior strip |
| AudioPlayer | Good | Provider indicator, auto-play |
| VoiceInput | Good | Permission handling, hotkey |
| VoiceFirstOverlay | Good | Visualizer, state machine, minimal chrome |
| ContextDisplay | Fair | Dense — needs better hierarchy |
| SimulationMeters | Fair | Labels hard to read at small sizes |
| SubjectAvatar | Fair | Initials-only — needs avatar images |
| BehaviorStrip | Fair | Useful but visually flat |
| DebriefScreen | Fair | Text-heavy, no visual hierarchy |
| FeedbackScreen | Fair | Basic, no charts/graphs |
| ScenarioSelector | Fair | Deprecated — merged into PackSelector |
| ChatInterface | Poor | Legacy — should be removed |

---

## 2. Gaps & Issues

### 🔴 Critical

1. **No responsive design** — App breaks below 1024px. Pack selector grid overflows on tablet. Voice overlay isn't optimized for mobile.
2. **Missing loading states** — No skeleton screens, only raw text "SIMULATION READY" state.
3. **No error boundaries** — API failures show no user feedback beyond console errors.

### 🟡 Important

4. **Typography scale undefined** — `text-3xl`, `text-sm`, `text-xs` used ad-hoc without a consistent scale. Need a type ramp (14/16/20/24/32/40px).
5. **Spacing inconsistency** — `px-6 py-4`, `px-8 py-4`, `p-5`, `px-5 py-3` used interchangeably. Need a spacing scale (4/8/12/16/24/32/48px).
6. **No component tokens** — Buttons, inputs, and cards use inline styles instead of semantic tokens like `--btn-height`, `--input-height`.
7. **SubjectAvatar lacks visual identity** — Initials only. Need generated avatar images or 3D persona models.
8. **No dark/light mode toggle** — Dark-only limits accessibility.

### 🟢 Recommendations

9. **Add success/warning/error color tokens** — Currently only accent green, amber score-mid, red score-low.
10. **Animation library** — Only `pulse-glow` and `mic-pulse`. Need enter/exit transitions, slide-in, fade-up.
11. **Focus states** — No visible keyboard focus indicators. Accessibility gap.
12. **Print stylesheet** — Debrief reports should be printable.

---

## 3. Component Inventory & Sprint 2 Needs

### Existing (Keep)
- PackSelector, SimulationChat, AudioPlayer, VoiceInput, VoiceFirstOverlay
- SimulationMeters, BehaviorStrip, ContextDisplay, DebriefScreen

### Needs Upgrade
- SubjectAvatar → Add AI-generated avatar images
- DebriefScreen → Visual scorecard with charts
- FeedbackScreen → Radar chart + improvement tips

### New (Sprint 2+)
| Component | Purpose | Priority |
|-----------|---------|----------|
| ProductSetup | Upload product docs, define value prop | P0 |
| ICPBuilder | Define ideal customer profiles + verticals | P0 |
| SettingsPanel | API keys, voice preferences, scoring config | P1 |
| DashboardHome | Training history, skill scores, progress | P1 |
| OnboardingWizard | First-run setup flow | P2 |
| ScoreRadar | D3/Recharts radar chart for skill areas | P1 |
| SessionHistory | List past sessions with replay links | P2 |

---

## 4. Color & Typography Recommendations

### Current Palette (Keep)
```css
--bg-primary: #000000
--bg-secondary: #0d0d0d
--bg-card: #111111
--accent-primary: #3FD497
```

### Proposed Additions
```css
--accent-secondary: #60a5fa    /* Blue — for info/insights */
--status-warning: #f59e0b      /* Amber */
--status-error: #ef4444        /* Red */
--status-success: #3FD497      /* Green (reuse accent) */
--bg-elevated: #1a1a1a         /* For modals, dropdowns */
--text-link: #60a5fa           /* For clickable text */
```

### Typography Scale
```css
--type-xs: 0.75rem    /* 12px — labels, badges */
--type-sm: 0.875rem   /* 14px — secondary text */
--type-base: 1rem     /* 16px — body text */
--type-lg: 1.25rem    /* 20px — section headers */
--type-xl: 1.5rem     /* 24px — page headers */
--type-2xl: 2rem      /* 32px — hero/title */
--type-3xl: 2.5rem    /* 40px — landing splash */
```

---

## 5. Design Brief for Sprint 2

### Priority: Product Setup Page
- Full-width upload zone (drag-and-drop) for product documents
- URL input for website crawl
- Auto-extracted feature list with editable cards
- Preview of how the AI will describe the product

### Priority: ICP Builder
- Multi-step wizard: Industry → Company Size → Buyer Personas → Pain Points
- Template library ("Enterprise SaaS," "SMB Services," "Healthcare")
- Visual card layout for each ICP with vertical tagging
- Export to simulation config

### Design Direction
- Maintain Iron Bank aesthetic (dark, sharp, green)
- Add more visual depth (subtle gradients, card elevation)
- Introduce micro-animations for state transitions
- Add toast notifications for user actions
