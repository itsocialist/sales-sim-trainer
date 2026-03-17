/**
 * Stakeholder Voice Profiles — SalesSim
 * 
 * Maps each stakeholder archetype to a specific voice across all providers.
 * Designed to make each stakeholder sound distinct and persona-appropriate.
 */

import type { VoiceProfile } from './types';

// ── Enterprise Stakeholder Voices ──

export const STAKEHOLDER_VOICES: Record<string, VoiceProfile> = {
    // ═══════════════════════════════════════
    // ENTERPRISE AE PACK
    // ═══════════════════════════════════════

    'champion': {
        name: 'Champion / Internal Advocate',
        elevenlabsVoiceId: 'EXAVITQu4vr4xnSDxMaL',  // Sarah — warm, professional
        fishModelId: '7f92f8afb8ec43bf81429cc1c9199cb1',  // Default female professional
        openaiVoice: 'nova',
        gender: 'female',
        ageRange: 'middle',
        style: 'Warm, enthusiastic but measured. Genuinely wants to help but politically aware.',
        elevenlabsSettings: {
            stability: 0.45,
            similarity_boost: 0.75,
            style: 0.5,
            use_speaker_boost: true,
        },
        fishSettings: {
            temperature: 0.7,
            top_p: 0.8,
            speed: 1.0,
        },
    },

    'economic-buyer': {
        name: 'Economic Buyer (CFO / VP)',
        elevenlabsVoiceId: 'onwK4e9ZLuTAKqWW03F9',  // Daniel — commanding, deep
        fishModelId: 'e58b0d7efca34eb5b5c9fb86a18a83b5',  // Default male authoritative
        openaiVoice: 'onyx',
        gender: 'male',
        ageRange: 'senior',
        style: 'Authoritative, skeptical, time-precious. Speaks in economic terms.',
        elevenlabsSettings: {
            stability: 0.65,        // More controlled, authoritative
            similarity_boost: 0.8,
            style: 0.3,            // Less dramatic, more businesslike
            use_speaker_boost: true,
        },
        fishSettings: {
            temperature: 0.5,
            top_p: 0.7,
            speed: 0.95,           // Slightly slower, deliberate
        },
    },

    'blocker': {
        name: 'Blocker / Skeptic',
        elevenlabsVoiceId: 'N2lVS1w4EtoT3dr4eOWO',  // Callum — calm but firm
        fishModelId: 'e58b0d7efca34eb5b5c9fb86a18a83b5',
        openaiVoice: 'fable',
        gender: 'male',
        ageRange: 'middle',
        style: 'Dismissive, arms-crossed energy. Short answers, looks for flaws.',
        elevenlabsSettings: {
            stability: 0.7,         // Very controlled, restrictive
            similarity_boost: 0.75,
            style: 0.2,            // Low expressiveness — stone-faced
            use_speaker_boost: false,
        },
        fishSettings: {
            temperature: 0.4,       // Low expressiveness
            top_p: 0.6,
            speed: 0.9,
        },
    },

    'technical-evaluator': {
        name: 'Technical Evaluator',
        elevenlabsVoiceId: 'IKne3meq5aSn9XLyUdCD',  // Oliver — precise, technical
        fishModelId: '7f92f8afb8ec43bf81429cc1c9199cb1',
        openaiVoice: 'echo',
        gender: 'male',
        ageRange: 'young',
        style: 'Detail-oriented, asks specific technical questions. Neutral until impressed.',
        elevenlabsSettings: {
            stability: 0.55,
            similarity_boost: 0.8,
            style: 0.35,
            use_speaker_boost: true,
        },
        fishSettings: {
            temperature: 0.6,
            top_p: 0.75,
            speed: 1.05,           // Slightly faster, eager to get to details
        },
    },

    // ═══════════════════════════════════════
    // MID-MARKET AE PACK
    // ═══════════════════════════════════════

    'founder-ceo': {
        name: 'Founder / CEO (SMB)',
        elevenlabsVoiceId: 'pFZP5JQG7iQjIQuC4Bku',  // Jeff — classy, resonating
        fishModelId: 'e58b0d7efca34eb5b5c9fb86a18a83b5',
        openaiVoice: 'onyx',
        gender: 'male',
        ageRange: 'middle',
        style: 'Decisive, informal, time-starved. Wants bottom line. Easily distracted.',
        elevenlabsSettings: {
            stability: 0.4,
            similarity_boost: 0.7,
            style: 0.55,
            use_speaker_boost: true,
        },
        fishSettings: {
            temperature: 0.75,
            top_p: 0.8,
            speed: 1.1,           // Fast-paced, impatient
        },
    },

    'vp-sales': {
        name: 'VP Sales / Revenue Leader',
        elevenlabsVoiceId: 'XB0fDUnXU5powFXDhCwa',  // Charlotte — confident, direct
        fishModelId: '7f92f8afb8ec43bf81429cc1c9199cb1',
        openaiVoice: 'nova',
        gender: 'female',
        ageRange: 'middle',
        style: 'Sales-savvy, sees through BS. Tests your credibility. Respects competence.',
        elevenlabsSettings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.45,
            use_speaker_boost: true,
        },
        fishSettings: {
            temperature: 0.65,
            top_p: 0.75,
            speed: 1.0,
        },
    },

    // ═══════════════════════════════════════
    // SDR / BDR PACK
    // ═══════════════════════════════════════

    'gatekeeper': {
        name: 'Gatekeeper / EA',
        elevenlabsVoiceId: 'jBpfuIE2acCO8z3wKNLl',  // Gigi — professional, guarded
        fishModelId: '7f92f8afb8ec43bf81429cc1c9199cb1',
        openaiVoice: 'shimmer',
        gender: 'female',
        ageRange: 'young',
        style: 'Professional but protective. Screens calls. Follows protocols. Hard to bypass.',
        elevenlabsSettings: {
            stability: 0.6,
            similarity_boost: 0.8,
            style: 0.25,           // Low drama — just doing her job
            use_speaker_boost: false,
        },
        fishSettings: {
            temperature: 0.5,
            top_p: 0.65,
            speed: 1.0,
        },
    },

    'curious-skeptic': {
        name: 'Curious but Skeptical Prospect',
        elevenlabsVoiceId: 'LcfcDJNUP1GQjkzn1xUU',  // Jamahal — natural, vibrant
        fishModelId: 'e58b0d7efca34eb5b5c9fb86a18a83b5',
        openaiVoice: 'echo',
        gender: 'male',
        ageRange: 'young',
        style: 'Interested but burned before. Asks pointed questions. Needs proof, not promises.',
        elevenlabsSettings: {
            stability: 0.45,
            similarity_boost: 0.7,
            style: 0.5,
            use_speaker_boost: true,
        },
        fishSettings: {
            temperature: 0.7,
            top_p: 0.8,
            speed: 1.0,
        },
    },
};

