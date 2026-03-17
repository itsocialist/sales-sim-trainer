/**
 * STT API Route — /api/stt
 * 
 * POST: Upload audio for server-side transcription (Deepgram)
 * GET:  Check STT provider status
 */

import { NextResponse } from 'next/server';
import { transcribeAudio, getSTTStatus } from '@/lib/voice/sttProvider';

/**
 * GET /api/stt — Provider status
 */
export async function GET() {
    return NextResponse.json(getSTTStatus());
}

/**
 * POST /api/stt — Transcribe audio
 * 
 * Body: raw audio data (audio/webm, audio/wav, etc.)
 * Headers: Content-Type must match the audio format
 * 
 * Response: { transcript, confidence, provider, latencyMs }
 */
export async function POST(request: Request) {
    try {
        const contentType = request.headers.get('content-type') || 'audio/webm';
        const audioBuffer = await request.arrayBuffer();

        if (!audioBuffer || audioBuffer.byteLength === 0) {
            return NextResponse.json(
                { error: 'No audio data provided' },
                { status: 400 }
            );
        }

        const result = await transcribeAudio({
            audioBuffer,
            contentType,
            language: 'en',
        });

        return NextResponse.json({
            transcript: result.transcript,
            confidence: result.confidence,
            provider: result.provider,
            latencyMs: result.latencyMs,
        });
    } catch (error) {
        console.error('STT error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Transcription failed' },
            { status: 500 }
        );
    }
}
