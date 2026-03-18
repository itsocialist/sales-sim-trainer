/**
 * PackLibrary — Manage Products, ICPs, and Training Packs
 * 
 * A top-level management screen where users:
 * - View all available products (built-in + custom)
 * - Create/upload custom products
 * - View all ICP profiles (built-in + custom)
 * - Create custom ICPs
 * - Browse training pack configurations
 * 
 * This is the "library" layer — separate from the scenario config flow.
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { type ProductPack, PRODUCT_PACKS } from '@/lib/packs/productPacks';
import { type ICPPack, ICP_PACKS } from '@/lib/packs/icpPacks';
import { TRAINING_PACKS } from '@/lib/packs/trainingPacks';
import {
    getSavedProducts, saveProduct, deleteProduct,
    getSavedICPs, saveICP, deleteICP,
    getAllTrainingPacks, getSavedTrainingPacks,
    getSavedBundles, installBundle, uninstallBundle,
    exportBundleAsJSON, parseBundleFromJSON,
    type IndustryPackBundle,
} from '@/lib/packs/packStore';
import ProductSetup from './ProductSetup';
import ICPBuilder from './ICPBuilder';

type Tab = 'products' | 'icps' | 'training' | 'bundles';

interface PackLibraryProps {
    onClose: () => void;
}

export default function PackLibrary({ onClose }: PackLibraryProps) {
    const [activeTab, setActiveTab] = useState<Tab>('products');
    const [customProducts, setCustomProducts] = useState<ProductPack[]>([]);
    const [customICPs, setCustomICPs] = useState<ICPPack[]>([]);
    const [showProductCreator, setShowProductCreator] = useState(false);
    const [showICPCreator, setShowICPCreator] = useState(false);
    const [expandedPack, setExpandedPack] = useState<string | null>(null);
    const [bundles, setBundles] = useState<IndustryPackBundle[]>([]);
    const bundleInputRef = useRef<HTMLInputElement>(null);

    // Load saved packs from localStorage
    useEffect(() => {
        setCustomProducts(getSavedProducts());
        setCustomICPs(getSavedICPs());
        setBundles(getSavedBundles());
    }, []);

    const handleSaveProduct = useCallback((pack: ProductPack) => {
        // Ensure it has a custom ID
        const toSave = {
            ...pack,
            id: pack.id.startsWith('prod-custom-') || pack.id.startsWith('prod-uploaded-')
                ? pack.id
                : `prod-custom-${Date.now()}`,
        };
        saveProduct(toSave);
        setCustomProducts(getSavedProducts());
        setShowProductCreator(false);
    }, []);

    const handleDeleteProduct = useCallback((id: string) => {
        if (confirm('Delete this custom product?')) {
            deleteProduct(id);
            setCustomProducts(getSavedProducts());
        }
    }, []);

    const handleSaveICP = useCallback((icp: ICPPack) => {
        const toSave = {
            ...icp,
            id: icp.id.startsWith('icp-custom-') ? icp.id : `icp-custom-${Date.now()}`,
        };
        saveICP(toSave);
        setCustomICPs(getSavedICPs());
        setShowICPCreator(false);
    }, []);

    const handleDeleteICP = useCallback((id: string) => {
        if (confirm('Delete this custom ICP?')) {
            deleteICP(id);
            setCustomICPs(getSavedICPs());
        }
    }, []);

    const tabs: { id: Tab; label: string; icon: string; count: number }[] = [
        { id: 'products', label: 'Products', icon: '📦', count: PRODUCT_PACKS.length + customProducts.length },
        { id: 'icps', label: 'Buyer Profiles', icon: '🎯', count: ICP_PACKS.length + customICPs.length },
        { id: 'training', label: 'Training Roles', icon: '🎓', count: getAllTrainingPacks().length },
        { id: 'bundles' as Tab, label: 'Industry Bundles', icon: '📦', count: bundles.length },
    ];

    return (
        <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
            {/* Header */}
            <div
                className="border-b px-8 py-4 flex justify-between items-center"
                style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}
            >
                <div>
                    <span className="label-accent">SALESSIM</span>
                    <h1 className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                        Pack Library
                    </h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                        Manage your products, buyer profiles, and training configurations
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="btn-secondary px-6 py-2 text-sm font-semibold"
                >
                    ← Back to Simulation
                </button>
            </div>

            {/* Tab Bar */}
            <div className="px-8 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <div className="flex gap-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id); setShowProductCreator(false); setShowICPCreator(false); }}
                            className="px-5 py-3 text-sm transition-all flex items-center gap-2"
                            style={{
                                color: activeTab === tab.id ? 'var(--accent-primary)' : 'var(--text-muted)',
                                borderBottom: `2px solid ${activeTab === tab.id ? 'var(--accent-primary)' : 'transparent'}`,
                                marginBottom: '-1px',
                            }}
                        >
                            <span>{tab.icon}</span>
                            <span>{tab.label}</span>
                            <span
                                className="text-xs px-1.5 py-0.5"
                                style={{
                                    background: activeTab === tab.id
                                        ? 'rgba(63,212,151,0.15)'
                                        : 'rgba(255,255,255,0.05)',
                                    color: activeTab === tab.id ? 'var(--accent-primary)' : 'var(--text-muted)',
                                }}
                            >
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="px-8 py-6 max-w-6xl mx-auto">
                {/* ── PRODUCTS TAB ── */}
                {activeTab === 'products' && (
                    <div>
                        {!showProductCreator ? (
                            <>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-sm uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                                        Available Products
                                    </h2>
                                    <button
                                        onClick={() => setShowProductCreator(true)}
                                        className="btn-primary px-4 py-2 text-xs font-semibold"
                                    >
                                        + Add Product
                                    </button>
                                </div>

                                {/* Built-in */}
                                <div className="mb-6">
                                    <div className="text-xs uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
                                        Built-in ({PRODUCT_PACKS.length})
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        {PRODUCT_PACKS.map(pack => (
                                            <ProductCard
                                                key={pack.id}
                                                pack={pack}
                                                isCustom={false}
                                                expanded={expandedPack === pack.id}
                                                onToggle={() => setExpandedPack(expandedPack === pack.id ? null : pack.id)}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Custom */}
                                {customProducts.length > 0 && (
                                    <div>
                                        <div className="text-xs uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
                                            Your Custom Products ({customProducts.length})
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            {customProducts.map(pack => (
                                                <ProductCard
                                                    key={pack.id}
                                                    pack={pack}
                                                    isCustom={true}
                                                    expanded={expandedPack === pack.id}
                                                    onToggle={() => setExpandedPack(expandedPack === pack.id ? null : pack.id)}
                                                    onDelete={() => handleDeleteProduct(pack.id)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div>
                                <button
                                    onClick={() => setShowProductCreator(false)}
                                    className="text-sm mb-4 transition-all"
                                    style={{ color: 'var(--accent-primary)' }}
                                >
                                    ← Back to products
                                </button>
                                <ProductSetup
                                    onSelectProduct={handleSaveProduct}
                                    selectedProduct={null}
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* ── ICPs TAB ── */}
                {activeTab === 'icps' && (
                    <div>
                        {!showICPCreator ? (
                            <>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-sm uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                                        Available Buyer Profiles
                                    </h2>
                                    <button
                                        onClick={() => setShowICPCreator(true)}
                                        className="btn-primary px-4 py-2 text-xs font-semibold"
                                    >
                                        + Build Custom ICP
                                    </button>
                                </div>

                                {/* Built-in */}
                                <div className="mb-6">
                                    <div className="text-xs uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
                                        Built-in ({ICP_PACKS.length})
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        {ICP_PACKS.map(icp => (
                                            <ICPCard
                                                key={icp.id}
                                                icp={icp}
                                                isCustom={false}
                                                expanded={expandedPack === icp.id}
                                                onToggle={() => setExpandedPack(expandedPack === icp.id ? null : icp.id)}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Custom */}
                                {customICPs.length > 0 && (
                                    <div>
                                        <div className="text-xs uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
                                            Your Custom ICPs ({customICPs.length})
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            {customICPs.map(icp => (
                                                <ICPCard
                                                    key={icp.id}
                                                    icp={icp}
                                                    isCustom={true}
                                                    expanded={expandedPack === icp.id}
                                                    onToggle={() => setExpandedPack(expandedPack === icp.id ? null : icp.id)}
                                                    onDelete={() => handleDeleteICP(icp.id)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div>
                                <button
                                    onClick={() => setShowICPCreator(false)}
                                    className="text-sm mb-4 transition-all"
                                    style={{ color: 'var(--accent-primary)' }}
                                >
                                    ← Back to buyer profiles
                                </button>
                                <ICPBuilder
                                    onSelectICP={handleSaveICP}
                                    selectedICP={null}
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* ── TRAINING PACKS TAB ── */}
                {activeTab === 'training' && (
                    <div>
                        <div className="mb-6">
                            <h2 className="text-sm uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                                Training Roles & Scenarios
                            </h2>
                            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                                Each role includes stakeholder archetypes and deal scenarios
                            </p>
                        </div>

                        <div className="space-y-6">
                            {getAllTrainingPacks().map(pack => (
                                <div
                                    key={pack.id}
                                    className="p-5"
                                    style={{
                                        background: 'var(--bg-secondary)',
                                        border: '1px solid var(--border-color)',
                                    }}
                                >
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="text-3xl">{pack.icon}</div>
                                        <div className="flex-1">
                                            <div className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
                                                {pack.name}
                                            </div>
                                            <div className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                                                {pack.description}
                                            </div>
                                            <div className="text-xs mt-1" style={{ color: 'var(--accent-primary)' }}>
                                                Role: {pack.targetRole}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        {/* Stakeholder Archetypes */}
                                        <div>
                                            <div className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                                                Stakeholder Types ({pack.subjectPacks.length})
                                            </div>
                                            <div className="space-y-2">
                                                {pack.subjectPacks.map(sp => (
                                                    <div
                                                        key={sp.id}
                                                        className="p-3 text-sm"
                                                        style={{
                                                            background: 'var(--bg-primary)',
                                                            border: '1px solid var(--border-color)',
                                                        }}
                                                    >
                                                        <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                                                            {sp.name}
                                                        </div>
                                                        <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                                                            {sp.condition}
                                                        </div>
                                                        <span
                                                            className="text-xs px-2 py-0.5 mt-1 inline-block"
                                                            style={{
                                                                background: sp.conditionLevel === 'severe'
                                                                    ? 'rgba(239,68,68,0.15)' : sp.conditionLevel === 'moderate'
                                                                    ? 'rgba(245,158,11,0.15)' : 'rgba(63,212,151,0.15)',
                                                                color: sp.conditionLevel === 'severe'
                                                                    ? '#ef4444' : sp.conditionLevel === 'moderate'
                                                                    ? '#f59e0b' : 'var(--accent-primary)',
                                                            }}
                                                        >
                                                            {sp.conditionLevel === 'severe' ? 'ENTERPRISE' : sp.conditionLevel === 'moderate' ? 'MID-MARKET' : 'SMB'}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Scenarios */}
                                        <div>
                                            <div className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                                                Deal Scenarios ({pack.scenarioPacks.length})
                                            </div>
                                            <div className="space-y-2">
                                                {pack.scenarioPacks.map(sc => (
                                                    <div
                                                        key={sc.id}
                                                        className="p-3 text-sm"
                                                        style={{
                                                            background: 'var(--bg-primary)',
                                                            border: '1px solid var(--border-color)',
                                                        }}
                                                    >
                                                        <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                                                            {sc.name}
                                                        </div>
                                                        <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                                                            {sc.description}
                                                        </div>
                                                        <div className="flex gap-3 mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                                                            <span>Warmth: {sc.initialDistance}/10</span>
                                                            <span>Engagement: {sc.initialTemperature}/10</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── BUNDLES TAB ── */}
                {activeTab === 'bundles' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-sm uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                                    Industry Pack Bundles
                                </h2>
                                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                                    Import a JSON bundle to install Training + ICP + Product packs for any industry
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    ref={bundleInputRef}
                                    type="file"
                                    accept=".json"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        const reader = new FileReader();
                                        reader.onload = (ev) => {
                                            const text = ev.target?.result as string;
                                            const bundle = parseBundleFromJSON(text);
                                            if (bundle) {
                                                installBundle(bundle);
                                                setBundles(getSavedBundles());
                                                setCustomProducts(getSavedProducts());
                                                setCustomICPs(getSavedICPs());
                                                alert(`✅ Installed "${bundle.meta.name}" bundle`);
                                            } else {
                                                alert('❌ Invalid bundle file. Please check the JSON format.');
                                            }
                                        };
                                        reader.readAsText(file);
                                        e.target.value = '';
                                    }}
                                />
                                <button
                                    onClick={() => bundleInputRef.current?.click()}
                                    className="btn-primary px-4 py-2 text-xs font-semibold"
                                >
                                    📥 Import Bundle
                                </button>
                            </div>
                        </div>

                        {bundles.length === 0 ? (
                            <div
                                className="p-8 text-center"
                                style={{
                                    background: 'var(--bg-secondary)',
                                    border: '2px dashed var(--border-color)',
                                }}
                            >
                                <div className="text-3xl mb-3">📦</div>
                                <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                    No custom bundles installed
                                </div>
                                <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                                    Import a <code>.json</code> bundle file to add a complete industry pack
                                    (Training roles + Buyer profile + Product/service)
                                </div>
                                <div className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
                                    Built-in packs (Tech Sales, CRE) are always available — bundles add new industries
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {bundles.map(bundle => (
                                    <div
                                        key={bundle.id}
                                        className="p-5"
                                        style={{
                                            background: 'var(--bg-secondary)',
                                            border: '1px solid var(--border-color)',
                                        }}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-2xl">{bundle.meta.icon}</span>
                                                    <div>
                                                        <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                                                            {bundle.meta.name}
                                                        </div>
                                                        <div className="text-xs" style={{ color: 'var(--accent-primary)' }}>
                                                            {bundle.meta.industry}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                                                    {bundle.meta.description}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => exportBundleAsJSON(bundle)}
                                                    className="text-xs px-3 py-1"
                                                    style={{
                                                        border: '1px solid var(--border-color)',
                                                        color: 'var(--text-secondary)',
                                                    }}
                                                >
                                                    📤 Export
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (confirm(`Remove "${bundle.meta.name}" bundle and its packs?`)) {
                                                            uninstallBundle(bundle.id);
                                                            setBundles(getSavedBundles());
                                                            setCustomProducts(getSavedProducts());
                                                            setCustomICPs(getSavedICPs());
                                                        }
                                                    }}
                                                    className="text-xs px-3 py-1"
                                                    style={{
                                                        border: '1px solid rgba(239,68,68,0.3)',
                                                        color: '#ef4444',
                                                        background: 'rgba(239,68,68,0.05)',
                                                    }}
                                                >
                                                    Uninstall
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-3 mt-3">
                                            <div className="p-3" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                                                <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Training</div>
                                                <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                                    {bundle.trainingPack.icon} {bundle.trainingPack.name}
                                                </div>
                                                <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                                                    {bundle.trainingPack.subjectPacks.length} stakeholders · {bundle.trainingPack.scenarioPacks.length} scenarios
                                                </div>
                                            </div>
                                            <div className="p-3" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                                                <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Buyer Profile</div>
                                                <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                                    {bundle.icpPack.icon} {bundle.icpPack.name}
                                                </div>
                                                <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                                                    {bundle.icpPack.vertical.name}
                                                </div>
                                            </div>
                                            <div className="p-3" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                                                <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Product/Service</div>
                                                <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                                    {bundle.productPack.icon} {bundle.productPack.name}
                                                </div>
                                                <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                                                    {bundle.productPack.company}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 mt-3">
                                            {bundle.meta.tags?.map(tag => (
                                                <span key={tag} className="text-xs px-2 py-0.5" style={{
                                                    background: 'rgba(63,212,151,0.1)',
                                                    color: 'var(--accent-primary)',
                                                }}>
                                                    {tag}
                                                </span>
                                            ))}
                                            {bundle.meta.locale && (
                                                <span className="text-xs px-2 py-0.5" style={{
                                                    background: 'rgba(96,165,250,0.15)',
                                                    color: '#60a5fa',
                                                }}>
                                                    🌐 {bundle.meta.locale}
                                                </span>
                                            )}
                                            <span className="text-xs px-2 py-0.5" style={{
                                                background: 'rgba(255,255,255,0.05)',
                                                color: 'var(--text-muted)',
                                            }}>
                                                v{bundle.version}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}


// ── Sub-Components ────────────────────────────────────────────────

function ProductCard({
    pack,
    isCustom,
    expanded,
    onToggle,
    onDelete,
}: {
    pack: ProductPack;
    isCustom: boolean;
    expanded: boolean;
    onToggle: () => void;
    onDelete?: () => void;
}) {
    return (
        <div
            className="p-4 transition-all cursor-pointer"
            style={{
                background: expanded ? 'var(--bg-card)' : 'var(--bg-secondary)',
                border: `1px solid ${expanded ? 'var(--accent-primary)' : 'var(--border-color)'}`,
            }}
            onClick={onToggle}
        >
            <div className="flex justify-between items-start">
                <div>
                    <div className="text-xl mb-1">{pack.icon}</div>
                    <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                        {pack.name}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--accent-primary)' }}>{pack.company}</div>
                </div>
                <div className="flex items-center gap-2">
                    {isCustom && (
                        <span className="text-xs px-2 py-0.5" style={{
                            background: 'rgba(96, 165, 250, 0.15)',
                            color: '#60a5fa',
                        }}>
                            CUSTOM
                        </span>
                    )}
                </div>
            </div>
            <div className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>{pack.tagline}</div>

            {expanded && (
                <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {pack.description}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1">
                        {pack.features?.slice(0, 5).map(f => (
                            <span key={f.name} className="text-xs px-2 py-0.5" style={{
                                background: 'rgba(63,212,151,0.1)',
                                color: 'var(--accent-primary)',
                            }}>
                                {f.differentiator ? '⭐ ' : ''}{f.name}
                            </span>
                        ))}
                    </div>
                    {pack.competitors?.length > 0 && (
                        <div className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                            Competitors: {pack.competitors.map(c => c.name).join(', ')}
                        </div>
                    )}
                    {isCustom && onDelete && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(); }}
                            className="mt-3 text-xs px-3 py-1 transition-all"
                            style={{
                                color: '#ef4444',
                                border: '1px solid rgba(239,68,68,0.3)',
                                background: 'rgba(239,68,68,0.05)',
                            }}
                        >
                            Delete
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}


function ICPCard({
    icp,
    isCustom,
    expanded,
    onToggle,
    onDelete,
}: {
    icp: ICPPack;
    isCustom: boolean;
    expanded: boolean;
    onToggle: () => void;
    onDelete?: () => void;
}) {
    return (
        <div
            className="p-4 transition-all cursor-pointer"
            style={{
                background: expanded ? 'var(--bg-card)' : 'var(--bg-secondary)',
                border: `1px solid ${expanded ? 'var(--accent-primary)' : 'var(--border-color)'}`,
            }}
            onClick={onToggle}
        >
            <div className="flex justify-between items-start">
                <div>
                    <div className="text-xl mb-1">{icp.icon}</div>
                    <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                        {icp.name}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{icp.companySize}</div>
                </div>
                {isCustom && (
                    <span className="text-xs px-2 py-0.5" style={{
                        background: 'rgba(96, 165, 250, 0.15)',
                        color: '#60a5fa',
                    }}>
                        CUSTOM
                    </span>
                )}
            </div>
            <div className="flex gap-3 mt-2">
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{icp.vertical.name}</span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>·</span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{icp.avgDealSize}</span>
            </div>

            {expanded && (
                <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {icp.description}
                    </div>
                    <div className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                        Cycle: {icp.salesCycleLength}
                    </div>
                    {icp.vertical.painPoints?.length > 0 && (
                        <div className="mt-2">
                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Pain Points: </span>
                            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                {icp.vertical.painPoints.slice(0, 3).join(' · ')}
                            </span>
                        </div>
                    )}
                    {isCustom && onDelete && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(); }}
                            className="mt-3 text-xs px-3 py-1 transition-all"
                            style={{
                                color: '#ef4444',
                                border: '1px solid rgba(239,68,68,0.3)',
                                background: 'rgba(239,68,68,0.05)',
                            }}
                        >
                            Delete
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
