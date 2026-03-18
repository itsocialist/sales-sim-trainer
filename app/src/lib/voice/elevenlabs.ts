/**
 * ElevenLabs TTS Provider — SalesSim
 * 
 * Premium voice synthesis with emotional range.
 * API: https://api.elevenlabs.io/v1/text-to-speech/{voice_id}
 */

import type { TTSProvider, TTSRequest, TTSResponse } from './types';

const ELEVENLABS_API_BASE = 'https://api.elevenlabs.io/v1';

export class ElevenLabsProvider implements TTSProvider {
    name = 'elevenlabs' as const;
    private apiKey: string;

    constructor() {
        this.apiKey = process.env.ELEVENLABS_API_KEY || '';
    }

    isAvailable(): boolean {
        return this.apiKey.length > 0;
    }

    async synthesize(request: TTSRequest): Promise<TTSResponse> {
        const startTime = Date.now();
        const { text, voiceProfile, format = 'mp3' } = request;

        const voiceId = voiceProfile.elevenlabsVoiceId;
        const settings = voiceProfile.elevenlabsSettings;

        // Use eleven_v3 for dialog (most natural conversational prosody)
        // Fall back to turbo for very long responses where latency matters more
        const modelId = text.length > 800
            ? 'eleven_turbo_v2_5'
            : 'eleven_v3';

        // Add latency optimization for real-time dialog (level 2 = 75% improvement)
        const optimizeLatency = text.length < 300 ? 2 : 1;

        const response = await fetch(
            `${ELEVENLABS_API_BASE}/text-to-speech/${voiceId}?optimize_streaming_latency=${optimizeLatency}`,
            {
                method: 'POST',
                headers: {
                    'xi-api-key': this.apiKey,
                    'Content-Type': 'application/json',
                    'Accept': `audio/${format}`,
                },
                body: JSON.stringify({
                    text,
                    model_id: modelId,
                    output_format: format === 'mp3' ? 'mp3_44100_128' : format,
                    voice_settings: {
                        stability: settings.stability,
                        similarity_boost: settings.similarity_boost,
                        style: settings.style,
                        use_speaker_boost: settings.use_speaker_boost,
                    },
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            throw new Error(
                `ElevenLabs TTS failed (${response.status}): ${errorText}`
            );
        }

        const audioBuffer = await response.arrayBuffer();
        const latencyMs = Date.now() - startTime;

        return {
            audioBuffer,
            contentType: `audio/${format === 'mp3' ? 'mpeg' : format}`,
            provider: 'elevenlabs',
            latencyMs,
        };
    }
}
