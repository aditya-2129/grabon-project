// ============================================================
// Template-Based Copy Generation
// Generates 54 copy variants using dynamic templates
// No external API key needed — works on all Claude plans
//
// Each variant uses a fundamentally different marketing angle:
//   urgency     → scarcity, countdown, FOMO, "last chance"
//   value       → ROI, savings math, "more for less"
//   social_proof → popularity, trending, community validation
//
// Hindi templates use natural colloquial deal language
// Telugu templates use culturally authentic Telugu idioms
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
  discountShort: string;  // shorter form for tight char limits
  minOrder: string;
  maxRedemptions: string;
  expiry: string;
  exclusive: boolean;
  language: Language;
}

function buildContext(deal: DealInput, language: Language): CopyContext {
  const discountMap: Record<Language, string> = {
    en: deal.discount_type === "percentage" ? `${deal.discount_value}% off` : `₹${deal.discount_value} off`,
    hi: deal.discount_type === "percentage" ? `${deal.discount_value}% छूट` : `₹${deal.discount_value} की छूट`,
    te: deal.discount_type === "percentage" ? `${deal.discount_value}% తగ్గింపు` : `₹${deal.discount_value} తగ్గింపు`,
  };

  const discountShortMap: Record<Language, string> = {
    en: deal.discount_type === "percentage" ? `${deal.discount_value}%` : `₹${deal.discount_value}`,
    hi: deal.discount_type === "percentage" ? `${deal.discount_value}%` : `₹${deal.discount_value}`,
    te: deal.discount_type === "percentage" ? `${deal.discount_value}%` : `₹${deal.discount_value}`,
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
    discountShort: discountShortMap[language],
    minOrder: `₹${deal.min_order_value}`,
    maxRedemptions: deal.max_redemptions.toLocaleString(),
    expiry: expiryMap[language],
    exclusive: deal.exclusive_flag,
    language,
  };
}

// ─── Email Generator ────────────────────────────────────────
// Urgency: Countdown pressure, scarcity, "running out"
// Value:   Savings math, ROI framing, "smart shopper"
// Social:  Community numbers, trending, "everyone's doing it"

