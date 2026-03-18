'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { type SimulationConfig } from './PackSelector';
import ContextDisplay from './ContextDisplay';
import SimulationMeters from './SimulationMeters';
import BehaviorStrip from './BehaviorStrip';
import AudioPlayer from './AudioPlayer';
import SubjectAvatar from './SubjectAvatar';
import VoiceInput from './VoiceInput';
import VoiceFirstOverlay from './VoiceFirstOverlay';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface SimulationChatProps {
    config: SimulationConfig;
    onEndSession: (messages: Message[], scenarioContext: string, intoxicationLevel: string) => void;
}

// Analyze rep's sales approach based on message content
function analyzeRepApproach(message: string): number {
    const lower = message.toLowerCase();
    let pushiness = 5; // Start consultative

    // PUSHY/AGGRESSIVE SALES BEHAVIORS
    if (lower.includes('you need to') || lower.includes('you have to')) pushiness += 2;
    if (lower.includes('limited time') || lower.includes('expiring')) pushiness += 2;
    if (lower.includes('if you don\'t') || lower.includes('you\'ll miss')) pushiness += 2;
    if (lower.includes('sign today') || lower.includes('close today')) pushiness += 3;
    if (lower.includes('final offer') || lower.includes('last chance')) pushiness += 3;
    if (lower.includes('trust me') || lower.includes('i promise')) pushiness += 1;
    // All caps
    const capsWords = message.match(/\b[A-Z]{3,}\b/g);
    if (capsWords && capsWords.length > 0) pushiness += capsWords.length;

    // CONSULTATIVE/EMPATHETIC BEHAVIORS
    if (lower.includes('what does') || lower.includes('how do you')) pushiness -= 2;
    if (lower.includes('help me understand')) pushiness -= 2;
    if (lower.includes('tell me more')) pushiness -= 2;
    if (lower.includes('what\'s the') || lower.includes('what are the')) pushiness -= 1;
    if (lower.includes('i hear you') || lower.includes('that makes sense')) pushiness -= 2;
    if (lower.includes('what would success look like')) pushiness -= 3;
    if (lower.includes('what matters most to you')) pushiness -= 3;
    if (lower.includes('curious') || lower.includes('wondering')) pushiness -= 1;
    if (lower.includes('your team') || lower.includes('your business')) pushiness -= 1;
    if (lower.includes('roi') || lower.includes('impact') || lower.includes('value')) pushiness -= 1;
    if (message.includes('?') && (lower.includes('what') || lower.includes('how') || lower.includes('why'))) pushiness -= 1;

    return Math.max(1, Math.min(10, Math.round(pushiness)));
}

