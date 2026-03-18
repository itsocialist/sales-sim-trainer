import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * POST /api/product/scrape
 * 
 * Accepts a URL, scrapes the page content, and extracts
 * structured product information into a ProductPack format.
 */
export async function POST(request: NextRequest) {
    try {
        const { url } = await request.json() as { url: string };

        if (!url || typeof url !== 'string') {
            return NextResponse.json(
                { error: 'URL is required.' },
                { status: 400 }
            );
        }

        // Validate URL
        let parsedUrl: URL;
        try {
            parsedUrl = new URL(url);
            if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
                throw new Error('Invalid protocol');
            }
        } catch {
            return NextResponse.json(
                { error: 'Invalid URL. Please provide a valid http or https URL.' },
                { status: 400 }
            );
        }

        // Fetch the page
        const pageResponse = await fetch(parsedUrl.toString(), {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            },
            signal: AbortSignal.timeout(15000),
        });

        if (!pageResponse.ok) {
            return NextResponse.json(
                { error: `Failed to fetch URL (HTTP ${pageResponse.status})` },
                { status: 400 }
            );
        }

        const html = await pageResponse.text();

        // Extract readable text from HTML (lightweight readability)
        const textContent = extractTextFromHTML(html);

        if (textContent.length < 50) {
            return NextResponse.json(
                { error: 'Could not extract enough content from the URL. Try a different page (e.g., product page, features page, or about page).' },
                { status: 400 }
            );
        }

        // Truncate to ~8000 chars
        const truncatedText = textContent.length > 8000
            ? textContent.substring(0, 8000) + '\n\n[Content truncated]'
            : textContent;

        // Use GPT to extract structured product info
        const extractionPrompt = `You are a product marketing analyst. Extract structured product information from this website content.

SOURCE URL: ${url}

WEBSITE CONTENT:
---
${truncatedText}
---

Extract and return a JSON object with EXACTLY this structure:
{
  "name": "Product name",
  "company": "Company name",
  "tagline": "One-line value proposition",
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
  "aiContext": "A paragraph of context for an AI to role-play a buyer being pitched this product."
}

Rules:
- Extract AT LEAST 3 value props and 3 features
- If pricing isn't on this page, make reasonable assumptions for a B2B SaaS product
- If competitors aren't mentioned, infer 1-2 likely competitors from the category
- Generate 3-5 realistic objections based on the product type
- The aiContext should be detailed enough for a realistic simulation
- Return ONLY valid JSON`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: extractionPrompt }],
            temperature: 0.4,
            max_tokens: 2000,
            response_format: { type: 'json_object' },
        });

        const extracted = JSON.parse(response.choices[0]?.message?.content || '{}');

        const id = `prod-url-${Date.now()}`;

        const productPack = {
            id,
            icon: '🌐',
            sourceUrl: url,
            ...extracted,
            valueProps: extracted.valueProps || [],
            features: extracted.features || [],
            pricing: extracted.pricing || [],
            competitors: extracted.competitors || [],
            objectionHandling: extracted.objectionHandling || {},
        };

        return NextResponse.json({
            success: true,
            productPack,
            sourceUrl: url,
            contentLength: truncatedText.length,
        });
    } catch (error) {
        console.error('Product scrape error:', error);
        const message = error instanceof Error && error.name === 'TimeoutError'
            ? 'URL took too long to respond. Please try again or try a different URL.'
            : 'Failed to process URL. Please try again.';
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}

/**
 * Lightweight HTML to text extraction
 * Strips scripts, styles, tags, and collapses whitespace
 */
function extractTextFromHTML(html: string): string {
    let text = html;

    // Remove scripts and styles
    text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    text = text.replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '');

    // Remove SVGs and other non-content
    text = text.replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, '');

    // Convert common block elements to newlines
    text = text.replace(/<\/?(?:div|p|h[1-6]|li|br|tr|section|article|header|footer)[^>]*>/gi, '\n');

    // Remove all remaining tags
    text = text.replace(/<[^>]+>/g, ' ');

    // Decode HTML entities
    text = text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ');

    // Collapse whitespace
    text = text.replace(/[ \t]+/g, ' ');
    text = text.replace(/\n\s*\n/g, '\n');
    text = text.trim();

    return text;
}