function generateEmail(ctx: CopyContext, variant: Variant) {
  const templates: Record<Language, Record<Variant, { subject: string; body_headline: string; cta: string }>> = {
    en: {
      urgency: {
        subject: `⏰ ${ctx.expiry} is the deadline — ${ctx.discount} at ${ctx.merchant} vanishes after that`,
        body_headline: `The clock is ticking. ${ctx.discount} at ${ctx.merchant} expires on ${ctx.expiry} and there are only ${ctx.maxRedemptions} redemptions left. Once they're gone, this deal dies. Min order ${ctx.minOrder}.`,
        cta: "Claim Before It Expires →",
      },
      value: {
        subject: `Your ${ctx.category} order just got ${ctx.discount} cheaper at ${ctx.merchant}`,
        body_headline: `Here's the math: order ${ctx.minOrder}+ at ${ctx.merchant} and pocket ${ctx.discount} in savings. That's like getting part of your order free. ${ctx.exclusive ? "This deal is only on GrabOn — you won't find it anywhere else." : "The best value deal in " + ctx.category + " right now."}`,
        cta: "Start Saving →",
      },
      social_proof: {
        subject: `${ctx.maxRedemptions}+ people already grabbed this ${ctx.merchant} deal — here's why`,
        body_headline: `This isn't just a deal — it's a movement. ${ctx.maxRedemptions}+ shoppers have already used ${ctx.discount} at ${ctx.merchant}, making it the #1 trending offer in ${ctx.category}. ${ctx.exclusive ? "Exclusive to GrabOn." : "The crowd has spoken."}`,
        cta: "See What Everyone's Getting →",
      },
    },
    hi: {
      urgency: {
        subject: `⏰ ${ctx.expiry} के बाद गायब — ${ctx.merchant} पर ${ctx.discount} का आखिरी मौका`,
        body_headline: `बस कुछ ही घंटे बचे हैं! ${ctx.merchant} पर ${ctx.discount} सिर्फ ${ctx.expiry} तक है, और ${ctx.maxRedemptions} में से कुछ ही कोड बचे हैं। अभी नहीं तो कभी नहीं! मिनिमम ऑर्डर ${ctx.minOrder}।`,
        cta: "अभी लपक लो →",
      },
      value: {
        subject: `${ctx.merchant} पर ${ctx.discount} — पैसे वसूल गारंटी 💰`,
        body_headline: `खुद सोचो: ${ctx.minOrder} का ऑर्डर करो, ${ctx.discount} बचाओ। सीधा फायदा, कोई झमेला नहीं। ${ctx.category} में इससे बेहतर डील आज कहीं नहीं मिलेगी। ${ctx.exclusive ? "सिर्फ GrabOn पर — कहीं और ढूंढोगे तो निराशा मिलेगी।" : "बचत का सीधा रास्ता।"}`,
        cta: "बचत शुरू करो →",
      },
      social_proof: {
        subject: `🔥 ${ctx.maxRedemptions}+ लोगों ने लूटा — ${ctx.merchant} की सबसे हिट डील`,
        body_headline: `पूरा शहर इस डील के दीवाने है! ${ctx.maxRedemptions}+ लोगों ने ${ctx.merchant} पर ${ctx.discount} का फायदा उठाया है। ${ctx.category} में ये अभी नंबर 1 ट्रेंडिंग ऑफर है। ${ctx.exclusive ? "सिर्फ GrabOn पर Exclusive!" : "सब ले रहे हैं, तुम कब ले रहे हो?"}`,
        cta: "भीड़ में शामिल हो →",
      },
    },
    te: {
      urgency: {
        subject: `⏰ ${ctx.expiry} తర్వాత లేదు — ${ctx.merchant} లో ${ctx.discount} చివరి అవకాశం`,
        body_headline: `కొన్ని గంటలే మిగిలాయి! ${ctx.merchant} లో ${ctx.discount} ${ctx.expiry} వరకే. ${ctx.maxRedemptions} కోడ్‌లలో కొన్నే మిగిలాయి. ఇప్పుడు కాకపోతే ఎప్పుడూ కాదు! కనీస ఆర్డర్ ${ctx.minOrder}.`,
        cta: "ఇప్పుడే క్లెయిమ్ చేయండి →",
      },
      value: {
        subject: `${ctx.merchant} లో ${ctx.discount} — డబ్బు పూర్తిగా వసూల్ 💰`,
        body_headline: `లెక్క చూడండి: ${ctx.minOrder} ఆర్డర్ చేస్తే ${ctx.discount} ఆదా. నేరుగా మీ జేబులో డబ్బు. ${ctx.category} లో ఇంతకంటే మంచి డీల్ ఎక్కడా దొరకదు. ${ctx.exclusive ? "GrabOn లో మాత్రమే — వేరే చోట వెతికినా దొరకదు." : "ఈ రోజు బెస్ట్ డీల్."}`,
        cta: "ఆదా మొదలుపెట్టండి →",
      },
      social_proof: {
        subject: `🔥 ${ctx.maxRedemptions}+ మంది ఎంచుకున్నారు — ${ctx.merchant} హాటెస్ట్ డీల్`,
        body_headline: `అందరూ మాట్లాడుకుంటున్నారు! ${ctx.maxRedemptions}+ మంది ${ctx.merchant} లో ${ctx.discount} వాడుకున్నారు. ${ctx.category} లో ఇది నంబర్ 1 ట్రెండింగ్ ఆఫర్. ${ctx.exclusive ? "GrabOn Exclusive!" : "అందరూ తీసుకుంటున్నారు, మీరు ఎప్పుడు?"}`,
        cta: "మీరూ చేరండి →",
      },
    },
  };

  return templates[ctx.language][variant];
}

// ─── WhatsApp Generator (max 160 chars) ─────────────────────
// Urgency: "bro hurry" tone, countdown
// Value:   "check this out, you'll save X" tone
// Social:  "everyone's talking about it" tone