export default function SimulationChat({ config, onEndSession }: SimulationChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [streamingContent, setStreamingContent] = useState('');
    const [sessionTime, setSessionTime] = useState(0);
    const [distance, setDistance] = useState(config.scenarioPack.initialDistance);
    const [temperature, setTemperature] = useState(config.scenarioPack.initialTemperature);
    const [officerTone, setOfficerTone] = useState(5); // Start neutral
    const [behaviorDescription, setBehaviorDescription] = useState('');
    const [sessionId] = useState(`session-${Date.now()}`);
    const [voiceMode, setVoiceMode] = useState(false);
    const [lastAssistantMessage, setLastAssistantMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, streamingContent]);

    useEffect(() => {
        const timer = setInterval(() => setSessionTime((t) => t + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleMoveCloser = () => {
        if (distance > 1) {
            setDistance(d => d - 1);
            // Moving closer may increase tension if already agitated
            if (temperature >= 6 && Math.random() > 0.3) {
                setTemperature(t => Math.min(10, t + 1));
            }
        }
    };

    const handleStepBack = () => {
        if (distance < 10) {
            setDistance(d => d + 1);
            // Stepping back may help calm situation
            if (temperature > 1 && Math.random() > 0.5) {
                setTemperature(t => Math.max(1, t - 0.5));
            }
        }
    };

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        // Analyze rep's approach from the message
        const messageTone = analyzeRepApproach(input.trim());
        setOfficerTone(messageTone);

        const userMessage: Message = {
            role: 'user',
            content: input.trim(),
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setStreamingContent('');

        try {
            const response = await fetch('/api/simulate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMessage].map((m) => ({
                        role: m.role,
                        content: m.content,
                    })),
                    sessionId,
                    config: {
                        subject: config.subject,
                        subjectPack: config.subjectPack,
                        scenarioPack: config.scenarioPack,
                        trainingPack: config.trainingPack,
                        productPack: config.productPack,
                        icpPack: config.icpPack,
                        distance,
                        temperature,
                    },
                }),
            });

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let fullContent = '';

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const text = decoder.decode(value);
                    const lines = text.split('\n').filter(Boolean);

                    for (const line of lines) {
                        try {
                            const data = JSON.parse(line);

                            if (data.type === 'meta') {
                                // Apply AI-analyzed temperature change
                                if (data.temperatureChange) {
                                    setTemperature(t => Math.max(1, Math.min(10, t + data.temperatureChange)));
                                }
                                // Apply AI-analyzed distance change (subject moving)
                                if (data.distanceChange) {
                                    setDistance(d => Math.max(1, Math.min(10, d + data.distanceChange)));
                                }
                                // Update behavior description
                                if (data.behavior) {
                                    setBehaviorDescription(data.behavior);
                                }
                            } else if (data.type === 'content') {
                                fullContent += data.content;
                                setStreamingContent(fullContent);
                            } else if (data.type === 'done') {
                                const assistantMessage: Message = {
                                    role: 'assistant',
                                    content: fullContent,
                                    timestamp: new Date(),
                                };
                                setMessages((prev) => [...prev, assistantMessage]);
                                setStreamingContent('');
                            }
                        } catch {
                            // Skip malformed JSON
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Voice-first mode: send message via voice transcript
    const sendVoiceMessage = useCallback((text: string) => {
        if (!text.trim() || isLoading) return;

        const userMessage: Message = {
            role: 'user',
            content: text.trim(),
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setStreamingContent('');

        // Call the same simulation API
        fetch('/api/simulate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
                sessionId,
                config: {
                    subject: config.subject,
                    subjectPack: config.subjectPack,
                    scenarioPack: config.scenarioPack,
                    trainingPack: config.trainingPack,
                    productPack: config.productPack,
                    icpPack: config.icpPack,
                    distance,
                    temperature,
                },
            }),
        }).then(async response => {
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let fullContent = '';

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    const text = decoder.decode(value);
                    const lines = text.split('\n').filter(Boolean);
                    for (const line of lines) {
                        try {
                            const data = JSON.parse(line);
                            if (data.type === 'meta') {
                                if (data.temperatureChange) setTemperature(t => Math.max(1, Math.min(10, t + data.temperatureChange)));
                                if (data.distanceChange) setDistance(d => Math.max(1, Math.min(10, d + data.distanceChange)));
                                if (data.behavior) setBehaviorDescription(data.behavior);
                            } else if (data.type === 'content') {
                                fullContent += data.content;
                                setStreamingContent(fullContent);
                            } else if (data.type === 'done') {
                                const assistantMessage: Message = {
                                    role: 'assistant',
                                    content: fullContent,
                                    timestamp: new Date(),
                                };
                                setMessages(prev => [...prev, assistantMessage]);
                                setLastAssistantMessage(fullContent);
                                setStreamingContent('');
                            }
                        } catch { /* skip */ }
                    }
                }
            }
        }).catch(error => {
            console.error('Voice message failed:', error);
        }).finally(() => {
            setIsLoading(false);
        });
    }, [messages, isLoading, sessionId, config, distance, temperature]);

    return (
        <div className="flex flex-col h-screen" style={{ background: 'var(--bg-primary)' }}>
            {/* Voice-First Overlay */}
            {voiceMode && (
                <VoiceFirstOverlay
                    subjectName={config.subject.name}
                    subjectTitle={(config.subject as unknown as { title: string }).title || 'Prospect'}
                    lastAssistantMessage={lastAssistantMessage}
                    isStreaming={!!streamingContent}
                    streamingText={streamingContent}
                    onUserSpeak={sendVoiceMessage}
                    onExitVoiceMode={() => setVoiceMode(false)}
                    sessionTime={sessionTime}
                    rapport={Math.round(10 - temperature)}
                    isLoading={isLoading}
                    subjectCondition={config.subjectPack?.conditionLevel}
                />
            )}
            {/* Context Display */}
            <ContextDisplay config={config} />

            {/* Behavior Status Strip */}
            <BehaviorStrip
                config={config}
                behaviorDescription={behaviorDescription}
                isLoading={isLoading}
            />

            {/* Header with meters */}
            <div
                className="border-b px-6 py-2 flex justify-between items-center"
                style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
            >
                <SimulationMeters
                    distance={distance}
                    temperature={temperature}
                    officerTone={officerTone}
                    onMoveCloser={handleMoveCloser}
                    onStepBack={handleStepBack}
                />
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => setVoiceMode(!voiceMode)}
                        className="btn-secondary px-4 py-2 text-xs font-semibold"
                        style={{
                            borderColor: voiceMode ? 'var(--accent-primary)' : 'var(--border-color)',
                            color: voiceMode ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        }}
                        id="voice-mode-toggle"
                    >
                        {voiceMode ? '◉ VOICE MODE' : '○ VOICE MODE'}
                    </button>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        <span style={{ color: 'var(--text-muted)' }}>TIME</span>
                        <span className="ml-2 font-mono" style={{ color: 'var(--accent-primary)' }}>{formatTime(sessionTime)}</span>
                    </div>
                    <button
                        onClick={() => onEndSession(messages, config.scenarioPack.context, config.subjectPack.conditionLevel)}
                        className="btn-primary px-5 py-2 text-sm font-semibold"
                    >
                        END SESSION →
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
                <div className="max-w-3xl mx-auto space-y-6">
                    {messages.length === 0 && !streamingContent && (
                        <div className="text-center py-16">
                            <div className="label-accent mb-3">SIMULATION READY</div>
                            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                                Initiate contact with {config.subject.name}
                            </p>
                            <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
                                {(config.subject as unknown as {title: string; company: string}).title} · {(config.subject as unknown as {title: string; company: string}).company}
                            </p>
                        </div>
                    )}

                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {message.role === 'assistant' && (
                                <div className="flex items-start gap-3 max-w-[80%]">
                                    <SubjectAvatar
                                        subjectId={config.subject.id}
                                        subjectName={config.subject.name}
                                        size="small"
                                    />
                                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }} className="px-5 py-4">
                                        <p className="whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                                            {message.content}
                                        </p>
                                        <div className="mt-2 flex justify-end">
                                            <AudioPlayer
                                                text={message.content}
                                                subjectName={config.subject.name}
                                                subjectAge={(config.subject as unknown as {title: string}).title || 'Executive'}
                                                subjectCondition={config.subjectPack?.conditionLevel || config.subject.name}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                            {message.role === 'user' && (
                                <div className="flex items-start gap-3 max-w-[80%]">
                                    <div style={{ background: 'var(--accent-primary)', color: '#000' }} className="px-5 py-4">
                                        <p className="whitespace-pre-wrap leading-relaxed font-medium">
                                            {message.content}
                                        </p>
                                    </div>
                                    <div
                                        className="w-8 h-8 flex items-center justify-center text-xs font-bold flex-shrink-0"
                                        style={{ background: 'var(--accent-primary)', color: '#000' }}
                                    >
                                        {config.trainingPack.targetRole.charAt(0)}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {streamingContent && (
                        <div className="flex justify-start">
                            <div className="flex items-start gap-3 max-w-[80%]">
                                <div
                                    className="w-8 h-8 flex items-center justify-center text-xs font-bold flex-shrink-0 animate-pulse-glow"
                                    style={{ background: 'var(--bg-card)', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)' }}
                                >
                                    S
                                </div>
                                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }} className="px-5 py-4">
                                    <p className="whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                                        {streamingContent}
                                        <span className="animate-pulse-glow" style={{ color: 'var(--accent-primary)' }}>▋</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {isLoading && !streamingContent && (
                        <div className="flex justify-start">
                            <div className="flex items-start gap-3">
                                <div
                                    className="w-8 h-8 flex items-center justify-center text-xs font-bold animate-pulse-glow"
                                    style={{ background: 'var(--bg-card)', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)' }}
                                >
                                    S
                                </div>
                                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }} className="px-5 py-3">
                                    <span style={{ color: 'var(--accent-primary)' }}>●●●</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="border-t px-6 py-4" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
                <div className="max-w-3xl mx-auto flex gap-3 items-center">
                    {/* Mic Button */}
                    <VoiceInput
                        onTranscript={(text) => setInput((prev) => prev ? `${prev} ${text}` : text)}
                        disabled={isLoading}
                        autoSend={false}
                    />

                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={`Speak to ${config.subject.name} — type or press mic / spacebar...`}
                        className="input flex-1 px-5 py-3"
                        disabled={isLoading}
                        id="simulation-input"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!input.trim() || isLoading}
                        className="btn-primary px-8 py-3 font-semibold"
                        id="send-btn"
                    >
                        SEND
                    </button>
                </div>
            </div>
        </div>
    );
}
