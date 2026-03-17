---
description: How to configure and test voice providers (ElevenLabs, Fish Audio) for SalesSim
---
# Voice Integration Workflow

## Environment Setup

1. **Add API keys to `.env.local`**
   ```env
   ELEVENLABS_API_KEY=<key>
   FISH_AUDIO_API_KEY=<key>
   TTS_PROVIDER=elevenlabs   # or 'fish' or 'openai'
   STT_PROVIDER=deepgram     # or 'whisper'
   DEEPGRAM_API_KEY=<key>
   ```

2. **Install dependencies** (if not already present)
   ```bash
   cd /Users/briandawson/workspace/sales-sim-trainer/app && npm install
   ```

## Testing Voice Output (TTS)

1. Start the dev server
2. Navigate to any simulation
3. Send a message and wait for the AI response
4. Click the ▶ play button on the response to test TTS
5. Check Network tab — verify the `/api/tts` call succeeds with audio/mpeg response

## Testing Voice Input (STT)

1. Start the dev server
2. Navigate to a simulation
3. Click the microphone button (or press the push-to-talk key)
4. Speak a sales message
5. Verify transcription appears in the input field
6. Verify the message sends correctly

## Switching Providers

- Change `TTS_PROVIDER` in `.env.local` to switch between `elevenlabs`, `fish`, or `openai`
- Change `STT_PROVIDER` to switch between `deepgram` or `whisper`
- Restart the dev server after changing env vars

## Voice Mapping

Each stakeholder subject has a voice profile. The voice selection logic lives in:
- `app/src/app/api/tts/route.ts` — server-side TTS provider router
- Voice profiles are mapped from stakeholder metadata (gender, age, personality)
