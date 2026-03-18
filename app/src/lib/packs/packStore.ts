/**
 * Pack Store — localStorage persistence for Products, ICPs, and saved Training Configs
 * 
 * Persists custom-created and built-in packs so they survive page reloads.
 * Uses localStorage with a versioned schema.
 */

import { type ProductPack, PRODUCT_PACKS } from './productPacks';
import { type ICPPack, ICP_PACKS } from './icpPacks';
import { TRAINING_PACKS, type TrainingPack } from './trainingPacks';

const STORAGE_KEY_PRODUCTS = 'salessim_products_v1';
const STORAGE_KEY_ICPS = 'salessim_icps_v1';

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

// ── Training Pack Access ─────────────────────────────────────────

/** Returns all built-in training packs */
export function getAllTrainingPacks(): TrainingPack[] {
    return TRAINING_PACKS;
}

// ── Utility: check if a pack is user-created ─────────────────────

export function isCustomProduct(id: string): boolean {
    return id.startsWith('prod-custom-') || id.startsWith('prod-uploaded-');
}

export function isCustomICP(id: string): boolean {
    return id.startsWith('icp-custom-');
}