function generateWhatsApp(ctx: CopyContext, variant: Variant): string {
  const templates: Record<Language, Record<Variant, string>> = {
    en: {
      urgency: `🚨 ${ctx.merchant} deal dying soon! ${ctx.discount}, ends ${ctx.expiry}. Only ${ctx.maxRedemptions} left. Min ${ctx.minOrder} — GO NOW!`.slice(0, 160),
      value: `Hey! ${ctx.discount} at ${ctx.merchant} rn. Spend ${ctx.minOrder}+ and save big on ${ctx.category}. ${ctx.exclusive ? "GrabOn exclusive. " : ""}Legit best deal today 💰`.slice(0, 160),
      social_proof: `${ctx.maxRedemptions}+ already grabbed ${ctx.discount} at ${ctx.merchant}! Hottest ${ctx.category} deal rn 🔥 Min ${ctx.minOrder}. Don't be the last one!`.slice(0, 160),
    },
    hi: {
      urgency: `🚨 Bhai jaldi! ${ctx.merchant} pe ${ctx.discount}, ${ctx.expiry} tak hi hai. Sirf ${ctx.maxRedemptions} bache. ₹${ctx.minOrder} se order kar — ABHI!`.slice(0, 160),
      value: `Yaar ${ctx.merchant} pe ${ctx.discount} chal rahi hai! ${ctx.minOrder} ka order = seedha bachat 💰 ${ctx.category} mein aaj sabse sasta. ${ctx.exclusive ? "GrabOn pe hi hai." : ""}`.slice(0, 160),
      social_proof: `${ctx.maxRedemptions}+ logo ne loot liya! 🔥 ${ctx.merchant} pe ${ctx.discount}. ${ctx.category} ki sabse hot deal. ${ctx.minOrder} se. Tu bhi le le bhai!`.slice(0, 160),
    },
    te: {
      urgency: `🚨 Urgent! ${ctx.merchant} lo ${ctx.discount}, ${ctx.expiry} varake. ${ctx.maxRedemptions} matrame migili. ${ctx.minOrder} nundi — ippude order cheyandi!`.slice(0, 160),
      value: `Chudandi! ${ctx.merchant} lo ${ctx.discount} vasthundi 💰 ${ctx.minOrder} order chesthe super aada. ${ctx.category} lo ee roju best deal. ${ctx.exclusive ? "GrabOn lone!" : ""}`.slice(0, 160),
      social_proof: `${ctx.maxRedemptions}+ mandi vaadaru! 🔥 ${ctx.merchant} lo ${ctx.discount}. ${ctx.category} trending deal. ${ctx.minOrder} nundi. Meeru kuda try cheyandi!`.slice(0, 160),
    },
  };

  return templates[ctx.language][variant];
}

// ─── Push Notification Generator (title 50, body 100) ───────
// Urgency: Alarm tone, time pressure
// Value:   "look what you could save" tone
// Social:  "trending now" discovery tone

