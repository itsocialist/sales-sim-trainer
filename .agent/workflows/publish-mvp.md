---
description: Publish SalesSim MVP — build, deploy, and go-to-market checklist
---
# Publish MVP Workflow

## Pre-Publish Checklist

1. **All sprint stories complete** — verify in `docs/sprints/`
2. **No critical bugs** — run full app test
3. **Environment variables documented** in `app/ENV_SETUP.md`
4. **README polished** — product screenshots, feature list, quick start guide
5. **Marketing assets ready** — `docs/SalesSim_Marketing_OneSheet.docx` and `.pptx`

## Build & Deploy

1. **Run production build**
   ```bash
   cd /Users/briandawson/workspace/sales-sim-trainer/app && npm run build
   ```

2. **Fix any build errors** — type errors, missing imports, etc.

3. **Deploy to Vercel** (or target platform)
   ```bash
   npx vercel --prod
   ```

4. **Set environment variables** on the deployment platform:
   - `OPENAI_API_KEY`
   - `ANTHROPIC_API_KEY`
   - `ELEVENLABS_API_KEY`
   - `FISH_AUDIO_API_KEY`
   - `DEEPGRAM_API_KEY`
   - `TTS_PROVIDER`
   - `STT_PROVIDER`

## Post-Deploy Verification

1. **Smoke test** — run through a full simulation cycle on production
2. **Test voice** — verify TTS and STT work
3. **Test product upload** — upload a product doc and verify it persists
4. **Test ICP creation** — create an ICP with vertical and verify it appears

## Go-To-Market

1. **Update GitHub README** — add live demo link
2. **Polish landing page** (if deployed)
3. **Share marketing one-sheet** with target prospects
4. **Create demo video** — screen recording of a full sim session
