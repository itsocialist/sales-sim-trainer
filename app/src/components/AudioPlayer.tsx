'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface AudioPlayerProps {
    text: string;
    subjectName: string;
    subjectAge: string;
    /** Stakeholder condition for voice matching (e.g., "Champion / Internal Advocate") */
    subjectCondition?: string;
    autoPlay?: boolean;
    onPlayStart?: () => void;
    onPlayEnd?: () => void;
}

export default function AudioPlayer({
    text,
    subjectName,
    subjectAge,
    subjectCondition,
    autoPlay = false,
    onPlayStart,
    onPlayEnd,
}: AudioPlayerProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [provider, setProvider] = useState<string>('');
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Generate audio when text changes (if autoPlay is enabled)
    useEffect(() => {
        if (autoPlay && text) {
            generateAudio();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [text, autoPlay]);

    // Cleanup audio URL on unmount
    useEffect(() => {
        return () => {
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }
        };
    }, [audioUrl]);

    const generateAudio = useCallback(async () => {
        if (!text || isLoading) return;

        setIsLoading(true);
        try {
            const response = await fetch('/api/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text,
                    subjectCondition,
                    subjectName,
                    subjectAge,
                }),
            });

            if (!response.ok) throw new Error('TTS failed');

            // Capture provider info from headers
            const ttsProvider = response.headers.get('X-TTS-Provider') || '';
            setProvider(ttsProvider);

            const audioBlob = await response.blob();
            const url = URL.createObjectURL(audioBlob);

            // Cleanup previous URL
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }

            setAudioUrl(url);

            // Auto-play if requested
            if (autoPlay && audioRef.current) {
                audioRef.current.src = url;
                audioRef.current.play();
            }
        } catch (error) {
            console.error('Failed to generate audio:', error);
        } finally {
            setIsLoading(false);
        }
    }, [text, subjectCondition, subjectName, subjectAge, autoPlay, audioUrl, isLoading]);

    const handlePlay = async () => {
        if (!audioUrl) {
            await generateAudio();
        }

        if (audioRef.current && audioUrl) {
            audioRef.current.src = audioUrl;
            audioRef.current.play();
        }
    };

    const handleStop = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    };

    const handleAudioPlay = () => {
        setIsPlaying(true);
        onPlayStart?.();
    };

    const handleAudioEnded = () => {
        setIsPlaying(false);
        onPlayEnd?.();
    };

    // Provider indicator color
    const providerColor = provider === 'elevenlabs' 
        ? 'var(--accent-primary)' 
        : provider === 'fish' 
            ? '#60a5fa' 
            : 'var(--text-muted)';

    return (
        <div className="inline-flex items-center gap-1">
            <audio
                ref={audioRef}
                onPlay={handleAudioPlay}
                onEnded={handleAudioEnded}
                onPause={() => setIsPlaying(false)}
            />

            <button
                onClick={isPlaying ? handleStop : handlePlay}
                disabled={isLoading}
                className="w-7 h-7 flex items-center justify-center text-xs transition-all"
                style={{
                    background: isPlaying ? 'var(--accent-primary)' : 'var(--bg-input)',
                    border: `1px solid ${isPlaying ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                    color: isPlaying ? '#000' : 'var(--text-muted)',
                }}
                title={
                    isLoading 
                        ? 'Generating...' 
                        : isPlaying 
                            ? 'Stop' 
                            : `Play voice${provider ? ` (${provider})` : ''}`
                }
            >
                {isLoading ? (
                    <span className="animate-pulse">●</span>
                ) : isPlaying ? (
                    '■'
                ) : (
                    '▶'
                )}
            </button>

            {/* Provider dot indicator */}
            {provider && !isLoading && (
                <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: providerColor }}
                    title={provider}
                />
            )}
        </div>
    );
}
