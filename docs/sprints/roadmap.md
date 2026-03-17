# SalesSim — Sprint Roadmap (Sprints 1–6)

> **Sprint Length:** 2 weeks  
> **Start Date:** March 18, 2026  
> **MVP Target:** Sprint 4 close (May 12, 2026)  
> **Market Launch Target:** Sprint 6 close (June 9, 2026)

---

## Current State Audit

### ✅ What Exists
- Next.js 16 app with Tailwind v4, TypeScript
- 3 Training Packs (Enterprise AE, Mid-Market AE, SDR/BDR)
- 7 stakeholder subjects with deep personality/behavior prompts
- 4 enterprise scenarios, 3 mid-market scenarios, 3 SDR scenarios
- AI simulation via OpenAI GPT-4o (streaming, JSON-structured responses)
- Engagement/warmth dynamic meter system
- MEDDIC-native debrief scoring with 4 dimensions
- TTS via OpenAI (basic voice mapping by gender/age)
- Iron Bank design system (dark mode, emerald accent, Space Grotesk)

### ❌ What's Missing
- Voice input (STT) — no speech recognition
- ElevenLabs / Fish Audio TTS (only OpenAI TTS)
- Product definition (upload docs / URL)
- ICP definition (with verticals)
- User accounts / authentication
- Settings / admin dashboard
- Session history & analytics
- Onboarding flow
- Mobile responsiveness
- Production deployment
- Landing page

---

## Sprint 1 — Voice & Foundation (Mar 18 – Mar 31)
**Goal:** Enable voice-first simulation and lay infrastructure groundwork.

| ID | Story | Points | Priority | Assignee |
|----|-------|--------|----------|----------|
| S1-01 | **ElevenLabs TTS integration** — Replace OpenAI TTS with ElevenLabs for higher-quality, emotional voices. Map stakeholder profiles to ElevenLabs voice IDs. Support voice cloning parameters (stability, similarity_boost) per persona. | 5 | P0 | Eng |
| S1-02 | **Fish Audio TTS fallback** — Implement Fish Audio as a cost-effective TTS alternative. Create a provider abstraction layer (`TTS_PROVIDER` env var) that routes to ElevenLabs, Fish Audio, or OpenAI. | 3 | P0 | Eng |
| S1-03 | **Speech-to-Text (STT) input** — Add browser-native Web Speech API for voice input with a push-to-talk button (mic icon + spacebar hotkey). Transcribe speech → fill input → auto-send. | 5 | P0 | Eng |
| S1-04 | **Deepgram STT integration** — Add server-side Deepgram STT as a higher-accuracy alternative to Web Speech API. Route via `STT_PROVIDER` env var. | 3 | P1 | Eng |
| S1-05 | **Voice-first simulation mode** — Enable "hands-free" mode: auto-play TTS responses, auto-activate mic after response ends, creating a continuous voice conversation loop. Add toggle in simulation UI. | 5 | P0 | Eng |
| S1-06 | **Design system audit** — UI/UX designer reviews current Iron Bank design system. Identify gaps: onboarding, settings, product config, ICP builder. Produce design brief. | 3 | P1 | UI/UX |
| S1-07 | **Scenario realism review** — Sales expert audits all 3 training packs for realism. Flag unrealistic behaviors, missing objections, or incorrect MEDDIC mappings. Deliver annotated feedback doc. | 2 | P1 | Sales |

**Sprint 1 Total:** 26 points

**Acceptance Criteria:**
- [ ] User can speak into mic and have their message transcribed + sent
- [ ] AI responses auto-play with ElevenLabs voice matching the stakeholder persona
- [ ] Fish Audio works as a fallback when `TTS_PROVIDER=fish`
- [ ] "Hands-free" voice loop mode works end-to-end
- [ ] Design brief delivered
- [ ] Sales expert feedback doc delivered

---

## Sprint 2 — Product & ICP Configuration (Apr 1 – Apr 14)
**Goal:** Let users define what they're selling and who they're selling to.

