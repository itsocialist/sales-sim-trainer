# S1-07: Scenario Realism Review
**Auditor:** Alex Torres (Sales Domain Expert)  
**Date:** March 17, 2026  
**Status:** ✅ Complete

---

## Executive Summary

Reviewed all 3 training packs (Enterprise AE, Mid-Market AE, SDR/BDR) including all stakeholder archetypes (8 total), scenario packs (4 per role), and subject profiles (16+ total). Overall quality: **Strong foundation, needs depth for V1 launch.** The MEDDIC integration is well-executed. Key gap: scenarios lack enough objection branching for repeat training value.

---

## 1. Training Pack Review: Enterprise AE

**Overall: 8/10** — Best-developed pack. MEDDIC signals are embedded correctly.

### Stakeholder Archetypes

| Archetype | Realism | MEDDIC Fit | Notes |
|-----------|---------|------------|-------|
| Champion / Internal Advocate | ✅ 9/10 | Excellent | Great behavior prompt — "volunteers info freely but overestimates influence." Authentic sales dynamics. |
| Economic Buyer (CFO / VP) | ✅ 9/10 | Excellent | "What's the ask and why now?" — dead accurate C-level behavior. Strong pushback patterns. |
| Blocker / Skeptic | ✅ 8/10 | Good | Realistic territorial behavior. Could add more passive-aggressive patterns ("I'll need to loop in legal"). |
| Technical Evaluator | ✅ 7/10 | Fair | Needs more detailed feature probing. Real tech evaluators ask about integrations, API limits, SLAs. |

### Subject Profiles (Enterprise)
| Subject | Realism | Improvement |
|---------|---------|-------------|
| Jordan Kim (Champion) | ✅ Good | Add a specific pain metric ("our ramp time is 90 days") |
| Priya Nair (Champion) | ✅ Great | Very authentic — protective boss dynamic |
| Marcus Webb (EB) | ✅ Good | Add a mention of a competing initiative for budget |
| Linda Hsu (EB) | ✅ Good | Add reference to board reporting requirements |
| Dave Kosinski (Blocker) | ✅ Good | Add "I've been burned by vendors before" backstory |
| Sandra Okoye (Blocker) | ✅ Fair | Needs more technical depth in backstory |
| Raj Gupta (Tech) | ✅ Good | Add specific tech stack preferences |
| Mei-Lin Zhang (Tech) | ✅ Fair | Add concern about migration effort |

### Scenario Packs (Enterprise)
| Scenario | Realism | Notes |
|----------|---------|-------|
| First Discovery Call | ✅ 8/10 | Warmth 7 / Engagement 4 is accurate. Could add more "I have a hard stop" pressure. |
| Executive Pitch / Demo | ✅ 8/10 | Good framing. Need to add a "multi-tasking executive" behavior (checking phone). |
| Late-Stage Objection Handling | ✅ 9/10 | Excellent scenario. This is where reps typically fail. |
| Multi-Stakeholder Business Review | ✅ 7/10 | Great concept but hard to execute well with single AI persona. Should multi-thread. |

---

## 2. Training Pack Review: Mid-Market AE

**Overall: 7/10** — Solid but less differentiated from Enterprise.

### Key Observations
- ✅ Grid-tier labels (["MID-MARKET", "ENTERPRISE"]) help differentiate complexity
- ⚠️ Behavior prompts for mid-market stakeholders feel too similar to enterprise — real mid-market has faster cycles, less bureaucracy, more founder involvement
- ⚠️ Missing the classic mid-market pattern: "founder who IS the economic buyer AND the champion AND the technical evaluator"

### Recommended Additions
1. **Founder-CEO archetype** — Wears many hats, makes decisions fast, but wants proof of ROI in weeks, not quarters
2. **VP of Sales who built a spreadsheet** — Already has a "solution" built in Google Sheets. You have to unsell that first.
3. **Reference-driven buyer** — Won't move forward without talking to 3 references. Tests your ability to provide relevant ones.

---

## 3. Training Pack Review: SDR/BDR

**Overall: 7/10** — Good for cold outreach practice but limited scenario depth.

