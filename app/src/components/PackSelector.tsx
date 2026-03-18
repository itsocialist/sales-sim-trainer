/**
 * PackSelector — Simplified Simulation Configuration
 * 
 * A lean 3-step setup flow:
 *   Step 1: Pick Product + ICP (from saved library)
 *   Step 2: Pick Training Role + Stakeholder
 *   Step 3: Pick Scenario → GO
 * 
 * Product/ICP creation is handled separately in PackLibrary.
 */

'use client';

import { useState, useEffect } from 'react';
import {
    TRAINING_PACKS,
    type TrainingPack,
    type SubjectPack,
    type ScenarioPack,
    type SubjectProfile,
    getRandomSubject
} from '@/lib/packs/trainingPacks';
import { type ProductPack } from '@/lib/packs/productPacks';
import { type ICPPack } from '@/lib/packs/icpPacks';
import { getAllProducts, getAllICPs } from '@/lib/packs/packStore';

export interface SimulationConfig {
    productPack: ProductPack;
    icpPack: ICPPack;
    trainingPack: TrainingPack;
    subjectPack: SubjectPack;
    scenarioPack: ScenarioPack;
    subject: SubjectProfile;
}

interface PackSelectorProps {
    onStart: (config: SimulationConfig) => void;
    onOpenLibrary: () => void;
}

type Step = 'context' | 'role' | 'scenario';

const STEP_ORDER: Step[] = ['context', 'role', 'scenario'];

