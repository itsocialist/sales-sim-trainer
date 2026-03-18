'use client';

import { useState, useEffect } from 'react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface DebriefAnalysis {
    recognitionScore: number;
    communicationScore: number;
    safetyScore: number;
    overallScore: number;
    strengths: string[];
    improvements: string[];
    indicatorsPresent: string[];
    indicatorsMissed: string[];
    summary: string;
}

interface DebriefScreenProps {
    messages: Message[];
    scenarioContext: string;
    intoxicationLevel: string;
    traineeRole?: string;
    subjectCondition?: string;
    scenarioName?: string;
    onRestart: () => void;
    onNewScenario: () => void;
}

export default function DebriefScreen({
    messages,
    scenarioContext,
    intoxicationLevel,
    traineeRole = 'Account Executive',
    subjectCondition = 'prospect',
    scenarioName,
    onRestart,
    onNewScenario,
}: DebriefScreenProps) {
    const [analysis, setAnalysis] = useState<DebriefAnalysis | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchDebrief() {
            // Don't attempt scoring with no messages
            if (!messages || messages.length < 2) {
                setError(`Not enough conversation data to analyze (${messages?.length || 0} messages). Try having a longer conversation before ending the session.`);
                setLoading(false);
                return;
            }

            try {
                const response = await fetch('/api/debrief', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        messages,
                        scenarioContext,
                        intoxicationLevel,
                        traineeRole,
                        subjectCondition,
                    }),
                });

                const data = await response.json();
                if (data.success && data.analysis) {
                    setAnalysis(data.analysis);
                } else {
                    setError(data.error || 'Could not generate analysis');
                }
            } catch {
                setError('Failed to load analysis');
            } finally {
                setLoading(false);
            }
        }
        fetchDebrief();
    }, [messages, scenarioContext, intoxicationLevel, traineeRole, subjectCondition]);

    const ScoreBox = ({ score, label }: { score: number; label: string }) => {
        const color = score >= 7 ? 'var(--accent-primary)' : score >= 5 ? '#f59e0b' : '#ef4444';
        return (
            <div className="text-center p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                <div className="score-display text-4xl" style={{ color }}>{score}</div>
                <div className="text-[10px] uppercase tracking-wider mt-2 font-medium" style={{ color: 'var(--text-muted)' }}>{label}</div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
                <div className="text-center">
                    <div className="label-accent animate-pulse-glow mb-3">ANALYZING SESSION</div>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        Evaluating {messages.length} messages across MEDDIC, Discovery, and Objection Handling...
                    </p>
                    <div className="mt-4 flex gap-2 justify-center">
                        {['MEDDIC', 'DISCOVERY', 'OBJECTIONS', 'PRESENCE'].map(dim => (
                            <span key={dim} className="text-[10px] px-2 py-1 animate-pulse-glow" style={{
                                background: 'rgba(63, 212, 151, 0.08)',
                                color: 'var(--accent-primary)',
                                border: '1px solid rgba(63, 212, 151, 0.2)',
                                animationDelay: `${Math.random() * 1}s`,
                            }}>
                                {dim}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error || !analysis) {
        return (
            <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--bg-primary)' }}>
                <div className="text-center max-w-md">
                    <p className="text-sm mb-4" style={{ color: '#f59e0b' }}>{error || 'Analysis unavailable'}</p>
                    <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                        Session completed with {messages.length} message{messages.length !== 1 ? 's' : ''}.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <button onClick={onRestart} className="btn-primary px-6 py-3">TRY AGAIN</button>
                        <button onClick={onNewScenario} className="btn-secondary px-6 py-3">NEW SCENARIO</button>
                    </div>
                </div>
            </div>
        );
    }

    const overallColor = analysis.overallScore >= 7 ? 'var(--accent-primary)' : analysis.overallScore >= 5 ? '#f59e0b' : '#ef4444';

    return (
        <div className="min-h-screen px-6 py-8" style={{ background: 'var(--bg-primary)' }}>
            <div className="max-w-3xl mx-auto fade-in">
                {/* Header */}
                <div className="text-center mb-8">
                    <span className="label-accent">DEBRIEF COMPLETE</span>
                    <h2 className="text-2xl font-bold mt-2" style={{ color: 'var(--text-primary)' }}>
                        Performance Analysis
                    </h2>
                    {scenarioName && (
                        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                            {scenarioName} · {messages.length} exchanges · {traineeRole}
                        </p>
                    )}
                </div>

                {/* Overall Score */}
                <div className="text-center p-8 mb-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                    <div className="score-display text-6xl mb-3" style={{ color: overallColor }}>
                        {analysis.overallScore}
                        <span className="text-2xl" style={{ color: 'var(--text-muted)' }}>/10</span>
                    </div>
                    <p className="text-sm leading-relaxed max-w-lg mx-auto" style={{ color: 'var(--text-secondary)' }}>
                        {analysis.summary}
                    </p>
                </div>

                {/* Score Breakdown */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <ScoreBox score={analysis.recognitionScore} label="MEDDIC Coverage" />
                    <ScoreBox score={analysis.communicationScore} label="Discovery & Questions" />
                    <ScoreBox score={analysis.safetyScore} label="Objection Handling" />
                </div>

                {/* Strengths */}
                <div className="p-6 mb-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                    <span className="label-accent" style={{ color: 'var(--accent-primary)' }}>STRENGTHS</span>
                    <ul className="mt-3 space-y-2">
                        {analysis.strengths.map((s, i) => (
                            <li key={i} className="flex gap-2 text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                                <span style={{ color: 'var(--accent-primary)' }}>↗</span> {s}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Improvements */}
                <div className="p-6 mb-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                    <span className="label-accent" style={{ color: '#f59e0b' }}>AREAS FOR IMPROVEMENT</span>
                    <ul className="mt-3 space-y-2">
                        {analysis.improvements.map((s, i) => (
                            <li key={i} className="flex gap-2 text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                                <span style={{ color: '#f59e0b' }}>→</span> {s}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* MEDDIC Indicators */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                        <span className="label-accent">MEDDIC COVERED</span>
                        <ul className="mt-2 space-y-1">
                            {analysis.indicatorsPresent.slice(0, 6).map((s, i) => (
                                <li key={i} className="text-sm flex items-start gap-2" style={{ color: 'var(--text-secondary)' }}>
                                    <span style={{ color: 'var(--accent-primary)' }}>✓</span> {s}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                        <span className="label-accent" style={{ color: '#ef4444' }}>MEDDIC GAPS</span>
                        <ul className="mt-2 space-y-1">
                            {analysis.indicatorsMissed.slice(0, 6).map((s, i) => (
                                <li key={i} className="text-sm flex items-start gap-2" style={{ color: 'var(--text-secondary)' }}>
                                    <span style={{ color: '#ef4444' }}>✗</span> {s}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <button onClick={onRestart} className="btn-primary flex-1 py-4 font-semibold">
                        RETRY SCENARIO
                    </button>
                    <button onClick={onNewScenario} className="btn-secondary flex-1 py-4 font-semibold">
                        NEW SCENARIO
                    </button>
                </div>
            </div>
        </div>
    );
}