| ID | Story | Points | Priority | Assignee |
|----|-------|--------|----------|----------|
| S2-01 | **Product Definition — Document Upload** — New "Product Setup" page. Upload PDF, DOCX, or TXT product docs. Parse via server-side extraction (pdf-parse, mammoth). Store extracted product context in local state / localStorage. | 5 | P0 | Eng |
| S2-02 | **Product Definition — Website URL** — Enter a URL. Server-side scrape with readability-style extraction. Extract product name, description, features, pricing, and value props. Store as product profile. | 5 | P0 | Eng |
| S2-03 | **Product Context Injection** — Inject the user's product definition into the simulation system prompt. AI stakeholders now react to the user's actual product, not generic software. Update simulation API route. | 3 | P0 | Eng |
| S2-04 | **ICP Definition — Builder UI** — New "ICPs" page. Define Ideal Customer Profiles with: company size, industry vertical, pain points, buying process, key stakeholders, budget range, tech stack. | 5 | P0 | Eng |
| S2-05 | **ICP Verticals** — Preset industry verticals (SaaS, FinTech, HealthTech, Manufacturing, Professional Services, etc.) with vertical-specific defaults. User can customize or create custom verticals. | 3 | P0 | Eng |
| S2-06 | **ICP → Simulation Integration** — Selected ICP influences simulation: stakeholder company/industry match the ICP, objections are industry-specific, decision process reflects the vertical's buying behavior. | 5 | P1 | Eng |
| S2-07 | **Dynamic Stakeholder Generation** — Given the user's product + selected ICP, AI generates new stakeholder profiles on-the-fly (name, title, company, backstory, personality) that match the ICP context. | 5 | P1 | Eng |
| S2-08 | **Product & ICP page UX design** — UI/UX designer delivers Figma mockups for Product Setup page and ICP Builder. | 3 | P1 | UI/UX |
| S2-09 | **Scenario pack additions** — Sales expert provides 3-5 new scenarios and 2 new stakeholder archetypes based on Sprint 1 audit findings. | 3 | P1 | Sales |

**Sprint 2 Total:** 37 points

**Acceptance Criteria:**
- [ ] User can upload a product doc (PDF/DOCX/TXT) and see extracted info
- [ ] User can enter a URL and see scraped product info
- [ ] Simulations reference the user's actual product
- [ ] User can create an ICP with verticals
- [ ] Simulations adapt to the selected ICP (industry, company size, objections)
- [ ] AI can generate new stakeholders matching the ICP

---

## Sprint 3 — Auth, Persistence & Sessions (Apr 15 – Apr 28)
**Goal:** Add user accounts, save sessions, and build analytics foundation.

| ID | Story | Points | Priority | Assignee |
|----|-------|--------|----------|----------|
| S3-01 | **User authentication** — Add NextAuth.js with Google OAuth and email/password. Protect simulation and config pages. | 5 | P0 | Eng |
| S3-02 | **Database setup** — Add Supabase (or PostgreSQL) for persistent storage. Schema: users, products, icps, sessions, debrief_scores. | 5 | P0 | Eng |
| S3-03 | **Session history** — Save every simulation session (messages, config, debrief scores). Show history page with sortable/filterable session list. | 5 | P0 | Eng |
| S3-04 | **Analytics dashboard** — Show user's score trends over time: MEDDIC coverage, discovery quality, objection handling. Chart.js or Recharts. Per-training-pack breakdown. | 5 | P1 | Eng |
| S3-05 | **Product & ICP persistence** — Migrate product definitions and ICPs from localStorage to database. Multi-product and multi-ICP support per user. | 3 | P0 | Eng |
| S3-06 | **Settings page** — Voice provider selection (ElevenLabs/Fish/OpenAI), STT provider, voice-first toggle, playback speed. Persist per user. | 3 | P1 | Eng |
| S3-07 | **Onboarding flow design** — UI/UX designer creates onboarding: welcome → define product → define ICP → first simulation walkthrough. | 3 | P1 | UI/UX |
| S3-08 | **MEDDIC coaching content** — Sales expert writes coaching tips for each MEDDIC pillar gap. Displayed in debrief when a pillar is missed. | 3 | P1 | Sales |

**Sprint 3 Total:** 32 points

---

## Sprint 4 — MVP Polish & Onboarding (Apr 29 – May 12)
**Goal:** Deliver a complete, polished MVP ready for early users.

| ID | Story | Points | Priority | Assignee |
|----|-------|--------|----------|----------|
| S4-01 | **Onboarding flow implementation** — Implement the designed onboarding: first-time user → product setup → ICP → guided first simulation. | 5 | P0 | Eng |
| S4-02 | **Mobile responsiveness** — Make simulation, pack selector, debrief, product setup, and ICP pages work on tablet and mobile. | 5 | P0 | Eng/UI |
| S4-03 | **Simulation UX polish** — Implement UI/UX designer's simulation redesign. Smooth animations, better chat bubbles, improved meter visualization, loading states. | 5 | P1 | Eng/UI |
| S4-04 | **Debrief enhancement** — Add specific coaching recommendations per MEDDIC gap. Add "replay key moments" feature. Add share/export debrief as PDF. | 5 | P1 | Eng |
| S4-05 | **Error handling & edge cases** — Graceful API failure handling, rate limiting, session timeout management, input validation. | 3 | P0 | Eng |
| S4-06 | **Performance optimization** — Optimize streaming responses, reduce TTFB for TTS, lazy-load components, bundle size audit. | 3 | P1 | Eng |
| S4-07 | **README & documentation polish** — Update README with product screenshots, feature list, quick start guide, architecture diagram. | 2 | P1 | Eng |

