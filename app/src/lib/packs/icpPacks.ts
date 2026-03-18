/**
 * ICP (Ideal Customer Profile) Pack System for SalesSim
 * 
 * Defines the buyer profile that the AI stakeholder represents.
 * Each ICP pack includes industry vertical, company attributes,
 * buying patterns, and pain points that shape how the AI responds.
 * 
 * Selection flow: Product Pack × ICP Pack × Training Pack × Scenario
 */

export interface BuyerPersona {
    title: string;
    /** What this person cares about */
    priorities: string[];
    /** Typical objections from this persona */
    commonObjections: string[];
    /** What wins them over */
    persuasionTriggers: string[];
    /** How they make decisions */
    decisionStyle: string;
}

export interface VerticalProfile {
    name: string;
    /** Industry-specific pain points */
    painPoints: string[];
    /** Regulatory / compliance factors */
    regulations: string[];
    /** Industry-specific terminology to use */
    jargon: string[];
    /** Typical budget cycle */
    budgetCycle: string;
}

export interface ICPPack {
    id: string;
    name: string;
    icon: string;
    description: string;
    /** Company size range */
    companySize: string;
    /** Annual revenue range */
    revenueRange: string;
    /** Primary industry vertical */
    vertical: VerticalProfile;
    /** Buying committee personas */
    buyerPersonas: BuyerPersona[];
    /** Typical sales cycle length */
    salesCycleLength: string;
    /** Average deal size */
    avgDealSize: string;
    /** Key buying triggers */
    buyingTriggers: string[];
    /** Common deal blockers */
    dealBlockers: string[];
    /** AI behavior context — shapes how the AI prospect acts */
    aiContext: string;
}


// ============================================
// BUILT-IN ICP PACKS
// ============================================