function generatePush(ctx: CopyContext, variant: Variant) {
  const templates: Record<Language, Record<Variant, { title: string; body: string }>> = {
    en: {
      urgency: {
        title: `⏰ ${ctx.merchant}: Ends ${ctx.expiry}!`.slice(0, 50),
        body: `${ctx.discount} vanishing soon. Only ${ctx.maxRedemptions} redemptions left. Min ${ctx.minOrder}. Now or never!`.slice(0, 100),
      },
      value: {
        title: `💰 ${ctx.discount} at ${ctx.merchant}`.slice(0, 50),
        body: `Spend ${ctx.minOrder}+ on ${ctx.category} and save instantly. Your smartest purchase today.`.slice(0, 100),
      },
      social_proof: {
        title: `🔥 Trending: ${ctx.merchant} deal`.slice(0, 50),
        body: `${ctx.maxRedemptions}+ people saved with ${ctx.discount}. #1 in ${ctx.category} right now. Join them!`.slice(0, 100),
      },
    },
    hi: {
      urgency: {
        title: `⏰ ${ctx.merchant}: ${ctx.expiry} तक!`.slice(0, 50),
        body: `${ctx.discount} खत्म होने वाली है! सिर्फ ${ctx.maxRedemptions} बचे। ${ctx.minOrder} से ऑर्डर — अभी लपको!`.slice(0, 100),
      },
      value: {
        title: `💰 ${ctx.merchant} पर ${ctx.discount}`.slice(0, 50),
        body: `${ctx.minOrder} खर्चो, ${ctx.discount} बचाओ। ${ctx.category} में आज की सबसे समझदार डील। पैसा वसूल!`.slice(0, 100),
      },
      social_proof: {
        title: `🔥 ट्रेंडिंग: ${ctx.merchant} डील`.slice(0, 50),
        body: `${ctx.maxRedemptions}+ लोगों ने ${ctx.discount} लूटा। ${ctx.category} में नंबर 1 डील। तुम भी ले लो!`.slice(0, 100),
      },
    },
    te: {
      urgency: {
        title: `⏰ ${ctx.merchant}: ${ctx.expiry} వరకే!`.slice(0, 50),
        body: `${ctx.discount} అయిపోతోంది! ${ctx.maxRedemptions} మాత్రమే మిగిలాయి. ${ctx.minOrder} నుండి. ఇప్పుడే తీసుకోండి!`.slice(0, 100),
      },
      value: {
        title: `💰 ${ctx.merchant} లో ${ctx.discount}`.slice(0, 50),
        body: `${ctx.minOrder} ఖర్చుపెట్టి, ${ctx.discount} ఆదా చేయండి. ${ctx.category} లో బెస్ట్ బార్గెయిన్. మిస్ అవ్వకండి!`.slice(0, 100),
      },
      social_proof: {
        title: `🔥 ట్రెండింగ్: ${ctx.merchant} డీల్`.slice(0, 50),
        body: `${ctx.maxRedemptions}+ మంది ${ctx.discount} వాడారు. ${ctx.category} నం.1 ఆఫర్. మీరూ చేరండి!`.slice(0, 100),
      },
    },
  };

  return templates[ctx.language][variant];
}

// ─── Glance Lock Screen Generator (max 160 chars) ───────────
// Must work WITHOUT any app context — straight to the deal
// Urgency: "running out" alarm
// Value:   "here's what you save" direct
// Social:  "X people already got this" validating

function generateGlance(ctx: CopyContext, variant: Variant): string {
  const templates: Record<Language, Record<Variant, string>> = {
    en: {
      urgency: `⏰ ${ctx.discount} at ${ctx.merchant} — only till ${ctx.expiry}! ${ctx.maxRedemptions} redemptions left. Orders above ${ctx.minOrder}. Claim now or lose it!`.slice(0, 160),
      value: `💰 Spend ${ctx.minOrder}+ at ${ctx.merchant}, get ${ctx.discount}. That's instant money back on ${ctx.category}. Best deal you'll see today!`.slice(0, 160),
      social_proof: `🔥 ${ctx.maxRedemptions}+ people used ${ctx.discount} at ${ctx.merchant}! #1 ${ctx.category} deal trending now. Min ${ctx.minOrder}. Tap to grab yours!`.slice(0, 160),
    },
    hi: {
      urgency: `⏰ ${ctx.merchant} पर ${ctx.discount} — ${ctx.expiry} तक ही! बस ${ctx.maxRedemptions} बचे। ${ctx.minOrder}+ ऑर्डर। फटाफट ले लो, मौका जा रहा है!`.slice(0, 160),
      value: `💰 ${ctx.minOrder} खर्चो ${ctx.merchant} पर, ${ctx.discount} बचाओ। ${ctx.category} में सबसे भारी बचत। ऐसी डील रोज़ नहीं मिलती!`.slice(0, 160),
      social_proof: `🔥 ${ctx.maxRedemptions}+ लोगों की पसंद! ${ctx.merchant} पर ${ctx.discount}। ${ctx.category} की धांसू ट्रेंडिंग डील। ${ctx.minOrder} से। टैप करो!`.slice(0, 160),
    },
    te: {
      urgency: `⏰ ${ctx.merchant} లో ${ctx.discount} — ${ctx.expiry} వరకే! ${ctx.maxRedemptions} మిగిలాయి. ${ctx.minOrder}+. ఇప్పుడు తీసుకోండి, లేకపోతే పోతుంది!`.slice(0, 160),
      value: `💰 ${ctx.minOrder} ఖర్చుపెట్టి ${ctx.merchant} లో ${ctx.discount} ఆదా. ${ctx.category} లో నేటి బెస్ట్ డీల్. ఇలాంటిది రోజూ రాదు!`.slice(0, 160),
      social_proof: `🔥 ${ctx.maxRedemptions}+ మందికి నచ్చింది! ${ctx.merchant} లో ${ctx.discount}. ${ctx.category} టాప్ ట్రెండింగ్ డీల్. ${ctx.minOrder} నుండి. ట్యాప్ చేయండి!`.slice(0, 160),
    },
  };

  return templates[ctx.language][variant];
}