**Sprint 4 Total:** 28 points

**🎯 MVP CHECKPOINT** — At Sprint 4 close, the product should be:
- ✅ Voice-first sales simulation with ElevenLabs/Fish Audio
- ✅ User-defined product and ICPs with vertical support
- ✅ Dynamic stakeholder generation from ICP context
- ✅ Session history and analytics
- ✅ Authentication and data persistence
- ✅ Onboarding flow
- ✅ Mobile responsive

---

## Sprint 5 — Deployment & Landing (May 13 – May 26)
**Goal:** Deploy to production, build landing page, prepare go-to-market.

| ID | Story | Points | Priority | Assignee |
|----|-------|--------|----------|----------|
| S5-01 | **Production deployment** — Deploy to Vercel. Configure env vars, custom domain, SSL. Verify all features work in production. | 3 | P0 | Eng |
| S5-02 | **Landing page** — Build a marketing landing page: hero, feature grid, pricing, demo CTA, social proof placeholder. SEO-optimized. | 8 | P0 | Eng/UI |
| S5-03 | **Demo recording** — Create a 90-second product demo video (screen recording of a full voice sim session). | 2 | P0 | Brian |
| S5-04 | **Admin dashboard (team management)** — For enterprise customers: invite team members, view team score trends, manage product definitions and ICPs. | 5 | P1 | Eng |
| S5-05 | **Stripe integration** — Payment processing for Professional/Enterprise tiers. Free trial (3 sessions), then paywall. | 5 | P1 | Eng |
| S5-06 | **Email capture & waitlist** — Pre-launch email capture on landing page. Integrate with HubSpot or Mailchimp. | 2 | P1 | Eng |
| S5-07 | **SEO & analytics** — Google Analytics, Open Graph tags, sitemap, structured data. | 2 | P1 | Eng |

**Sprint 5 Total:** 27 points

---

## Sprint 6 — GTM Launch & Iterate (May 27 – Jun 9)
**Goal:** Launch publicly, gather feedback, begin sales outreach.

| ID | Story | Points | Priority | Assignee |
|----|-------|--------|----------|----------|
| S6-01 | **Product Hunt / HN launch prep** — Polish screenshots, write launch copy, prepare social posts. | 3 | P0 | Brian |
| S6-02 | **LMS integration exploration** — Research Cornerstone, SAP SuccessFactors, Workday Learning API requirements. Build integration spec doc. | 3 | P1 | Eng |
| S6-03 | **CRM integration — Salesforce/HubSpot** — Import deal context from CRM to auto-populate scenario. Export debrief scores back. Scoping + POC. | 5 | P2 | Eng |
| S6-04 | **Custom scenario builder** — Enterprise feature: create custom training scenarios with specific stakeholder profiles, objections, and scoring criteria. | 5 | P1 | Eng |
| S6-05 | **Feedback collection** — In-app feedback widget after each session. NPS survey. Aggregate feedback for Sprint 7 planning. | 3 | P1 | Eng |
| S6-06 | **User interview pipeline** — Schedule 10 target customer interviews (enterprise SaaS sales leaders). Prepare interview script. | 2 | P0 | Brian/Sales |
| S6-07 | **Iteration based on launch feedback** — Buffer for bug fixes, UX adjustments, and quick wins from user feedback. | 5 | P0 | Eng |

**Sprint 6 Total:** 26 points

---

## Velocity Summary

| Sprint | Theme | Points | Cumulative |
|--------|-------|--------|------------|
| **1** | Voice & Foundation | 26 | 26 |
| **2** | Product & ICP Config | 37 | 63 |
| **3** | Auth, Persistence & Sessions | 32 | 95 |
| **4** | MVP Polish & Onboarding | 28 | 123 |
| **5** | Deployment & Landing | 27 | 150 |
| **6** | GTM Launch & Iterate | 26 | 176 |

## Key Milestones

| Date | Milestone |
|------|-----------|
| Mar 31 | Voice-first simulation working end-to-end |
| Apr 14 | Product & ICP self-configuration complete |
| Apr 28 | Auth + persistence + analytics live |
| **May 12** | **🎯 MVP Complete** |
| May 26 | Production deployed + landing page live |
| **Jun 9** | **🚀 Market Launch** |
