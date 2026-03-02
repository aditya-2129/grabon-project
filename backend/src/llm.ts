// ============================================================
// Template-Based Copy Generation
// Generates 54 copy variants using dynamic templates
// No external API key needed — works on all Claude plans
// ============================================================

import type { DealInput, ChannelCopy, Channel, Variant, Language } from "./types.js";
import { CHANNELS, VARIANTS, LANGUAGES } from "./types.js";

/**
 * Generate all 54 deal copy variants using dynamic templates.
 * 6 channels × 3 A/B variants × 3 languages = 54 total outputs.
 */
export function generateDealCopies(deal: DealInput): ChannelCopy[] {
  const copies: ChannelCopy[] = [];

  for (const channel of CHANNELS) {
    for (const variant of VARIANTS) {
      for (const language of LANGUAGES) {
        copies.push(generateCopy(deal, channel, variant, language));
      }
    }
  }

  console.error(`[Generator] Created ${copies.length} copy variants`);
  return copies;
}

function generateCopy(
  deal: DealInput,
  channel: Channel,
  variant: Variant,
  language: Language
): ChannelCopy {
  const ctx = buildContext(deal, language);

  switch (channel) {
    case "email":
      return {
        channel, variant, language,
        content: {
          type: "email",
          data: generateEmail(ctx, variant),
        },
      };
    case "whatsapp":
      return {
        channel, variant, language,
        content: {
          type: "whatsapp",
          data: generateWhatsApp(ctx, variant),
        },
      };
    case "push":
      return {
        channel, variant, language,
        content: {
          type: "push",
          data: generatePush(ctx, variant),
        },
      };
    case "glance":
      return {
        channel, variant, language,
        content: {
          type: "glance",
          data: generateGlance(ctx, variant),
        },
      };
    case "payu":
      return {
        channel, variant, language,
        content: {
          type: "payu",
          data: generatePayU(ctx, variant),
        },
      };
    case "instagram":
      return {
        channel, variant, language,
        content: {
          type: "instagram",
          data: generateInstagram(ctx, variant),
        },
      };
  }
}

// ─── Context Builder ────────────────────────────────────────

interface CopyContext {
  merchant: string;
  category: string;
  discount: string;
  minOrder: string;
  maxRedemptions: string;
  expiry: string;
  exclusive: boolean;
  language: Language;
}

function buildContext(deal: DealInput, language: Language): CopyContext {
  const discountMap: Record<Language, string> = {
    en: deal.discount_type === "percentage" ? `${deal.discount_value}% off` : `₹${deal.discount_value} off`,
    hi: deal.discount_type === "percentage" ? `${deal.discount_value}% की छूट` : `₹${deal.discount_value} की छूट`,
    te: deal.discount_type === "percentage" ? `${deal.discount_value}% తగ్గింపు` : `₹${deal.discount_value} తగ్గింపు`,
  };

  const expiryDate = new Date(deal.expiry_timestamp);
  const expiryMap: Record<Language, string> = {
    en: expiryDate.toLocaleDateString("en-IN", { dateStyle: "medium" }),
    hi: expiryDate.toLocaleDateString("hi-IN", { dateStyle: "medium" }),
    te: expiryDate.toLocaleDateString("te-IN", { dateStyle: "medium" }),
  };

  return {
    merchant: deal.merchant_id,
    category: deal.category,
    discount: discountMap[language],
    minOrder: `₹${deal.min_order_value}`,
    maxRedemptions: deal.max_redemptions.toLocaleString(),
    expiry: expiryMap[language],
    exclusive: deal.exclusive_flag,
    language,
  };
}

// ─── Email Generator ────────────────────────────────────────

