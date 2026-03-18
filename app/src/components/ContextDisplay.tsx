'use client';

import { type SimulationConfig } from './PackSelector';

interface ContextDisplayProps {
    config: SimulationConfig;
}

export default function ContextDisplay({ config }: ContextDisplayProps) {
    return (
        <div
            className="px-5 py-4"
            style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}
        >
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-6 gap-4 text-sm">
                    {/* Product */}
                    <div>
                        <div className="label-accent text-xs">SELLING</div>
                        <div className="mt-1 font-medium" style={{ color: 'var(--text-primary)' }}>
                            {config.productPack.name}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {config.productPack.company}
                        </div>
                    </div>

                    {/* ICP */}
                    <div>
                        <div className="label-accent text-xs">BUYER</div>
                        <div className="mt-1 font-medium" style={{ color: 'var(--text-primary)' }}>
                            {config.icpPack.name}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {config.icpPack.companySize}
                        </div>
                    </div>

                    {/* Scenario */}
                    <div>
                        <div className="label-accent text-xs">SCENARIO</div>
                        <div className="mt-1 font-medium" style={{ color: 'var(--text-primary)' }}>
                            {config.scenarioPack.name}
                        </div>
                    </div>

                    {/* Prospect */}
                    <div>
                        <div className="label-accent text-xs">PROSPECT</div>
                        <div className="mt-1" style={{ color: 'var(--text-primary)' }}>
                            <span className="font-medium">{config.subject.name}</span>
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {(config.subject as unknown as {title: string}).title || ''}
                        </div>
                    </div>

                    {/* Stakeholder Type */}
                    <div>
                        <div className="label-accent text-xs">STAKEHOLDER</div>
                        <div className="mt-1" style={{ color: 'var(--text-primary)' }}>
                            {config.subjectPack.name}
                            <span
                                className="ml-2 text-xs px-1.5 py-0.5"
                                style={{
                                    background: config.subjectPack.conditionLevel === 'severe' ? 'rgba(239,68,68,0.2)' :
                                        config.subjectPack.conditionLevel === 'moderate' ? 'rgba(245,158,11,0.2)' : 'rgba(63,212,151,0.2)',
                                    color: config.subjectPack.conditionLevel === 'severe' ? '#ef4444' :
                                        config.subjectPack.conditionLevel === 'moderate' ? '#f59e0b' : 'var(--accent-primary)',
                                }}
                            >
                                {config.subjectPack.conditionLevel === 'severe' ? 'ENTERPRISE' : config.subjectPack.conditionLevel === 'moderate' ? 'MID-MARKET' : 'SMB'}
                            </span>
                        </div>
                    </div>

                    {/* Your Role */}
                    <div>
                        <div className="label-accent text-xs">YOUR ROLE</div>
                        <div className="mt-1 font-medium" style={{ color: 'var(--accent-primary)' }}>
                            {config.trainingPack.targetRole}
                        </div>
                    </div>
                </div>

                {/* Context strip */}
                <div className="mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                    {config.scenarioPack.context}
                </div>
            </div>
        </div>
    );
}
