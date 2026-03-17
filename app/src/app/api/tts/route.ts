/**
 * TTS API Route — SalesSim
 * 
 * Synthesizes speech from text using the configured TTS provider.
 * Supports ElevenLabs (premium), Fish Audio (cost-effective), and OpenAI (fallback).
 * 
 * Provider selection: TTS_PROVIDER env var → automatic fallback
 * 
 * POST /api/tts
 * Body: { text, subjectCondition?, subjectName?, subjectAge? }
 * Response: audio/mpeg binary
 */

import { NextRequest } from 'next/server';
import { synthesizeSpeech, getProviderStatus, resolveVoiceProfile, resolveVoiceFromNameAge } from '@/lib/voice';
import type { TTSRequest } from '@/lib/voice';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { text, subjectCondition, subjectName, subjectAge } = body;

        if (!text || text.trim().length === 0) {
            return new Response(JSON.stringify({ error: 'No text provided' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Resolve voice profile from stakeholder context
        // Priority: subjectCondition (new) > subjectName/Age (legacy)
        const voiceProfile = subjectCondition
            ? resolveVoiceProfile(subjectCondition)
            : resolveVoiceFromNameAge(subjectName || 'default', subjectAge || '35');

        // Build TTS request
        const ttsRequest: TTSRequest = {
            text: text.trim(),
            voiceProfile,
            format: 'mp3',
        };

        // Synthesize with automatic fallback
        const result = await synthesizeSpeech(ttsRequest);

        // Return audio binary
        return new Response(result.audioBuffer, {
            headers: {
                'Content-Type': result.contentType,
                'Content-Length': result.audioBuffer.byteLength.toString(),
                'X-TTS-Provider': result.provider,
                'X-TTS-Latency-Ms': result.latencyMs.toString(),
                'X-Voice-Name': voiceProfile.name,
            },
        });
    } catch (error) {
        console.error('TTS API error:', error);
        const message = error instanceof Error ? error.message : 'Failed to generate speech';
        return new Response(JSON.stringify({ error: message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

/**
 * GET /api/tts — Provider status endpoint
 * Returns which providers are available and which is primary.
 */
export async function GET() {
    try {
        const status = getProviderStatus();
        return new Response(JSON.stringify(status), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to get provider status';
        return new Response(JSON.stringify({ error: message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
