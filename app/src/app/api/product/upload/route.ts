import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * POST /api/product/upload
 * 
 * Accepts a product document (PDF, DOCX, TXT) or raw text content.
 * Extracts and structures product information into a ProductPack format
 * using GPT-4o-mini for intelligent extraction.
 */
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const rawText = formData.get('text') as string | null;

        let documentText = '';

        if (file) {
            const buffer = Buffer.from(await file.arrayBuffer());
            const fileName = file.name.toLowerCase();

            if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
                documentText = buffer.toString('utf-8');
            } else if (fileName.endsWith('.pdf')) {
                // Dynamic import — pdf-parse exports as CJS
                // eslint-disable-next-line @typescript-eslint/no-require-imports
                const pdfParse = require('pdf-parse') as (buf: Buffer) => Promise<{ text: string }>;
                const pdfData = await pdfParse(buffer);
                documentText = pdfData.text;
            } else if (fileName.endsWith('.docx')) {
                const mammoth = await import('mammoth');
                const result = await mammoth.extractRawText({ buffer });
                documentText = result.value;
            } else {
                return NextResponse.json(
                    { error: 'Unsupported file type. Please upload PDF, DOCX, or TXT.' },
                    { status: 400 }
                );
            }
        } else if (rawText) {
            documentText = rawText;
        } else {
            return NextResponse.json(
                { error: 'No file or text content provided.' },
                { status: 400 }
            );
        }

        // Truncate to ~8000 chars to fit in context
        if (documentText.length > 8000) {
            documentText = documentText.substring(0, 8000) + '\n\n[Document truncated]';
        }

        // Use GPT to extract structured product information
        const extractionPrompt = `You are a product marketing analyst. Extract structured product information from this document.

DOCUMENT:
---
${documentText}
---

Extract and return a JSON object with EXACTLY this structure:
{
  "name": "Product name",
  "company": "Company name (if identifiable, otherwise 'Unknown')",
  "tagline": "One-line value proposition (create one if not obvious)",
  "category": "Product category (e.g., 'Revenue Operations', 'Cloud Security', 'HR Technology')",
  "description": "2-3 sentence description of what the product does and who it's for",
  "valueProps": ["Value prop 1", "Value prop 2", "Value prop 3", "Value prop 4", "Value prop 5"],
  "features": [
    {
      "name": "Feature name",
      "description": "Brief description",
      "painMapping": "What buyer pain this addresses",
      "differentiator": true
    }
  ],
  "pricing": [
    {"name": "Tier name", "price": "$X", "unit": "per user/month", "features": ["feature1", "feature2"]}
  ],
  "competitors": [
    {
      "name": "Competitor name",
      "commonReference": "How a buyer might mention them",
      "ourAdvantage": "Our advantage",
      "theirAdvantage": "Their advantage",
      "counterPositioning": "How to position against them"
    }
  ],
  "objectionHandling": {
    "Common objection 1": "Suggested response 1",
    "Common objection 2": "Suggested response 2"
  },
  "aiContext": "A paragraph of context for an AI to role-play a buyer being pitched this product. Include what the rep should know and how the buyer should react."
}

Rules:
- Extract AT LEAST 3 value props and 3 features
- If pricing isn't in the document, make reasonable assumptions for a B2B SaaS product
- If competitors aren't mentioned, infer 1-2 likely competitors from the category
- Generate 3-5 realistic objections even if none are in the document
- The aiContext should be detailed enough for a realistic simulation
- Return ONLY valid JSON, no other text`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: extractionPrompt }],
            temperature: 0.4,
            max_tokens: 2000,
            response_format: { type: 'json_object' },
        });

        const extracted = JSON.parse(response.choices[0]?.message?.content || '{}');

        // Generate a unique ID
        const id = `prod-custom-${Date.now()}`;

        const productPack = {
            id,
            icon: '📦',
            ...extracted,
            // Ensure arrays exist even if extraction missed them
            valueProps: extracted.valueProps || [],
            features: extracted.features || [],
            pricing: extracted.pricing || [],
            competitors: extracted.competitors || [],
            objectionHandling: extracted.objectionHandling || {},
        };

        return NextResponse.json({
            success: true,
            productPack,
            sourceLength: documentText.length,
        });
    } catch (error) {
        console.error('Product upload error:', error);
        return NextResponse.json(
            { error: 'Failed to process document. Please try again.' },
            { status: 500 }
        );
    }
}
