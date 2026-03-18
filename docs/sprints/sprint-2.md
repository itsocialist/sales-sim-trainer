# Sprint 2 — CRE Vertical Extension
**Sprint Duration:** Mar 19 – Mar 25, 2026 (Rapid Sprint — Pitch Deadline)  
**Sprint Goal:** Build CRE-specific content packs and demo preset to enable a live pitch to South Coast Commercial CRE & Property Management on Wednesday March 25.  
**Status:** 🟢 ACTIVE

---

## Sprint Context

South Coast Commercial CRE & Property Management (Brian & Kevin) meeting is Wednesday March 25.
We need a fully functional CRE broker training demo that showcases:
- Real CRE scenarios (listing presentations, investment sales, 1031 exchanges)
- CRE-fluent AI stakeholders (property owners, investors, tenants)
- Voice-first mode working with CRE content
- CRE-specific coaching in the debrief

**Strategy Doc:** [CRE Vertical Extension Strategy](../../.gemini/antigravity/brain/b77f10b1-5ba7-428c-ae76-7265416a0893/cre_vertical_extension_strategy.md)

---

## Stories

### S2-01: CRE Training Pack — Subjects & Scenarios
**Priority:** P0 | **Points:** 5 | **Assignee:** Eng | **Status:** ✅ Done

**Description:**
Create a complete CRE Training Pack with 5 stakeholder archetypes and 6 deal scenarios tailored for commercial real estate brokerage training.

**Implementation Details:**
- Add new training pack in `app/src/lib/packs/trainingPacks.ts`
- Pack ID: `training-cre-broker`
- Target Role: `Commercial Real Estate Broker`
- 5 Subject Packs (stakeholder archetypes):
  1. **Property Owner (Listing Prospect)** — evaluating brokers, protective of property, pricing-conscious
  2. **Institutional Investor** — ROI-obsessed, cap rate/IRR focused, wants comparable sales proof
  3. **Tenant Representative** — focused on TI allowance, lease flexibility, timeline-driven
  4. **1031 Exchange Buyer** — anxiety about 45-day identification / 180-day close deadlines
  5. **Property Manager / Owner (Retention)** — frustrated with vacancy, considering switching firms
- 6 Scenario Packs:
  1. **Listing Presentation** — competing against other brokerages (warmth: 5, engagement: 6)
  2. **Cold Prospecting Call** — off-market property owner (warmth: 9/cold, engagement: 2)
  3. **Investment Sales Pitch** — qualified buyer, cap rate objections (warmth: 6, engagement: 7)
  4. **Tenant Negotiation** — lease terms, balancing landlord/tenant needs (warmth: 4, engagement: 7)
  5. **1031 Exchange Consultation** — timeline pressure, replacement property ID (warmth: 3, engagement: 9)
  6. **Client QBR / Retention** — existing PM client, vacancy concerns (warmth: 2, engagement: 5)

**Acceptance Criteria:**
- [ ] Training pack appears in PackSelector under "Your Role"
- [ ] All 5 subject archetypes are selectable with distinct personality traits
- [ ] All 6 scenarios launch correctly with appropriate warmth/engagement settings
- [ ] AI stays in character using CRE terminology and behaviors
- [ ] Behavior prompts produce realistic CRE conversations

---

### S2-02: CRE ICP Pack — Multifamily Investment Market
**Priority:** P0 | **Points:** 2 | **Assignee:** Eng | **Status:** ✅ Done

**Description:**
Create a CRE-specific ICP Pack representing the multifamily investment market segment with industry-specific jargon, pain points, regulations, and buyer personas.

**Implementation Details:**
- Add new ICP pack in `app/src/lib/packs/icpPacks.ts`
- Pack ID: `icp-cre-multifamily`
- Include CRE jargon: cap rate, NOI, NNN, GRM, TI allowance, free rent, DSCR, pro forma, value-add, stabilized yield, cost segregation, 1031 exchange, qualified intermediary
- Pain Points: cap rate compression, rising interest rates, off-market difficulty, PM quality affecting NOI, regulatory compliance
- Regulations: 1031 Exchange (IRS), Fair Housing Act, ADA, local rent control, Cal/OSHA
- Buyer Personas: Principal Broker, Investment Analyst, Property Manager, Syndicator

**Acceptance Criteria:**
- [ ] ICP pack appears in PackSelector under "Client Profile"
- [ ] All CRE jargon is included in the vertical definition
- [ ] AI uses CRE jargon naturally during simulation
- [ ] Pain points and deal blockers are realistic for SoCal multifamily market

---

### S2-03: CRE Product Pack — South Coast Commercial Services
**Priority:** P0 | **Points:** 2 | **Assignee:** Eng | **Status:** ✅ Done

**Description:**
Create a Product Pack representing South Coast Commercial's brokerage and property management services, including competitor positioning against CBRE, Marcus & Millichap, and Cushman & Wakefield.

