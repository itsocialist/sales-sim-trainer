/**
 * OpenAI TTS Provider — SalesSim (Legacy Fallback)
 * 
 * Uses OpenAI's TTS API as the last-resort fallback.
 * Lower quality than ElevenLabs but always available if OPENAI_API_KEY is set.
 */

import type { TTSProvider, TTSRequest, TTSResponse } from './types';

export class OpenAITTSProvider implements TTSProvider {
    name = 'openai' as const;
    private apiKey: string;

    constructor() {
        this.apiKey = process.env.OPENAI_API_KEY || '';
    }

    isAvailable(): boolean {
        return this.apiKey.length > 0;
    }

    async synthesize(request: TTSRequest): Promise<TTSResponse> {
        const startTime = Date.now();
        const { text, voiceProfile } = request;

        const response = await fetch('https://api.openai.com/v1/audio/speech', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'tts-1',
                voice: voiceProfile.openaiVoice,
                input: text,
                response_format: 'mp3',
                speed: 1.0,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            throw new Error(
                `OpenAI TTS failed (${response.status}): ${errorText}`
            );
        }

        const audioBuffer = await response.arrayBuffer();
        const latencyMs = Date.now() - startTime;

        return {
            audioBuffer,
            contentType: 'audio/mpeg',
            provider: 'openai',
            latencyMs,
        };
    }
}
