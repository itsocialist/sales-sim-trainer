import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface DebriefRequest {
    messages: Message[];
    scenarioContext: string;
    intoxicationLevel: string; // deal complexity level (mild/moderate/severe)
    traineeRole?: string;      // e.g., "Enterprise Account Executive", "SDR"
    subjectCondition?: string; // stakeholder archetype, e.g., "Economic Buyer (CFO/VP)"
}

function buildDebriefPrompt(traineeRole: string, stakeholderType: string): string {
    const roleLabel = traineeRole || 'Account Executive';
    const isCRE = roleLabel.toLowerCase().includes('real estate') || roleLabel.toLowerCase().includes('broker') || roleLabel.toLowerCase().includes('cre');

    if (isCRE) {
        return buildCREDebriefPrompt(roleLabel, stakeholderType);
    }

    return `You are a senior sales coach analyzing a sales simulation conversation.

The trainee (acting as a ${roleLabel}) just completed a scenario with a prospect playing the role of: ${stakeholderType}.

Analyze their sales performance across four dimensions:

1. **MEDDIC COVERAGE SCORE (1-10)**: How well did they qualify using MEDDIC/MEDDPICC?
   - Did they uncover Metrics (quantifiable business impact)?
   - Did they identify or confirm the Economic Buyer?
   - Did they understand Decision Criteria and Decision Process?
   - Did they Identify Pain clearly?
   - Did they develop or confirm a Champion?
   - (Bonus: Did they surface Paper Process or map Competition?)

2. **DISCOVERY & QUESTIONING SCORE (1-10)**: Quality of their questions and listening.
   - Did they ask insight-led, open-ended questions?
   - Did they listen and adapt, or push their agenda?
   - Did they uncover needs vs. just presenting features?
   - Did they use a hypothesis-led opening ("Companies like yours often struggle with X...")?

3. **OBJECTION HANDLING SCORE (1-10)**: How well did they handle pushback?
   - Did they acknowledge, empathize, then reframe?
   - Did they get defensive or capitulate too quickly?
   - Did they turn objections into discovery opportunities?
   - Did they close for next steps clearly?

4. **EXECUTIVE PRESENCE & CREDIBILITY SCORE (1-10)**: Did they show up like a trusted advisor?
   - Did they lead with business value, not features?
   - Were they concise, confident, and clear?
   - Did they demonstrate peer-level conversation with the stakeholder?
   - Did they use appropriate social proof and competitor positioning?

5. **KEY OBSERVATIONS**:
   - What did the ${roleLabel} do well? (2-3 specific examples with actual quotes)
   - What should they improve? (2-3 specific, actionable coaching points)

6. **MEDDIC GAPS**: Which MEDDIC pillars were NOT covered or covered poorly?

7. **OVERALL ASSESSMENT**: A 2-3 sentence summary. Be direct and coaching-focused.

Reference actual dialogue in your feedback. Be specific and actionable. Don't be vague.

Format your response as JSON:
{
  "recognitionScore": number,
  "communicationScore": number,
  "safetyScore": number,
  "overallScore": number,
  "strengths": ["string", "string"],
  "improvements": ["string", "string"],
  "indicatorsPresent": ["MEDDIC pillar covered", "..."],
  "indicatorsMissed": ["MEDDIC pillar missed", "..."],
  "summary": "string"
}

Note: recognitionScore = MEDDIC Coverage, communicationScore = Discovery & Questioning, safetyScore = Objection Handling. overallScore = weighted average.`;
}

