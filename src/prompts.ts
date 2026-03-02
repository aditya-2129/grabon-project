// ============================================================
// Prompt Templates for Deal Copy Generation
// ============================================================

import type { DealInput } from "./types.js";

/**
 * Builds the full prompt that instructs Claude (via MCP sampling)
 * to generate all 54 copy variants for a deal.
 */
export function buildGenerationPrompt(deal: DealInput): string {
  const expiryDate = new Date(deal.expiry_timestamp);
  const formattedExpiry = expiryDate.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const discountText =
    deal.discount_type === "percentage"
      ? `${deal.discount_value}% off`
      : `₹${deal.discount_value} off`;

  const exclusiveText = deal.exclusive_flag
    ? "This is an EXCLUSIVE deal only on GrabOn."
    : "This deal is available across platforms.";

  return `You are a world-class multilingual marketing copywriter for GrabOn, India's #1 coupon and deals platform.

DEAL DETAILS:
- Merchant: ${deal.merchant_id}
- Category: ${deal.category}
- Discount: ${discountText}
- Minimum Order Value: ₹${deal.min_order_value}
- Maximum Redemptions: ${deal.max_redemptions.toLocaleString()}
- Expires: ${formattedExpiry}
- ${exclusiveText}

YOUR TASK:
Generate marketing copy for this deal across 6 channels, 3 A/B variant strategies, and 3 languages = 54 total outputs.

═══════════════════════════════════════
CHANNELS & FORMAT CONSTRAINTS:
═══════════════════════════════════════

1. EMAIL — HTML snippet with:
   - "subject": compelling subject line
   - "body_headline": short punchy headline
   - "cta": call-to-action button text

2. WHATSAPP — Single plain text message
   - Max 160 characters total
   - Must include the discount and merchant name

3. PUSH NOTIFICATION —
   - "title": max 50 characters
   - "body": max 100 characters

4. GLANCE (lock screen card) —
   - Max 160 characters
   - Must work WITHOUT any context (user sees this on lock screen)
   - No app name, no preamble — straight to the deal

5. PAYU (checkout banner) —
   - Max 40 characters
   - Action-oriented (user is mid-checkout)
   - e.g., "Apply 20% off now!" or "Save ₹100 instantly!"

6. INSTAGRAM — 
   - "caption": engaging post caption
   - "hashtags": array of relevant hashtags (5-8)

═══════════════════════════════════════
A/B VARIANT STRATEGIES:
═══════════════════════════════════════

For EACH channel, generate 3 meaningfully different variants:

1. "urgency" — Create urgency/FOMO. Use time limits, scarcity ("only X left"), countdown language. Make the reader feel they'll miss out.

2. "value" — Lead with the value proposition. Emphasize savings amount, ROI, getting more for less. Make the deal feel like a steal.

3. "social_proof" — Leverage social validation. Reference popularity ("10K+ people grabbed this"), trending status, ratings, community behavior.

CRITICAL: Variants must be MEANINGFULLY DIFFERENT in tone, angle, and messaging strategy. NOT just synonym swaps or minor word changes.

═══════════════════════════════════════
LANGUAGES:
═══════════════════════════════════════

Generate each variant in 3 languages:
1. "en" — English
2. "hi" — Hindi (Devanagari script). Must be CULTURALLY NATURAL Hindi, not Google Translate. Use colloquial deal language Indians actually use: "लूट लो", "मत चूको", "पैसे वसूल", etc.
3. "te" — Telugu (Telugu script). Must be CULTURALLY ACCURATE Telugu. Telugu idioms for deal urgency are different from Hindi. Use natural expressions: "అదిరిపోయే ఆఫర్", "మిస్ అవ్వకండి", etc.

═══════════════════════════════════════
OUTPUT FORMAT (STRICT JSON):
═══════════════════════════════════════

Return a JSON array with exactly 54 objects. Each object must follow this structure:

For EMAIL channel:
{
  "channel": "email",
  "variant": "urgency" | "value" | "social_proof",
  "language": "en" | "hi" | "te",
  "content": {
    "type": "email",
    "data": { "subject": "...", "body_headline": "...", "cta": "..." }
  }
}

For WHATSAPP channel:
{
  "channel": "whatsapp",
  "variant": "...",
  "language": "...",
  "content": { "type": "whatsapp", "data": "..." }
}

For PUSH channel:
{
  "channel": "push",
  "variant": "...",
  "language": "...",
  "content": { "type": "push", "data": { "title": "...", "body": "..." } }
}

For GLANCE channel:
{
  "channel": "glance",
  "variant": "...",
  "language": "...",
  "content": { "type": "glance", "data": "..." }
}

For PAYU channel:
{
  "channel": "payu",
  "variant": "...",
  "language": "...",
  "content": { "type": "payu", "data": "..." }
}

For INSTAGRAM channel:
{
  "channel": "instagram",
  "variant": "...",
  "language": "...",
  "content": {
    "type": "instagram",
    "data": { "caption": "...", "hashtags": ["...", "..."] }
  }
}

RETURN ONLY THE JSON ARRAY. No markdown, no code fences, no explanation. Just the raw JSON array with exactly 54 objects.`;
}