function generateEmail(ctx: CopyContext, variant: Variant) {
  const templates: Record<Language, Record<Variant, { subject: string; body_headline: string; cta: string }>> = {
    en: {
      urgency: {
        subject: `⏰ EXPIRING SOON: ${ctx.discount} at ${ctx.merchant}!`,
        body_headline: `Only hours left! Grab ${ctx.discount} on ${ctx.merchant} before ${ctx.expiry}. Don't let this deal slip away!`,
        cta: "Grab Deal Now →",
      },
      value: {
        subject: `💰 Save Big: ${ctx.discount} at ${ctx.merchant}`,
        body_headline: `Unlock incredible savings with ${ctx.discount} on ${ctx.merchant}. Min order just ${ctx.minOrder} — maximum value, minimum spend!`,
        cta: "Save Now →",
      },
      social_proof: {
        subject: `🔥 ${ctx.maxRedemptions}+ people are saving at ${ctx.merchant}!`,
        body_headline: `Join thousands who are already saving with ${ctx.discount} at ${ctx.merchant}. This is the most popular deal in ${ctx.category} right now!`,
        cta: "Join the Savings →",
      },
    },
    hi: {
      urgency: {
        subject: `⏰ जल्दी करो! ${ctx.merchant} पर ${ctx.discount} — सीमित समय!`,
        body_headline: `मत चूको! ${ctx.merchant} पर ${ctx.discount} पाओ, ${ctx.expiry} से पहले। यह मौका दोबारा नहीं आएगा!`,
        cta: "अभी लूट लो →",
      },
      value: {
        subject: `💰 बंपर बचत: ${ctx.merchant} पर ${ctx.discount}`,
        body_headline: `${ctx.merchant} पर ${ctx.discount} — सिर्फ ${ctx.minOrder} का ऑर्डर करो और जमकर बचाओ! पैसे वसूल डील!`,
        cta: "बचत करो →",
      },
      social_proof: {
        subject: `🔥 ${ctx.maxRedemptions}+ लोग ${ctx.merchant} पर बचा रहे हैं!`,
        body_headline: `${ctx.category} की सबसे हिट डील! हज़ारों लोग ${ctx.merchant} पर ${ctx.discount} का फायदा उठा रहे हैं। तुम भी जुड़ो!`,
        cta: "डील पाओ →",
      },
    },
    te: {
      urgency: {
        subject: `⏰ త్వరగా! ${ctx.merchant} పై ${ctx.discount} — సమయం అయిపోతోంది!`,
        body_headline: `మిస్ అవ్వకండి! ${ctx.merchant} పై ${ctx.discount} ${ctx.expiry} లోపు. ఈ అవకాశం మళ్ళీ రాదు!`,
        cta: "ఇప్పుడే పొందండి →",
      },
      value: {
        subject: `💰 భారీ ఆదా: ${ctx.merchant} పై ${ctx.discount}`,
        body_headline: `${ctx.merchant} పై ${ctx.discount} — కనీసం ${ctx.minOrder} ఆర్డర్ చేయండి, గరిష్ట ఆదా పొందండి! అదిరిపోయే ఆఫర్!`,
        cta: "ఆదా చేయండి →",
      },
      social_proof: {
        subject: `🔥 ${ctx.maxRedemptions}+ మంది ${ctx.merchant} లో ఆదా చేస్తున్నారు!`,
        body_headline: `${ctx.category} లో అత్యంత ప్రజాదరణ పొందిన డీల్! వేలమంది ${ctx.merchant} పై ${ctx.discount} వాడుతున్నారు. మీరూ చేరండి!`,
        cta: "డీల్ పొందండి →",
      },
    },
  };

  return templates[ctx.language][variant];
}

// ─── WhatsApp Generator (max 160 chars) ─────────────────────

