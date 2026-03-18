/**
 * Product Pack System for SalesSim
 * 
 * Defines products that reps are selling. Each product pack includes
 * value props, features, pricing, objection responses, and competitive positioning.
 * Works alongside Training Packs and ICP Packs for mix-and-match simulation.
 * 
 * Selection flow: Product Pack × ICP Pack × Training Pack × Scenario
 */

export interface ProductFeature {
    name: string;
    description: string;
    /** How this feature maps to buyer pain */
    painMapping: string;
    /** Competitive differentiator? */
    differentiator: boolean;
}

export interface PricingTier {
    name: string;
    price: string;
    /** e.g. "per user/month" */
    unit: string;
    features: string[];
}

export interface CompetitorProfile {
    name: string;
    /** How buyer might mention them */
    commonReference: string;
    /** Our advantage over them */
    ourAdvantage: string;
    /** Their advantage over us */
    theirAdvantage: string;
    /** Recommended counter-positioning */
    counterPositioning: string;
}

export interface ProductPack {
    id: string;
    name: string;
    icon: string;
    /** One-line value prop */
    tagline: string;
    /** Company selling this product */
    company: string;
    /** Product category */
    category: string;
    /** Detailed description for AI context */
    description: string;
    /** Core value propositions (3-5) */
    valueProps: string[];
    /** Key features */
    features: ProductFeature[];
    /** Pricing tiers */
    pricing: PricingTier[];
    /** Known competitors */
    competitors: CompetitorProfile[];
    /** Common objections and suggested responses */
    objectionHandling: Record<string, string>;
    /** AI prompt context for the product */
    aiContext: string;
}


// ============================================
// BUILT-IN PRODUCT PACKS
// ============================================

