'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface VoiceInputProps {
    /** Called when transcription is complete */
    onTranscript: (text: string) => void;
    /** Whether to auto-send after transcription */
    autoSend?: boolean;
    /** Whether voice input is disabled (e.g., while loading) */
    disabled?: boolean;
    /** Callback when auto-send is triggered */
    onAutoSend?: () => void;
}

// Check if Web Speech API is available
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSpeechRecognition(): (new () => SpeechRecognition) | null {
    if (typeof window === 'undefined') return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export default function VoiceInput({
    onTranscript,
    autoSend = false,
    disabled = false,
    onAutoSend,
}: VoiceInputProps) {
    const [isListening, setIsListening] = useState(false);
    const [interimText, setInterimText] = useState('');
    const [isSupported, setIsSupported] = useState(true);
    const [micPermission, setMicPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognitionRef = useRef<any>(null);
    const isListeningRef = useRef(false);

    // Check support on mount
    useEffect(() => {
        const SR = getSpeechRecognition();
        setIsSupported(!!SR);

        // Check mic permissions
        if (navigator.permissions) {
            navigator.permissions.query({ name: 'microphone' as PermissionName }).then((result) => {
                setMicPermission(result.state as 'granted' | 'denied' | 'prompt');
                result.onchange = () => setMicPermission(result.state as 'granted' | 'denied' | 'prompt');
            }).catch(() => {
                // Permissions API not supported for microphone in some browsers
            });
        }

        return () => {
            stopListening();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Spacebar hotkey
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Only trigger on spacebar when not typing in an input/textarea
            if (e.code === 'Space' && !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
                e.preventDefault();
                if (!isListeningRef.current) {
                    startListening();
                } else {
                    stopListening();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [disabled]);

    const startListening = useCallback(() => {
        if (disabled || isListeningRef.current) return;

        const SR = getSpeechRecognition();
        if (!SR) {
            setIsSupported(false);
            return;
        }

        const recognition = new SR();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsListening(true);
            isListeningRef.current = true;
            setInterimText('');
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
            let interim = '';
            let final = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    final += transcript;
                } else {
                    interim += transcript;
                }
            }

            if (interim) {
                setInterimText(interim);
            }

            if (final) {
                setInterimText('');
                onTranscript(final.trim());
                
                // Auto-send after a brief delay for UX
                if (autoSend && onAutoSend) {
                    setTimeout(() => onAutoSend(), 300);
                }
            }
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
            isListeningRef.current = false;
            setInterimText('');

            if (event.error === 'not-allowed') {
                setMicPermission('denied');
            }
        };

        recognition.onend = () => {
            setIsListening(false);
            isListeningRef.current = false;
        };

        recognitionRef.current = recognition;

        try {
            recognition.start();
        } catch (error) {
            console.error('Failed to start recognition:', error);
            setIsListening(false);
            isListeningRef.current = false;
        }
    }, [disabled, onTranscript, autoSend, onAutoSend]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }
        setIsListening(false);
        isListeningRef.current = false;
        setInterimText('');
    }, []);

    const toggleListening = useCallback(() => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    }, [isListening, startListening, stopListening]);

    // Not supported
    if (!isSupported) {
        return (
            <button
                disabled
                className="w-12 h-12 flex items-center justify-center"
                style={{
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-muted)',
                    opacity: 0.5,
                }}
                title="Speech recognition not supported in this browser"
            >
                <MicOffIcon />
            </button>
        );
    }

    // Permission denied
    if (micPermission === 'denied') {
        return (
            <button
                disabled
                className="w-12 h-12 flex items-center justify-center"
                style={{
                    background: 'var(--bg-input)',
                    border: '1px solid #ef4444',
                    color: '#ef4444',
                    opacity: 0.7,
                }}
                title="Microphone access denied. Enable in browser settings."
            >
                <MicOffIcon />
            </button>
        );
    }

    return (
        <div className="relative flex items-center">
            {/* Mic Button */}
            <button
                onClick={toggleListening}
                disabled={disabled}
                className="w-12 h-12 flex items-center justify-center transition-all"
                style={{
                    background: isListening ? 'var(--accent-primary)' : 'var(--bg-input)',
                    border: `2px solid ${isListening ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                    color: isListening ? '#000' : 'var(--text-muted)',
                    boxShadow: isListening ? '0 0 20px rgba(63, 212, 151, 0.4)' : 'none',
                }}
                title={isListening ? 'Stop recording (Space)' : 'Start recording (Space)'}
                id="voice-input-btn"
            >
                {isListening ? <MicActiveIcon /> : <MicIcon />}
            </button>

            {/* Pulsing ring when recording */}
            {isListening && (
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        border: '2px solid var(--accent-primary)',
                        animation: 'mic-pulse 1.5s ease-in-out infinite',
                        opacity: 0.5,
                    }}
                />
            )}

            {/* Interim transcript tooltip */}
            {interimText && (
                <div
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 text-sm whitespace-nowrap max-w-xs truncate"
                    style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--accent-primary)',
                        color: 'var(--text-secondary)',
                    }}
                >
                    {interimText}
                    <span className="animate-pulse-glow" style={{ color: 'var(--accent-primary)' }}>▋</span>
                </div>
            )}
        </div>
    );
}

// ── SVG Icons ──

function MicIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
            <rect x="9" y="2" width="6" height="12" rx="0" />
            <path d="M5 10a7 7 0 0 0 14 0" />
            <line x1="12" y1="19" x2="12" y2="22" />
            <line x1="8" y1="22" x2="16" y2="22" />
        </svg>
    );
}

function MicActiveIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="square">
            <rect x="9" y="2" width="6" height="12" rx="0" />
            <path d="M5 10a7 7 0 0 0 14 0" fill="none" strokeWidth="2" />
            <line x1="12" y1="19" x2="12" y2="22" strokeWidth="2" />
            <line x1="8" y1="22" x2="16" y2="22" strokeWidth="2" />
        </svg>
    );
}

function MicOffIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
            <rect x="9" y="2" width="6" height="12" rx="0" />
            <path d="M5 10a7 7 0 0 0 14 0" />
            <line x1="12" y1="19" x2="12" y2="22" />
            <line x1="8" y1="22" x2="16" y2="22" />
            <line x1="2" y1="2" x2="22" y2="22" strokeWidth="2.5" stroke="#ef4444" />
        </svg>
    );
}
