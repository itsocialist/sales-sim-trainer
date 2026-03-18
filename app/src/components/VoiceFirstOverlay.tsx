'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { type SimulationConfig } from './PackSelector';

interface VoiceFirstOverlayProps {
    /** Current stakeholder name */
    subjectName: string;
    /** Stakeholder title */
    subjectTitle: string;
    /** Last assistant message (for TTS) */
    lastAssistantMessage: string;
    /** Whether assistant is currently streaming */
    isStreaming: boolean;
    /** Streaming text content */
    streamingText: string;
    /** Called when user finishes speaking — auto-sends to API */
    onUserSpeak: (text: string) => void;
    /** Called to exit voice-first mode */
    onExitVoiceMode: () => void;
    /** Session timer */
    sessionTime: number;
    /** Rapport level 1-10 */
    rapport: number;
    /** Is AI currently generating */
    isLoading: boolean;
    /** Stakeholder condition for voice matching */
    subjectCondition?: string;
    /** Current behavior description */
    behaviorDescription?: string;
    /** Full config for context display */
    config?: SimulationConfig;
}

/**
 * Full-Duplex Voice State Machine:
 * 
 *   ┌──────────────────────────────────────────────┐
 *   │                                              │
 *   ▼                                              │
 * LISTENING ──(final transcript)──▷ PROCESSING     │
 *   ▲                                  │           │
 *   │                                  ▼           │
 *   │                        AI generates response │
 *   │                                  │           │
 *   │                                  ▼           │
 *   └────────(TTS ends)────────── SPEAKING         │
 *                                      │           │
 *                                      └───────────┘
 * 
 * No idle state in duplex mode — always either listening, 
 * processing, or speaking. User can interrupt at any point.
 */
