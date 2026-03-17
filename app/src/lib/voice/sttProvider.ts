/**
 * STT Provider Router
 * 
 * Manages STT providers with fallback chain:
 *   Deepgram (server-side, high accuracy) → Web Speech API (client-side, free)
 * 
 * STT_PROVIDER env var controls the preferred provider.
 * Client-side Web Speech API is handled directly in VoiceInput.tsx;
 * this router is for server-side transcription via /api/stt.
 */

import { type STTProvider, type STTRequest, type STTResponse } from './types';
import { DeepgramSTTProvider } from './deepgram';

const deepgram = new DeepgramSTTProvider();

// Server-side providers only
const providers: STTProvider[] = [deepgram];

/**
 * Get the preferred STT provider
 */
function getPreferredProvider(): STTProvider | null {
    const preferred = process.env.STT_PROVIDER || 'deepgram';

    // Try preferred first
    const pref = providers.find(p => p.name === preferred && p.isAvailable());
    if (pref) return pref;

    // Fallback to any available
    return providers.find(p => p.isAvailable()) || null;
}

/**
 * Transcribe audio using the best available STT provider
 */
export async function transcribeAudio(request: STTRequest): Promise<STTResponse> {
    const provider = getPreferredProvider();

    if (!provider) {
        throw new Error('No STT provider available. Set DEEPGRAM_API_KEY in .env.local');
    }

    return provider.transcribe(request);
}

/**
 * Get current STT provider status
 */
export function getSTTStatus() {
    return {
        primary: getPreferredProvider()?.name || 'none',
        available: providers.filter(p => p.isAvailable()).map(p => p.name),
        clientSide: ['webspeech'],
        note: 'Web Speech API runs client-side (no server key needed). Deepgram runs server-side for higher accuracy.',
    };
}
