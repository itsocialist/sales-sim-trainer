import OpenAI from 'openai';
import { NextRequest } from 'next/server';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

interface SimulateConfig {
    subject: {
        name: string;
        title: string;
        company: string;
        industry: string;
        backstory: string;
        personalityTraits: string[];
        physicalDescription: string;
    };
    subjectPack: {
        condition: string;
        conditionLevel: string;
        behaviorPrompt: string;
    };
    scenarioPack: {
        name: string;
        context: string;
    };
    trainingPack: {
        targetRole: string;
    };
    distance: number;    // warmth/trust: 1=cold stranger, 10=trusted advisor
    temperature: number; // engagement: 1=disinterested, 10=highly engaged/active eval
}

async function analyzeEngagement(
    messages: { role: string; content: string }[],
    currentWarmth: number,
    currentEngagement: number
): Promise<{ temperatureChange: number; distanceChange: number; reason: string }> {
    const recentMessages = messages.slice(-6);
    const transcript = recentMessages
        .map(m => `${m.role === 'user' ? 'REP' : 'PROSPECT'}: ${m.content}`)
        .join('\n');

    const analysisPrompt = `Analyze this sales conversation:
1. How should the prospect's ENGAGEMENT change? (+2 = much more interested, 0 = neutral, -2 = losing interest/shutting down)
2. How should WARMTH/TRUST change? (+1 = warmer/more open, 0 = neutral, -1 = cooler/more guarded)

Current Warmth (1=cold stranger, 10=trusted advisor): ${currentWarmth}/10
Current Engagement (1=disinterested, 10=highly engaged): ${currentEngagement}/10

${transcript}

Consider: Did the rep demonstrate relevance? Ask sharp discovery questions? Handle objections well? Earn respect?

JSON only: {"temperatureChange": number, "distanceChange": number, "reason": "brief"}`;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            max_tokens: 80,
            messages: [{ role: 'user', content: analysisPrompt }],
            temperature: 0.3,
            response_format: { type: 'json_object' },
        });

        const result = JSON.parse(response.choices[0]?.message?.content || '{}');
        return {
            temperatureChange: Math.max(-2, Math.min(2, result.temperatureChange || 0)),
            distanceChange: Math.max(-1, Math.min(1, result.distanceChange || 0)),
            reason: result.reason || '',
        };
    } catch {
        return { temperatureChange: 0, distanceChange: 0, reason: '' };
    }
}

function buildSystemPrompt(config: SimulateConfig): string {
    const warmthContext = config.distance <= 2
        ? 'This rep is a cold stranger — you have zero relationship and no reason to trust them yet.'
        : config.distance <= 4
        ? 'You barely know this rep — professional but guarded.'
        : config.distance <= 7
        ? 'You\'re warming up. There\'s some rapport building.'
        : 'You trust this rep. You speak candidly with them.';

    const engagementContext = config.temperature >= 8
        ? 'You are highly engaged — you have real pain and urgency. This might actually be what you need.'
        : config.temperature >= 6
        ? 'You are interested but evaluating carefully. Asking pointed questions.'
        : config.temperature >= 4
        ? 'You are somewhat curious but skeptical. You need more to commit your time.'
        : 'You are skeptical and disinterested. You\'re looking for a reason to end this call.';

    return `You ARE ${config.subject.name}, ${config.subject.title} at ${config.subject.company}.

WHO YOU ARE:
- Industry: ${config.subject.industry}
- Background: ${config.subject.backstory}
- Personality: ${config.subject.personalityTraits.join(', ')}

YOUR STAKEHOLDER TYPE:
${config.subjectPack.condition}
${config.subjectPack.behaviorPrompt}

CURRENT SITUATION:
${config.scenarioPack.context}
${warmthContext}
${engagementContext}

You are speaking with: a ${config.trainingPack.targetRole}

RESPONSE FORMAT:
Your response MUST be valid JSON with exactly this structure:
{
  "behavior": "Your internal state, body language, and what you're doing during the call",
  "statements": ["First thing you say", "Second thing", "Third thing"]
}

BEHAVIOR: Describe your demeanor in this moment.
Examples: "Glancing at watch, half-listening, clearly multitasking on laptop", "Leaning forward, genuinely interested, taking notes", "Arms crossed, skeptical, ready to push back"

STATEMENTS: Say 2-4 realistic things. Each should:
- Sound like an actual executive or manager (NOT a training script character)
- Reflect your current engagement and trust level
- Include authentic objections, sharp questions, OR genuine interest — based on your personality
- React naturally to what the rep just said

Stay in character as ${config.subject.name}. Never break character. Never make things easier for the rep than your archetype would.`;
}

export async function POST(request: NextRequest) {
    try {
        const { messages, sessionId, config } = await request.json() as {
            messages: { role: string; content: string }[];
            sessionId: string;
            config: SimulateConfig;
        };

        let engagementAnalysis = { temperatureChange: 0, distanceChange: 0, reason: '' };
        if (messages.length >= 2) {
            engagementAnalysis = await analyzeEngagement(
                messages,
                config.distance,
                config.temperature
            );
        }

        const systemPrompt = buildSystemPrompt(config);

        const formattedMessages = [
            { role: 'system' as const, content: systemPrompt },
            ...messages.map((msg) => ({
                role: msg.role as 'user' | 'assistant',
                content: msg.content,
            })),
        ];

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            max_tokens: 700,
            messages: formattedMessages,
            temperature: 0.85,
            presence_penalty: 0.4,
            frequency_penalty: 0.5,
            response_format: { type: 'json_object' },
        });

        const responseText = response.choices[0]?.message?.content || '{}';
        let parsed: { behavior?: string; statements?: string[] };

        try {
            parsed = JSON.parse(responseText);
        } catch {
            parsed = { behavior: 'Neutral expression', statements: [responseText] };
        }

        const behavior = parsed.behavior || 'No visible change';
        const statements = parsed.statements || ['...'];

        const encoder = new TextEncoder();
        const readable = new ReadableStream({
            async start(controller) {
                controller.enqueue(encoder.encode(JSON.stringify({
                    type: 'meta',
                    sessionId,
                    temperatureChange: engagementAnalysis.temperatureChange,
                    distanceChange: engagementAnalysis.distanceChange,
                    behavior,
                }) + '\n'));

                for (let i = 0; i < statements.length; i++) {
                    const statement = statements[i];
                    for (const char of statement) {
                        controller.enqueue(encoder.encode(JSON.stringify({
                            type: 'content',
                            content: char,
                        }) + '\n'));
                    }
                    if (i < statements.length - 1) {
                        controller.enqueue(encoder.encode(JSON.stringify({
                            type: 'content',
                            content: '\n\n',
                        }) + '\n'));
                    }
                }

                controller.enqueue(encoder.encode(JSON.stringify({ type: 'done' }) + '\n'));
                controller.close();
            },
        });

        return new Response(readable, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Transfer-Encoding': 'chunked',
            },
        });
    } catch (error) {
        console.error('Simulate API error:', error);
        return new Response(JSON.stringify({ error: 'Failed to generate response' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
