/**
 * Pack Store — localStorage persistence for Products, ICPs, Training Packs, and Industry Bundles
 * 
 * ALL pack types are pluggable:
 * - Built-in packs are hardcoded defaults (tech sales + CRE)
 * - Custom packs are user-created and persisted to localStorage
 * - Industry Bundles wrap Training + ICP + Product into one portable JSON file
 * 
 * Uses localStorage with a versioned schema.
 */

import { type ProductPack, PRODUCT_PACKS } from './productPacks';
import { type ICPPack, ICP_PACKS } from './icpPacks';
import { TRAINING_PACKS, type TrainingPack } from './trainingPacks';

const STORAGE_KEY_PRODUCTS = 'salessim_products_v1';
const STORAGE_KEY_ICPS = 'salessim_icps_v1';
const STORAGE_KEY_TRAININGS = 'salessim_trainings_v1';
const STORAGE_KEY_BUNDLES = 'salessim_bundles_v1';

// ══════════════════════════════════════════════════
// INDUSTRY PACK BUNDLE — Portable pack format
// One JSON file = Training + ICP + Product
// ══════════════════════════════════════════════════

export interface IndustryPackBundle {
    /** Unique bundle ID */
    id: string;
    /** Bundle format version for forward compat */
    version: '1.0';
    /** Bundle metadata */
    meta: {
        name: string;
        description: string;
        icon: string;
        /** Industry vertical (e.g. "Commercial Real Estate", "Hospitality") */
        industry: string;
        /** Who created this bundle */
        author: string;
        /** ISO date string */
        createdAt: string;
        /** Optional tags for discoverability */
        tags?: string[];
        /** Optional locale / language support */
        locale?: string;
    };
    /** Training pack with stakeholders and scenarios */
    trainingPack: TrainingPack;
    /** Ideal Customer Profile */
    icpPack: ICPPack;
    /** Product/service being sold */
    productPack: ProductPack;
}

// ── Product Persistence ──────────────────────────────────────────

export function getSavedProducts(): ProductPack[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY_PRODUCTS);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export function saveProduct(product: ProductPack): void {
    const saved = getSavedProducts();
    const idx = saved.findIndex(p => p.id === product.id);
    if (idx >= 0) {
        saved[idx] = product;
    } else {
        saved.push(product);
    }
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(saved));
}

export function deleteProduct(id: string): void {
    const saved = getSavedProducts().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(saved));
}

/** Returns built-in + saved custom products */
export function getAllProducts(): ProductPack[] {
    return [...PRODUCT_PACKS, ...getSavedProducts()];
}

// ── ICP Persistence ──────────────────────────────────────────────

export function getSavedICPs(): ICPPack[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY_ICPS);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export function saveICP(icp: ICPPack): void {
    const saved = getSavedICPs();
    const idx = saved.findIndex(p => p.id === icp.id);
    if (idx >= 0) {
        saved[idx] = icp;
    } else {
        saved.push(icp);
    }
    localStorage.setItem(STORAGE_KEY_ICPS, JSON.stringify(saved));
}

export function deleteICP(id: string): void {
    const saved = getSavedICPs().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY_ICPS, JSON.stringify(saved));
}

/** Returns built-in + saved custom ICPs */
export function getAllICPs(): ICPPack[] {
    return [...ICP_PACKS, ...getSavedICPs()];
}

// ── Training Pack Persistence ────────────────────────────────────

export function getSavedTrainingPacks(): TrainingPack[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY_TRAININGS);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export function saveTrainingPack(pack: TrainingPack): void {
    const saved = getSavedTrainingPacks();
    const idx = saved.findIndex(p => p.id === pack.id);
    if (idx >= 0) {
        saved[idx] = pack;
    } else {
        saved.push(pack);
    }
    localStorage.setItem(STORAGE_KEY_TRAININGS, JSON.stringify(saved));
}

export function deleteTrainingPack(id: string): void {
    const saved = getSavedTrainingPacks().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY_TRAININGS, JSON.stringify(saved));
}

/** Returns built-in + saved custom training packs */
export function getAllTrainingPacks(): TrainingPack[] {
    return [...TRAINING_PACKS, ...getSavedTrainingPacks()];
}