### Key Observations
- ✅ Good cold calling / outreach focus
- ⚠️ Needs more "gatekeeper" scenarios (executive assistant blocking access)
- ⚠️ Missing LinkedIn/social selling scenarios
- ⚠️ Should include "referral intro" scenarios (warm intro from mutual connection)

### Recommended Additions
1. **Executive Assistant gatekeeper** — Professional, protective, but can be an ally if respected
2. **Conference/event follow-up** — "We met at Dreamforce" opener
3. **Referral warm intro** — "Sarah Chen suggested I reach out" — different dynamic than cold
4. **Re-engagement** — "We spoke 6 months ago, what's changed?"

---

## 4. Missing Objection Patterns

Critical objections not currently embedded in any behavior prompt:

| Objection | Frequency in Real Sales | Priority |
|-----------|------------------------|----------|
| "What about data privacy/security?" | Very High | P0 |
| "Our team is spread too thin for another rollout" | High | P0 |
| "Can you integrate with [competitor product]?" | High | P1 |
| "We're in a hiring freeze" | Medium | P1 |
| "Your pricing doesn't work for us" | Medium | P1 |
| "What happens when we outgrow your product?" | Medium | P2 |
| "I need to run this by procurement" | High | P0 |
| "We just signed a 2-year contract with [competitor]" | Medium | P1 |
| "Show me the ROI model" | Very High | P0 |

---

## 5. MEDDIC Mapping Accuracy

| MEDDIC Element | Coverage | Assessment |
|----------------|----------|------------|
| **M**etrics | ✅ Good | Embedded in EB and Champion behavior. Need more specific numbers. |
| **E**conomic Buyer | ✅ Excellent | EB archetype is very well-built. |
| **D**ecision Criteria | ✅ Good | Referenced but not deeply probed in scenarios. |
| **D**ecision Process | ⚠️ Fair | Mentioned but not mapped. Need more "paper process" detail (legal review, procurement, security audit). |
| **I**dentify Pain | ✅ Good | Champions and blockers surface pain differently. |
| **C**hampion | ✅ Excellent | Champion archetype is the strongest in the pack. |

### Recommended MEDDIC Enhancements
1. Add a **"Paper Process" scenario** — navigate procurement, legal, and security reviews
2. Add **explicit metric probing** in EB behavior: "Give me a number — how much is this costing you?"
3. Add **competitive trap question** in Tech Evaluator: "How do you compare to [competitor]?"

---

## 6. Recommended New Archetypes (Sprint 2+)

| Archetype | Training Pack | Rationale |
|-----------|--------------|-----------|
| Procurement Lead | Enterprise | Gating function — reps must learn to work with, not fight |
| Legal/Compliance | Enterprise | Security questionnaire and contract negotiation |
| End User / Practitioner | All | The person who actually uses the product daily |
| Founder-CEO | Mid-Market | Decision-maker who moves fast but needs social proof |
| Executive Assistant | SDR/BDR | Gatekeeper pattern — critical skill |
| Dormant Champion | Enterprise | Reactivating a previous champion after org change |

---

## 7. Recommended New Scenarios (Sprint 2+)

| Scenario | Pack | Warmth | Engagement | Notes |
|----------|------|--------|------------|-------|
| Procurement Negotiation | Enterprise | 8 | 7 | Price pushback, legal terms |
| Renewal Defense | Enterprise | 6 | 9 | Competitor threat, must retain |
| Expansion Play | Mid-Market | 9 | 8 | Happy customer, upsell opportunity |
| Multi-thread Strategy | Enterprise | 5 | 6 | Build consensus across 3+ stakeholders |
| Re-engagement Call | SDR/BDR | 4 | 3 | Reviving a dead lead |
| Referral Introduction | SDR/BDR | 8 | 6 | Warm intro, different tone |

---

## Summary

The current packs are a **strong MVP** with excellent MEDDIC integration in the Enterprise pack. The main gap is **breadth** — more objection patterns, more archetypes, and more scenario variations to give the product replay value. Sprint 2 should focus on adding the P0 objections and the most-requested archetypes (Procurement, EA/Gatekeeper, Founder-CEO).
