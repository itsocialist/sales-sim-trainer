/**
 * ElevenLabsConversation — True Full-Duplex Voice via ElevenAgents
 * 
 * Uses the @elevenlabs/react SDK's useConversation hook to manage a
 * native WebSocket conversation with ElevenAgents. This replaces the
 * manual STT → API → TTS pipeline with a single WebSocket that handles:
 * 
 * 1. Speech-to-Text (ASR) — ElevenLabs' fine-tuned model
 * 2. LLM response generation — using our system prompt
 * 3. Text-to-Speech — with the correct stakeholder voice
 * 4. Turn-taking — proprietary model handles interruptions natively
 * 
 * No echo cancellation issues because ElevenAgents handles the full
 * audio pipeline server-side.
 */

'use client';

import { useConversation } from '@elevenlabs/react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { type SimulationConfig } from './PackSelector';
import type { Mode, Status } from '@elevenlabs/react';

export type ConvAIStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';

interface UseElevenLabsConversationOptions {
    config: SimulationConfig;
    onTranscriptUpdate: (role: 'user' | 'agent', text: string) => void;
    onStatusChange: (status: ConvAIStatus) => void;
    onModeChange: (mode: 'speaking' | 'listening') => void;
}

export function useElevenLabsConversation({
    config,
    onTranscriptUpdate,
    onStatusChange,
    onModeChange,
}: UseElevenLabsConversationOptions) {
    const [convStatus, setConvStatus] = useState<ConvAIStatus>('idle');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const agentIdRef = useRef<string | null>(null);
    const hasStarted = useRef(false);
    const connectingRef = useRef(false);
    const onTranscriptRef = useRef(onTranscriptUpdate);
    const onStatusRef = useRef(onStatusChange);
    const onModeRef = useRef(onModeChange);

    // Keep refs in sync
    useEffect(() => { onTranscriptRef.current = onTranscriptUpdate; }, [onTranscriptUpdate]);
    useEffect(() => { onStatusRef.current = onStatusChange; }, [onStatusChange]);
    useEffect(() => { onModeRef.current = onModeChange; }, [onModeChange]);

    const cleanupAgent = useCallback(() => {
        if (agentIdRef.current) {
            fetch(`/api/convai/agent?agent_id=${agentIdRef.current}`, { method: 'DELETE' })
                .catch(() => {/* best effort */});
            agentIdRef.current = null;
        }
    }, []);

    const conversation = useConversation({
        onConnect: () => {
            console.log('[ElevenAgents] ✓ Connected');
            connectingRef.current = false;
            setConvStatus('connected');
            onStatusRef.current('connected');
        },
        onDisconnect: () => {
            console.log('[ElevenAgents] Disconnected');
            connectingRef.current = false;
            setConvStatus('disconnected');
            onStatusRef.current('disconnected');
            cleanupAgent();
        },
        onMessage: (message) => {
            // MessagePayload: { message: string, source: "user" | "ai", role: Role }
            if (message.source === 'user' && message.message) {
                onTranscriptRef.current('user', message.message);
            } else if (message.source === 'ai' && message.message) {
                onTranscriptRef.current('agent', message.message);
            }
        },
        onModeChange: (data: { mode: Mode }) => {
            const speaking = data.mode === 'speaking';
            setIsSpeaking(speaking);
            onModeRef.current(speaking ? 'speaking' : 'listening');
        },
        onStatusChange: (data: { status: Status }) => {
            console.log('[ElevenAgents] Status:', data.status);
        },
        onError: (error: string) => {
            console.error('[ElevenAgents] Error:', error);
            connectingRef.current = false;
            setConvStatus('error');
            onStatusRef.current('error' as ConvAIStatus);
        },
    });

    // Keep a stable ref to conversation methods so startConversation doesn't re-create
    const conversationRef = useRef(conversation);
    useEffect(() => { conversationRef.current = conversation; }, [conversation]);

    const startConversation = useCallback(async () => {
        // Guard against double-mount (React Strict Mode) and overlapping calls
        if (hasStarted.current || connectingRef.current) {
            console.log('[ElevenAgents] Skipping duplicate start (hasStarted:', hasStarted.current, 'connecting:', connectingRef.current, ')');
            return;
        }
        connectingRef.current = true;
        hasStarted.current = true;

        try {
            setConvStatus('connecting');
            onStatusRef.current('connecting');

            // Build the simulation prompt for the agent
            const systemPrompt = buildConvAIPrompt(config);
            const firstMessage = buildFirstMessage(config);
            const voiceId = resolveVoiceId(config.subjectPack?.condition || '', config.subject?.name || '');

            // 1. Create agent + get signed URL in one request
            const createResponse = await fetch('/api/convai/agent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    systemPrompt,
                    firstMessage,
                    voiceId,
                    agentName: `SalesSim-${config.subject?.name || 'Agent'}`,
                }),
            });

            if (!createResponse.ok) {
                const err = await createResponse.json();
                throw new Error(err.error || 'Failed to create agent');
            }

            const { agent_id, signed_url } = await createResponse.json();
            agentIdRef.current = agent_id;

            // 2. Connect the WebSocket conversation via stable ref
            await conversationRef.current.startSession({
                signedUrl: signed_url,
            });

        } catch (error) {
            console.error('[ElevenAgents] Start failed:', error);
            connectingRef.current = false;
            setConvStatus('error');
            onStatusRef.current('error' as ConvAIStatus);
            hasStarted.current = false;
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [config]);

    const endConversation = useCallback(async () => {
        try {
            await conversationRef.current.endSession();
        } catch {
            // Connection may already be closed
        }
        cleanupAgent();
        hasStarted.current = false;
        connectingRef.current = false;
    }, [cleanupAgent]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            cleanupAgent();
        };
    }, [cleanupAgent]);

    return {
        status: convStatus,
        isSpeaking,
        startConversation,
        endConversation,
        getInputVolume: conversation.getInputVolume,
        getOutputVolume: conversation.getOutputVolume,
    };
}

