/**
 * Deepgram STT Provider
 * 
 * Server-side transcription using Deepgram's Nova-2 model.
 * Requires DEEPGRAM_API_KEY environment variable.
 * 
 * Cost: ~$0.0043/min (Nova-2) vs free Web Speech API
 * Advantage: Works in all browsers, higher accuracy, no mic permissions needed on server
 */

import { type STTProvider, type STTRequest, type STTResponse } from './types';

const DEEPGRAM_API_URL = 'https://api.deepgram.com/v1/listen';

export class DeepgramSTTProvider implements STTProvider {
    name: 'deepgram' = 'deepgram';

    isAvailable(): boolean {
        return !!process.env.DEEPGRAM_API_KEY;
    }

    async transcribe(request: STTRequest): Promise<STTResponse> {
        const apiKey = process.env.DEEPGRAM_API_KEY;
        if (!apiKey) {
            throw new Error('DEEPGRAM_API_KEY not configured');
        }

        const startTime = Date.now();

        const params = new URLSearchParams({
            model: 'nova-2',
            language: request.language || 'en',
            smart_format: 'true',
            punctuate: 'true',
            diarize: 'false',
            filler_words: 'false',
        });

        const response = await fetch(`${DEEPGRAM_API_URL}?${params}`, {
            method: 'POST',
            headers: {
                'Authorization': `Token ${apiKey}`,
                'Content-Type': request.contentType || 'audio/webm',
            },
            body: request.audioBuffer,
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Deepgram STT error ${response.status}: ${errorBody}`);
        }

        const data = await response.json();
        const latencyMs = Date.now() - startTime;

        const channel = data.results?.channels?.[0];
        const alternative = channel?.alternatives?.[0];

        return {
            transcript: alternative?.transcript || '',
            confidence: alternative?.confidence || 0,
            provider: 'deepgram',
            latencyMs,
            isFinal: true,
        };
    }
}
