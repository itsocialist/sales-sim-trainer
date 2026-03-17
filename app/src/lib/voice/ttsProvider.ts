/**
 * TTS Provider Router — SalesSim
 * 
 * Routes TTS requests to the configured provider with automatic fallback.
 * 
 * Priority chain: TTS_PROVIDER env → ElevenLabs → Fish Audio → OpenAI
 * If the primary provider fails, falls back to the next available provider.
 */

import type { TTSProvider, TTSProviderName, TTSRequest, TTSResponse } from './types';
import { ElevenLabsProvider } from './elevenlabs';
import { FishAudioProvider } from './fishAudio';
import { OpenAITTSProvider } from './openaiTTS';

// Singleton instances (created once per server lifecycle)
let providers: Map<TTSProviderName, TTSProvider> | null = null;

function getProviders(): Map<TTSProviderName, TTSProvider> {
    if (!providers) {
        providers = new Map();
        
        const elevenlabs = new ElevenLabsProvider();
        const fish = new FishAudioProvider();
        const openai = new OpenAITTSProvider();

        if (elevenlabs.isAvailable()) providers.set('elevenlabs', elevenlabs);
        if (fish.isAvailable()) providers.set('fish', fish);
        if (openai.isAvailable()) providers.set('openai', openai);
    }
    return providers;
}

/**
 * Get the primary provider based on TTS_PROVIDER env var.
 * Falls back to the first available provider.
 */
function getPrimaryProvider(): TTSProviderName {
    const env = (process.env.TTS_PROVIDER || 'elevenlabs').toLowerCase() as TTSProviderName;
    const all = getProviders();
    
    // If requested provider is available, use it
    if (all.has(env)) return env;
    
    // Fallback chain
    const fallbackOrder: TTSProviderName[] = ['elevenlabs', 'fish', 'openai'];
    for (const name of fallbackOrder) {
        if (all.has(name)) return name;
    }
    
    throw new Error('No TTS provider available. Set ELEVENLABS_API_KEY, FISH_AUDIO_API_KEY, or OPENAI_API_KEY.');
}

/**
 * Get fallback providers (everything except the primary).
 */
function getFallbacks(primary: TTSProviderName): TTSProviderName[] {
    const all = getProviders();
    const fallbackOrder: TTSProviderName[] = ['elevenlabs', 'fish', 'openai'];
    return fallbackOrder.filter(name => name !== primary && all.has(name));
}

/**
 * Synthesize speech with automatic fallback.
 * 
 * 1. Try the primary provider (TTS_PROVIDER env var)
 * 2. If it fails, try each fallback in order
 * 3. If all fail, throw the last error
 */
export async function synthesizeSpeech(request: TTSRequest): Promise<TTSResponse> {
    const all = getProviders();
    const primaryName = getPrimaryProvider();
    const fallbacks = getFallbacks(primaryName);
    const attemptOrder = [primaryName, ...fallbacks];

    let lastError: Error | null = null;

    for (const providerName of attemptOrder) {
        const provider = all.get(providerName);
        if (!provider) continue;

        try {
            const result = await provider.synthesize(request);
            
            // Log if we fell back
            if (providerName !== primaryName) {
                console.warn(
                    `[TTS] Primary provider '${primaryName}' failed. ` +
                    `Fell back to '${providerName}'. Latency: ${result.latencyMs}ms`
                );
            } else {
                console.log(
                    `[TTS] ${providerName} — ${result.latencyMs}ms — ${request.text.length} chars`
                );
            }

            return result;
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            console.error(`[TTS] ${providerName} failed:`, lastError.message);
        }
    }

    throw lastError || new Error('All TTS providers failed');
}

/**
 * Get info about available providers (for settings/debug).
 */
export function getProviderStatus(): { 
    primary: TTSProviderName; 
    available: TTSProviderName[]; 
    fallbacks: TTSProviderName[];
} {
    const primary = getPrimaryProvider();
    const all = getProviders();
    return {
        primary,
        available: Array.from(all.keys()),
        fallbacks: getFallbacks(primary),
    };
}