// ── Industry Pack Bundle Persistence ─────────────────────────────

export function getSavedBundles(): IndustryPackBundle[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY_BUNDLES);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export function saveBundle(bundle: IndustryPackBundle): void {
    const saved = getSavedBundles();
    const idx = saved.findIndex(b => b.id === bundle.id);
    if (idx >= 0) {
        saved[idx] = bundle;
    } else {
        saved.push(bundle);
    }
    localStorage.setItem(STORAGE_KEY_BUNDLES, JSON.stringify(saved));
}

export function deleteBundle(id: string): void {
    const saved = getSavedBundles().filter(b => b.id !== id);
    localStorage.setItem(STORAGE_KEY_BUNDLES, JSON.stringify(saved));
}

/**
 * Install a bundle — extracts Training, ICP, and Product packs
 * and saves each one individually so they appear in selectors.
 */
export function installBundle(bundle: IndustryPackBundle): void {
    // Save the bundle record itself
    saveBundle(bundle);
    // Install individual packs (skip if built-in already exists)
    if (!PRODUCT_PACKS.find(p => p.id === bundle.productPack.id)) {
        saveProduct(bundle.productPack);
    }
    if (!ICP_PACKS.find(p => p.id === bundle.icpPack.id)) {
        saveICP(bundle.icpPack);
    }
    if (!TRAINING_PACKS.find(p => p.id === bundle.trainingPack.id)) {
        saveTrainingPack(bundle.trainingPack);
    }
}

/**
 * Uninstall a bundle — removes all installed packs from the bundle.
 * Only removes packs that are NOT built-in.
 */
export function uninstallBundle(bundleId: string): void {
    const bundle = getSavedBundles().find(b => b.id === bundleId);
    if (!bundle) return;

    // Only delete packs that aren't built-in
    if (!PRODUCT_PACKS.find(p => p.id === bundle.productPack.id)) {
        deleteProduct(bundle.productPack.id);
    }
    if (!ICP_PACKS.find(p => p.id === bundle.icpPack.id)) {
        deleteICP(bundle.icpPack.id);
    }
    if (!TRAINING_PACKS.find(p => p.id === bundle.trainingPack.id)) {
        deleteTrainingPack(bundle.trainingPack.id);
    }

    deleteBundle(bundleId);
}

// ── Bundle Import / Export ────────────────────────────────────────

/**
 * Export a bundle as a downloadable JSON file
 */
export function exportBundleAsJSON(bundle: IndustryPackBundle): void {
    const json = JSON.stringify(bundle, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `salessim-pack-${bundle.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Import a bundle from a JSON file.
 * Returns the parsed bundle (caller decides whether to installBundle).
 */
export function parseBundleFromJSON(jsonString: string): IndustryPackBundle | null {
    try {
        const parsed = JSON.parse(jsonString);
        // Basic validation
        if (
            !parsed.id ||
            !parsed.version ||
            !parsed.meta?.name ||
            !parsed.trainingPack?.id ||
            !parsed.icpPack?.id ||
            !parsed.productPack?.id
        ) {
            console.error('Invalid bundle format — missing required fields');
            return null;
        }
        return parsed as IndustryPackBundle;
    } catch (e) {
        console.error('Failed to parse bundle JSON:', e);
        return null;
    }
}

/**
 * Build a bundle from existing packs (for export).
 * Convenience for creating a bundle from packs already in the system.
 */
export function createBundle(
    meta: IndustryPackBundle['meta'],
    trainingPack: TrainingPack,
    icpPack: ICPPack,
    productPack: ProductPack,
): IndustryPackBundle {
    return {
        id: `bundle-${meta.industry.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        version: '1.0',
        meta: {
            ...meta,
            createdAt: new Date().toISOString(),
        },
        trainingPack,
        icpPack,
        productPack,
    };
}

// ── Utility: check if a pack is user-created ─────────────────────

export function isCustomProduct(id: string): boolean {
    return !PRODUCT_PACKS.find(p => p.id === id);
}

export function isCustomICP(id: string): boolean {
    return !ICP_PACKS.find(p => p.id === id);
}

export function isCustomTrainingPack(id: string): boolean {
    return !TRAINING_PACKS.find(p => p.id === id);
}
