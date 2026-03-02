// ============================================================
// Type Definitions for GrabOn Deal Distribution MCP Server
// ============================================================

/** The 6 distribution channels */
export const CHANNELS = [
  "email",
  "whatsapp",
  "push",
  "glance",
  "payu",
  "instagram",
] as const;
export type Channel = (typeof CHANNELS)[number];

/** A/B testing variant strategies */
export const VARIANTS = ["urgency", "value", "social_proof"] as const;
export type Variant = (typeof VARIANTS)[number];

/** Supported localization languages */
export const LANGUAGES = ["en", "hi", "te"] as const;
export type Language = (typeof LANGUAGES)[number];

/** Discount type for deals */
export type DiscountType = "percentage" | "flat";

/** Input deal payload from the merchant */
export interface DealInput {
  merchant_id: string;
  category: string;
  discount_value: number;
  discount_type: DiscountType;
  expiry_timestamp: string;
  min_order_value: number;
  max_redemptions: number;
  exclusive_flag: boolean;
}

/** Email-specific copy fields */
export interface EmailCopy {
  subject: string;
  body_headline: string;
  cta: string;
}

/** Push notification copy fields */
export interface PushCopy {
  title: string; // max 50 chars
  body: string; // max 100 chars
}

/** Instagram-specific copy fields */
export interface InstagramCopy {
  caption: string;
  hashtags: string[];
}

/**
 * A single generated copy variant.
 * Channel-specific fields are stored in `content`.
 */
export interface ChannelCopy {
  channel: Channel;
  variant: Variant;
  language: Language;
  content:
    | { type: "email"; data: EmailCopy }
    | { type: "whatsapp"; data: string } // max 160 chars
    | { type: "push"; data: PushCopy }
    | { type: "glance"; data: string } // max 160 chars, standalone
    | { type: "payu"; data: string } // max 40 chars, action-oriented
    | { type: "instagram"; data: InstagramCopy };
}

/** Delivery status from webhook simulation */
export type DeliveryStatus = "delivered" | "failed" | "pending";

/** Result of delivering a single copy to a webhook */
export interface DeliveryResult {
  channel: Channel;
  variant: Variant;
  language: Language;
  status: DeliveryStatus;
  attempts: number;
  timestamp: string;
  retryLog: RetryLogEntry[];
}

/** Individual retry attempt log */
export interface RetryLogEntry {
  attempt: number;
  status: DeliveryStatus;
  timestamp: string;
  latencyMs: number;
}

/** Channel format constraints for reference */
export const CHANNEL_CONSTRAINTS: Record<
  Channel,
  { description: string; maxLength?: number }
> = {
  email: {
    description: "HTML snippet with subject line + body headline + CTA button",
  },
  whatsapp: {
    description: "Plain text message",
    maxLength: 160,
  },
  push: {
    description: "Title (max 50 chars) + Body (max 100 chars)",
  },
  glance: {
    description: "Lock screen card, must work without context",
    maxLength: 160,
  },
  payu: {
    description: "Checkout banner, action-oriented",
    maxLength: 40,
  },
  instagram: {
    description: "Caption with relevant hashtags",
  },
};
