'use client';

import { useState } from 'react';
import {
    TRAINING_PACKS,
    type TrainingPack,
    type SubjectPack,
    type ScenarioPack,
    type SubjectProfile,
    getRandomSubject
} from '@/lib/packs/trainingPacks';
import { PRODUCT_PACKS, type ProductPack } from '@/lib/packs/productPacks';
import { type ICPPack } from '@/lib/packs/icpPacks';
import ProductSetup from './ProductSetup';
import ICPBuilder from './ICPBuilder';

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
}

type Step = 'product' | 'icp' | 'training' | 'stakeholder' | 'scenario';

const STEP_ORDER: Step[] = ['product', 'icp', 'training', 'stakeholder', 'scenario'];
const STEP_LABELS: Record<Step, string> = {
    product: 'What are you selling?',
    icp: 'Who are you selling to?',
    training: 'Your role',
    stakeholder: 'Stakeholder type',
    scenario: 'Deal scenario',
};

export default function PackSelector({ onStart }: PackSelectorProps) {
    const [selectedProductPack, setSelectedProductPack] = useState<ProductPack | null>(null);
    const [selectedICPPack, setSelectedICPPack] = useState<ICPPack | null>(null);
    const [selectedTrainingPack, setSelectedTrainingPack] = useState<TrainingPack | null>(null);
    const [selectedSubjectPack, setSelectedSubjectPack] = useState<SubjectPack | null>(null);
    const [selectedScenarioPack, setSelectedScenarioPack] = useState<ScenarioPack | null>(null);
    const [showCustomProduct, setShowCustomProduct] = useState(false);

    const currentStep = (): Step => {
        if (!selectedProductPack) return 'product';
        if (!selectedICPPack) return 'icp';
        if (!selectedTrainingPack) return 'training';
        if (!selectedSubjectPack) return 'stakeholder';
        return 'scenario';
    };

    const handleProductSelect = (pack: ProductPack) => {
        setSelectedProductPack(pack);
    };

    const handleICPSelect = (pack: ICPPack) => {
        setSelectedICPPack(pack);
    };

    const handleTrainingPackSelect = (pack: TrainingPack) => {
        setSelectedTrainingPack(pack);
        setSelectedSubjectPack(null);
        setSelectedScenarioPack(null);
    };

    const handleStepClick = (step: Step) => {
        const idx = STEP_ORDER.indexOf(step);
        const currentIdx = STEP_ORDER.indexOf(currentStep());
        if (idx < currentIdx) {
            // Go back to this step — reset downstream selections
            if (idx <= 0) { setSelectedProductPack(null); setSelectedICPPack(null); setSelectedTrainingPack(null); setSelectedSubjectPack(null); setSelectedScenarioPack(null); }
            else if (idx <= 1) { setSelectedICPPack(null); setSelectedTrainingPack(null); setSelectedSubjectPack(null); setSelectedScenarioPack(null); }
            else if (idx <= 2) { setSelectedTrainingPack(null); setSelectedSubjectPack(null); setSelectedScenarioPack(null); }
            else if (idx <= 3) { setSelectedSubjectPack(null); setSelectedScenarioPack(null); }
            else { setSelectedScenarioPack(null); }
        }
    };

    const handleStart = () => {
        if (!selectedProductPack || !selectedICPPack || !selectedTrainingPack || !selectedSubjectPack || !selectedScenarioPack) return;

        const subject = getRandomSubject(selectedSubjectPack);
        onStart({
            productPack: selectedProductPack,
            icpPack: selectedICPPack,
            trainingPack: selectedTrainingPack,
            subjectPack: selectedSubjectPack,
            scenarioPack: selectedScenarioPack,
            subject,
        });
    };

    const canStart = selectedProductPack && selectedICPPack && selectedTrainingPack && selectedSubjectPack && selectedScenarioPack;
    const step = currentStep();

    return (
        <div className="min-h-screen px-6 py-10" style={{ background: 'var(--bg-primary)' }}>
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-10">
                    <span className="label-accent">SALESSIM</span>
                    <h1 className="text-3xl font-bold mt-2" style={{ color: 'var(--text-primary)' }}>
                        Configure Simulation
                    </h1>
                    <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
                        Product × ICP × Role × Stakeholder × Scenario
                    </p>
                </div>

                {/* Step Progress */}
                <div className="flex items-center gap-2 mb-10">
                    {STEP_ORDER.map((s, i) => {
                        const isComplete = STEP_ORDER.indexOf(step) > i;
                        const isCurrent = s === step;
                        const selectedName = s === 'product' ? selectedProductPack?.name
                            : s === 'icp' ? selectedICPPack?.name
                            : s === 'training' ? selectedTrainingPack?.name
                            : s === 'stakeholder' ? selectedSubjectPack?.name
                            : selectedScenarioPack?.name;

                        return (
                            <button
                                key={s}
                                onClick={() => handleStepClick(s)}
                                disabled={!isComplete && !isCurrent}
                                className="flex-1 p-3 text-left transition-all"
                                style={{
                                    background: isCurrent ? 'var(--bg-card)' : isComplete ? 'var(--bg-secondary)' : 'transparent',
                                    borderBottom: `2px solid ${isCurrent ? 'var(--accent-primary)' : isComplete ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                                    cursor: isComplete ? 'pointer' : isCurrent ? 'default' : 'not-allowed',
                                    opacity: !isComplete && !isCurrent ? 0.4 : 1,
                                }}
                            >
                                <div className="text-xs uppercase tracking-wider" style={{ color: isComplete ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                                    {i + 1}. {STEP_LABELS[s]}
                                </div>
                                {isComplete && selectedName && (
                                    <div className="text-sm mt-1 truncate" style={{ color: 'var(--text-primary)' }}>
                                        {selectedName}
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Step 1: Product Pack */}
                {step === 'product' && (
                    <div className="mb-8">
                        <h2 className="text-xs uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>
                            What product are you selling?
                        </h2>

                        {!showCustomProduct ? (
                            <>
                                <div className="grid grid-cols-3 gap-4">
                                    {PRODUCT_PACKS.map((pack) => (
                                        <button
                                            key={pack.id}
                                            onClick={() => handleProductSelect(pack)}
                                            className="p-5 text-left transition-all"
                                            style={{
                                                background: selectedProductPack?.id === pack.id ? 'var(--bg-card)' : 'var(--bg-secondary)',
                                                border: `1px solid ${selectedProductPack?.id === pack.id ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                                            }}
                                        >
                                            <div className="text-2xl mb-2">{pack.icon}</div>
                                            <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{pack.name}</div>
                                            <div className="text-xs mt-1" style={{ color: 'var(--accent-primary)' }}>{pack.company}</div>
                                            <div className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>{pack.tagline}</div>
                                        </button>
                                    ))}
                                </div>

                                <div className="mt-6 text-center">
                                    <button
                                        onClick={() => setShowCustomProduct(true)}
                                        className="px-6 py-3 text-sm transition-all"
                                        style={{
                                            background: 'transparent',
                                            border: '1px dashed var(--border-color)',
                                            color: 'var(--text-secondary)',
                                        }}
                                    >
                                        📄 Bring Your Own Product — Upload a doc or enter a URL
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => setShowCustomProduct(false)}
                                    className="text-xs mb-4 transition-all"
                                    style={{ color: 'var(--accent-primary)' }}
                                >
                                    ← Back to built-in products
                                </button>
                                <ProductSetup
                                    onSelectProduct={(pack) => {
                                        handleProductSelect(pack);
                                        setShowCustomProduct(false);
                                    }}
                                    selectedProduct={selectedProductPack}
                                />
                            </>
                        )}
                    </div>
                )}

                {/* Step 2: ICP Pack */}
                {step === 'icp' && (
                    <div className="mb-8">
                        <h2 className="text-xs uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>
                            Who is your target buyer?
                        </h2>
                        <ICPBuilder
                            onSelectICP={handleICPSelect}
                            selectedICP={selectedICPPack}
                        />
                    </div>
                )}

                {/* Step 3: Training Pack (Role) */}
                {step === 'training' && (
                    <div className="mb-8">
                        <h2 className="text-xs uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>
                            Your sales role
                        </h2>
                        <div className="grid grid-cols-3 gap-4">
                            {TRAINING_PACKS.map((pack) => (
                                <button
                                    key={pack.id}
                                    onClick={() => handleTrainingPackSelect(pack)}
                                    className="p-5 text-left transition-all"
                                    style={{
                                        background: selectedTrainingPack?.id === pack.id ? 'var(--bg-card)' : 'var(--bg-secondary)',
                                        border: `1px solid ${selectedTrainingPack?.id === pack.id ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                                    }}
                                >
                                    <div className="text-2xl mb-2">{pack.icon}</div>
                                    <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{pack.name}</div>
                                    <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{pack.description}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 4: Stakeholder Type */}
                {step === 'stakeholder' && selectedTrainingPack && (
                    <div className="mb-8">
                        <h2 className="text-xs uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>
                            Stakeholder archetype
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            {selectedTrainingPack.subjectPacks.map((pack) => (
                                <button
                                    key={pack.id}
                                    onClick={() => setSelectedSubjectPack(pack)}
                                    className="p-5 text-left transition-all"
                                    style={{
                                        background: selectedSubjectPack?.id === pack.id ? 'var(--bg-card)' : 'var(--bg-secondary)',
                                        border: `1px solid ${selectedSubjectPack?.id === pack.id ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                                    }}
                                >
                                    <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{pack.name}</div>
                                    <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{pack.condition}</div>
                                    <div
                                        className="text-xs mt-2 inline-block px-2 py-0.5"
                                        style={{
                                            background: pack.conditionLevel === 'severe' ? 'rgba(239,68,68,0.2)' :
                                                pack.conditionLevel === 'moderate' ? 'rgba(245,158,11,0.2)' : 'rgba(63,212,151,0.2)',
                                            color: pack.conditionLevel === 'severe' ? '#ef4444' :
                                                pack.conditionLevel === 'moderate' ? '#f59e0b' : 'var(--accent-primary)',
                                        }}
                                    >
                                        {pack.conditionLevel === 'severe' ? 'ENTERPRISE' : pack.conditionLevel === 'moderate' ? 'MID-MARKET' : 'SMB'}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 5: Scenario */}
                {step === 'scenario' && selectedTrainingPack && (
                    <div className="mb-8">
                        <h2 className="text-xs uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>
                            Deal scenario
                        </h2>
                        <div className="grid grid-cols-1 gap-3">
                            {selectedTrainingPack.scenarioPacks.map((pack) => (
                                <button
                                    key={pack.id}
                                    onClick={() => setSelectedScenarioPack(pack)}
                                    className="p-5 text-left transition-all"
                                    style={{
                                        background: selectedScenarioPack?.id === pack.id ? 'var(--bg-card)' : 'var(--bg-secondary)',
                                        border: `1px solid ${selectedScenarioPack?.id === pack.id ? 'var(--accent-primary)' : 'var(--border-color)'}`,
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
                    <div className="p-5 mb-8" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                        <span className="label-accent">SIMULATION PREVIEW</span>
                        <div className="mt-3 grid grid-cols-5 gap-4 text-sm">
                            <div>
                                <div style={{ color: 'var(--text-muted)' }}>Product</div>
                                <div style={{ color: 'var(--text-primary)' }}>{selectedProductPack?.name}</div>
                            </div>
                            <div>
                                <div style={{ color: 'var(--text-muted)' }}>Target</div>
                                <div style={{ color: 'var(--text-primary)' }}>{selectedICPPack?.name}</div>
                            </div>
                            <div>
                                <div style={{ color: 'var(--text-muted)' }}>Role</div>
                                <div style={{ color: 'var(--text-primary)' }}>{selectedTrainingPack?.targetRole}</div>
                            </div>
                            <div>
                                <div style={{ color: 'var(--text-muted)' }}>Stakeholder</div>
                                 <div style={{ color: 'var(--text-primary)' }}>{selectedSubjectPack?.name}</div>
                            </div>
                            <div>
                                <div style={{ color: 'var(--text-muted)' }}>Scenario</div>
                                <div style={{ color: 'var(--text-primary)' }}>{selectedScenarioPack?.name}</div>
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
