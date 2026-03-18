/**
 * Demo Presets — One-click scenarios for quick demos.
 * 
 * Each preset picks a specific Product, ICP, Training Pack,
 * Stakeholder, and Scenario so the user can skip all configuration.
 */

import { PRODUCT_PACKS, type ProductPack } from './productPacks';
import { ICP_PACKS, type ICPPack } from './icpPacks';
import {
    TRAINING_PACKS,
    type TrainingPack,
    type SubjectPack,
    type ScenarioPack,
    type SubjectProfile,
    getRandomSubject,
} from './trainingPacks';

export interface DemoPreset {
    id: string;
    name: string;
    description: string;
    icon: string;
    /** Color accent for the card */
    accentColor: string;
    /** Index into PRODUCT_PACKS */
    productIndex: number;
    /** Index into ICP_PACKS */
    icpIndex: number;
    /** Index into TRAINING_PACKS */
    trainingIndex: number;
    /** Index into the training pack's subjectPacks */
    stakeholderIndex: number;
    /** Index into the training pack's scenarioPacks */
    scenarioIndex: number;
    /** Start in voice mode immediately */
    voiceMode: boolean;
}

export const DEMO_PRESETS: DemoPreset[] = [
    {
        id: 'cold-discovery',
        name: 'Cold Discovery Call',
        description: 'First meeting with a skeptical VP. Build rapport and uncover pain.',
        icon: '🎯',
        accentColor: '#3FD497',
        productIndex: 0,
        icpIndex: 0,
        trainingIndex: 0,
        stakeholderIndex: 0,
        scenarioIndex: 0,
        voiceMode: true,
    },
    {
        id: 'executive-pitch',
        name: 'Executive Pitch',
        description: 'Demo to a C-level buyer. Lead with business value, handle tough questions.',
        icon: '💼',
        accentColor: '#60a5fa',
        productIndex: 0,
        icpIndex: 1,
        trainingIndex: 0,
        stakeholderIndex: 1,
        scenarioIndex: 1,
        voiceMode: true,
    },
    {
        id: 'objection-gauntlet',
        name: 'Objection Gauntlet',
        description: 'Handle a barrage of objections from a hostile stakeholder.',
        icon: '🛡️',
        accentColor: '#f59e0b',
        productIndex: 1,
        icpIndex: 2,
        trainingIndex: 0,
        stakeholderIndex: 2,
        scenarioIndex: 2,
        voiceMode: true,
    },
];

export interface ResolvedDemoConfig {
    productPack: ProductPack;
    icpPack: ICPPack;
    trainingPack: TrainingPack;
    subjectPack: SubjectPack;
    scenarioPack: ScenarioPack;
    subject: SubjectProfile;
    voiceMode: boolean;
}

export function resolveDemoPreset(preset: DemoPreset): ResolvedDemoConfig | null {
    const products = PRODUCT_PACKS;
    const icps = ICP_PACKS;
    const trainings = TRAINING_PACKS;

    const product = products[preset.productIndex % products.length];
    const icp = icps[preset.icpIndex % icps.length];
    const training = trainings[preset.trainingIndex % trainings.length];

    if (!training.subjectPacks?.length || !training.scenarioPacks?.length) return null;

    const stakeholder = training.subjectPacks[preset.stakeholderIndex % training.subjectPacks.length];
    const scenario = training.scenarioPacks[preset.scenarioIndex % training.scenarioPacks.length];
    const subject = getRandomSubject(stakeholder);

    return {
        productPack: product,
        icpPack: icp,
        trainingPack: training,
        subjectPack: stakeholder,
        scenarioPack: scenario,
        subject,
        voiceMode: preset.voiceMode,
    };
}