// ── Prompt Builders ──────────────────────────────────────────────

function buildConvAIPrompt(config: SimulationConfig): string {
    const subject = config.subject;
    const scenario = config.scenarioPack;
    const product = config.productPack;
    const icp = config.icpPack;
    const subjectPack = config.subjectPack;

    if (!subject || !scenario) return 'You are a helpful assistant.';

    const warmth = scenario.initialDistance ?? 5;
    const engagement = scenario.initialTemperature ?? 5;

    const warmthContext = warmth <= 3
        ? 'This rep is a cold stranger — you have zero relationship and no reason to trust them yet.'
        : warmth <= 6
        ? 'You barely know this rep — professional but guarded.'
        : 'You\'re warming up. There\'s some rapport building.';

    const engagementContext = engagement >= 7
        ? 'You are interested but evaluating carefully.'
        : engagement >= 4
        ? 'You are somewhat curious but skeptical.'
        : 'You are skeptical and disinterested.';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = product as any;
    const productContext = p ? `
THE PRODUCT BEING PITCHED TO YOU:
- Product: ${p.name || ''} ${p.company ? 'by ' + p.company : ''}
${p.tagline ? '- Tagline: "' + p.tagline + '"' : ''}
${p.description ? '- What it does: ' + p.description : ''}
${p.valueProps?.length ? '- Value props: ' + p.valueProps.join('; ') : ''}
${p.competitors?.length ? '- Competitors: ' + p.competitors.map((c: { name: string }) => c.name).join(', ') : ''}
` : '';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const i = icp as any;
    const icpContext = i ? `
YOUR ORGANIZATION:
- Segment: ${i.name || ''}
${i.companySize ? '- Size: ' + i.companySize : ''}
${i.vertical?.name ? '- Industry: ' + i.vertical.name : ''}
${i.vertical?.painPoints?.length ? '- Pain points: ' + i.vertical.painPoints.slice(0, 3).join('; ') : ''}
${i.vertical?.jargon?.length ? '- Jargon you use: ' + i.vertical.jargon.slice(0, 4).join(', ') : ''}
` : '';

    return `You ARE ${subject.name}, ${subject.title} at ${subject.company || 'a company'}.

WHO YOU ARE:
- Industry: ${subject.industry || 'Technology'}
${subject.backstory ? '- Background: ' + subject.backstory : ''}
${subject.personalityTraits?.length ? '- Personality: ' + subject.personalityTraits.join(', ') : ''}

YOUR STAKEHOLDER TYPE:
${subjectPack?.condition || ''}
${subjectPack?.behaviorPrompt || ''}
${productContext}${icpContext}
SCENARIO: ${scenario.name}
${scenario.context || scenario.description || ''}
${warmthContext}
${engagementContext}

You are speaking with: a ${config.trainingPack?.targetRole || 'sales representative'}

CRITICAL VOICE CONVERSATION RULES:
- You are on a LIVE VOICE CALL. Speak naturally as a real person would.
- Keep responses SHORT — 1-3 sentences max. This is a conversation, not a monologue.
- Use natural speech patterns: "Look,...", "Well,...", "Here's the thing...", "I mean,..."
- Vary your sentence length. Sometimes one word ("No."), sometimes a full thought.
- React authentically to what the rep just said.
- If skeptical, be terse. If interested, open up slightly.
- NEVER break character. You are ${subject.name}, not an AI.
- Do NOT list questions. Ask one thing at a time, like a real person.
- Sound like a REAL person on a call — hesitations, course corrections, natural rhythm.`;
}