function generateWhatsApp(ctx: CopyContext, variant: Variant): string {
  const templates: Record<Language, Record<Variant, string>> = {
    en: {
      urgency: `🚨 ${ctx.merchant}: ${ctx.discount}! Expires ${ctx.expiry}. Min order ${ctx.minOrder}. Grab it before it's gone! ${ctx.exclusive ? "GrabOn Exclusive!" : ""}`.slice(0, 160),
      value: `💰 ${ctx.merchant} deal: ${ctx.discount} on orders over ${ctx.minOrder}. Best ${ctx.category} deal! ${ctx.exclusive ? "Only on GrabOn." : ""}`.slice(0, 160),
      social_proof: `🔥 Trending: ${ctx.maxRedemptions}+ grabbed ${ctx.discount} at ${ctx.merchant}! Min ${ctx.minOrder}. ${ctx.exclusive ? "GrabOn Exclusive!" : "Join now!"}`.slice(0, 160),
    },
    hi: {
      urgency: `🚨 ${ctx.merchant}: ${ctx.discount}! ${ctx.expiry} तक। मिनिमम ${ctx.minOrder}। जल्दी करो, मत चूको! ${ctx.exclusive ? "सिर्फ GrabOn पर!" : ""}`.slice(0, 160),
      value: `💰 ${ctx.merchant}: ${ctx.discount}! ${ctx.minOrder} से ऑर्डर करो, खूब बचाओ! ${ctx.category} की बेस्ट डील! ${ctx.exclusive ? "GrabOn Exclusive!" : ""}`.slice(0, 160),
      social_proof: `🔥 ${ctx.maxRedemptions}+ लोगों ने लूटा! ${ctx.merchant} पर ${ctx.discount}। ${ctx.minOrder} से ऑर्डर करो। ${ctx.exclusive ? "सिर्फ GrabOn!" : ""}`.slice(0, 160),
    },
    te: {
      urgency: `🚨 ${ctx.merchant}: ${ctx.discount}! ${ctx.expiry} వరకు. కనీసం ${ctx.minOrder}. మిస్ అవ్వకండి! ${ctx.exclusive ? "GrabOn Exclusive!" : ""}`.slice(0, 160),
      value: `💰 ${ctx.merchant}: ${ctx.discount}! ${ctx.minOrder} నుండి ఆర్డర్ చేయండి. ${ctx.category} బెస్ట్ డీల్! ${ctx.exclusive ? "GrabOn మాత్రమే!" : ""}`.slice(0, 160),
      social_proof: `🔥 ${ctx.maxRedemptions}+ మంది వాడారు! ${ctx.merchant} పై ${ctx.discount}. ${ctx.minOrder} నుండి. ${ctx.exclusive ? "GrabOn Exclusive!" : ""}`.slice(0, 160),
    },
  };

  return templates[ctx.language][variant];
}

// ─── Push Notification Generator (title 50, body 100) ───────

function generatePush(ctx: CopyContext, variant: Variant) {
  const templates: Record<Language, Record<Variant, { title: string; body: string }>> = {
    en: {
      urgency: {
        title: `⏰ ${ctx.merchant}: ${ctx.discount} — Hurry!`.slice(0, 50),
        body: `Expires ${ctx.expiry}! Don't miss ${ctx.discount} at ${ctx.merchant}. Min order ${ctx.minOrder}. Grab it now!`.slice(0, 100),
      },
      value: {
        title: `💰 ${ctx.discount} at ${ctx.merchant}!`.slice(0, 50),
        body: `Save big on ${ctx.category}! ${ctx.discount} on orders above ${ctx.minOrder}. Best deal of the day!`.slice(0, 100),
      },
      social_proof: {
        title: `🔥 ${ctx.merchant} deal is trending!`.slice(0, 50),
        body: `${ctx.maxRedemptions}+ people grabbed ${ctx.discount}. Min order ${ctx.minOrder}. Join the crowd!`.slice(0, 100),
      },
    },
    hi: {
      urgency: {
        title: `⏰ ${ctx.merchant}: ${ctx.discount} — जल्दी!`.slice(0, 50),
        body: `${ctx.expiry} तक! ${ctx.merchant} पर ${ctx.discount} मत चूको। मिनिमम ${ctx.minOrder}।`.slice(0, 100),
      },
      value: {
        title: `💰 ${ctx.merchant} पर ${ctx.discount}!`.slice(0, 50),
        body: `${ctx.category} की बेस्ट डील! ${ctx.minOrder} से ऑर्डर पर ${ctx.discount}। पैसे वसूल!`.slice(0, 100),
      },
      social_proof: {
        title: `🔥 ${ctx.merchant} डील ट्रेंडिंग!`.slice(0, 50),
        body: `${ctx.maxRedemptions}+ लोगों ने लूटा! ${ctx.discount}। मिनिमम ${ctx.minOrder}। तुम भी जुड़ो!`.slice(0, 100),
      },
    },
    te: {
      urgency: {
        title: `⏰ ${ctx.merchant}: ${ctx.discount} — త్వరగా!`.slice(0, 50),
        body: `${ctx.expiry} వరకు! ${ctx.merchant} పై ${ctx.discount} మిస్ అవ్వకండి. కనీసం ${ctx.minOrder}.`.slice(0, 100),
      },
      value: {
        title: `💰 ${ctx.merchant} పై ${ctx.discount}!`.slice(0, 50),
        body: `${ctx.category} బెస్ట్ డీల్! ${ctx.minOrder} నుండి ఆర్డర్ పై ${ctx.discount}. అదిరిపోయే ఆఫర్!`.slice(0, 100),
      },
      social_proof: {
        title: `🔥 ${ctx.merchant} డీల్ ట్రెండింగ్!`.slice(0, 50),
        body: `${ctx.maxRedemptions}+ మంది వాడారు! ${ctx.discount}. కనీసం ${ctx.minOrder}. మీరూ చేరండి!`.slice(0, 100),
      },
    },
  };

  return templates[ctx.language][variant];
}

