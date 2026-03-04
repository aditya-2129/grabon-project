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

For EACH channel, generate 3 meaningfully different variants. Each variant must feel like it was written by a different copywriter with a completely different marketing philosophy.

1. "urgency" — SCARCITY & FOMO
   - Core angle: TIME IS RUNNING OUT, quantities are LIMITED
   - Emotional trigger: anxiety about missing out, countdown pressure
   - Language style: short punchy sentences, alarm tone, exclamation marks
   - Example (email subject): "⏰ 3 hours left — your 20% Zomato code dies at midnight"
   - Example (WhatsApp): "🚨 Bro this deal's dying! 20% off Zomato ends TONIGHT. Only 847 left. GO NOW"
   - AVOID: Mentioning savings math or how many people used it

2. "value" — SAVINGS MATH & ROI
   - Core angle: Here's EXACTLY how much you save, your wallet will thank you
   - Emotional trigger: smart shopper satisfaction, getting more for less
   - Language style: conversational, calculating, "here's the math"
   - Example (email subject): "Your dinner just got ₹200 cheaper — that's a free dessert"
   - Example (WhatsApp): "Hey! 20% off Zomato rn. That ₹500 order? Now ₹400. Legit best deal today 💰"
   - AVOID: Countdown language or mentioning how many people used it

3. "social_proof" — CROWD VALIDATION & TRENDING
   - Core angle: EVERYONE is using this, it's the #1 deal, don't be left out
   - Emotional trigger: wanting to be part of the crowd, validation from numbers
   - Language style: excited, community-oriented, citing specific numbers
   - Example (email subject): "47,000+ foodies grabbed this Zomato deal this week — your turn"
   - Example (WhatsApp): "🔥 2K+ people grabbed 20% off Zomato! Hottest food deal rn. Don't be last!"
   - AVOID: Countdown language or savings math

CRITICAL DIFFERENTIATION RULES:
- An urgency variant should NEVER mention "X people grabbed this" — that's social proof
- A value variant should NEVER say "hurry" or "ending soon" — that's urgency
- A social proof variant should NEVER calculate savings — that's value
- Each variant must be written from a FUNDAMENTALLY DIFFERENT ANGLE

═══════════════════════════════════════
LANGUAGES & CULTURAL GUIDELINES:
═══════════════════════════════════════

Generate each variant in 3 languages. Localization must be CULTURALLY NATIVE, not just translated.

1. "en" — English
   Standard marketing English. Conversational, not corporate.

2. "hi" — Hindi (Devanagari script)
   MUST sound like how an Indian friend texts you about a deal. NOT Google Translate.
   
   Cultural rules:
   - WhatsApp: Use natural Hinglish (mix of Hindi + English) since that's how Indians actually text: "Bhai jaldi!" not "भाई जल्दी करो"
   - Email/Push: Use Devanagari script but with colloquial tone
   - Use natural deal slang: "लूट लो" (grab it), "मत चूको" (don't miss), "पैसे वसूल" (money's worth), "धांसू डील" (killer deal), "बंपर बचत" (bumper savings), "फटाफट" (quickly)
   - Use "तुम/तू" (informal you) not "आप" (formal you) — this is a deal, not a government notice
   - For PayU: Keep it ultra-short in Hindi, consider Hinglish if natural
   
3. "te" — Telugu (Telugu script for Email/Push/Glance, transliterated Roman for WhatsApp)
   MUST use authentic Telugu expressions. Telugu deal culture is DIFFERENT from Hindi.
   
   Cultural rules:
   - WhatsApp: Use Telugu-English mix in Roman script (how Telugu speakers actually text): "Chudandi!" not "చూడండి!"
   - Email/Push: Use Telugu script with natural expressions
   - Telugu deal idioms (USE THESE): "అదిరిపోయే ఆఫర్" (mind-blowing offer), "మిస్ అవ్వకండి" (don't miss), "డబ్బు పూర్తిగా వసూల్" (full value for money), "బంపర్ ఆదా" (bumper savings), "అందరి ఛాయిస్" (everyone's choice)
   - Telugu urgency feels different from Hindi: use "ఇప్పుడు కాకపోతే ఎప్పుడూ కాదు" (now or never) not just a translation of "jaldi karo"
   - Telugu social proof: "అందరూ మాట్లాడుకుంటున్నారు" (everyone's talking about it), "లక్షలమంది నమ్ముతున్నారు" (lakhs trust this)

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