**Implementation Details:**
- Add new product pack in `app/src/lib/packs/productPacks.ts`
- Pack ID: `prod-southcoast-cre`
- Company: South Coast Commercial CRE & Property Management
- Value Props: SoCal multifamily expertise, full-service (brokerage + PM + asset mgmt), 1031 exchange specialist, in-house maintenance, data-driven marketing
- Features: market analysis, professional photography/3D tours, targeted syndication, investor matching, PM reporting
- Competitors: CBRE, Marcus & Millichap, Cushman & Wakefield, local boutique firms
- Objection handling: "Why not go with a national brand?", "What's your track record?", "Why are your fees higher?"
- aiContext: Guide AI to reference SoCal multifamily market conditions, recent transactions, cap rate trends

**Acceptance Criteria:**
- [ ] Product pack appears in PackSelector under "Your Services"
- [ ] Competitor positioning enables realistic competitive objections from AI
- [ ] Objection handling scenarios feel authentic to CRE brokerage sales
- [ ] aiContext produces conversations that sound like real CRE discussions

---

### S2-04: CRE Quick Demo Preset
**Priority:** P0 | **Points:** 1 | **Assignee:** Eng | **Status:** ✅ Done

**Description:**
Add a CRE-specific quick demo preset to the landing page for one-click launch into a Listing Presentation scenario with voice mode.

**Implementation Details:**
- Add preset in `app/src/lib/packs/demoPresets.ts`
- Preset config:
  - Product: South Coast CRE Services
  - ICP: CRE Multifamily Investor
  - Training: CRE Broker → Property Owner subject → Listing Presentation scenario
  - Voice mode: enabled
  - Demo label: "🏗️ CRE Listing Presentation"
- Add demo button to landing page hero section in `app/src/app/page.tsx`

**Acceptance Criteria:**
- [ ] "🏗️ CRE Listing Presentation" button visible on landing page
- [ ] One click launches directly into voice-first CRE simulation
- [ ] AI property owner opens with a natural CRE greeting
- [ ] Full simulation loop works (voice in → AI response → coaching debrief)

---

### S2-05: CRE Voice Mode Smoke Test
**Priority:** P0 | **Points:** 2 | **Assignee:** Eng | **Status:** ✅ Done (voice profiles + CRE debrief coaching)

**Description:**
End-to-end verification that the voice-first simulation pipeline works correctly with CRE content, including TTS voice selection, STT accuracy for CRE jargon, and natural conversation flow.

**Implementation Details:**
- Test all 5 CRE subject archetypes in voice mode
- Verify ElevenLabs voice selection is appropriate for CRE personas
- Test STT accuracy with common CRE terms (cap rate, NOI, 1031, etc.)
- Run at least 3 full simulation sessions end-to-end
- Verify debrief screen generates meaningful CRE-specific coaching

**Acceptance Criteria:**
- [ ] Voice-first loop works for all CRE scenarios without errors
- [ ] TTS voice matches persona (e.g., professional tone for institutional investor)
- [ ] CRE terminology is transcribed correctly by STT
- [ ] Debrief provides CRE-specific feedback, not generic sales tips
- [ ] At least one full demo run recorded as reference for pitch rehearsal

---

### S2-06: CRE Stakeholder Profile Generation
**Priority:** P1 | **Points:** 2 | **Assignee:** Eng | **Status:** ✅ Done

**Description:**
Generate realistic individual profiles for each CRE subject archetype — unique names, backstories, personality traits, and physical descriptions using the existing AI stakeholder generation endpoint.

**Implementation Details:**
- Use existing `/api/stakeholder/generate` endpoint
- Generate 2-3 profiles per CRE subject archetype (10-15 total)
- Each profile needs: name, title, company, industry, backstory, personality traits, physical description
- Profiles should reflect SoCal CRE market — reference local cities, property types, investment strategies

**Acceptance Criteria:**
- [ ] Each CRE archetype has at least 2 distinct AI-generated profiles
- [ ] Profiles include realistic SoCal CRE backstories
- [ ] Profile variety creates meaningfully different conversations
- [ ] Profiles are stored and selectable during simulation setup

---

## Sprint Metrics

| Metric | Target | Actual |
|--------|--------|--------|
| Stories Completed | 6/6 | — |
| Points Completed | 14/14 | — |
| CRE Demo Functional | ✅ | — |
| Voice Loop + CRE | ✅ | — |
| Pitch-Ready by Mar 24 | ✅ | — |

## Notes
- This is a **rapid sprint** — 6 business days to pitch-ready
- All work must be demo-stable by Monday March 24 EOD for Tuesday pitch rehearsal
- Phase 2 CRE features (SMART Broker scoring, CoStar integration, team dashboard) deferred to Sprint 3+
- UI label changes (Product → Services, ICP → Client Profile) are P2 and deferred
