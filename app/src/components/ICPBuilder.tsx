'use client';

import { useState } from 'react';
import { type ICPPack, ICP_PACKS } from '@/lib/packs/icpPacks';

const INDUSTRY_PRESETS = [
    { name: 'B2B SaaS / Technology', icon: '💻', painPoints: ['Long sales cycles', 'Infrastructure costs', 'Talent retention'], jargon: ['ARR', 'CAC', 'LTV', 'churn', 'NRR'] },
    { name: 'Financial Services', icon: '🏦', painPoints: ['Regulatory compliance', 'Legacy systems', 'Risk management'], jargon: ['AUM', 'KYC', 'AML', 'fiduciary', 'basis points'] },
    { name: 'Healthcare & Life Sciences', icon: '🏥', painPoints: ['HIPAA compliance', 'EHR integration', 'Patient outcomes'], jargon: ['PHI', 'HIPAA', 'HL7', 'FHIR', 'formulary'] },
    { name: 'Manufacturing', icon: '🏭', painPoints: ['Supply chain disruption', 'Quality control', 'Workforce safety'], jargon: ['OEE', 'MES', 'ERP', 'lean', 'six sigma'] },
    { name: 'Professional Services', icon: '🏗️', painPoints: ['Utilization rates', 'Project overruns', 'Talent pipeline'], jargon: ['utilization', 'billable hours', 'SOW', 'T&M', 'bench'] },
    { name: 'Retail / E-Commerce', icon: '🛒', painPoints: ['Cart abandonment', 'Inventory management', 'Customer acquisition cost'], jargon: ['AOV', 'ROAS', 'SKU', 'omnichannel', 'fulfillment'] },
    { name: 'Media & Entertainment', icon: '🎬', painPoints: ['Content monetization', 'Subscriber growth', 'Ad-tech complexity'], jargon: ['CPM', 'AVOD', 'SVOD', 'DAU', 'engagement'] },
    { name: 'Education / EdTech', icon: '📚', painPoints: ['Budget constraints', 'Adoption rates', 'Accessibility'], jargon: ['LMS', 'SCORM', 'enrollment', 'K-12', 'adjunct'] },
];

const COMPANY_SIZE_OPTIONS = ['1-50 employees', '50-200 employees', '200-500 employees', '500-2,000 employees', '2,000-10,000 employees', '10,000+ employees'];
const DEAL_SIZE_OPTIONS = ['$5K-$25K ACV', '$25K-$75K ACV', '$75K-$200K ACV', '$200K-$500K ACV', '$500K-$1M+ ACV'];
const CYCLE_OPTIONS = ['7-21 days', '21-45 days', '45-90 days', '90-180 days', '180+ days'];

interface ICPBuilderProps {
    onSelectICP: (icp: ICPPack) => void;
    selectedICP: ICPPack | null;
}

