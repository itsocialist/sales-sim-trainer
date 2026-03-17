# Sprint 1 — Voice & Foundation
**Sprint Duration:** Mar 18 – Mar 31, 2026  
**Sprint Goal:** Enable voice-first simulation with ElevenLabs/Fish Audio and lay infrastructure groundwork.  
**Status:** 🟢 ACTIVE

---

## Stories

### S1-01: ElevenLabs TTS Integration
**Priority:** P0 | **Points:** 5 | **Assignee:** Eng | **Status:** ✅ Done (PR #8)

**Description:**
Replace OpenAI TTS with ElevenLabs for higher-quality, emotionally expressive voices.

**Implementation Details:**
- Create `app/src/lib/voice/ttsProvider.ts` — provider abstraction layer
- Create `app/src/lib/voice/elevenlabs.ts` — ElevenLabs API client
- Map each stakeholder subject to an ElevenLabs voice ID based on persona
- Support voice settings per persona: `stability`, `similarity_boost`, `style`
- Use ElevenLabs API key from `ai-outbound-caller` project: `sk_41e7fe0b3a8de9d3de676a49c9acb47d522bc3680a8ff481`
- Alternatively use key from `claude-cowork` / `revops-intelligence`: `830133a877f53f26766fdadf56bc5b65894aab8481d84d62327c806e69fb0037`

**Acceptance Criteria:**
- [ ] ElevenLabs TTS works when `TTS_PROVIDER=elevenlabs`
- [ ] Each stakeholder has a distinct, persona-appropriate voice
- [ ] Voice settings (stability, expressiveness) match stakeholder personality
- [ ] Fallback to OpenAI TTS if ElevenLabs fails

---

### S1-02: Fish Audio TTS Fallback
**Priority:** P0 | **Points:** 3 | **Assignee:** Eng | **Status:** ✅ Done (PR #8)

**Description:**
Implement Fish Audio as a cost-effective TTS alternative behind the same provider abstraction.

**Implementation Details:**
- Create `app/src/lib/voice/fishAudio.ts` — Fish Audio API client
- Same voice mapping interface as ElevenLabs
- Route selection via `TTS_PROVIDER` env var (`elevenlabs` | `fish` | `openai`)
- Cost comparison: Fish Audio ~$0.015/1K chars vs ElevenLabs ~$0.18/1K chars (12x cheaper)

**Acceptance Criteria:**
- [ ] Fish Audio TTS works when `TTS_PROVIDER=fish`
- [ ] Switching providers requires only an env var change
- [ ] Audio quality is acceptable for training purposes

---

### S1-03: Speech-to-Text (STT) Input
**Priority:** P0 | **Points:** 5 | **Assignee:** Eng | **Status:** ✅ Done (PR #9)

**Description:**
Add voice input so reps can speak their responses instead of typing.

**Implementation Details:**
- Create `app/src/components/VoiceInput.tsx` — mic button with push-to-talk
- Use browser Web Speech API (SpeechRecognition) as default provider
- Add to `SimulationChat.tsx` input area: mic icon button + spacebar hotkey
- On transcription complete → populate input field → auto-send option
- Visual feedback: pulsing mic indicator, waveform animation
- Permissions handling: request mic access, handle denial gracefully

**Acceptance Criteria:**
- [ ] User can click mic button or press spacebar to start recording
- [ ] Speech is transcribed to text in the input field
- [ ] Auto-send option sends the message after transcription
- [ ] Visual indicator shows recording state
- [ ] Works in Chrome, Edge, Safari

---

### S1-04: Deepgram STT Integration
**Priority:** P1 | **Points:** 3 | **Assignee:** Eng | **Status:** ✅ Done (PR #11)

**Description:**
Add server-side Deepgram as a higher-accuracy STT alternative.

**Implementation Details:**
- Create `app/src/lib/voice/sttProvider.ts` — STT provider abstraction
- Create `app/src/app/api/stt/route.ts` — server-side Deepgram endpoint
- Route via `STT_PROVIDER` env var (`webspeech` | `deepgram`)
- WebSocket-based streaming for real-time transcription

**Acceptance Criteria:**
- [ ] Deepgram STT works when `STT_PROVIDER=deepgram`
- [ ] Real-time transcription appears as user speaks
- [ ] Fallback to Web Speech API if Deepgram unavailable

---

### S1-05: Voice-First Simulation Mode
**Priority:** P0 | **Points:** 5 | **Assignee:** Eng | **Status:** ✅ Done (PR #10)

**Description:**
Enable "hands-free" mode for continuous voice conversation.

**Implementation Details:**
- Add toggle in simulation header: "VOICE MODE" on/off
- When enabled:
  1. AI response auto-plays via TTS
  2. After TTS finishes, mic auto-activates (2s delay)
  3. After user speech transcribed → auto-send
  4. AI responds → back to step 1
- Visual: full-screen mode with prominent avatar, waveform visualization, minimal chrome
- Push-to-talk override always available (spacebar)
- "End Session" via voice command: "end simulation" or escape key

**Acceptance Criteria:**
- [ ] Toggle enables/disables voice-first mode
- [ ] Continuous voice loop works without touching keyboard/mouse
- [ ] User can interrupt at any time
- [ ] Session can be ended via voice or keyboard

---

### S1-06: Design System Audit
**Priority:** P1 | **Points:** 3 | **Assignee:** UI/UX | **Status:** ✅ Done

**Description:**
UI/UX designer reviews the current Iron Bank design system and app UX.

**Deliverables:**
- [ ] Design audit document (current strengths, gaps, inconsistencies)
- [ ] Design brief for Sprint 2+ work (product setup page, ICP builder, settings)
- [ ] Component inventory (what exists, what's needed)
- [ ] Color/typography/spacing recommendations

---

### S1-07: Scenario Realism Review
**Priority:** P1 | **Points:** 2 | **Assignee:** Sales Expert | **Status:** ✅ Done

**Description:**
Sales domain expert audits all training pack content for realism.

**Deliverables:**
- [ ] Annotated review of all 3 training packs
- [ ] Flagged unrealistic behaviors or responses
- [ ] Missing objection patterns to add
- [ ] MEDDIC mapping accuracy assessment
- [ ] Recommended new scenarios/archetypes for Sprint 2

---

## Sprint Metrics

| Metric | Target | Actual |
|--------|--------|--------|
| Stories Completed | 7/7 | 7/7 ✅ |
| Points Completed | 26/26 | 26/26 ✅ |
| Voice Loop Working | ✅ | ✅ |
| Provider Abstraction | ✅ | ✅ |
| Design Brief Delivered | ✅ | ✅ |
| Sales Audit Delivered | ✅ | ✅ |

## Notes
- ElevenLabs API keys available from `ai-outbound-caller` and `claude-cowork` projects
- Existing `AudioPlayer.tsx` and `api/tts/route.ts` need refactoring, not replacing
- Legacy `api/chat/route.ts` references old behavioral-sim-trainer profiles — can be removed once confirmed unused