function buildCREDebriefPrompt(roleLabel: string, stakeholderType: string): string {
    return `You are a senior CRE brokerage coach analyzing a commercial real estate simulation conversation.

The trainee (acting as a ${roleLabel}) just completed a scenario with: ${stakeholderType}.

Analyze their CRE sales performance across four dimensions:

1. **MARKET EXPERTISE SCORE (1-10)**: Did they demonstrate deep local market knowledge?
   - Did they reference specific submarkets, recent transactions, or cap rate trends?
   - Did they use CRE terminology naturally (NOI, DSCR, GRM, pro forma, trailing 12)?
   - Did they cite comparable sales data to support their positioning?
   - Did they demonstrate understanding of current market conditions (interest rates, supply, demand)?

2. **RELATIONSHIP & TRUST BUILDING SCORE (1-10)**: Did they build rapport and credibility?
   - Did they ask about the owner/investor's goals and timeline?
   - Did they listen before pitching?
   - Did they demonstrate understanding of the prospect's specific situation?
   - Did they show empathy for the prospect's concerns (pricing, timing, switching costs)?

3. **VALUE DIFFERENTIATION SCORE (1-10)**: How well did they position their services?
   - Did they articulate what makes them different from national firms (CBRE, M&M)?
   - Did they quantify their value (days-on-market, sale-price premium, vacancy reduction)?
   - Did they handle competitive objections with data, not just claims?
   - Did they connect their services to the prospect's specific pain points?

4. **CLOSING & NEXT STEPS SCORE (1-10)**: Did they advance the deal?
   - Did they propose a clear next step (CMA, property tour, listing agreement)?
   - Did they create urgency without being pushy?
   - Did they handle the "I'll think about it" or "I have another broker" gracefully?
   - Did they leave the door open for future engagement if not closing now?

5. **KEY OBSERVATIONS**:
   - What did the broker do well? (2-3 specific examples with actual quotes from the conversation)
   - What should they improve? (2-3 specific, actionable CRE coaching points)

6. **CRE SKILLS GAPS**: Which critical CRE broker skills were NOT demonstrated?
   - Examples: market data usage, 1031 expertise, property valuation discussion, PM track record

7. **OVERALL ASSESSMENT**: A 2-3 sentence summary. Be direct, reference specific moments, and focus on what would win the listing or close the deal in real life.

Reference actual dialogue in your feedback. Be specific to commercial real estate — do NOT give generic SaaS sales advice.

Format your response as JSON:
{
  "recognitionScore": number,
  "communicationScore": number,
  "safetyScore": number,
  "overallScore": number,
  "strengths": ["string", "string"],
  "improvements": ["string", "string"],
  "indicatorsPresent": ["CRE skill demonstrated", "..."],
  "indicatorsMissed": ["CRE skill gap", "..."],
  "summary": "string"
}

Note: recognitionScore = Market Expertise, communicationScore = Relationship & Trust, safetyScore = Value Differentiation. overallScore = weighted average.`;
}

export async function POST(request: NextRequest) {
    try {
        const {
            messages,
            scenarioContext,
            intoxicationLevel,
            traineeRole = 'Account Executive',
            subjectCondition = 'prospect'
        }: DebriefRequest = await request.json();

        if (!messages || messages.length < 2) {
            return NextResponse.json(
                { error: 'Not enough conversation to analyze' },
                { status: 400 }
            );
        }

        const traineeLabel = traineeRole.toUpperCase().replace(/\//g, '-');
        const transcript = messages
            .map(m => `${m.role === 'user' ? traineeLabel : 'PROSPECT'}: ${m.content}`)
            .join('\n\n');

        const debriefPrompt = buildDebriefPrompt(traineeRole, subjectCondition);

        const analysisPrompt = `${debriefPrompt}

SCENARIO CONTEXT:
${scenarioContext}
Deal Complexity: ${intoxicationLevel}

CONVERSATION TRANSCRIPT:
${transcript}

Provide your analysis as valid JSON only, no markdown formatting.`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            max_tokens: 1200,
            messages: [
                { role: 'system', content: `You are a senior sales coach and MEDDIC expert analyzing a ${traineeRole} simulation. Respond only with valid JSON.` },
                { role: 'user', content: analysisPrompt },
            ],
            temperature: 0.3,
            response_format: { type: 'json_object' },
        });

        const analysisText = response.choices[0]?.message?.content || '{}';

        try {
            const analysis = JSON.parse(analysisText);

            if (!analysis.overallScore) {
                analysis.overallScore = Math.round(
                    (analysis.recognitionScore + analysis.communicationScore + analysis.safetyScore) / 3
                );
            }

            return NextResponse.json({
                success: true,
                analysis,
                messageCount: messages.length,
            });
        } catch {
            console.error('Failed to parse analysis JSON:', analysisText);
            return NextResponse.json({
                success: false,
                error: 'Failed to parse analysis',
                raw: analysisText,
            });
        }
    } catch (error) {
        console.error('Debrief API error:', error);
        return NextResponse.json(
            { error: 'Failed to generate debrief' },
            { status: 500 }
        );
    }
}
