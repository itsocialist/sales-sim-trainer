/**
 * ElevenLabs ConvAI — Dynamic Agent Creation
 * 
 * Creates an ElevenAgents agent on-the-fly for each simulation session.
 * The agent gets the full scenario system prompt, correct voice, and
 * first message — then handles STT → LLM → TTS + turn-taking natively.
 */

import { NextRequest, NextResponse } from 'next/server';

interface CreateAgentRequest {
    /** System prompt (full character/scenario context) */
    systemPrompt: string;
    /** First message the agent speaks */
    firstMessage: string;
    /** ElevenLabs voice ID for this stakeholder */
    voiceId: string;
    /** Agent display name */
    agentName: string;
}

export async function POST(request: NextRequest) {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
        return NextResponse.json(
            { error: 'ElevenLabs API key not configured' },
            { status: 500 }
        );
    }

    try {
        const body: CreateAgentRequest = await request.json();
        const { systemPrompt, firstMessage, voiceId, agentName } = body;

        // Create ephemeral agent via ElevenLabs API
        const agentResponse = await fetch(
            'https://api.elevenlabs.io/v1/convai/agents/create',
            {
                method: 'POST',
                headers: {
                    'xi-api-key': apiKey,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: agentName,
                    conversation_config: {
                        agent: {
                            prompt: {
                                prompt: systemPrompt,
                            },
                            first_message: firstMessage,
                            language: 'en',
                        },
                        tts: {
                            voice_id: voiceId,
                            model_id: 'eleven_turbo_v2',
                            stability: 0.4,
                            similarity_boost: 0.75,
                        },
                    },
                }),
            }
        );

        if (!agentResponse.ok) {
            const errorText = await agentResponse.text();
            console.error('Agent creation failed:', agentResponse.status, errorText);
            return NextResponse.json(
                { error: `Failed to create agent: ${agentResponse.status}`, details: errorText },
                { status: agentResponse.status }
            );
        }

        const agentData = await agentResponse.json();
        const agentId = agentData.agent_id;

        // Now get a signed URL for this agent
        const signedUrlResponse = await fetch(
            `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`,
            {
                method: 'GET',
                headers: { 'xi-api-key': apiKey },
            }
        );

        if (!signedUrlResponse.ok) {
            const errorText = await signedUrlResponse.text();
            console.error('Signed URL failed:', signedUrlResponse.status, errorText);
            return NextResponse.json(
                { error: `Failed to get signed URL: ${signedUrlResponse.status}` },
                { status: signedUrlResponse.status }
            );
        }

        const signedUrlData = await signedUrlResponse.json();

        return NextResponse.json({
            agent_id: agentId,
            signed_url: signedUrlData.signed_url,
        });
    } catch (error) {
        console.error('Agent creation error:', error);
        return NextResponse.json(
            { error: 'Failed to create conversational agent' },
            { status: 500 }
        );
    }
}

/**
 * Cleanup: Delete an agent when the session ends
 */
export async function DELETE(request: NextRequest) {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: 'No API key' }, { status: 500 });
    }

    const agentId = request.nextUrl.searchParams.get('agent_id');
    if (!agentId) {
        return NextResponse.json({ error: 'agent_id required' }, { status: 400 });
    }

    try {
        await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, {
            method: 'DELETE',
            headers: { 'xi-api-key': apiKey },
        });
        return NextResponse.json({ ok: true });
    } catch {
        // Best-effort cleanup; don't fail the client
        return NextResponse.json({ ok: true });
    }
}