function buildFirstMessage(config: SimulationConfig): string {
    const scenario = config.scenarioPack;
    if (!scenario) return 'Hi there.';

    const name = (scenario.name || '').toLowerCase();
    if (name.includes('discovery')) return 'Hey, thanks for making time. So, what exactly does your company do?';
    if (name.includes('pitch') || name.includes('demo')) return 'Alright, I\'ve got about twenty minutes. Show me what you\'ve got.';
    if (name.includes('objection')) return 'Look, I\'ve been thinking about this and I have some concerns.';
    if (name.includes('business review') || name.includes('multi-stakeholder')) return 'Okay, we\'re all here. Let\'s get started.';
    return 'Hi there. So, what did you want to talk about?';
}

function resolveVoiceId(condition: string, subjectName: string): string {
    // Gender detection from subject name
    const firstName = subjectName.split(' ')[0].toLowerCase();
    const femaleNames = [
        'priya', 'diana', 'sandra', 'lisa', 'carol',
        'sarah', 'maria', 'emma', 'jennifer', 'karen',
        'patricia', 'jessica', 'ashley', 'michelle', 'amanda',
        'rachel', 'laura', 'nicole', 'anna', 'sophia',
    ];
    const isFemale = femaleNames.includes(firstName);

    // ElevenLabs voice IDs — female voices
    const FEMALE_VOICES = {
        warm: 'EXAVITQu4vr4xnSDxMaL',       // Sarah — warm, professional (Champion)
        confident: 'XB0fDUnXU5powFXDhCwa',   // Charlotte — confident, direct (VP Sales)
        professional: 'jBpfuIE2acCO8z3wKNLl', // Gigi — professional, guarded (Gatekeeper)
    };

    // ElevenLabs voice IDs — male voices
    const MALE_VOICES = {
        authoritative: 'onwK4e9ZLuTAKqWW03F9', // Daniel — commanding (Economic Buyer)
        calm: 'N2lVS1w4EtoT3dr4eOWO',          // Callum — calm, firm (Blocker)
        precise: 'IKne3meq5aSn9XLyUdCD',        // Oliver — precise (Technical)
        energetic: 'pFZP5JQG7iQjIQuC4Bku',      // Jeff — classy (Founder/CEO)
        natural: 'LcfcDJNUP1GQjkzn1xUU',        // Jamahal — vibrant (Curious Prospect)
    };

    const c = condition.toLowerCase();

    // Match archetype, then pick gender-appropriate voice
    if (c.includes('champion') || c.includes('advocate')) {
        return isFemale ? FEMALE_VOICES.warm : MALE_VOICES.natural;
    }
    if (c.includes('economic') || c.includes('cfo') || c.includes('buyer')) {
        return isFemale ? FEMALE_VOICES.confident : MALE_VOICES.authoritative;
    }
    if (c.includes('blocker') || (c.includes('skeptic') && !c.includes('curious'))) {
        return isFemale ? FEMALE_VOICES.professional : MALE_VOICES.calm;
    }
    if (c.includes('technical') || c.includes('evaluator')) {
        return isFemale ? FEMALE_VOICES.warm : MALE_VOICES.precise;
    }
    if (c.includes('founder') || c.includes('ceo')) {
        return isFemale ? FEMALE_VOICES.confident : MALE_VOICES.energetic;
    }
    if (c.includes('vp sales') || c.includes('revenue')) {
        return isFemale ? FEMALE_VOICES.confident : MALE_VOICES.authoritative;
    }
    if (c.includes('gatekeeper') || c.includes('assistant')) {
        return isFemale ? FEMALE_VOICES.professional : MALE_VOICES.natural;
    }
    if (c.includes('curious') || c.includes('prospect')) {
        return isFemale ? FEMALE_VOICES.warm : MALE_VOICES.natural;
    }

    // Fallback: gender-appropriate default
    return isFemale ? FEMALE_VOICES.confident : MALE_VOICES.authoritative;
}
