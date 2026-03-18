/**
 * VoiceDuplexOverlay — True Full-Duplex Voice via ElevenAgents
 * 
 * This overlay replaces the manual STT→API→TTS pipeline with a single
 * WebSocket to ElevenAgents. ElevenLabs handles:
 * - Speech-to-Text (ASR)
 * - LLM response generation
 * - Text-to-Speech with the correct voice
 * - Turn-taking and interruption detection
 * 
 * The result: true full-duplex voice with zero echo issues.
 */

'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useElevenLabsConversation, type ConvAIStatus } from './ElevenLabsConversation';
import { type SimulationConfig } from './PackSelector';

interface VoiceDuplexOverlayProps {
    config: SimulationConfig;
    subjectName: string;
    subjectTitle: string;
    sessionTime: number;
    rapport: number;
    behaviorDescription?: string;
    onExitVoiceMode: () => void;
    /** Called when a transcript message arrives (for the chat log) */
    onTranscript: (role: 'user' | 'assistant', text: string) => void;
}

type VoiceMode = 'connecting' | 'listening' | 'speaking';

export default function VoiceDuplexOverlay({
    config,
    subjectName,
    subjectTitle,
    sessionTime,
    rapport,
    behaviorDescription,
    onExitVoiceMode,
    onTranscript,
}: VoiceDuplexOverlayProps) {
    const [mode, setMode] = useState<VoiceMode>('connecting');
    const [lastUserText, setLastUserText] = useState('');
    const [lastAgentText, setLastAgentText] = useState('');
    const [visualizerValues, setVisualizerValues] = useState<number[]>(new Array(24).fill(0));
    const animFrameRef = useRef<number | null>(null);
    const onTranscriptRef = useRef(onTranscript);

    useEffect(() => { onTranscriptRef.current = onTranscript; }, [onTranscript]);

    const handleTranscriptUpdate = useCallback((role: 'user' | 'agent', text: string) => {
        if (role === 'user') {
            setLastUserText(text);
            onTranscriptRef.current('user', text);
        } else {
            setLastAgentText(text);
            onTranscriptRef.current('assistant', text);
        }
    }, []);

    const handleStatusChange = useCallback((status: ConvAIStatus) => {
        if (status === 'connecting') setMode('connecting');
        else if (status === 'connected') setMode('listening');
        else if (status === 'disconnected' || status === 'error') {
            // If disconnected or error, exit voice mode
            console.log('[VoiceDuplex] Status:', status, '→ exiting');
        }
    }, []);

    const handleModeChange = useCallback((m: 'speaking' | 'listening') => {
        setMode(m);
    }, []);

    const {
        status,
        isSpeaking,
        startConversation,
        endConversation,
        getInputVolume,
        getOutputVolume,
    } = useElevenLabsConversation({
        config,
        onTranscriptUpdate: handleTranscriptUpdate,
        onStatusChange: handleStatusChange,
        onModeChange: handleModeChange,
    });

    // Auto-start conversation on mount
    useEffect(() => {
        startConversation();
    }, [startConversation]);

    // Visualizer animation loop
    useEffect(() => {
        const animate = () => {
            animFrameRef.current = requestAnimationFrame(animate);

            try {
                // Use ElevenLabs SDK volume getters for visualization
                const inputVol = getInputVolume?.() || 0;
                const outputVol = getOutputVolume?.() || 0;
                const activeVol = isSpeaking ? outputVol : inputVol;

                setVisualizerValues(prev => {
                    const next = [...prev];
                    for (let i = 0; i < next.length; i++) {
                        const target = activeVol > 0
                            ? Math.min(1, activeVol / 100 + Math.random() * 0.3)
                            : Math.random() * 0.05;
                        next[i] = next[i] * 0.7 + target * 0.3;
                    }
                    return next;
                });
            } catch {
                // Volume getters may not be available yet
            }
        };

        animFrameRef.current = requestAnimationFrame(animate);
        return () => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
    }, [isSpeaking, getInputVolume, getOutputVolume]);

    // ESC key handler
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                endConversation();
                onExitVoiceMode();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [endConversation, onExitVoiceMode]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const rapportColor = rapport >= 7 ? 'var(--accent-primary)' : rapport >= 4 ? '#f59e0b' : '#ef4444';

    const modeColor = mode === 'listening'
        ? 'var(--accent-primary)'
        : mode === 'speaking'
            ? '#60a5fa'
            : '#f59e0b';

    const modeLabels: Record<VoiceMode, string> = {
        connecting: 'CONNECTING...',
        listening: 'LISTENING',
        speaking: `${subjectName.toUpperCase()} IS SPEAKING`,
    };

    const modeSubLabels: Record<VoiceMode, string> = {
        connecting: 'Setting up full-duplex voice...',
        listening: 'Speak naturally — true full-duplex, no echo',
        speaking: 'Natural turn-taking — just speak to interrupt',
    };

    return (
        <div
            className="fixed inset-0 z-50 flex flex-col"
            style={{ background: 'rgba(10, 12, 16, 0.88)', backdropFilter: 'blur(6px)' }}
            id="voice-duplex-overlay"
        >
            {/* Top bar */}
            <div
                className="w-full px-8 py-3 flex justify-between items-center border-b"
                style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.4)' }}
            >
                <div>
                    <div className="flex items-center gap-3">
                        <div
                            className="w-2.5 h-2.5"
                            style={{
                                background: status === 'connected' ? modeColor : '#f59e0b',
                                animation: status === 'connected' ? 'mic-pulse 2s ease-in-out infinite' : undefined,
                                borderRadius: '50%',
                            }}
                        />
                        <span className="label-accent text-xs">
                            {status === 'connected' ? 'FULL DUPLEX — LIVE' : 'CONNECTING...'}
                        </span>
                        <span className="text-[10px] px-2 py-0.5" style={{
                            background: 'rgba(96, 165, 250, 0.15)',
                            color: '#60a5fa',
                            border: '1px solid rgba(96, 165, 250, 0.3)',
                        }}>
                            ELEVENLABS
                        </span>
                    </div>
                    <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                        {subjectName} · {subjectTitle}
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        <span className="font-mono" style={{ color: 'var(--accent-primary)' }}>{formatTime(sessionTime)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>RAPPORT</span>
                        <span className="font-mono text-sm" style={{ color: rapportColor }}>{rapport}/10</span>
                    </div>
                    <button
                        onClick={() => {
                            endConversation();
                            onExitVoiceMode();
                        }}
                        className="btn-secondary px-4 py-2 text-xs"
                        id="exit-voice-mode"
                    >
                        EXIT · ESC
                    </button>
                </div>
            </div>

            {/* Context bar */}
            {config && (
                <div
                    className="w-full px-8 py-2 border-b"
                    style={{
                        borderColor: 'rgba(255,255,255,0.06)',
                        background: 'rgba(0,0,0,0.3)',
                    }}
                >
                    <div className="flex items-center gap-8 text-xs">
                        <div>
                            <span style={{ color: 'var(--text-muted)' }}>SELLING: </span>
                            <span style={{ color: 'var(--text-primary)' }}>
                                {config.productPack?.name || ''}
                            </span>
                        </div>
                        <div>
                            <span style={{ color: 'var(--text-muted)' }}>BUYER: </span>
                            <span style={{ color: 'var(--text-primary)' }}>
                                {config.icpPack?.name || ''}
                            </span>
                        </div>
                        <div>
                            <span style={{ color: 'var(--text-muted)' }}>SCENARIO: </span>
                            <span style={{ color: 'var(--text-primary)' }}>
                                {config.scenarioPack?.name || ''}
                            </span>
                        </div>
                        <div>
                            <span style={{ color: 'var(--text-muted)' }}>ROLE: </span>
                            <span style={{ color: 'var(--accent-primary)' }}>
                                {config.trainingPack?.targetRole || ''}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Behavior cue */}
            {behaviorDescription && (
                <div
                    className="w-full px-8 py-2 border-b text-center"
                    style={{
                        borderColor: 'rgba(255,255,255,0.04)',
                        background: 'rgba(245, 158, 11, 0.06)',
                    }}
                >
                    <span className="text-xs italic" style={{ color: '#f59e0b' }}>
                        ✦ {behaviorDescription}
                    </span>
                </div>
            )}

            {/* Center — transcript + visualizer */}
            <div className="flex-1 flex flex-col items-center justify-center gap-8 px-8" style={{ maxWidth: 700, margin: '0 auto', width: '100%' }}>
                {/* Transcript display */}
                <div className="text-center min-h-[80px] max-h-[200px] overflow-y-auto">
                    {mode === 'connecting' && (
                        <p className="text-lg" style={{ color: 'var(--text-muted)' }}>
                            Initializing full-duplex voice...
                        </p>
                    )}
                    {mode === 'listening' && lastUserText && (
                        <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                            &quot;{lastUserText}&quot;
                        </p>
                    )}
                    {mode === 'listening' && !lastUserText && (
                        <p className="text-lg" style={{ color: 'var(--text-muted)', opacity: 0.5 }}>
                            ···
                        </p>
                    )}
                    {mode === 'speaking' && lastAgentText && (
                        <p className="text-lg leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                            {lastAgentText}
                        </p>
                    )}
                </div>

                {/* Audio Visualizer */}
                <div className="flex items-end justify-center gap-1.5" style={{ height: 120, width: '100%' }}>
                    {visualizerValues.map((val, i) => (
                        <div
                            key={i}
                            style={{
                                width: 7,
                                height: `${Math.max(3, val * 100)}%`,
                                borderRadius: 2,
                                background: modeColor,
                                opacity: 0.85,
                                transition: 'height 50ms ease, background 200ms ease',
                            }}
                        />
                    ))}
                </div>

                {/* State Label */}
                <div className="text-center">
                    <div
                        className="text-sm font-bold tracking-[0.2em]"
                        style={{ color: modeColor }}
                    >
                        {modeLabels[mode]}
                    </div>
                    <div className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                        {modeSubLabels[mode]}
                    </div>
                </div>
            </div>

            {/* Bottom status */}
            <div className="pb-6 flex flex-col items-center gap-3">
                {config?.scenarioPack && (
                    <div
                        className="px-6 py-2 text-xs text-center max-w-lg"
                        style={{
                            color: 'var(--text-muted)',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.06)',
                        }}
                    >
                        {config.scenarioPack.context || config.scenarioPack.description || ''}
                    </div>
                )}
                <div className="flex items-center gap-3">
                    <div
                        className="w-3 h-3"
                        style={{
                            background: modeColor,
                            animation: mode === 'listening' ? 'mic-pulse 1.5s ease-in-out infinite' : undefined,
                            borderRadius: '50%',
                        }}
                    />
                    <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                        {mode === 'listening' ? 'MIC ACTIVE' : mode === 'speaking' ? 'AGENT SPEAKING' : 'INITIALIZING'}
                    </span>
                </div>
                <div className="text-xs" style={{ color: 'var(--text-muted)', opacity: 0.5 }}>
                    Press ESC to exit voice mode
                </div>
            </div>
        </div>
    );
}
