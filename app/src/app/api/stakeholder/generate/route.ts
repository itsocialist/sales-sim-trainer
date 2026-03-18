import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * POST /api/stakeholder/generate
 *
 * Generates a realistic stakeholder profile on-the-fly based on
 * the selected Product Pack and ICP Pack context.
 */
export async function POST(request: NextRequest) {
    try {
        const { productPack, icpPack, stakeholderType } = await request.json();

        if (!productPack || !icpPack) {
            return NextResponse.json(
                { error: 'Product pack and ICP pack are required.' },
                { status: 400 }
            );
        }

        const prompt = `You are a sales training content designer. Generate a realistic buyer stakeholder profile for a sales simulation.

CONTEXT:
- Product being sold: ${productPack.name} by ${productPack.company} (${productPack.category})
- Target company segment: ${icpPack.name} (${icpPack.companySize})
- Industry vertical: ${icpPack.vertical?.name || 'General B2B'}
- Stakeholder archetype requested: ${stakeholderType || 'Decision Maker'}

Generate a JSON stakeholder with this EXACT structure:
{
  "name": "Full Name (realistic, diverse)",
  "title": "Job title matching the ICP (e.g., VP Engineering, CTO, CFO)",
  "company": "Realistic company name matching the ICP vertical",
  "companyDescription": "One sentence about the company",
  "personality": "2-3 sentence personality description — communication style, decision-making approach, pet peeves",
  "background": "Professional background (previous companies, years of experience, domain expertise)",
  "priorities": ["Priority 1", "Priority 2", "Priority 3"],
  "painPoints": ["Pain point 1", "Pain point 2", "Pain point 3"],
  "objections": [
    {
      "topic": "Objection category (e.g., 'Budget', 'Timing', 'Competition')",
      "objection": "The specific objection they would raise",
      "hiddenConcern": "What they're really worried about underneath"
    }
  ],
  "persuasionTriggers": ["What convinces this person", "Trigger 2", "Trigger 3"],
  "communicationStyle": "How they communicate in meetings (brief/detailed, warm/cold, technical/strategic)",
  "decisionStyle": "How they make buying decisions (consensus, data-driven, gut-feel, delegation)",
  "meetingBehavior": "How they behave in a first meeting with a vendor (skeptical, curious, rushed, etc.)",
  "warmthLevel": 4,
  "engagementLevel": 5,
  "dealInfluence": "Champion | Decision Maker | Influencer | Blocker | Gatekeeper"
}

Rules:
- Name should be realistic and diverse (not just Anglo names)
- Title should match the ICP's typical buyer personas
- Company should feel real for the vertical (not actual real companies)
- Personality should create interesting simulation dynamics
- Include AT LEAST 3 realistic objections with hidden concerns
- warmthLevel (1-10): how warm they are to vendors initially
- engagementLevel (1-10): how engaged/talkative they are
- Return ONLY valid JSON`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.8,  // Higher creativity for diverse personas
            max_tokens: 1500,
            response_format: { type: 'json_object' },
        });

        const stakeholder = JSON.parse(response.choices[0]?.message?.content || '{}');

        return NextResponse.json({
            success: true,
            stakeholder: {
                id: `stakeholder-gen-${Date.now()}`,
                ...stakeholder,
                generated: true,
                generatedFrom: {
                    productId: productPack.id,
                    icpId: icpPack.id,
                    stakeholderType: stakeholderType || 'Decision Maker',
                },
            },
        });
    } catch (error) {
        console.error('Stakeholder generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate stakeholder. Please try again.' },
            { status: 500 }
        );
    }
}