/**
 * Resolve a voice profile from stakeholder condition text.
 * Falls back to economic-buyer if no match found.
 */
export function resolveVoiceProfile(subjectCondition: string): VoiceProfile {
    const conditionLower = subjectCondition.toLowerCase();

    // Match against known stakeholder types
    if (conditionLower.includes('champion') || conditionLower.includes('advocate')) {
        return STAKEHOLDER_VOICES['champion'];
    }
    if (conditionLower.includes('economic') || conditionLower.includes('cfo') || conditionLower.includes('buyer')) {
        return STAKEHOLDER_VOICES['economic-buyer'];
    }
    if (conditionLower.includes('blocker') || conditionLower.includes('skeptic') && !conditionLower.includes('curious')) {
        return STAKEHOLDER_VOICES['blocker'];
    }
    if (conditionLower.includes('technical') || conditionLower.includes('evaluator')) {
        return STAKEHOLDER_VOICES['technical-evaluator'];
    }
    if (conditionLower.includes('founder') || conditionLower.includes('ceo')) {
        return STAKEHOLDER_VOICES['founder-ceo'];
    }
    if (conditionLower.includes('vp sales') || conditionLower.includes('revenue')) {
        return STAKEHOLDER_VOICES['vp-sales'];
    }
    if (conditionLower.includes('gatekeeper') || conditionLower.includes('assistant') || conditionLower.includes('ea')) {
        return STAKEHOLDER_VOICES['gatekeeper'];
    }
    if (conditionLower.includes('curious') || conditionLower.includes('prospect')) {
        return STAKEHOLDER_VOICES['curious-skeptic'];
    }

    // Default fallback
    return STAKEHOLDER_VOICES['economic-buyer'];
}

/**
 * Get a simple voice for legacy name/age based selection.
 */
export function resolveVoiceFromNameAge(name: string, age: string): VoiceProfile {
    const ageNum = parseInt(age) || 35;
    const firstName = name.split(' ')[0].toLowerCase();
    const femaleNames = ['sarah', 'michelle', 'maria', 'emma', 'jasmine', 'alex', 'lisa', 'jennifer', 'karen', 'patricia'];
    const isFemale = femaleNames.some(n => firstName.includes(n));

    if (isFemale) {
        if (ageNum < 30) return STAKEHOLDER_VOICES['gatekeeper'];
        if (ageNum < 50) return STAKEHOLDER_VOICES['champion'];
        return STAKEHOLDER_VOICES['vp-sales'];
    } else {
        if (ageNum < 30) return STAKEHOLDER_VOICES['curious-skeptic'];
        if (ageNum < 50) return STAKEHOLDER_VOICES['founder-ceo'];
        return STAKEHOLDER_VOICES['economic-buyer'];
    }
}
