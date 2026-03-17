# Sprint 1 Planning Meeting — SalesSim
**Date:** March 17, 2026 (Mon)  
**Sprint Duration:** March 18 – March 31, 2026  
**Attendees:** Brian Dawson (PO), Antigravity AI (Eng), Maya Torres (UI/UX), Marcus Chen (Sales Expert)

---

## 📋 Agenda

1. Team introductions & roles
2. Product vision alignment
3. Current state walkthrough
4. Sprint 1 goal & story review
5. Capacity planning
6. Commitments & risks

---

## 1. Team Introductions

**Brian Dawson (Product Owner):**
> "SalesSim started as a fork of a behavioral simulation trainer. We've customized it for enterprise sales — MEDDIC/MEDDPICC, realistic stakeholder conversations. The core simulation works but we need to level it up to a real product. The killer feature is voice-first: reps should feel like they're on an actual sales call, not typing into a chatbot."

**Antigravity AI (Lead Engineer):**
> "Current stack is Next.js 16 + TypeScript + Tailwind v4. We have GPT-4o for simulation and debrief, OpenAI TTS for basic voice, and a streaming response architecture. The infrastructure is solid — we need to swap in better voice providers, add product/ICP configuration, and build persistence. I'll be the primary implementer across all engineering stories."

**Maya Torres (Senior UI/UX Designer):**
> "I've worked on Gong's conversation review interface and Chorus.ai's coaching dashboard — both are close cousins to what SalesSim needs. The current Iron Bank design system is a strong foundation. I'll focus on the voice-first simulation UX, making sure it feels like a real phone call, not a chat window. My first deliverable will be the design audit and Sprint 2 UX specs."

**Marcus Chen (Enterprise Sales Training Advisor):**
> "I've trained over 200 AEs on MEDDIC at Datadog and Salesforce. I've also evaluated every AI sales sim tool on the market — Second Nature, Hyperbound, Rehearsal VRP. What they all get wrong is the stakeholder behavior. Real CFOs don't give you neat objections; they deflect, they get distracted, they test your executive presence. I'll review every scenario and stakeholder prompt for realism and add the coaching content that's currently missing."

---

## 2. Product Vision Alignment

**Brian:**
> "Our north star is: a flight simulator for sales reps. Three things matter in Sprint 1:
> 1. **Voice-first** — this isn't a text chatbot. It's a phone call simulator.
> 2. **Quality voices** — ElevenLabs for premium, Fish Audio for cost-effective training at scale.
> 3. **Lay the foundation** for Sprint 2's product/ICP self-configuration.
>
> MVP target is Sprint 4 (May 12). Market launch is Sprint 6 (June 9)."

**Marcus (validation):**
> "The voice angle is the right move. Second Nature and Hyperbound both have voice, but their stakeholder behavior is predictable and scripted. If our AI stakeholders sound and behave like real executives, that's the differentiation."

**Maya (validation):**
> "Voice-first also means we need to rethink the UI. Current chat bubble layout is wrong for a voice conversation. I'm thinking: avatar-centric, minimal chrome, waveform visualization, and the chat transcript as a background element — like a real call recording interface."

---

## 3. Current State Walkthrough

| Component | Status | Notes |
|-----------|--------|-------|
| Pack Selector | ✅ Working | 3 training packs, stakeholder/scenario selection |
| Simulation Chat | ✅ Working | GPT-4o streaming, behavior analysis, distance/temp meters |
| Debrief | ✅ Working | MEDDIC scoring, strengths/gaps analysis |
| TTS (OpenAI) | ✅ Working | Basic voice-mapped output, but quality is mediocre |
| STT | ❌ None | No voice input at all |
| ElevenLabs | ❌ None | API key available, not integrated |
| Product Config | ❌ None | No product definition capability |
| ICP Builder | ❌ None | No ICP definition capability |
| Auth | ❌ None | No user accounts |
| Database | ❌ None | No persistence (localStorage only) |
| Mobile | ❌ None | Not responsive |

---

## 4. Sprint 1 Stories — Review & Commitment