// ─── Glance Lock Screen Generator (max 160 chars) ───────────

function generateGlance(ctx: CopyContext, variant: Variant): string {
  const templates: Record<Language, Record<Variant, string>> = {
    en: {
      urgency: `⏰ ${ctx.discount} at ${ctx.merchant} — ending ${ctx.expiry}! Min ${ctx.minOrder}. Last chance to save on ${ctx.category}!`.slice(0, 160),
      value: `💰 ${ctx.discount} at ${ctx.merchant}! Orders above ${ctx.minOrder}. Your best ${ctx.category} deal today. Tap to save big!`.slice(0, 160),
      social_proof: `🔥 ${ctx.maxRedemptions}+ grabbed ${ctx.discount} at ${ctx.merchant}! Min ${ctx.minOrder}. The hottest ${ctx.category} deal right now!`.slice(0, 160),
    },
    hi: {
      urgency: `⏰ ${ctx.merchant} पर ${ctx.discount} — ${ctx.expiry} तक! ${ctx.minOrder} से ऑर्डर करो। आखिरी मौका, मत चूको!`.slice(0, 160),
      value: `💰 ${ctx.merchant}: ${ctx.discount}! ${ctx.minOrder} से ऑर्डर पर। ${ctx.category} की धांसू डील। टैप करो, बचाओ!`.slice(0, 160),
      social_proof: `🔥 ${ctx.maxRedemptions}+ लोगों ने लूटा! ${ctx.merchant} पर ${ctx.discount}। ${ctx.minOrder} से। सबसे हॉट ${ctx.category} डील!`.slice(0, 160),
    },
    te: {
      urgency: `⏰ ${ctx.merchant} పై ${ctx.discount} — ${ctx.expiry} వరకు! ${ctx.minOrder} నుండి. ఆఖరి అవకాశం, మిస్ అవ్వకండి!`.slice(0, 160),
      value: `💰 ${ctx.merchant}: ${ctx.discount}! ${ctx.minOrder} నుండి ఆర్డర్. ${ctx.category} బెస్ట్ డీల్. ట్యాప్ చేయండి!`.slice(0, 160),
      social_proof: `🔥 ${ctx.maxRedemptions}+ మంది వాడారు! ${ctx.merchant} పై ${ctx.discount}. ${ctx.minOrder} నుండి. హాటెస్ట్ డీల్!`.slice(0, 160),
    },
  };

  return templates[ctx.language][variant];
}

// ─── PayU Checkout Banner Generator (max 40 chars) ──────────

function generatePayU(ctx: CopyContext, variant: Variant): string {
  const templates: Record<Language, Record<Variant, string>> = {
    en: {
      urgency: `⏰ Apply ${ctx.discount} now!`.slice(0, 40),
      value: `💰 Save ${ctx.discount} today!`.slice(0, 40),
      social_proof: `🔥 ${ctx.discount} — top deal!`.slice(0, 40),
    },
    hi: {
      urgency: `⏰ अभी ${ctx.discount} लगाओ!`.slice(0, 40),
      value: `💰 ${ctx.discount} बचाओ आज!`.slice(0, 40),
      social_proof: `🔥 ${ctx.discount} — हिट डील!`.slice(0, 40),
    },
    te: {
      urgency: `⏰ ఇప్పుడే ${ctx.discount}!`.slice(0, 40),
      value: `💰 ${ctx.discount} ఆదా!`.slice(0, 40),
      social_proof: `🔥 ${ctx.discount} — టాప్ డీల్!`.slice(0, 40),
    },
  };

  return templates[ctx.language][variant];
}

// ─── Instagram Caption Generator ────────────────────────────