// ─── PayU Checkout Banner Generator (max 40 chars) ──────────
// User is MID-CHECKOUT — every word must drive conversion
// Urgency: "last chance to apply"
// Value:   "save X on this order"
// Social:  "popular code / top choice"

function generatePayU(ctx: CopyContext, variant: Variant): string {
  const templates: Record<Language, Record<Variant, string>> = {
    en: {
      urgency: `⏰ Apply ${ctx.discountShort} off — ending!`.slice(0, 40),
      value: `💰 Save ${ctx.discountShort} on this order`.slice(0, 40),
      social_proof: `🔥 Most used: ${ctx.discountShort} off!`.slice(0, 40),
    },
    hi: {
      urgency: `⏰ जल्दी! ${ctx.discountShort} छूट लगाओ`.slice(0, 40),
      value: `💰 इस ऑर्डर पर ${ctx.discountShort} बचाओ`.slice(0, 40),
      social_proof: `🔥 सबकी पसंद: ${ctx.discountShort} छूट`.slice(0, 40),
    },
    te: {
      urgency: `⏰ ఇప్పుడే! ${ctx.discountShort} తగ్గింపు`.slice(0, 40),
      value: `💰 ఈ ఆర్డర్‌పై ${ctx.discountShort} ఆదా`.slice(0, 40),
      social_proof: `🔥 అందరి ఛాయిస్: ${ctx.discountShort}`.slice(0, 40),
    },
  };

  return templates[ctx.language][variant];
}