type VoiceState = 'listening' | 'processing' | 'speaking';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSpeechRecognition(): (new () => any) | null {
    if (typeof window === 'undefined') return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export default function VoiceFirstOverlay({
    subjectName,
    subjectTitle,
    lastAssistantMessage,
    isStreaming,
    streamingText,
    onUserSpeak,
    onExitVoiceMode,
    sessionTime,
    rapport,
    isLoading,
    subjectCondition,
    behaviorDescription,
    config,
}: VoiceFirstOverlayProps) {
    const [voiceState, setVoiceState] = useState<VoiceState>('listening');
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [visualizerValues, setVisualizerValues] = useState<number[]>(new Array(24).fill(0));
    const [lastPlayedMsg, setLastPlayedMsg] = useState('');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognitionRef = useRef<any>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const animFrameRef = useRef<number | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const mountedRef = useRef(true);
    const isListeningRef = useRef(false);
    const stateRef = useRef<VoiceState>('listening');
    const ttsAbortRef = useRef<AbortController | null>(null);
    const audioSourceRef = useRef<MediaElementAudioSourceNode | null>(null);

    // ── REFS to break stale closure chains ──
    const onUserSpeakRef = useRef(onUserSpeak);
    const startListeningRef = useRef<() => void>(() => {});

    // Keep onUserSpeak ref in sync
    useEffect(() => {
        onUserSpeakRef.current = onUserSpeak;
    }, [onUserSpeak]);

    // CRITICAL: Helper to set voice state synchronously.
    // stateRef must be updated BEFORE any recognition.abort() calls,
    // because abort triggers recognition.onend synchronously, and the
    // onend handler checks stateRef to decide whether to restart listening.
    // Using useEffect to sync stateRef was causing a race condition.
    const setVoiceStateSafe = useCallback((state: VoiceState) => {
        stateRef.current = state;  // Synchronous — guards fire correctly
        setVoiceState(state);      // Async render update for UI
    }, []);

    // ── AUTO-START listening on mount ──
    useEffect(() => {
        mountedRef.current = true;
        const timer = setTimeout(() => {
            if (mountedRef.current) {
                startListening();
            }
        }, 500);

        return () => {
            mountedRef.current = false;
            clearTimeout(timer);
            stopListening();
            stopTTS();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Escape key to exit ──
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                stopListening();
                stopTTS();
                onExitVoiceMode();
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [onExitVoiceMode]);

    // ── AUTO-PLAY TTS when NEW assistant message arrives ──
    useEffect(() => {
        if (
            lastAssistantMessage &&
            lastAssistantMessage !== lastPlayedMsg &&
            !isStreaming &&
            !isLoading
        ) {
            setLastPlayedMsg(lastAssistantMessage);
            playTTS(lastAssistantMessage);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lastAssistantMessage, isStreaming, isLoading]);

    // ── Update voiceState based on loading/streaming ──
    useEffect(() => {
        if (isLoading || isStreaming) {
            setVoiceState('processing');
        }
    }, [isLoading, isStreaming]);

    // ── Visualizer animation loop ──
    useEffect(() => {
        let mounted = true;

        function animate() {
            if (!mounted) return;

            if (analyserRef.current && (stateRef.current === 'speaking')) {
                const data = new Uint8Array(analyserRef.current.frequencyBinCount);
                analyserRef.current.getByteFrequencyData(data);
                const bars = 24;
                const step = Math.floor(data.length / bars);
                const values = [];
                for (let i = 0; i < bars; i++) {
                    values.push(data[i * step] / 255);
                }
                setVisualizerValues(values);
            } else if (stateRef.current === 'listening') {
                // Breathing animation while listening — alive, waiting
                const t = Date.now() / 600;
                const values = new Array(24).fill(0).map((_, i) => {
                    return 0.08 + 0.06 * Math.sin(t + i * 0.4);
                });
                setVisualizerValues(values);
            } else if (stateRef.current === 'processing') {
                // Faster pulse while AI is thinking
                const t = Date.now() / 200;
                const values = new Array(24).fill(0).map((_, i) => {
                    return 0.15 + 0.12 * Math.sin(t + i * 0.3);
                });
                setVisualizerValues(values);
            }

            animFrameRef.current = requestAnimationFrame(animate);
        }

        animate();
        return () => {
            mounted = false;
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
    }, []);

    // ── STOP TTS — completely clean up audio to prevent overlap ──
    const stopTTS = useCallback(() => {
        // Abort any in-flight TTS fetch
        if (ttsAbortRef.current) {
            ttsAbortRef.current.abort();
            ttsAbortRef.current = null;
        }
        // Stop and clean up audio element
        if (audioRef.current) {
            try {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                audioRef.current.onended = null;
                audioRef.current.onerror = null;
                // Revoke the blob URL if it exists
                if (audioRef.current.src && audioRef.current.src.startsWith('blob:')) {
                    URL.revokeObjectURL(audioRef.current.src);
                }
                audioRef.current.removeAttribute('src');
            } catch { /* ok */ }
            audioRef.current = null;
        }
        // Reset analyser (don't destroy AudioContext — it can be reused)
        analyserRef.current = null;
        audioSourceRef.current = null;
    }, []);

    // ── TTS Playback ──
    const playTTS = useCallback(async (text: string) => {
        try {
            // CRITICAL: Set state BEFORE stopping listeners.
            // This prevents recognition.onend (fired by abort) from
            // seeing stateRef='listening' and restarting the mic.
            setVoiceStateSafe('speaking');

            stopTTS();
            stopListeningQuiet();

            // Create abort controller for this TTS request
            const abortController = new AbortController();
            ttsAbortRef.current = abortController;

            const response = await fetch('/api/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: abortController.signal,
                body: JSON.stringify({
                    text,
                    subjectCondition,
                    subjectName,
                }),
            });

            // Check if we were aborted during fetch
            if (abortController.signal.aborted) return;

            if (!response.ok) throw new Error('TTS failed');

            const audioBlob = await response.blob();

            // Check again after blob download
            if (abortController.signal.aborted) return;

            const audioUrl = URL.createObjectURL(audioBlob);

            // Setup audio context for visualizer
            if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
                audioContextRef.current = new AudioContext();
            }

            const audio = new Audio(audioUrl);
            audioRef.current = audio;

            // Connect to analyser for visualizer
            // Each Audio element can only have ONE source node — track and reuse
            const source = audioContextRef.current.createMediaElementSource(audio);
            audioSourceRef.current = source;
            const analyser = audioContextRef.current.createAnalyser();
            analyser.fftSize = 128;
            source.connect(analyser);
            analyser.connect(audioContextRef.current.destination);
            analyserRef.current = analyser;

            audio.onended = () => {
                URL.revokeObjectURL(audioUrl);
                audioRef.current = null;
                audioSourceRef.current = null;
                if (mountedRef.current) {
                    // ECHO COOLDOWN: Wait 600ms after TTS ends before re-enabling mic.
                    // This prevents the speaker's trailing echo from being picked up
                    // by SpeechRecognition and interpreted as user speech.
                    setTimeout(() => {
                        if (mountedRef.current && stateRef.current === 'speaking') {
                            startListeningRef.current();
                        }
                    }, 600);
                }
            };

            audio.onerror = () => {
                URL.revokeObjectURL(audioUrl);
                audioRef.current = null;
                audioSourceRef.current = null;
                if (mountedRef.current) {
                    setTimeout(() => {
                        if (mountedRef.current) {
                            startListeningRef.current();
                        }
                    }, 600);
                }
            };

            await audioContextRef.current.resume();
            await audio.play();
        } catch (error) {
            // Don't log abort errors — they're expected
            if (error instanceof Error && error.name === 'AbortError') return;
            console.error('Voice-first TTS error:', error);
            if (mountedRef.current) {
                startListeningRef.current();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [subjectCondition, subjectName, stopTTS]);

    // ── STT Listening ──
    const startListening = useCallback(() => {
        if (!mountedRef.current || isListeningRef.current) return;

        const SR = getSpeechRecognition();
        if (!SR) return;

        const recognition = new SR();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            isListeningRef.current = true;
            if (mountedRef.current) {
                setVoiceStateSafe('listening');
                setTranscript('');
                setInterimTranscript('');
            }
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
            let interim = '';
            let finalText = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const text = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalText += text;
                } else {
                    interim += text;
                }
            }

            if (interim && mountedRef.current) {
                setInterimTranscript(interim);
            }

            if (finalText && mountedRef.current) {
                // ECHO GUARD: Reject any speech recognized while TTS is playing
                // or a response is being generated. This prevents the mic from
                // picking up speaker output and feeding it back as user input.
                if (stateRef.current === 'speaking' || stateRef.current === 'processing') {
                    console.log('Echo guard: ignoring speech during', stateRef.current);
                    return;
                }

                const trimmed = finalText.trim();
                if (!trimmed) return;

                setTranscript(trimmed);
                setInterimTranscript('');
                isListeningRef.current = false;
                recognitionRef.current = null;

                // Check for exit command
                const lower = trimmed.toLowerCase();
                if (lower.includes('end simulation') || lower.includes('stop simulation') || lower === 'exit') {
                    stopTTS();
                    onExitVoiceMode();
                    return;
                }

                // FULL DUPLEX: use REF to call latest onUserSpeak (avoids stale closure)
                setVoiceStateSafe('processing');
                onUserSpeakRef.current(trimmed);
            }
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onerror = (event: any) => {
            console.warn('STT:', event.error);
            isListeningRef.current = false;

            if (event.error === 'no-speech' && mountedRef.current) {
                // FULL DUPLEX: restart listening on no-speech (user paused)
                setTimeout(() => {
                    if (mountedRef.current && stateRef.current === 'listening') {
                        startListening();
                    }
                }, 300);
            } else if (event.error === 'aborted') {
                // Expected when we stop manually — do nothing
            } else if (mountedRef.current) {
                // Other error — try to restart
                setTimeout(() => {
                    if (mountedRef.current && stateRef.current !== 'speaking') {
                        startListening();
                    }
                }, 1000);
            }
        };

        recognition.onend = () => {
            isListeningRef.current = false;
            if (mountedRef.current && stateRef.current === 'listening') {
                // FULL DUPLEX: auto-restart if we're still in listening state
                setTimeout(() => {
                    if (mountedRef.current && stateRef.current === 'listening') {
                        startListening();
                    }
                }, 200);
            }
        };

        recognitionRef.current = recognition;
        try {
            recognition.start();
        } catch {
            // Already started or not allowed — retry after delay
            isListeningRef.current = false;
            setTimeout(() => {
                if (mountedRef.current && stateRef.current !== 'speaking') {
                    startListening();
                }
            }, 500);
        }
    }, [onExitVoiceMode, stopTTS]);

    // Keep startListeningRef in sync with the latest startListening
    useEffect(() => {
        startListeningRef.current = startListening;
    }, [startListening]);

    const stopListeningQuiet = useCallback(() => {
        isListeningRef.current = false;
        if (recognitionRef.current) {
            try { recognitionRef.current.abort(); } catch { /* ok */ }
            recognitionRef.current = null;
        }
    }, []);

    const stopListening = useCallback(() => {
        stopListeningQuiet();
    }, [stopListeningQuiet]);

    // Interrupt: user taps while AI is speaking → cut TTS, start listening
    const handleInterrupt = useCallback(() => {
        if (voiceState === 'speaking') {
            stopTTS();
            startListening();
        }
    }, [voiceState, stopTTS, startListening]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Rapport color
    const rapportColor = rapport >= 7 ? 'var(--accent-primary)' : rapport >= 4 ? '#f59e0b' : '#ef4444';

    // State labels — no "TAP TO SPEAK", it's always active
    const stateLabels: Record<VoiceState, string> = {
        listening: 'LISTENING',
        processing: 'THINKING...',
        speaking: `${subjectName.toUpperCase()} IS SPEAKING`,
    };
    const stateSubLabels: Record<VoiceState, string> = {
        listening: 'Speak naturally — your message sends automatically',
        processing: 'Generating response...',
        speaking: 'Tap anywhere to interrupt',
    };

    return (
        <div
            className="fixed inset-0 z-50 flex flex-col"
            style={{ background: 'rgba(10, 12, 16, 0.88)', backdropFilter: 'blur(6px)' }}
            id="voice-first-overlay"
            onClick={voiceState === 'speaking' ? handleInterrupt : undefined}
        >
            {/* Top bar */}
            <div
                className="w-full px-8 py-3 flex justify-between items-center border-b"
                style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.4)' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div>
                    <div className="flex items-center gap-3">
                        <div
                            className="w-2.5 h-2.5"
                            style={{
                                background: voiceState === 'listening'
                                    ? 'var(--accent-primary)'
                                    : voiceState === 'speaking'
                                        ? '#60a5fa'
                                        : '#f59e0b',
                                animation: 'mic-pulse 2s ease-in-out infinite',
                            }}
                        />
                        <span className="label-accent text-xs">FULL DUPLEX — LIVE</span>
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
                        onClick={(e) => {
                            e.stopPropagation();
                            stopListening();
                            stopTTS();
                            onExitVoiceMode();
                        }}
                        className="btn-secondary px-4 py-2 text-xs"
                        id="exit-voice-mode"
                    >
                        EXIT · ESC
                    </button>
                </div>
            </div>

            {/* Situational context — always visible through the overlay */}
            {config && (
                <div
                    className="w-full px-8 py-2 border-b"
                    style={{
                        borderColor: 'rgba(255,255,255,0.06)',
                        background: 'rgba(0,0,0,0.3)',
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center gap-8 text-xs">
                        <div>
                            <span style={{ color: 'var(--text-muted)' }}>SELLING: </span>
                            <span style={{ color: 'var(--text-primary)' }}>{config.productPack.name}</span>
                        </div>
                        <div>
                            <span style={{ color: 'var(--text-muted)' }}>BUYER: </span>
                            <span style={{ color: 'var(--text-primary)' }}>{config.icpPack.name}</span>
                        </div>
                        <div>
                            <span style={{ color: 'var(--text-muted)' }}>SCENARIO: </span>
                            <span style={{ color: 'var(--text-primary)' }}>{config.scenarioPack.name}</span>
                        </div>
                        <div>
                            <span style={{ color: 'var(--text-muted)' }}>ROLE: </span>
                            <span style={{ color: 'var(--accent-primary)' }}>{config.trainingPack.targetRole}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Behavior cue — always visible */}
            {behaviorDescription && (
                <div
                    className="w-full px-8 py-2 border-b text-center"
                    style={{
                        borderColor: 'rgba(255,255,255,0.04)',
                        background: 'rgba(245, 158, 11, 0.06)',
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <span className="text-xs italic" style={{ color: '#f59e0b' }}>
                        ✦ {behaviorDescription}
                    </span>
                </div>
            )}

            {/* Center area — visualizer and transcript */}
            <div className="flex-1 flex flex-col items-center justify-center gap-8 px-8" style={{ maxWidth: 700, margin: '0 auto', width: '100%' }}>
                {/* Current transcript / response */}
                <div className="text-center min-h-[80px] max-h-[200px] overflow-y-auto">
                    {voiceState === 'listening' && interimTranscript && (
                        <p className="text-xl" style={{ color: 'var(--text-secondary)' }}>
                            {interimTranscript}<span className="animate-pulse-glow" style={{ color: 'var(--accent-primary)' }}>▋</span>
                        </p>
                    )}
                    {voiceState === 'listening' && !interimTranscript && (
                        <p className="text-lg" style={{ color: 'var(--text-muted)', opacity: 0.5 }}>
                            ···
                        </p>
                    )}
                    {voiceState === 'processing' && transcript && !streamingText && (
                        <p className="text-lg" style={{ color: 'var(--text-muted)' }}>
                            &quot;{transcript}&quot;
                        </p>
                    )}
                    {voiceState === 'processing' && streamingText && (
                        <p className="text-lg" style={{ color: 'var(--text-primary)' }}>
                            {streamingText}<span className="animate-pulse-glow" style={{ color: 'var(--accent-primary)' }}>▋</span>
                        </p>
                    )}
                    {voiceState === 'speaking' && lastAssistantMessage && (
                        <p className="text-lg leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                            {lastAssistantMessage}
                        </p>
                    )}
                </div>

                {/* Audio Visualizer — larger, more prominent */}
                <div className="flex items-end justify-center gap-1.5" style={{ height: 120, width: '100%' }}>
                    {visualizerValues.map((val, i) => (
                        <div
                            key={i}
                            style={{
                                width: 7,
                                height: `${Math.max(3, val * 100)}%`,
                                borderRadius: 2,
                                background: voiceState === 'listening'
                                    ? 'var(--accent-primary)'
                                    : voiceState === 'speaking'
                                        ? '#60a5fa'
                                        : '#f59e0b',
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
                        style={{
                            color: voiceState === 'listening'
                                ? 'var(--accent-primary)'
                                : voiceState === 'speaking'
                                    ? '#60a5fa'
                                    : '#f59e0b',
                        }}
                    >
                        {stateLabels[voiceState]}
                    </div>
                    <div className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                        {stateSubLabels[voiceState]}
                    </div>
                </div>
            </div>

            {/* Bottom — Scenario context hint + status */}
            <div className="pb-6 flex flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
                {/* Scenario context clue */}
                {config && (
                    <div
                        className="px-6 py-2 text-xs text-center max-w-lg"
                        style={{
                            color: 'var(--text-muted)',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.06)',
                        }}
                    >
                        {config.scenarioPack.context}
                    </div>
                )}
                <div className="flex items-center gap-3">
                    <div
                        className="w-3 h-3"
                        style={{
                            background: voiceState === 'listening'
                                ? 'var(--accent-primary)'
                                : voiceState === 'speaking'
                                    ? '#60a5fa'
                                    : '#f59e0b',
                            animation: voiceState === 'listening' ? 'mic-pulse 1.5s ease-in-out infinite' : undefined,
                        }}
                    />
                    <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                        {voiceState === 'listening' ? 'MIC ACTIVE' : voiceState === 'speaking' ? 'AUDIO OUT' : 'PROCESSING'}
                    </span>
                </div>
                <div className="text-xs" style={{ color: 'var(--text-muted)', opacity: 0.5 }}>
                    Say &quot;end simulation&quot; or press ESC to exit
                </div>
            </div>
        </div>
    );
}