### Sprint Goal
> **"Enable voice-first simulation with ElevenLabs/Fish Audio so a rep can complete an entire sim session without touching the keyboard."**

### Stories Reviewed

| ID | Story | Pts | Priority | Owner | Status |
|----|-------|-----|----------|-------|--------|
| [S1-01](https://github.com/itsocialist/sales-sim-trainer/issues/1) | ElevenLabs TTS integration | 5 | P0 | Eng | ✅ Committed |
| [S1-02](https://github.com/itsocialist/sales-sim-trainer/issues/2) | Fish Audio TTS fallback | 3 | P0 | Eng | ✅ Committed |
| [S1-03](https://github.com/itsocialist/sales-sim-trainer/issues/3) | Speech-to-Text (STT) input | 5 | P0 | Eng | ✅ Committed |
| [S1-04](https://github.com/itsocialist/sales-sim-trainer/issues/4) | Deepgram STT integration | 3 | P1 | Eng | ✅ Committed |
| [S1-05](https://github.com/itsocialist/sales-sim-trainer/issues/5) | Voice-first simulation mode | 5 | P0 | Eng | ✅ Committed |
| [S1-06](https://github.com/itsocialist/sales-sim-trainer/issues/6) | Design system audit | 3 | P1 | Maya | ✅ Committed |
| [S1-07](https://github.com/itsocialist/sales-sim-trainer/issues/7) | Scenario realism review | 2 | P1 | Marcus | ✅ Committed |

**Total committed:** 26 points

### Discussion Highlights

**Marcus on S1-01 (ElevenLabs):**
> "Voice quality matters more than people think. When an AI stakeholder sounds robotic, the rep mentally checks out — they know it's fake. ElevenLabs' emotional range will let us have a CFO sound annoyed and skeptical vs. a Champion who sounds enthusiastic but cautious. That difference is what makes reps actually improve."

**Maya on S1-05 (Voice-First Mode):**
> "I want to prototype two layouts for voice mode: (1) a full-screen avatar-centric view with the waveform as the primary visual, and (2) a split-view with the conversation transcript scrolling in real-time. I'll have wireframes for both by Wednesday of Week 1 so we can decide before implementation."

**Brian on dependency order:**
> "S1-01 and S1-02 (TTS providers) should land first — they unblock S1-05 (voice-first mode). S1-03 (STT) can proceed in parallel. S1-04 (Deepgram) is a nice-to-have if we hit capacity."

---

## 5. Capacity Planning

| Team Member | Available Hrs | Committed Pts | Risk |
|-------------|--------------|---------------|------|
| Eng (Antigravity) | Full-time | 21 pts | Low — clear specs, API keys available |
| Maya Torres | 25 hrs/week | 3 pts | Low — design audit is independent |
| Marcus Chen | 8 hrs/week | 2 pts | Low — review is async |

---

## 6. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| ElevenLabs rate limits | Voice mode interrupted | Fish Audio fallback (S1-02) |
| Web Speech API browser compat | STT fails in Safari | Deepgram fallback (S1-04) |
| Voice mode latency (TTS → mic → STT → response) | Unnatural conversation flow | Stream TTS in chunks, pre-warm mic |
| Fish Audio voice quality | Training quality suffers | Keep ElevenLabs as premium tier |

---

## 7. Action Items & Next Steps

| Action | Owner | Due |
|--------|-------|-----|
| Start S1-01 (ElevenLabs TTS) implementation | Eng | Mar 19 |
| Start S1-03 (STT) implementation in parallel | Eng | Mar 19 |
| Deliver design audit document | Maya | Mar 21 |
| Begin scenario review (Enterprise AE pack first) | Marcus | Mar 21 |
| First design review (voice-first wireframes) | Maya + Brian | Mar 19 (Wed) |
| First standup check | All | Mar 18 (Tue) |

---

## Meeting Summary

✅ **Sprint 1 is officially kicked off.**  
📍 All 7 stories committed (26 points).  
🎯 Sprint goal: voice-first simulation, end-to-end, without keyboard.  
🔗 All stories synced to GitHub Issues (#1–#7).  
📅 Next ceremony: Daily async standup starting March 18.