function generateInstagram(ctx: CopyContext, variant: Variant) {
  const categoryHashtags: Record<string, string[]> = {
    Food: ["#FoodDeals", "#FoodLovers", "#Foodie", "#OrderNow", "#FoodSavings"],
    "Fashion & Beauty": ["#FashionDeals", "#StyleSale", "#BeautySavings", "#OOTD", "#FashionFinds"],
    Travel: ["#TravelDeals", "#Wanderlust", "#TravelSavings", "#Vacation", "#TravelIndia"],
    Electronics: ["#TechDeals", "#GadgetSale", "#ElectronicsSale", "#TechSavings", "#BestPrice"],
    Health: ["#HealthDeals", "#WellnessSale", "#HealthySavings", "#SelfCare", "#HealthFirst"],
  };

  const baseTags = categoryHashtags[ctx.category] ?? ["#Deals", "#Savings", "#BestPrice", "#Shopping", "#Offers"];
  const extraTags = ["#GrabOn", `#${ctx.merchant.replace(/\s+/g, "")}`, "#DealOfTheDay"];
  const hashtags = [...baseTags, ...extraTags].slice(0, 8);

  const templates: Record<Language, Record<Variant, string>> = {
    en: {
      urgency: `🚨 DEAL ALERT! ${ctx.discount} at ${ctx.merchant} — but the clock is ticking! ⏰ Expires ${ctx.expiry}. Min order ${ctx.minOrder}. Don't wait, this ${ctx.category} deal won't last! ${ctx.exclusive ? "🔒 Exclusive to GrabOn!" : ""} Tap the link in bio to grab it! 👆`,
      value: `💰 Your wallet will thank you! ${ctx.discount} at ${ctx.merchant} on ${ctx.category}. Just order above ${ctx.minOrder} and watch the savings roll in! ${ctx.exclusive ? "🔒 Only on GrabOn!" : ""} Best deal you'll find today. Link in bio! 🔗`,
      social_proof: `🔥 TRENDING NOW! ${ctx.maxRedemptions}+ smart shoppers already grabbed ${ctx.discount} at ${ctx.merchant}! The most popular ${ctx.category} deal on GrabOn right now. Min order ${ctx.minOrder}. ${ctx.exclusive ? "🔒 GrabOn Exclusive!" : ""} Don't be the last one — link in bio! 👆`,
    },
    hi: {
      urgency: `🚨 डील अलर्ट! ${ctx.merchant} पर ${ctx.discount} — लेकिन वक़्त कम है! ⏰ ${ctx.expiry} तक। मिनिमम ${ctx.minOrder}। ${ctx.category} की यह डील जल्दी खत्म हो जाएगी! ${ctx.exclusive ? "🔒 सिर्फ GrabOn पर!" : ""} बायो में लिंक से लूट लो! 👆`,
      value: `💰 बंपर बचत! ${ctx.merchant} पर ${ctx.discount} — ${ctx.category} में। बस ${ctx.minOrder} से ऊपर ऑर्डर करो! ${ctx.exclusive ? "🔒 GrabOn Exclusive!" : ""} आज की सबसे पैसे वसूल डील। लिंक बायो में! 🔗`,
      social_proof: `🔥 ट्रेंडिंग! ${ctx.maxRedemptions}+ लोगों ने ${ctx.merchant} पर ${ctx.discount} लूट लिया! GrabOn पर ${ctx.category} की सबसे हिट डील। मिनिमम ${ctx.minOrder}। ${ctx.exclusive ? "🔒 GrabOn Exclusive!" : ""} बायो में लिंक! 👆`,
    },
    te: {
      urgency: `🚨 డీల్ అలర్ట్! ${ctx.merchant} పై ${ctx.discount} — సమయం తక్కువ! ⏰ ${ctx.expiry} వరకు. కనీసం ${ctx.minOrder}. ${ctx.category} డీల్ త్వరగా అయిపోతుంది! ${ctx.exclusive ? "🔒 GrabOn Exclusive!" : ""} బయోలో లింక్ ట్యాప్ చేయండి! 👆`,
      value: `💰 భారీ ఆదా! ${ctx.merchant} పై ${ctx.discount} — ${ctx.category} లో. ${ctx.minOrder} నుండి ఆర్డర్ చేయండి! ${ctx.exclusive ? "🔒 GrabOn మాత్రమే!" : ""} ఈ రోజు బెస్ట్ డీల్. బయోలో లింక్! 🔗`,
      social_proof: `🔥 ట్రెండింగ్! ${ctx.maxRedemptions}+ మంది ${ctx.merchant} పై ${ctx.discount} వాడారు! GrabOn లో ${ctx.category} హాటెస్ట్ డీల్. కనీసం ${ctx.minOrder}. ${ctx.exclusive ? "🔒 GrabOn Exclusive!" : ""} బయోలో లింక్! 👆`,
    },
  };

  return {
    caption: templates[ctx.language][variant],
    hashtags,
  };
}
