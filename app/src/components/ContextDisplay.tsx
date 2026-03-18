'use client';

import { type SimulationConfig } from './PackSelector';

interface ContextDisplayProps {
    config: SimulationConfig;
}

export default function ContextDisplay({ config }: ContextDisplayProps) {
    const subject = config.subject as unknown as { name: string; title: string; company: string };

    return (
        <div className="context-bar">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-6 gap-6">
                    {/* Product */}
                    <div>
                        <div className="context-label">SELLING</div>
                        <div className="context-value">{config.productPack.name}</div>
                        <div className="context-detail">{config.productPack.company}</div>
                    </div>

                    {/* Buyer */}
                    <div>
                        <div className="context-label">BUYER SEGMENT</div>
                        <div className="context-value">{config.icpPack.name}</div>
                        <div className="context-detail">{config.icpPack.companySize}</div>
                    </div>

                    {/* Scenario */}
                    <div>
                        <div className="context-label">SCENARIO</div>
                        <div className="context-value">{config.scenarioPack.name}</div>
                    </div>

                    {/* Prospect */}
                    <div>
                        <div className="context-label">PROSPECT</div>
                        <div className="context-value">{subject.name}</div>
                        <div className="context-detail">{subject.title || ''}</div>
                    </div>

                    {/* Stakeholder */}
                    <div>
                        <div className="context-label">STAKEHOLDER</div>
                        <div className="context-value">
                            {config.subjectPack.name}
                        </div>
                        <div className="context-detail">
                            <span
                                className="inline-block mt-1 px-1.5 py-0.5 text-[10px] font-medium"
                                style={{
                                    background: config.subjectPack.conditionLevel === 'severe' ? 'rgba(239,68,68,0.15)' :
                                        config.subjectPack.conditionLevel === 'moderate' ? 'rgba(245,158,11,0.15)' : 'rgba(63,212,151,0.15)',
                                    color: config.subjectPack.conditionLevel === 'severe' ? '#ef4444' :
                                        config.subjectPack.conditionLevel === 'moderate' ? '#f59e0b' : 'var(--accent-primary)',
                                    border: `1px solid ${config.subjectPack.conditionLevel === 'severe' ? 'rgba(239,68,68,0.3)' :
                                        config.subjectPack.conditionLevel === 'moderate' ? 'rgba(245,158,11,0.3)' : 'rgba(63,212,151,0.3)'}`,
                                }}
                            >
                                {config.subjectPack.conditionLevel === 'severe' ? 'ENTERPRISE' : config.subjectPack.conditionLevel === 'moderate' ? 'MID-MARKET' : 'SMB'}
                            </span>
                        </div>
                    </div>

                    {/* Your Role */}
                    <div>
                        <div className="context-label">YOUR ROLE</div>
                        <div className="context-value" style={{ color: 'var(--accent-primary)' }}>
                            {config.trainingPack.targetRole}
                        </div>
                    </div>
                </div>

                {/* Scenario context strip */}
                {config.scenarioPack.context && (
                    <div
                        className="mt-3 pt-3 text-xs leading-relaxed"
                        style={{
                            color: 'var(--text-muted)',
                            borderTop: '1px solid var(--border-color)',
                        }}
                    >
                        {config.scenarioPack.context}
                    </div>
                )}
            </div>
        </div>
    );
}
