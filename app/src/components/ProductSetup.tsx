'use client';

import { useState, useRef } from 'react';
import { PRODUCT_PACKS, type ProductPack } from '@/lib/packs/productPacks';

interface ProductSetupProps {
    onSelectProduct: (pack: ProductPack) => void;
    selectedProduct: ProductPack | null;
}

type Tab = 'builtin' | 'upload' | 'url';

export default function ProductSetup({ onSelectProduct, selectedProduct }: ProductSetupProps) {
    const [activeTab, setActiveTab] = useState<Tab>('builtin');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const [url, setUrl] = useState('');
    const [extractedProduct, setExtractedProduct] = useState<ProductPack | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['.pdf', '.docx', '.txt', '.md'];
        const ext = '.' + file.name.split('.').pop()?.toLowerCase();
        if (!validTypes.includes(ext)) {
            setError('Please upload a PDF, DOCX, or TXT file.');
            return;
        }

        // Validate size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
            setError('File too large. Maximum size is 10MB.');
            return;
        }

        setIsProcessing(true);
        setError('');
        setExtractedProduct(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/product/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            setExtractedProduct(data.productPack);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to process document');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleUrlScrape = async () => {
        if (!url.trim()) return;

        setIsProcessing(true);
        setError('');
        setExtractedProduct(null);

        try {
            const response = await fetch('/api/product/scrape', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: url.trim() }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Scrape failed');
            }

            setExtractedProduct(data.productPack);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to process URL');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div>
            {/* Tabs */}
            <div className="flex gap-1 mb-6" style={{ borderBottom: '1px solid var(--border-color)' }}>
                {([
                    { id: 'builtin' as Tab, label: 'Built-in Products', icon: '📦' },
                    { id: 'upload' as Tab, label: 'Upload Document', icon: '📄' },
                    { id: 'url' as Tab, label: 'From Website', icon: '🌐' },
                ]).map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id); setError(''); setExtractedProduct(null); }}
                        className="px-4 py-3 text-sm transition-all"
                        style={{
                            color: activeTab === tab.id ? 'var(--accent-primary)' : 'var(--text-muted)',
                            borderBottom: `2px solid ${activeTab === tab.id ? 'var(--accent-primary)' : 'transparent'}`,
                            marginBottom: '-1px',
                        }}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* Built-in Products */}
            {activeTab === 'builtin' && (
                <div className="grid grid-cols-3 gap-4">
                    {PRODUCT_PACKS.map((pack) => (
                        <button
                            key={pack.id}
                            onClick={() => onSelectProduct(pack)}
                            className="p-5 text-left transition-all"
                            style={{
                                background: selectedProduct?.id === pack.id ? 'var(--bg-card)' : 'var(--bg-secondary)',
                                border: `1px solid ${selectedProduct?.id === pack.id ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                            }}
                        >
                            <div className="text-2xl mb-2">{pack.icon}</div>
                            <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{pack.name}</div>
                            <div className="text-xs mt-1" style={{ color: 'var(--accent-primary)' }}>{pack.company}</div>
                            <div className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>{pack.tagline}</div>
                            <div className="mt-3 flex gap-1 flex-wrap">
                                {pack.features.slice(0, 3).map(f => (
                                    <span
                                        key={f.name}
                                        className="text-xs px-2 py-0.5"
                                        style={{ background: 'rgba(63,212,151,0.1)', color: 'var(--accent-primary)' }}
                                    >
                                        {f.name}
                                    </span>
                                ))}
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Upload Document */}
            {activeTab === 'upload' && (
                <div>
                    <div
                        className="p-10 text-center cursor-pointer transition-all"
                        style={{
                            background: 'var(--bg-secondary)',
                            border: '2px dashed var(--border-color)',
                        }}
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const file = e.dataTransfer.files[0];
                            if (file && fileInputRef.current) {
                                const dt = new DataTransfer();
                                dt.items.add(file);
                                fileInputRef.current.files = dt.files;
                                fileInputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
                            }
                        }}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.docx,.txt,.md"
                            className="hidden"
                            onChange={handleFileUpload}
                        />
                        <div className="text-4xl mb-3">📄</div>
                        <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {isProcessing ? 'Analyzing document...' : 'Drop your product document here'}
                        </div>
                        <div className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
                            PDF, DOCX, or TXT — pitch decks, one-pagers, product briefs
                        </div>
                        <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                            Max 10MB
                        </div>
                    </div>

                    {isProcessing && (
                        <div className="mt-4 p-4" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                            <div className="flex items-center gap-3">
                                <div className="animate-spin" style={{ color: 'var(--accent-primary)' }}>⟳</div>
                                <div>
                                    <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                        Extracting product information...
                                    </div>
                                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                        Analyzing value props, features, pricing, and competitive positioning
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* From URL */}
            {activeTab === 'url' && (
                <div>
                    <div className="flex gap-3">
                        <input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://your-product.com/features"
                            className="flex-1 px-4 py-3 text-sm"
                            style={{
                                background: 'var(--bg-secondary)',
                                border: '1px solid var(--border-color)',
                                color: 'var(--text-primary)',
                                outline: 'none',
                            }}
                            onKeyDown={(e) => e.key === 'Enter' && handleUrlScrape()}
                        />
                        <button
                            onClick={handleUrlScrape}
                            disabled={!url.trim() || isProcessing}
                            className="btn-primary px-6 py-3 text-sm font-semibold disabled:opacity-50"
                        >
                            {isProcessing ? 'Scraping...' : 'Analyze'}
                        </button>
                    </div>
                    <div className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                        Best results: product page, features page, or landing page. Pricing pages work great too.
                    </div>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="mt-4 p-3 text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>
                    {error}
                </div>
            )}

            {/* Extracted Product Preview */}
            {extractedProduct && (
                <div className="mt-6 p-5" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <span className="label-accent">EXTRACTED PRODUCT</span>
                            <h3 className="text-lg font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                                {extractedProduct.icon} {extractedProduct.name}
                            </h3>
                            <div className="text-sm" style={{ color: 'var(--accent-primary)' }}>{extractedProduct.company}</div>
                            <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{extractedProduct.tagline}</div>
                        </div>
                        <button
                            onClick={() => onSelectProduct(extractedProduct)}
                            className="btn-primary px-4 py-2 text-sm font-semibold"
                        >
                            Use This Product →
                        </button>
                    </div>

                    <div className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                        {extractedProduct.description}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <div className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Value Props</div>
                            <ul className="space-y-1">
                                {extractedProduct.valueProps?.slice(0, 5).map((vp: string, i: number) => (
                                    <li key={i} style={{ color: 'var(--text-primary)' }}>
                                        <span style={{ color: 'var(--accent-primary)' }}>✓</span> {vp}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <div className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Features</div>
                            <ul className="space-y-1">
                                {extractedProduct.features?.slice(0, 5).map((f: { name: string; differentiator: boolean }, i: number) => (
                                    <li key={i} style={{ color: 'var(--text-primary)' }}>
                                        {f.differentiator ? '⭐' : '•'} {f.name}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {extractedProduct.pricing && extractedProduct.pricing.length > 0 && (
                        <div className="mt-4">
                            <div className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Pricing</div>
                            <div className="flex gap-3">
                                {extractedProduct.pricing.map((tier: { name: string; price: string; unit: string }, i: number) => (
                                    <span key={i} className="text-xs px-3 py-1" style={{ background: 'rgba(63,212,151,0.1)', color: 'var(--text-primary)' }}>
                                        {tier.name}: {tier.price}/{tier.unit}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
