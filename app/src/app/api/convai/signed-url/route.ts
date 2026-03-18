/**
 * ElevenLabs Conversational AI — Signed URL Generator
 * 
 * Creates a temporary signed WebSocket URL for the client to connect to
 * ElevenAgents without exposing the API key. URLs are valid for 15 minutes,
 * but conversations can continue beyond that window.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
        return NextResponse.json(
            { error: 'ElevenLabs API key not configured' },
            { status: 500 }
        );
    }

    // Get agent_id from query params
    const agentId = request.nextUrl.searchParams.get('agent_id');
    if (!agentId) {
        return NextResponse.json(
            { error: 'agent_id is required' },
            { status: 400 }
        );
    }

    try {
        const response = await fetch(
            `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`,
            {
                method: 'GET',
                headers: {
                    'xi-api-key': apiKey,
                },
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('ElevenLabs signed URL error:', response.status, errorText);
            return NextResponse.json(
                { error: `Failed to get signed URL: ${response.status}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json({ signed_url: data.signed_url });
    } catch (error) {
        console.error('Signed URL generation failed:', error);
        return NextResponse.json(
            { error: 'Failed to generate signed URL' },
            { status: 500 }
        );
    }
}