// ─── Instagram Caption Generator ────────────────────────────
// Urgency: FOMO storytelling, "don't scroll past this"
// Value:   Math/savings angle, "your wallet is smiling"
// Social:  Community/crowd excitement, "everyone's sharing"

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
      urgency: `🚨 STOP SCROLLING. This won't last.\n\n${ctx.discount} at ${ctx.merchant} — but here's the catch: it expires ${ctx.expiry} and only ${ctx.maxRedemptions} people can grab it.\n\nMin order ${ctx.minOrder}. Once it's gone, it's gone.\n\n${ctx.exclusive ? "🔒 Only on GrabOn — you won't find this deal anywhere else.\n\n" : ""}Set a reminder, screenshot this, do whatever — just don't miss it.\n\n👆 Link in bio to claim.`,
      value: `Let's talk savings 💰\n\n${ctx.discount} at ${ctx.merchant} on ${ctx.category}. Order ${ctx.minOrder}+ and the discount hits instantly.\n\nThat's real money back in your pocket. No catch, no strings.\n\n${ctx.exclusive ? "🔒 This one's a GrabOn exclusive — you literally can't get this anywhere else.\n\n" : ""}Your future self will thank you. Link in bio! 🔗`,
      social_proof: `Something's happening at ${ctx.merchant} 🔥\n\n${ctx.maxRedemptions}+ people have already grabbed ${ctx.discount} — making it the most popular ${ctx.category} deal on the internet right now.\n\nMin order ${ctx.minOrder}.\n\n${ctx.exclusive ? "🔒 GrabOn Exclusive deal.\n\n" : ""}When this many people jump on a deal, you know it's legit. Don't be the friend who missed it.\n\n👆 Tap the link in bio.`,
    },
    hi: {
      urgency: `🚨 रुको, ये देख लो। फिर स्क्रॉल करना।\n\n${ctx.merchant} पर ${ctx.discount} — पर सुनो: ${ctx.expiry} के बाद खत्म हो जाएगी, और सिर्फ ${ctx.maxRedemptions} लोगों के लिए है।\n\nमिन ऑर्डर ${ctx.minOrder}। एक बार गई तो गई।\n\n${ctx.exclusive ? "🔒 सिर्फ GrabOn पर — बाकी कहीं नहीं मिलेगी।\n\n" : ""}Screenshot मार लो, reminder लगा लो — बस छूटने मत देना!\n\n👆 Bio में link से लो।`,
      value: `बचत की बात करें? 💰\n\n${ctx.merchant} पर ${ctx.discount} — ${ctx.category} में। ${ctx.minOrder}+ का ऑर्डर करो, डिस्काउंट तुरंत लगेगा।\n\nसीधा पैसा वापस। कोई चक्कर नहीं।\n\n${ctx.exclusive ? "🔒 GrabOn Exclusive — और कहीं ढूंढो, मिलेगी नहीं।\n\n" : ""}समझदार वही जो बचाके खर्च करे। Bio में link! 🔗`,
      social_proof: `${ctx.merchant} पर कुछ मचा हुआ है 🔥\n\n${ctx.maxRedemptions}+ लोगों ने ${ctx.discount} ले ली — ${ctx.category} में अभी इंटरनेट पर सबसे हिट डील यही है।\n\nमिनिमम ${ctx.minOrder}।\n\n${ctx.exclusive ? "🔒 GrabOn Exclusive!\n\n" : ""}इतने लोग ले रहे हैं तो कुछ बात तो है। वो दोस्त मत बनो जिसने मिस कर दिया!\n\n👆 Bio में link से grabbing शुरू करो।`,
    },
    te: {
      urgency: `🚨 ఆగండి, ఇది చూడండి. తర్వాత scroll చేయండి.\n\n${ctx.merchant} లో ${ctx.discount} — కానీ వినండి: ${ctx.expiry} తర్వాత లేదు, ${ctx.maxRedemptions} మందికి మాత్రమే.\n\nకనీస ఆర్డర్ ${ctx.minOrder}. ఒకసారి అయిపోతే మళ్ళీ రాదు.\n\n${ctx.exclusive ? "🔒 GrabOn లో మాత్రమే — వేరే ఎక్కడా దొరకదు.\n\n" : ""}Screenshot తీసి పెట్టుకోండి — miss అవ్వకండి!\n\n👆 Bio లో link నుండి claim చేయండి.`,
      value: `ఆదా గురించి మాట్లాడదాం 💰\n\n${ctx.merchant} లో ${ctx.discount} — ${ctx.category} పై. ${ctx.minOrder}+ ఆర్డర్ చేస్తే డిస్కౌంట్ వెంటనే వచ్చేస్తుంది.\n\nనేరుగా మీ జేబులో డబ్బు. ఏ కండీషన్ లేదు.\n\n${ctx.exclusive ? "🔒 GrabOn Exclusive — వేరే చోట వెతికినా కనపడదు.\n\n" : ""}తెలివిగా ఖర్చు చేసేవాళ్ళకి ఇది. Bio లో link! 🔗`,
      social_proof: `${ctx.merchant} లో ఏదో జరుగుతోంది 🔥\n\n${ctx.maxRedemptions}+ మంది ${ctx.discount} తీసుకున్నారు — ${ctx.category} లో ఇప్పుడు ఇంటర్నెట్ లో అత్యంత పాపులర్ డీల్ ఇదే.\n\nకనీసం ${ctx.minOrder}.\n\n${ctx.exclusive ? "🔒 GrabOn Exclusive!\n\n" : ""}ఇంతమంది తీసుకుంటుంటే ఏదో ఉంది. Miss చేసిన ఫ్రెండ్ అవ్వకండి!\n\n👆 Bio లో link ట్యాప్ చేయండి.`,
    },
  };

  return {
    caption: templates[ctx.language][variant],
    hashtags,
  };
}