export const PRODUCT_PACKS: ProductPack[] = [
    {
        id: 'prod-revops-platform',
        name: 'RevOps Intelligence Platform',
        icon: '📊',
        tagline: 'Unified revenue operations with AI-powered pipeline intelligence',
        company: 'DataFlow',
        category: 'Revenue Operations',
        description: 'An AI-native RevOps platform that unifies CRM, marketing automation, and customer success data into a single pipeline intelligence layer. Provides real-time deal scoring, forecast accuracy, and automated workflow recommendations.',
        valueProps: [
            'Reduce forecast variance by 40% with AI-powered deal scoring',
            'Eliminate 15+ hours/week of manual CRM data entry per rep',
            'Unified pipeline view across sales, marketing, and CS',
            'Real-time competitive intelligence alerts',
            'Automated QBR generation in under 5 minutes',
        ],
        features: [
            {
                name: 'AI Deal Scoring',
                description: 'Machine learning model trained on your historical win/loss data to score active deals',
                painMapping: 'Inaccurate forecasts, sandbagging, late-stage surprises',
                differentiator: true,
            },
            {
                name: 'Pipeline Intelligence',
                description: 'Real-time multi-dimensional pipeline health dashboard with risk alerts',
                painMapping: 'Limited visibility into pipeline quality and progression',
                differentiator: true,
            },
            {
                name: 'Auto-CRM Sync',
                description: 'Automatic activity capture from email, calendar, and calls into CRM',
                painMapping: 'Reps spending too much time on data entry instead of selling',
                differentiator: false,
            },
            {
                name: 'Forecast Engine',
                description: 'Multi-method forecasting: AI, rep-submitted, manager call, weighted pipeline',
                painMapping: 'Forecast misses, revenue predictability issues',
                differentiator: true,
            },
            {
                name: 'Revenue Workflow Automation',
                description: 'Automated handoffs, approvals, and escalations based on deal signals',
                painMapping: 'Dropped deals, slow approvals, missed follow-ups',
                differentiator: false,
            },
        ],
        pricing: [
            { name: 'Team', price: '$49', unit: 'per user/month', features: ['Up to 25 users', 'Basic deal scoring', 'CRM sync', 'Standard support'] },
            { name: 'Business', price: '$99', unit: 'per user/month', features: ['Unlimited users', 'AI deal scoring', 'Custom workflows', 'Forecast engine', 'Priority support'] },
            { name: 'Enterprise', price: 'Custom', unit: 'annual contract', features: ['Everything in Business', 'Custom ML models', 'SSO/SAML', 'Dedicated CSM', '99.9% SLA'] },
        ],
        competitors: [
            {
                name: 'Clari',
                commonReference: '"We\'re looking at Clari" or "Our VP mentioned Clari"',
                ourAdvantage: 'Deeper AI customization, lower price point, better workflow automation',
                theirAdvantage: 'Larger market presence, more enterprise references, Salesforce native',
                counterPositioning: 'Clari is great for forecasting but lacks the full RevOps automation layer. We give you forecasting PLUS workflow automation in one platform.',
            },
            {
                name: 'Gong',
                commonReference: '"We use Gong for conversation intelligence"',
                ourAdvantage: 'Full pipeline view beyond just calls, pricing advantage, broader RevOps scope',
                theirAdvantage: 'Best-in-class conversation intelligence, strong brand recognition',
                counterPositioning: 'Gong excels at conversation analysis but doesn\'t give you pipeline intelligence. We integrate WITH your conversation intelligence to provide full-funnel visibility.',
            },
        ],
        objectionHandling: {
            'We already have a CRM': 'Absolutely — we don\'t replace your CRM. We sit on top of it as an intelligence layer, making your existing CRM investment work harder.',
            'It\'s not in the budget': 'Understood. Our customers typically see ROI in 90 days through recovered pipeline and reduced manual work. Can I show you the ROI model?',
            'Our team is too small': 'Actually, we see the highest impact with teams of 10-50 reps because the efficiency gains compound faster. What size is your sales org?',
            'Security concerns': 'We\'re SOC 2 Type II certified, GDPR compliant, and offer SSO/SAML. Happy to loop in our security team for a detailed review.',
        },
        aiContext: `The rep is selling DataFlow\'s RevOps Intelligence Platform. They should be knowledgeable about deal scoring, pipeline intelligence, and forecast accuracy. They should position the platform as complementary to existing CRM (not a replacement). Emphasize ROI metrics: 40% forecast improvement, 15+ hours saved per rep per week. Be prepared to handle competitive objections about Clari and Gong.`,
    },
    {
        id: 'prod-security-platform',
        name: 'Cloud Security Posture Manager',
        icon: '🛡️',
        tagline: 'Continuous cloud security compliance and threat detection',
        company: 'ShieldOps',
        category: 'Cloud Security',
        description: 'A cloud-native security platform that provides continuous compliance monitoring, threat detection, and incident response automation across multi-cloud environments (AWS, Azure, GCP).',
        valueProps: [
            'Reduce mean-time-to-detect (MTTD) from days to minutes',
            'Continuous compliance against SOC2, HIPAA, PCI-DSS, ISO 27001',
            'Unified security posture across AWS, Azure, and GCP',
            'Automated incident response playbooks',
            'Real-time asset inventory and risk prioritization',
        ],
        features: [
            {
                name: 'Cloud Asset Discovery',
                description: 'Automatic discovery and inventory of all cloud resources across providers',
                painMapping: 'Shadow IT, unknown cloud resources, asset sprawl',
                differentiator: false,
            },
            {
                name: 'Compliance Automation',
                description: 'Continuous checks against 20+ regulatory frameworks with auto-remediation',
                painMapping: 'Manual compliance audits, audit preparation burden',
                differentiator: true,
            },
            {
                name: 'Threat Detection Engine',
                description: 'ML-based anomaly detection with behavioral analysis',
                painMapping: 'Slow threat detection, alert fatigue, false positives',
                differentiator: true,
            },
            {
                name: 'Incident Response Automation',
                description: 'Pre-built and custom playbooks for automated containment and remediation',
                painMapping: 'Slow incident response, over-reliance on manual processes',
                differentiator: false,
            },
        ],
        pricing: [
            { name: 'Starter', price: '$5,000', unit: 'per month', features: ['Up to 500 cloud assets', 'Basic compliance', 'Standard support'] },
            { name: 'Professional', price: '$15,000', unit: 'per month', features: ['Up to 5,000 assets', 'Full compliance suite', 'Threat detection', 'API access'] },
            { name: 'Enterprise', price: 'Custom', unit: 'annual', features: ['Unlimited assets', 'Custom playbooks', 'Dedicated team', 'SLA guarantee'] },
        ],
        competitors: [
            {
                name: 'Wiz',
                commonReference: '"Wiz seems to be the leader" or "Our CISO is looking at Wiz"',
                ourAdvantage: 'Better incident response automation, lower price, stronger multi-cloud parity',
                theirAdvantage: 'Stronger market positioning, larger customer base, faster graph scanning',
                counterPositioning: 'Wiz is excellent at finding vulnerabilities but lacks the automated response layer. We find AND fix — that\'s the difference between visibility and protection.',
            },
        ],
        objectionHandling: {
            'We already have AWS Security Hub': 'Security Hub is a great start but it\'s AWS-only. If you\'re multi-cloud or plan to be, you need a unified view across providers.',
            'Our security team is stretched thin': 'That\'s exactly why automation is critical. Our playbooks handle 80% of routine incidents automatically, freeing your team for strategic work.',
            'Not in this year\'s budget': 'Every day without proper cloud security posture is a risk. The average cloud breach costs $4.35M. Can I quantify the risk reduction for your environment?',
        },
        aiContext: `The rep is selling ShieldOps Cloud Security Posture Manager. They should demonstrate strong cloud security knowledge across AWS, Azure, and GCP. Position the product as "find AND fix" vs competitors that only detect. Emphasize MTTD reduction and compliance automation ROI. Be prepared for Wiz comparisons.`,
    },
    {
        id: 'prod-hr-platform',
        name: 'People Analytics Suite',
        icon: '👥',
        tagline: 'Data-driven talent decisions from hire to retire',
        company: 'TalentMetrics',
        category: 'HR Technology',
        description: 'An AI-powered people analytics platform that transforms HR from a cost center into a strategic driver. Combines workforce planning, engagement analytics, attrition prediction, and DEI metrics into a unified intelligence layer.',
        valueProps: [
            'Predict attrition risk 6 months before resignation with 85% accuracy',
            'Reduce time-to-hire by 35% with AI-sourced candidate matching',
            'Real-time engagement pulse without survey fatigue',
            'Board-ready DEI dashboards with benchmarking',
            'Workforce planning aligned to revenue targets',
        ],
        features: [
            {
                name: 'Attrition Predictor',
                description: 'ML model identifying flight risk based on 50+ behavioral signals',
                painMapping: 'Surprise resignations, high replacement costs, knowledge loss',
                differentiator: true,
            },
            {
                name: 'Engagement Pulse',
                description: 'Continuous, lightweight engagement measurement without formal surveys',
                painMapping: 'Low survey response rates, outdated annual engagement data',
                differentiator: true,
            },
            {
                name: 'Workforce Planner',
                description: 'Scenario modeling for headcount planning tied to revenue targets',
                painMapping: 'Misaligned hiring plans, reactive vs strategic talent decisions',
                differentiator: false,
            },
            {
                name: 'DEI Analytics',
                description: 'Real-time diversity metrics with peer benchmarking and progress tracking',
                painMapping: 'Board/investor DEI reporting burden, lack of actionable diversity data',
                differentiator: false,
            },
        ],
        pricing: [
            { name: 'Growth', price: '$8', unit: 'per employee/month', features: ['Up to 500 employees', 'Engagement pulse', 'Basic analytics', 'Email support'] },
            { name: 'Scale', price: '$15', unit: 'per employee/month', features: ['Up to 5,000 employees', 'Attrition prediction', 'DEI analytics', 'API access'] },
            { name: 'Enterprise', price: 'Custom', unit: 'annual', features: ['Unlimited employees', 'Custom models', 'Workforce planner', 'Dedicated CSM'] },
        ],
        competitors: [
            {
                name: 'Visier',
                commonReference: '"Our CHRO mentioned Visier"',
                ourAdvantage: 'Faster implementation (weeks vs months), better UX, more affordable for mid-market',
                theirAdvantage: 'Deeper analytics library, more Fortune 500 references, longer track record',
                counterPositioning: 'Visier is powerful but requires months of implementation and a dedicated analytics team. We give you 80% of the insights in 2 weeks, not 6 months.',
            },
        ],
        objectionHandling: {
            'Our HRIS already has analytics': 'HRIS analytics show you WHAT happened. We show you WHAT WILL happen — like which team is at attrition risk next quarter.',
            'Privacy concerns about employee monitoring': 'We aggregate and anonymize all data. We predict TEAM trends, not individual behavior. Happy to share our privacy whitepaper.',
            'HR doesn\'t have budget for analytics tools': 'Our customers position this as a retention investment, not an HR tool. The cost of replacing one engineer pays for a year of TalentMetrics.',
        },
        aiContext: `The rep is selling TalentMetrics People Analytics Suite. They should understand HR pain points: attrition, engagement, DEI reporting, and workforce planning. Position as "predictive, not reactive" HR. Key metric: 85% attrition prediction accuracy. Handle privacy objections carefully. Competitor: Visier (we're faster to implement, better UX).`,
    },

    // ============================================
    // CRE BROKERAGE & PM SERVICES
    // ============================================
    {
        id: 'prod-southcoast-cre',
        name: 'CRE Brokerage & PM Services',
        icon: '🏗️',
        tagline: 'Full-service commercial real estate brokerage and property management in Southern California',
        company: 'South Coast Commercial',
        category: 'Commercial Real Estate Services',
        description: 'A full-service CRE brokerage and property management firm specializing in multifamily properties across Southern California. Services include investment sales, listing representation, tenant representation, 1031 exchange advisory, property management, asset management consulting, and market research. Deep expertise in Orange County, San Diego, and Inland Empire submarkets.',
        valueProps: [
            'Deep Southern California multifamily market expertise with 15+ years of local transaction history',
            'Full-service platform: brokerage + property management + asset management under one roof',
            '1031 exchange specialist with established qualified intermediary network and pre-qualified replacement inventory',
            'In-house maintenance team delivering 2-hour emergency response (vs. 24-48 hour industry average)',
            'Data-driven marketing: professional photography, 3D Matterport tours, targeted investor syndication, and social media campaigns',
        ],
        features: [
            {
                name: 'Investment Sales Brokerage',
                description: 'Full-service listing and buyer representation for multifamily acquisitions and dispositions',
                painMapping: 'Owners who need to sell or reposition assets need a broker with deep market access and buyer relationships',
                differentiator: false,
            },
            {
                name: 'Proprietary Buyer Database',
                description: 'Database of 2,000+ active, qualified multifamily buyers across SoCal with verified purchase criteria',
                painMapping: 'Sellers want maximum exposure to serious buyers, not tire-kickers',
                differentiator: true,
            },
            {
                name: '1031 Exchange Advisory',
                description: 'End-to-end 1031 exchange guidance including QI coordination, replacement property identification, and timeline management',
                painMapping: 'Investors need a broker who understands 1031 mechanics and can move fast under IRS deadlines',
                differentiator: true,
            },
            {
                name: 'Property Management',
                description: 'Full-service PM including tenant screening, rent collection, maintenance, and monthly financial reporting',
                painMapping: 'Owners frustrated with high vacancy, slow maintenance, and poor communication from current PM',
                differentiator: false,
            },
            {
                name: 'In-House Maintenance Team',
                description: 'Dedicated maintenance staff (not outsourced) for faster response times and quality control',
                painMapping: 'Maintenance delays cause tenant turnover, which kills NOI',
                differentiator: true,
            },
            {
                name: 'Market Intelligence Reports',
                description: 'Quarterly submarket reports with cap rate trends, rent comps, vacancy analysis, and transaction volume',
                painMapping: 'Investors need accurate, hyperlocal data to make acquisition and pricing decisions',
                differentiator: false,
            },
        ],
        pricing: [
            { name: 'Listing Commission', price: '4-6%', unit: 'of sale price (split with buyer broker)', features: ['Full marketing package', 'Professional photography & 3D tours', 'Buyer database syndication', 'Negotiation & closing coordination'] },
            { name: 'Property Management', price: '5-8%', unit: 'of collected rent monthly', features: ['Tenant screening & placement', 'Rent collection & disbursement', 'Maintenance coordination', 'Monthly financial reporting'] },
            { name: 'Asset Management Consulting', price: '$2,500-5,000', unit: 'per month', features: ['NOI optimization analysis', 'Capital improvement planning', 'Rent survey & mark-to-market', 'Disposition strategy'] },
        ],
        competitors: [
            {
                name: 'CBRE',
                commonReference: '"We\'re talking to CBRE about this listing"',
                ourAdvantage: 'Hyperlocal SoCal expertise — we know every submarket block by block. Personal service, not a corporate machine. Faster response times.',
                theirAdvantage: 'Global brand recognition, larger institutional buyer network, more research resources',
                counterPositioning: 'CBRE is great for $50M+ institutional deals. For deals under $20M, your listing gets lost in their pipeline. We make every deal our top priority because that\'s our sweet spot.',
            },
            {
                name: 'Marcus & Millichap',
                commonReference: '"My neighbor sold through Marcus & Millichap"',
                ourAdvantage: 'Full-service (brokerage + PM + asset management). M&M is brokerage-only — once you sell, they\'re gone. We manage the full lifecycle.',
                theirAdvantage: 'Largest volume of multifamily transactions nationally, strong brand in investment sales',
                counterPositioning: 'Marcus & Millichap has great national reach, but their local agents turn over frequently. We\'ve been in this market for 15 years with the same team. Continuity matters when your asset is on the line.',
            },
            {
                name: 'Cushman & Wakefield',
                commonReference: '"Cushman has a big office nearby"',
                ourAdvantage: 'More competitive commission structure, faster marketing turnaround, owner-operator mentality vs. corporate bureaucracy',
                theirAdvantage: 'Larger research department, corporate tenant relationships, commercial office strength',
                counterPositioning: 'Cushman\'s strength is office and industrial. Multifamily is our DNA — it\'s all we do. When your entire portfolio is apartments, you want a specialist, not a generalist.',
            },
            {
                name: 'Local Boutique Firms',
                commonReference: '"There\'s a local broker who charges less"',
                ourAdvantage: 'Professional marketing materials, broader buyer network, in-house PM capability, established QI relationships',
                theirAdvantage: 'Lower commission rates, personal relationships, fewer layers',
                counterPositioning: 'A lower commission means nothing if the property sits on market 90 days longer. Our average days-on-market is 45 — that\'s 30-60 days faster than most boutique firms. Time is money in CRE.',
            },
        ],
        objectionHandling: {
            'Why not go with a national brand like CBRE?': 'National brands are great for $50M+ deals. For properties in our sweet spot ($2M-$20M), you\'ll get more attention, faster response, and someone who knows your submarket block by block. We\'ve closed 200+ transactions in this market — that\'s not a national average, that\'s right here.',
            'Your commission is too high': 'I hear you. Let me show you the math: our average sale price is 8% higher than the submarket average because of our marketing reach and buyer network. On a $5M property, that\'s $400K more in your pocket — far more than the commission difference.',
            'I can manage my own property': 'Many owners can and do. The question is whether your time is better spent finding the next deal or handling 2am maintenance calls. Our clients typically see a 3-5% NOI increase within the first year because we optimize rents, reduce vacancy, and control maintenance costs.',
            'What\'s your track record?': 'In the last 12 months: 47 transactions closed, average 45 days on market, sale prices averaging 4% above initial list price. I can share specific comps in your submarket — would that be helpful?',
            'I already have a broker relationship': 'I respect that. Most of our clients came from other brokerages. What I\'d ask is: are you getting quarterly market updates? A proactive call when a comparable property sells in your area? Data-driven pricing that maximizes your return? If not, it\'s worth a conversation.',
        },
        aiContext: `The rep is a commercial real estate broker selling brokerage and property management services. They should demonstrate deep knowledge of Southern California multifamily market conditions: current cap rates (4.5-5.5% for stabilized multifamily in OC), interest rate impact on deal economics, recent comparable transactions, and submarket trends. Key differentiators: hyperlocal expertise, full-service platform (brokerage + PM + asset management), 1031 exchange specialization, and in-house maintenance team. The rep should speak fluently in CRE terminology: cap rate, NOI, DSCR, pro forma, trailing 12, rent roll, TI, NNN, GRM, cost segregation, 1031 exchange mechanics. Position against national brands (CBRE, M&M, C&W) by emphasizing personalized service and local market depth. Always lead with data and comps, not credentials.`,
    },
];

/**
 * Get a product pack by ID
 */
export function getProductPack(id: string): ProductPack | undefined {
    return PRODUCT_PACKS.find(p => p.id === id);
}
