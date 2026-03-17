'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

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
    /** Called when user finishes speaking — returns transcript */
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
}

type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';

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
}: VoiceFirstOverlayProps) {
    const [voiceState, setVoiceState] = useState<VoiceState>('idle');
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [isTTSPlaying, setIsTTSPlaying] = useState(false);
    const [visualizerValues, setVisualizerValues] = useState<number[]>(new Array(24).fill(0));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognitionRef = useRef<any>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const animFrameRef = useRef<number | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);

    // Auto-play TTS when assistant message arrives
    useEffect(() => {
        if (lastAssistantMessage && !isStreaming && !isLoading) {
            playTTS(lastAssistantMessage);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lastAssistantMessage, isStreaming, isLoading]);

    // Update voiceState based on loading/streaming
    useEffect(() => {
        if (isLoading || isStreaming) {
            setVoiceState('processing');
        }
    }, [isLoading, isStreaming]);

    // Visualizer animation
    useEffect(() => {
        let mounted = true;

        function animate() {
            if (!mounted) return;

            if (analyserRef.current && (voiceState === 'speaking' || voiceState === 'listening')) {
                const data = new Uint8Array(analyserRef.current.frequencyBinCount);
                analyserRef.current.getByteFrequencyData(data);

                // Sample 24 bars from frequency data
                const bars = 24;
                const step = Math.floor(data.length / bars);
                const values = [];
                for (let i = 0; i < bars; i++) {
                    const val = data[i * step] / 255;
                    values.push(val);
                }
                setVisualizerValues(values);
            } else if (voiceState === 'processing') {
                // Pulsing animation while processing
                const t = Date.now() / 300;
                const values = new Array(24).fill(0).map((_, i) => {
                    return 0.15 + 0.1 * Math.sin(t + i * 0.3);
                });
                setVisualizerValues(values);
            } else {
                // Idle flat bars
                setVisualizerValues(new Array(24).fill(0.03));
            }

            animFrameRef.current = requestAnimationFrame(animate);
        }

        animate();
        return () => {
            mounted = false;
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
    }, [voiceState]);

    const playTTS = useCallback(async (text: string) => {
        try {
            setVoiceState('speaking');
            setIsTTSPlaying(true);

            const response = await fetch('/api/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text,
                    subjectCondition,
                    subjectName,
                }),
            });

            if (!response.ok) throw new Error('TTS failed');

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);

            // Setup audio context for visualizer
            if (!audioContextRef.current) {
                audioContextRef.current = new AudioContext();
            }

            const audio = new Audio(audioUrl);
            audioRef.current = audio;

            // Connect to analyser for visualizer
            const source = audioContextRef.current.createMediaElementSource(audio);
            const analyser = audioContextRef.current.createAnalyser();
            analyser.fftSize = 128;
            source.connect(analyser);
            analyser.connect(audioContextRef.current.destination);
            analyserRef.current = analyser;

            audio.onended = () => {
                setIsTTSPlaying(false);
                setVoiceState('idle');
                URL.revokeObjectURL(audioUrl);
                // Auto-start listening after TTS finishes
                startListening();
            };

            audio.onerror = () => {
                setIsTTSPlaying(false);
                setVoiceState('idle');
                URL.revokeObjectURL(audioUrl);
            };

            await audioContextRef.current.resume();
            await audio.play();
        } catch (error) {
            console.error('Voice-first TTS error:', error);
            setIsTTSPlaying(false);
            setVoiceState('idle');
        }
    }, [subjectCondition, subjectName]);

    const startListening = useCallback(() => {
        const SR = getSpeechRecognition();
        if (!SR) return;

        const recognition = new SR();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setVoiceState('listening');
            setTranscript('');
            setInterimTranscript('');
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
            let interim = '';
            let final = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const text = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    final += text;
                } else {
                    interim += text;
                }
            }

            if (interim) setInterimTranscript(interim);

            if (final) {
                setTranscript(final.trim());
                setInterimTranscript('');
                setVoiceState('processing');
                onUserSpeak(final.trim());
            }
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onerror = (event: any) => {
            console.error('Voice-first STT error:', event.error);
            if (event.error !== 'no-speech') {
                setVoiceState('idle');
            }
        };

        recognition.onend = () => {
            if (voiceState === 'listening') {
                setVoiceState('idle');
            }
        };

        recognitionRef.current = recognition;
        recognition.start();
    }, [onUserSpeak, voiceState]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }
    }, []);

    const handleMicToggle = () => {
        if (voiceState === 'listening') {
            stopListening();
            setVoiceState('idle');
        } else if (voiceState === 'idle') {
            startListening();
        } else if (voiceState === 'speaking' && audioRef.current) {
            // Skip TTS — stop current playback and start listening
            audioRef.current.pause();
            setIsTTSPlaying(false);
            startListening();
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Rapport color
    const rapportColor = rapport >= 7 ? 'var(--accent-primary)' : rapport >= 4 ? '#f59e0b' : '#ef4444';

    // State label
    const stateLabels: Record<VoiceState, string> = {
        idle: 'TAP TO SPEAK',
        listening: 'LISTENING...',
        processing: 'THINKING...',
        speaking: `${subjectName.toUpperCase()} IS SPEAKING`,
    };

    return (
        <div
            className="fixed inset-0 z-50 flex flex-col items-center justify-between"
            style={{ background: 'var(--bg-primary)' }}
            id="voice-first-overlay"
        >
            {/* Top bar */}
            <div
                className="w-full px-8 py-4 flex justify-between items-center border-b"
                style={{ borderColor: 'var(--border-color)' }}
            >
                <div>
                    <div className="label-accent text-xs">VOICE-FIRST MODE</div>
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
                        onClick={onExitVoiceMode}
                        className="btn-secondary px-4 py-2 text-xs"
                        id="exit-voice-mode"
                    >
                        EXIT VOICE MODE
                    </button>
                </div>
            </div>

            {/* Center area — visualizer and state */}
            <div className="flex-1 flex flex-col items-center justify-center gap-8 px-8" style={{ maxWidth: 700 }}>
                {/* Current transcript / message */}
                <div className="text-center min-h-[80px]">
                    {voiceState === 'listening' && interimTranscript && (
                        <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                            {interimTranscript}<span className="animate-pulse-glow" style={{ color: 'var(--accent-primary)' }}>▋</span>
                        </p>
                    )}
                    {voiceState === 'processing' && transcript && (
                        <p className="text-lg" style={{ color: 'var(--text-muted)' }}>
                            You said: &quot;{transcript}&quot;
                        </p>
                    )}
                    {voiceState === 'processing' && streamingText && (
                        <p className="text-lg mt-4" style={{ color: 'var(--text-primary)' }}>
                            {streamingText}<span className="animate-pulse-glow" style={{ color: 'var(--accent-primary)' }}>▋</span>
                        </p>
                    )}
                    {voiceState === 'speaking' && lastAssistantMessage && (
                        <p className="text-lg leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                            {lastAssistantMessage}
                        </p>
                    )}
                </div>

                {/* Audio Visualizer */}
                <div className="flex items-end justify-center gap-1" style={{ height: 120, width: '100%' }}>
                    {visualizerValues.map((val, i) => (
                        <div
                            key={i}
                            className="transition-all"
                            style={{
                                width: 6,
                                height: `${Math.max(4, val * 100)}%`,
                                background: voiceState === 'listening'
                                    ? 'var(--accent-primary)'
                                    : voiceState === 'speaking'
                                        ? '#60a5fa'
                                        : voiceState === 'processing'
                                            ? 'var(--text-muted)'
                                            : 'var(--border-color)',
                                opacity: voiceState === 'idle' ? 0.3 : 1,
                                transition: 'height 60ms ease, background 300ms ease',
                            }}
                        />
                    ))}
                </div>

                {/* State Label */}
                <div
                    className="text-sm font-semibold tracking-widest"
                    style={{
                        color: voiceState === 'listening'
                            ? 'var(--accent-primary)'
                            : voiceState === 'speaking'
                                ? '#60a5fa'
                                : 'var(--text-muted)',
                    }}
                >
                    {stateLabels[voiceState]}
                </div>
            </div>

            {/* Bottom — large mic button */}
            <div className="pb-12 flex flex-col items-center gap-4">
                <button
                    onClick={handleMicToggle}
                    disabled={voiceState === 'processing'}
                    className="relative w-20 h-20 flex items-center justify-center transition-all"
                    style={{
                        background: voiceState === 'listening'
                            ? 'var(--accent-primary)'
                            : voiceState === 'speaking'
                                ? '#60a5fa'
                                : 'var(--bg-input)',
                        border: `3px solid ${
                            voiceState === 'listening'
                                ? 'var(--accent-primary)'
                                : voiceState === 'speaking'
                                    ? '#60a5fa'
                                    : 'var(--border-color)'
                        }`,
                        color: voiceState === 'listening' || voiceState === 'speaking' ? '#000' : 'var(--text-muted)',
                        boxShadow:
                            voiceState === 'listening'
                                ? '0 0 40px rgba(63, 212, 151, 0.4)'
                                : voiceState === 'speaking'
                                    ? '0 0 40px rgba(96, 165, 250, 0.4)'
                                    : 'none',
                    }}
                    id="voice-first-mic-btn"
                >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill={voiceState === 'listening' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                        <rect x="9" y="2" width="6" height="12" rx="0" />
                        <path d="M5 10a7 7 0 0 0 14 0" fill="none" />
                        <line x1="12" y1="19" x2="12" y2="22" />
                        <line x1="8" y1="22" x2="16" y2="22" />
                    </svg>

                    {/* Pulsing ring when listening */}
                    {voiceState === 'listening' && (
                        <div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                                border: '3px solid var(--accent-primary)',
                                animation: 'mic-pulse 1.5s ease-in-out infinite',
                            }}
                        />
                    )}
                </button>

                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {voiceState === 'speaking' ? 'Tap to interrupt' : 'Spacebar or tap'}
                </div>
            </div>
        </div>
    );
}