export default function PackSelector({ onStart, onOpenLibrary }: PackSelectorProps) {
    // Available packs (built-in + saved custom)
    const [allProducts, setAllProducts] = useState<ProductPack[]>([]);
    const [allICPs, setAllICPs] = useState<ICPPack[]>([]);

    // Selections
    const [selectedProduct, setSelectedProduct] = useState<ProductPack | null>(null);
    const [selectedICP, setSelectedICP] = useState<ICPPack | null>(null);
    const [selectedTraining, setSelectedTraining] = useState<TrainingPack | null>(null);
    const [selectedSubject, setSelectedSubject] = useState<SubjectPack | null>(null);
    const [selectedScenario, setSelectedScenario] = useState<ScenarioPack | null>(null);

    useEffect(() => {
        setAllProducts(getAllProducts());
        setAllICPs(getAllICPs());
    }, []);

    const currentStep = (): Step => {
        if (!selectedProduct || !selectedICP) return 'context';
        if (!selectedTraining || !selectedSubject) return 'role';
        return 'scenario';
    };

    const handleStepClick = (step: Step) => {
        const idx = STEP_ORDER.indexOf(step);
        const currentIdx = STEP_ORDER.indexOf(currentStep());
        if (idx < currentIdx) {
            if (idx <= 0) {
                setSelectedProduct(null); setSelectedICP(null);
                setSelectedTraining(null); setSelectedSubject(null); setSelectedScenario(null);
            } else if (idx <= 1) {
                setSelectedTraining(null); setSelectedSubject(null); setSelectedScenario(null);
            } else {
                setSelectedScenario(null);
            }
        }
    };

    const handleStart = () => {
        if (!selectedProduct || !selectedICP || !selectedTraining || !selectedSubject || !selectedScenario) return;
        const subject = getRandomSubject(selectedSubject);
        onStart({
            productPack: selectedProduct,
            icpPack: selectedICP,
            trainingPack: selectedTraining,
            subjectPack: selectedSubject,
            scenarioPack: selectedScenario,
            subject,
        });
    };

    const canStart = selectedProduct && selectedICP && selectedTraining && selectedSubject && selectedScenario;
    const step = currentStep();

    const stepLabels: Record<Step, string> = {
        context: 'Product & Buyer',
        role: 'Role & Stakeholder',
        scenario: 'Scenario',
    };

    const stepSummary: Record<Step, string | null> = {
        context: selectedProduct && selectedICP ? `${selectedProduct.name} → ${selectedICP.name}` : null,
        role: selectedTraining && selectedSubject ? `${selectedTraining.targetRole} vs ${selectedSubject.name}` : null,
        scenario: selectedScenario ? selectedScenario.name : null,
    };

    return (
        <div className="min-h-screen px-6 py-10" style={{ background: 'var(--bg-primary)' }}>
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex justify-between items-start">
                    <div>
                        <span className="label-accent">SALESSIM</span>
                        <h1 className="text-3xl font-bold mt-2" style={{ color: 'var(--text-primary)' }}>
                            Quick Start
                        </h1>
                        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                            3 steps — pick your context, role, and scenario
                        </p>
                    </div>
                    <button
                        onClick={onOpenLibrary}
                        className="btn-secondary px-5 py-2.5 text-sm font-semibold flex items-center gap-2"
                    >
                        <span>📚</span> Pack Library
                    </button>
                </div>

                {/* Step Progress */}
                <div className="flex items-center gap-2 mb-8">
                    {STEP_ORDER.map((s, i) => {
                        const isComplete = STEP_ORDER.indexOf(step) > i;
                        const isCurrent = s === step;
                        return (
                            <button
                                key={s}
                                onClick={() => handleStepClick(s)}
                                disabled={!isComplete && !isCurrent}
                                className="flex-1 p-3 text-left transition-all"
                                style={{
                                    background: isCurrent ? 'var(--bg-card)' : isComplete ? 'var(--bg-secondary)' : 'transparent',
                                    borderBottom: `2px solid ${isCurrent || isComplete ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                                    cursor: isComplete ? 'pointer' : isCurrent ? 'default' : 'not-allowed',
                                    opacity: !isComplete && !isCurrent ? 0.4 : 1,
                                }}
                            >
                                <div className="text-xs uppercase tracking-wider" style={{ color: isComplete ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                                    {i + 1}. {stepLabels[s]}
                                </div>
                                {isComplete && stepSummary[s] && (
                                    <div className="text-sm mt-1 truncate" style={{ color: 'var(--text-primary)' }}>
                                        {stepSummary[s]}
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* ── STEP 1: Product + ICP ── */}
                {step === 'context' && (
                    <div className="grid grid-cols-2 gap-8 mb-8">
                        {/* Product Selection */}
                        <div>
                            <h2 className="text-xs uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>
                                What are you selling?
                            </h2>
                            <div className="space-y-3">
                                {allProducts.map(pack => (
                                    <button
                                        key={pack.id}
                                        onClick={() => setSelectedProduct(pack)}
                                        className="w-full p-4 text-left transition-all"
                                        style={{
                                            background: selectedProduct?.id === pack.id ? 'var(--bg-card)' : 'var(--bg-secondary)',
                                            border: `1px solid ${selectedProduct?.id === pack.id ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                                        }}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="text-xl">{pack.icon}</div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{pack.name}</div>
                                                <div className="text-xs" style={{ color: 'var(--accent-primary)' }}>{pack.company}</div>
                                                <div className="text-xs mt-1 truncate" style={{ color: 'var(--text-muted)' }}>{pack.tagline}</div>
                                            </div>
                                            {pack.id.startsWith('prod-custom-') && (
                                                <span className="text-xs px-1.5 py-0.5 shrink-0" style={{
                                                    background: 'rgba(96,165,250,0.15)', color: '#60a5fa',
                                                }}>CUSTOM</span>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={onOpenLibrary}
                                className="mt-3 w-full py-2 text-xs transition-all"
                                style={{ border: '1px dashed var(--border-color)', color: 'var(--text-muted)', background: 'transparent' }}
                            >
                                + Add products in Pack Library
                            </button>
                        </div>

                        {/* ICP Selection */}
                        <div>
                            <h2 className="text-xs uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>
                                Who are you selling to?
                            </h2>
                            <div className="space-y-3">
                                {allICPs.map(icp => (
                                    <button
                                        key={icp.id}
                                        onClick={() => setSelectedICP(icp)}
                                        className="w-full p-4 text-left transition-all"
                                        style={{
                                            background: selectedICP?.id === icp.id ? 'var(--bg-card)' : 'var(--bg-secondary)',
                                            border: `1px solid ${selectedICP?.id === icp.id ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                                        }}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="text-xl">{icp.icon}</div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{icp.name}</div>
                                                <div className="flex gap-2 mt-1">
                                                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{icp.companySize}</span>
                                                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>·</span>
                                                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{icp.avgDealSize}</span>
                                                </div>
                                                <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{icp.vertical.name}</div>
                                            </div>
                                            {icp.id.startsWith('icp-custom-') && (
                                                <span className="text-xs px-1.5 py-0.5 shrink-0" style={{
                                                    background: 'rgba(96,165,250,0.15)', color: '#60a5fa',
                                                }}>CUSTOM</span>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={onOpenLibrary}
                                className="mt-3 w-full py-2 text-xs transition-all"
                                style={{ border: '1px dashed var(--border-color)', color: 'var(--text-muted)', background: 'transparent' }}
                            >
                                + Add buyer profiles in Pack Library
                            </button>
                        </div>
                    </div>
                )}

                {/* ── STEP 2: Training Role + Stakeholder ── */}
                {step === 'role' && (
                    <div className="mb-8">
                        <div className="grid grid-cols-2 gap-8">
                            {/* Training Role */}
                            <div>
                                <h2 className="text-xs uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>
                                    Your sales role
                                </h2>
                                <div className="space-y-3">
                                    {TRAINING_PACKS.map(pack => (
                                        <button
                                            key={pack.id}
                                            onClick={() => { setSelectedTraining(pack); setSelectedSubject(null); setSelectedScenario(null); }}
                                            className="w-full p-4 text-left transition-all"
                                            style={{
                                                background: selectedTraining?.id === pack.id ? 'var(--bg-card)' : 'var(--bg-secondary)',
                                                border: `1px solid ${selectedTraining?.id === pack.id ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                                            }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="text-xl">{pack.icon}</div>
                                                <div>
                                                    <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{pack.name}</div>
                                                    <div className="text-xs mt-0.5" style={{ color: 'var(--accent-primary)' }}>{pack.targetRole}</div>
                                                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{pack.description}</div>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Stakeholder Type (only after training selected) */}
                            <div>
                                <h2 className="text-xs uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>
                                    Stakeholder archetype
                                </h2>
                                {selectedTraining ? (
                                    <div className="space-y-3">
                                        {selectedTraining.subjectPacks.map(pack => (
                                            <button
                                                key={pack.id}
                                                onClick={() => setSelectedSubject(pack)}
                                                className="w-full p-4 text-left transition-all"
                                                style={{
                                                    background: selectedSubject?.id === pack.id ? 'var(--bg-card)' : 'var(--bg-secondary)',
                                                    border: `1px solid ${selectedSubject?.id === pack.id ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                                                }}
                                            >
                                                <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{pack.name}</div>
                                                <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{pack.condition}</div>
                                                <span
                                                    className="text-xs px-2 py-0.5 mt-2 inline-block"
                                                    style={{
                                                        background: pack.conditionLevel === 'severe'
                                                            ? 'rgba(239,68,68,0.15)' : pack.conditionLevel === 'moderate'
                                                            ? 'rgba(245,158,11,0.15)' : 'rgba(63,212,151,0.15)',
                                                        color: pack.conditionLevel === 'severe'
                                                            ? '#ef4444' : pack.conditionLevel === 'moderate'
                                                            ? '#f59e0b' : 'var(--accent-primary)',
                                                    }}
                                                >
                                                    {pack.conditionLevel === 'severe' ? 'ENTERPRISE' : pack.conditionLevel === 'moderate' ? 'MID-MARKET' : 'SMB'}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center" style={{ color: 'var(--text-muted)', border: '1px dashed var(--border-color)' }}>
                                        ← Select a role first
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── STEP 3: Scenario ── */}
                {step === 'scenario' && selectedTraining && (
                    <div className="mb-8">
                        <h2 className="text-xs uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>
                            Deal scenario
                        </h2>
                        <div className="grid grid-cols-1 gap-3">
                            {selectedTraining.scenarioPacks.map(pack => (
                                <button
                                    key={pack.id}
                                    onClick={() => setSelectedScenario(pack)}
                                    className="p-5 text-left transition-all"
                                    style={{
                                        background: selectedScenario?.id === pack.id ? 'var(--bg-card)' : 'var(--bg-secondary)',
                                        border: `1px solid ${selectedScenario?.id === pack.id ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                                    }}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{pack.name}</div>
                                            <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{pack.description}</div>
                                        </div>
                                        <div className="text-right text-xs" style={{ color: 'var(--text-muted)' }}>
                                            <div>Warmth: {pack.initialDistance}/10</div>
                                            <div>Engagement: {pack.initialTemperature}/10</div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Preview */}
                {canStart && (
                    <div className="p-5 mb-6" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                        <span className="label-accent">SIMULATION PREVIEW</span>
                        <div className="mt-3 grid grid-cols-5 gap-4 text-sm">
                            <div>
                                <div style={{ color: 'var(--text-muted)' }}>Product</div>
                                <div style={{ color: 'var(--text-primary)' }}>{selectedProduct?.name}</div>
                            </div>
                            <div>
                                <div style={{ color: 'var(--text-muted)' }}>Buyer</div>
                                <div style={{ color: 'var(--text-primary)' }}>{selectedICP?.name}</div>
                            </div>
                            <div>
                                <div style={{ color: 'var(--text-muted)' }}>Role</div>
                                <div style={{ color: 'var(--text-primary)' }}>{selectedTraining?.targetRole}</div>
                            </div>
                            <div>
                                <div style={{ color: 'var(--text-muted)' }}>Stakeholder</div>
                                <div style={{ color: 'var(--text-primary)' }}>{selectedSubject?.name}</div>
                            </div>
                            <div>
                                <div style={{ color: 'var(--text-muted)' }}>Scenario</div>
                                <div style={{ color: 'var(--text-primary)' }}>{selectedScenario?.name}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Start Button */}
                <button
                    onClick={handleStart}
                    disabled={!canStart}
                    className="btn-primary w-full py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {canStart ? 'START SIMULATION →' : 'COMPLETE ALL STEPS TO START'}
                </button>
            </div>
        </div>
    );
}