export default function ICPBuilder({ onSelectICP, selectedICP }: ICPBuilderProps) {
    const [mode, setMode] = useState<'builtin' | 'custom'>('builtin');
    const [companyName, setCompanyName] = useState('');
    const [companySize, setCompanySize] = useState(COMPANY_SIZE_OPTIONS[2]);
    const [selectedIndustry, setSelectedIndustry] = useState<typeof INDUSTRY_PRESETS[0] | null>(null);
    const [avgDealSize, setAvgDealSize] = useState(DEAL_SIZE_OPTIONS[1]);
    const [salesCycle, setSalesCycle] = useState(CYCLE_OPTIONS[1]);
    const [customPainPoints, setCustomPainPoints] = useState('');
    const [customJargon, setCustomJargon] = useState('');

    const handleBuildICP = () => {
        if (!selectedIndustry || !companyName.trim()) return;

        const painPoints = customPainPoints
            ? customPainPoints.split(',').map(p => p.trim()).filter(Boolean)
            : selectedIndustry.painPoints;

        const jargon = customJargon
            ? customJargon.split(',').map(j => j.trim()).filter(Boolean)
            : selectedIndustry.jargon;

        const customICP: ICPPack = {
            id: `icp-custom-${Date.now()}`,
            name: companyName.trim(),
            icon: selectedIndustry.icon,
            description: `Custom ICP: ${companySize} ${selectedIndustry.name} company`,
            companySize: companySize,
            revenueRange: avgDealSize,
            vertical: {
                name: selectedIndustry.name,
                painPoints: painPoints,
                regulations: [],
                jargon: jargon,
                budgetCycle: 'Annual (fiscal year)',
            },
            buyerPersonas: [
                {
                    title: 'Decision Maker',
                    priorities: ['ROI', 'Risk reduction', 'Competitive advantage'],
                    commonObjections: ['Budget constraints', 'Implementation timeline', 'Change management risk'],
                    persuasionTriggers: ['Peer validation', 'Data-driven results', 'Quick time-to-value'],
                    decisionStyle: 'Consensus with executive sponsor',
                },
            ],
            salesCycleLength: salesCycle,
            avgDealSize: avgDealSize,
            buyingTriggers: ['Audit/compliance deadline', 'New leadership', 'Competitive pressure', 'Budget cycle timing'],
            dealBlockers: ['Procurement process', 'Legal review', 'Competing priorities', 'Budget freeze'],
            aiContext: `The buyer works at ${companyName}, a ${companySize} company in ${selectedIndustry.name}. They deal with challenges like ${painPoints.slice(0, 3).join(', ')}. Use industry jargon like ${jargon.slice(0, 3).join(', ')}. Average deal sizes are ${avgDealSize}, and sales cycles typically run ${salesCycle}. Be realistic about objections related to their specific industry challenges.`,
        };

        onSelectICP(customICP);
    };

    return (
        <div>
            {/* Mode Toggle */}
            <div className="flex gap-1 mb-6" style={{ borderBottom: '1px solid var(--border-color)' }}>
                <button
                    onClick={() => setMode('builtin')}
                    className="px-4 py-3 text-sm transition-all"
                    style={{
                        color: mode === 'builtin' ? 'var(--accent-primary)' : 'var(--text-muted)',
                        borderBottom: `2px solid ${mode === 'builtin' ? 'var(--accent-primary)' : 'transparent'}`,
                        marginBottom: '-1px',
                    }}
                >
                    🎯 Built-in ICPs
                </button>
                <button
                    onClick={() => setMode('custom')}
                    className="px-4 py-3 text-sm transition-all"
                    style={{
                        color: mode === 'custom' ? 'var(--accent-primary)' : 'var(--text-muted)',
                        borderBottom: `2px solid ${mode === 'custom' ? 'var(--accent-primary)' : 'transparent'}`,
                        marginBottom: '-1px',
                    }}
                >
                    ✏️ Build Custom ICP
                </button>
            </div>

            {/* Built-in ICPs */}
            {mode === 'builtin' && (
                <div className="grid grid-cols-2 gap-4">
                    {ICP_PACKS.map((pack) => (
                        <button
                            key={pack.id}
                            onClick={() => onSelectICP(pack)}
                            className="p-5 text-left transition-all"
                            style={{
                                background: selectedICP?.id === pack.id ? 'var(--bg-card)' : 'var(--bg-secondary)',
                                border: `1px solid ${selectedICP?.id === pack.id ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                            }}
                        >
                            <div className="text-2xl mb-2">{pack.icon}</div>
                            <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{pack.name}</div>
                            <div className="flex gap-3 mt-1">
                                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{pack.companySize}</span>
                                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>·</span>
                                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{pack.avgDealSize}</span>
                            </div>
                            <div className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>{pack.vertical.name}</div>
                            <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Cycle: {pack.salesCycleLength}</div>
                        </button>
                    ))}
                </div>
            )}

            {/* Custom ICP Builder */}
            {mode === 'custom' && (
                <div className="space-y-5">
                    {/* Company Name */}
                    <div>
                        <label className="text-xs uppercase tracking-wider block mb-2" style={{ color: 'var(--text-muted)' }}>
                            Target Company Name
                        </label>
                        <input
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="e.g., Acme Corp, TechStart Inc."
                            className="w-full px-4 py-3 text-sm"
                            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
                        />
                    </div>

                    {/* Industry Vertical */}
                    <div>
                        <label className="text-xs uppercase tracking-wider block mb-2" style={{ color: 'var(--text-muted)' }}>
                            Industry Vertical
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            {INDUSTRY_PRESETS.map((ind) => (
                                <button
                                    key={ind.name}
                                    onClick={() => setSelectedIndustry(ind)}
                                    className="p-3 text-left text-xs transition-all"
                                    style={{
                                        background: selectedIndustry?.name === ind.name ? 'var(--bg-card)' : 'var(--bg-secondary)',
                                        border: `1px solid ${selectedIndustry?.name === ind.name ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                                    }}
                                >
                                    <div className="text-lg mb-1">{ind.icon}</div>
                                    <div style={{ color: 'var(--text-primary)' }}>{ind.name}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Company Size + Deal Size + Cycle */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="text-xs uppercase tracking-wider block mb-2" style={{ color: 'var(--text-muted)' }}>Company Size</label>
                            <select
                                value={companySize}
                                onChange={(e) => setCompanySize(e.target.value)}
                                className="w-full px-3 py-2 text-sm"
                                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                            >
                                {COMPANY_SIZE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs uppercase tracking-wider block mb-2" style={{ color: 'var(--text-muted)' }}>Avg Deal Size</label>
                            <select
                                value={avgDealSize}
                                onChange={(e) => setAvgDealSize(e.target.value)}
                                className="w-full px-3 py-2 text-sm"
                                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                            >
                                {DEAL_SIZE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs uppercase tracking-wider block mb-2" style={{ color: 'var(--text-muted)' }}>Sales Cycle</label>
                            <select
                                value={salesCycle}
                                onChange={(e) => setSalesCycle(e.target.value)}
                                className="w-full px-3 py-2 text-sm"
                                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                            >
                                {CYCLE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Custom Pain Points & Jargon */}
                    {selectedIndustry && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs uppercase tracking-wider block mb-2" style={{ color: 'var(--text-muted)' }}>
                                    Pain Points <span style={{ color: 'var(--text-muted)' }}>(comma-separated, or leave blank for defaults)</span>
                                </label>
                                <input
                                    type="text"
                                    value={customPainPoints}
                                    onChange={(e) => setCustomPainPoints(e.target.value)}
                                    placeholder={selectedIndustry.painPoints.join(', ')}
                                    className="w-full px-4 py-3 text-sm"
                                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
                                />
                            </div>
                            <div>
                                <label className="text-xs uppercase tracking-wider block mb-2" style={{ color: 'var(--text-muted)' }}>
                                    Industry Jargon <span style={{ color: 'var(--text-muted)' }}>(comma-separated, or leave blank for defaults)</span>
                                </label>
                                <input
                                    type="text"
                                    value={customJargon}
                                    onChange={(e) => setCustomJargon(e.target.value)}
                                    placeholder={selectedIndustry.jargon.join(', ')}
                                    className="w-full px-4 py-3 text-sm"
                                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Build Button */}
                    <button
                        onClick={handleBuildICP}
                        disabled={!selectedIndustry || !companyName.trim()}
                        className="btn-primary w-full py-3 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {selectedIndustry && companyName.trim()
                            ? `Create ${companyName.trim()} ICP Profile →`
                            : 'Select an industry and enter a company name'}
                    </button>
                </div>
            )}
        </div>
    );
}