export const ICP_PACKS: ICPPack[] = [
    {
        id: 'icp-enterprise-saas',
        name: 'Enterprise SaaS',
        icon: '🏢',
        description: 'Large B2B SaaS companies with 500+ employees and $50M+ ARR. Complex buying committees, long cycles, heavy on security and integration requirements.',
        companySize: '500-5,000 employees',
        revenueRange: '$50M - $500M ARR',
        vertical: {
            name: 'B2B SaaS / Technology',
            painPoints: [
                'Scaling sales team without proportional revenue growth',
                'Tool sprawl — too many point solutions with poor integration',
                'Data silos between sales, marketing, and CS',
                'Forecast accuracy declining as team grows',
                'Customer churn increasing despite product improvements',
            ],
            regulations: ['SOC 2 Type II', 'GDPR', 'CCPA'],
            jargon: ['ARR', 'NRR', 'CAC payback', 'magic number', 'Rule of 40', 'product-led growth', 'PLG'],
            budgetCycle: 'Annual planning in Q4, mid-year budget reviews. Departmental budgets with VP+ approval for $50K+.',
        },
        buyerPersonas: [
            {
                title: 'VP of Sales',
                priorities: ['Hitting revenue targets', 'Rep productivity', 'Forecast accuracy'],
                commonObjections: ['My team won\'t adopt another tool', 'Show me ROI in 90 days'],
                persuasionTriggers: ['Peer company success stories', 'Quick time-to-value', 'Rep adoption metrics'],
                decisionStyle: 'Data-driven but fast. Wants proof then decides within 2 meetings.',
            },
            {
                title: 'CRO / Chief Revenue Officer',
                priorities: ['Board-level revenue metrics', 'GTM efficiency', 'Scaling profitably'],
                commonObjections: ['How does this affect our unit economics?', 'We\'re evaluating 3 vendors'],
                persuasionTriggers: ['Board-ready metrics', 'Efficiency gains', 'Competitive advantage'],
                decisionStyle: 'Strategic thinker. Needs to see alignment with company-level OKRs.',
            },
            {
                title: 'RevOps Manager',
                priorities: ['System integrations', 'Data quality', 'Process automation'],
                commonObjections: ['Does it integrate with our stack?', 'Migration risk is too high'],
                persuasionTriggers: ['API documentation', 'Implementation timeline', 'Data mapping'],
                decisionStyle: 'Technical evaluator. Will test the product extensively before recommending.',
            },
        ],
        salesCycleLength: '45-90 days',
        avgDealSize: '$80K-$200K ACV',
        buyingTriggers: [
            'New CRO hired (first 90 days)',
            'Missed forecast 2+ quarters in a row',
            'Planning to scale sales team 50%+',
            'Board pressure on GTM efficiency',
            'Competitor adopted a similar solution',
        ],
        dealBlockers: [
            'Legal/security review taking too long',
            'Champion leaves the company',
            'Budget freeze or reallocation',
            'Internal project competing for same resources',
            'Integration complexity with existing tech stack',
        ],
        aiContext: `This prospect is from a mid-to-large B2B SaaS company. They are sophisticated buyers who understand technology, have seen many vendor pitches, and are wary of "yet another tool." They care deeply about integration with their existing stack (Salesforce, HubSpot, Outreach, Gong, etc.). They will ask about API capabilities, data security, and implementation timeline. They respond well to peer references from similar companies and quantified ROI. The buying committee typically includes VP Sales, CRO, and RevOps. Budget discussions center on ACV and ROI payback period.`,
    },
    {
        id: 'icp-mid-market-services',
        name: 'Mid-Market Professional Services',
        icon: '🏗️',
        description: 'Professional services firms (consulting, accounting, legal tech) with 50-500 employees. Often founder-led, fast decisions, price-sensitive but value-driven.',
        companySize: '50-500 employees',
        revenueRange: '$10M - $100M',
        vertical: {
            name: 'Professional Services',
            painPoints: [
                'Utilization tracking and project profitability visibility',
                'Client retention and expansion — hard to track health signals',
                'Manual proposal generation and SOW management',
                'Talent retention in competitive market',
                'Scaling delivery without sacrificing quality',
            ],
            regulations: ['Varies by sub-vertical — legal: Bar standards, accounting: SEC/PCAOB', 'General: GDPR, state privacy laws'],
            jargon: ['utilization rate', 'billable hours', 'realization rate', 'SOW', 'change order', 'bench time', 'client health score'],
            budgetCycle: 'Often quarterly. Faster decisions. Managing partner or COO can approve $25K-$100K without board.',
        },
        buyerPersonas: [
            {
                title: 'Managing Partner / CEO',
                priorities: ['Firm profitability', 'Client satisfaction', 'Talent retention'],
                commonObjections: ['We\'re a relationship business, not a technology business', 'Our team is resistant to change'],
                persuasionTriggers: ['How similar firms are modernizing', 'Revenue impact stories', 'Talent retention angle'],
                decisionStyle: 'Relationship-driven. Buys from people they trust. Needs to feel understood.',
            },
            {
                title: 'COO / Director of Operations',
                priorities: ['Operational efficiency', 'Margins', 'Process standardization'],
                commonObjections: ['Our processes are too unique for off-the-shelf software', 'We tried something similar before'],
                persuasionTriggers: ['Customization capabilities', 'Time savings quantified', 'Implementation support'],
                decisionStyle: 'Practical. Wants to see the product working with their specific use case.',
            },
        ],
        salesCycleLength: '21-45 days',
        avgDealSize: '$20K-$75K ACV',
        buyingTriggers: [
            'Hiring surge (growing the team 30%+)',
            'Lost a key client due to delivery issues',
            'Partner meeting about profitability concerns',
            'Competitor firm visibly modernizing',
            'Spreadsheet-based systems collapsing',
        ],
        dealBlockers: [
            'Partner consensus required — hard to align multiple partners',
            'Change resistance from senior staff',
            '"We\'ve always done it this way" culture',
            'Bad experience with previous software implementations',
        ],
        aiContext: `This prospect is from a mid-market professional services firm. They are sophisticated in their domain (consulting, legal, accounting) but often behind on technology adoption. The decision-maker is likely a Managing Partner or COO who makes practical, relationship-driven decisions. They are wary of "enterprise software" that's too complex for their team size. Emphasize simplicity, fast implementation (weeks not months), and ROI measured in billable hours recovered or client retention improved. They will ask about customization and worry about change management.`,
    },
    {
        id: 'icp-healthcare',
        name: 'Healthcare & Life Sciences',
        icon: '🏥',
        description: 'Hospital systems, health tech companies, and pharma organizations. Heavily regulated, long procurement cycles, strong emphasis on patient outcomes and compliance.',
        companySize: '200-10,000+ employees',
        revenueRange: '$50M - $5B+',
        vertical: {
            name: 'Healthcare & Life Sciences',
            painPoints: [
                'Provider burnout and staffing shortages',
                'EHR interoperability and data fragmentation',
                'Regulatory compliance burden (HIPAA, FDA)',
                'Patient experience and satisfaction scores',
                'Revenue cycle management complexity',
            ],
            regulations: ['HIPAA', 'HITECH', 'FDA 21 CFR Part 11', 'SOC 2', 'HITRUST'],
            jargon: ['EHR/EMR', 'HL7/FHIR', 'revenue cycle', 'patient throughput', 'value-based care', 'BAA', 'clinical workflow', 'CPOE'],
            budgetCycle: 'Annual with capital expenditure committees. Major purchases go through governance board. Can take 6-12 months.',
        },
        buyerPersonas: [
            {
                title: 'CIO / CMIO',
                priorities: ['System integration', 'Clinical workflow impact', 'Compliance', 'Cybersecurity'],
                commonObjections: ['HIPAA compliance is non-negotiable', 'Integration with Epic/Cerner is critical', 'We need a BAA'],
                persuasionTriggers: ['HITRUST certification', 'Epic marketplace listing', 'Case studies from similar health systems'],
                decisionStyle: 'Consensus-driven. Will involve clinical, compliance, and IT teams. Slow but thorough.',
            },
            {
                title: 'VP of Clinical Operations',
                priorities: ['Clinical outcomes', 'Staff efficiency', 'Patient throughput'],
                commonObjections: ['Clinicians won\'t adopt another system', 'Show me the impact on patient outcomes'],
                persuasionTriggers: ['Clinical outcome data', 'Minutes saved per clinician per shift', 'Peer health system references'],
                decisionStyle: 'Outcome-focused. Wants evidence-based proof before moving forward.',
            },
        ],
        salesCycleLength: '90-180 days',
        avgDealSize: '$150K-$1M+ ACV',
        buyingTriggers: [
            'Joint Commission or regulatory audit finding',
            'EHR migration or upgrade cycle',
            'New CIO or CMIO (first 6 months)',
            'Patient satisfaction scores declining',
            'Cybersecurity incident at peer institution',
        ],
        dealBlockers: [
            'HIPAA/compliance review (can add months)',
            'Governance board approval required',
            'Epic/EHR integration certification needed',
            'Budget tied to fiscal year — can\'t reallocate mid-year',
            'Clinical champion burned out or transferred',
        ],
        aiContext: `This prospect is from a healthcare organization. They are extremely compliance-focused — HIPAA, HITRUST, and BAA requirements are non-negotiable table stakes. The buying process involves multiple stakeholders including clinical, IT, compliance, and procurement. Expect a long evaluation cycle with formal RFP/RFI processes. The AI prospect should ask about certifications, integration with EHR systems (Epic, Cerner), and patient outcome evidence. They will not move quickly and will require references from similar health systems. Budget discussions involve capital vs. operational expenditure classifications.`,
    },
    {
        id: 'icp-smb-ecommerce',
        name: 'SMB E-Commerce',
        icon: '🛒',
        description: 'Small to medium e-commerce businesses with 10-100 employees. Fast-moving, founder-driven, price-sensitive, focused on growth metrics.',
        companySize: '10-100 employees',
        revenueRange: '$1M - $20M',
        vertical: {
            name: 'E-Commerce / DTC',
            painPoints: [
                'Customer acquisition cost (CAC) rising year-over-year',
                'Cart abandonment and conversion optimization',
                'Inventory management and fulfillment complexity',
                'Attribution and marketing ROI tracking',
                'Scaling operations with small team',
            ],
            regulations: ['PCI-DSS', 'GDPR', 'CCPA', 'ADA compliance'],
            jargon: ['CAC', 'LTV', 'ROAS', 'AOV', 'conversion rate', 'SKU', 'DTC', 'Shopify', '3PL', 'return rate'],
            budgetCycle: 'Monthly/quarterly. Founder or head of marketing can approve $500-$5K/month quickly. Larger commitments need partner approval.',
        },
        buyerPersonas: [
            {
                title: 'Founder / CEO',
                priorities: ['Revenue growth', 'Profitability', 'Team efficiency'],
                commonObjections: ['We\'re bootstrapped — every dollar counts', 'I need to see ROI in 30 days', 'Can I get a free trial?'],
                persuasionTriggers: ['Quick wins with measurable impact', 'Similar brand case studies', 'Self-serve setup'],
                decisionStyle: 'Fast. Decides alone or with one other person. Goes with gut but validates with data.',
            },
            {
                title: 'Head of Marketing',
                priorities: ['Customer acquisition', 'Campaign performance', 'Attribution clarity'],
                commonObjections: ['We already use Google Analytics and Shopify analytics', 'How is this different from Klaviyo?'],
                persuasionTriggers: ['Attribution clarity', 'Campaign optimization results', 'Time saved on reporting'],
                decisionStyle: 'Performance-driven. Will run a quick test/trial before committing.',
            },
        ],
        salesCycleLength: '7-21 days',
        avgDealSize: '$5K-$25K ACV',
        buyingTriggers: [
            'Black Friday / holiday season preparation',
            'Shopify plan upgrade (scaling)',
            'Hired first marketing person',
            'Facebook CPMs spiking — need alternatives',
            'Moving from marketplace (Amazon) to owned DTC',
        ],
        dealBlockers: [
            'Cash flow constraints — bootstrapped business',
            'Too many tools already',
            'Founder bandwidth — no time for implementation',
            'Technical integration concerns with Shopify/WooCommerce',
        ],
        aiContext: `This prospect is from a small e-commerce brand. They are scrappy, fast-moving, and cost-conscious. The founder or head of marketing is the decision-maker — no procurement team, no legal review for standard SaaS products. They expect self-serve onboarding and quick time-to-value (days, not weeks). They will compare you to free tools (Google Analytics, Shopify analytics) and lower-cost alternatives. The winning approach is showing immediate, tangible impact on their metrics (ROAS, CAC, conversion rate). Don't over-pitch enterprise features — they want simplicity and speed.`,
    },
];

/**
 * Get an ICP pack by ID
 */
export function getICPPack(id: string): ICPPack | undefined {
    return ICP_PACKS.find(p => p.id === id);
}

/**
 * Get all ICP packs for a given vertical name
 */
export function getICPsByVertical(verticalName: string): ICPPack[] {
    return ICP_PACKS.filter(p =>
        p.vertical.name.toLowerCase().includes(verticalName.toLowerCase())
    );
}
