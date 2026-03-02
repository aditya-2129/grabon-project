export type Channel = 'email' | 'whatsapp' | 'push' | 'glance' | 'payu' | 'instagram';
export type Variant = 'urgency' | 'value' | 'social_proof';
export type Language = 'en' | 'hi' | 'te';
export type DeliveryStatus = 'pending' | 'delivered' | 'failed';

export type CopyContent =
  | { type: 'email'; data: { subject: string; body_headline: string; cta: string } }
  | { type: 'whatsapp'; data: string }
  | { type: 'push'; data: { title: string; body: string } }
  | { type: 'glance'; data: string }
  | { type: 'payu'; data: string }
  | { type: 'instagram'; data: { caption: string; hashtags: string[] } };

export interface DeliveryEvent {
  id?: string;
  channel: Channel;
  variant: Variant;
  language: Language;
  status: DeliveryStatus;
  latencyMs: number;
  timestamp: string;
  error?: string;
  attempts: number;
  content?: CopyContent;
}

export interface ChannelStats {
  channel: Channel;
  delivered: number;
  failed: number;
  pending: number;
  total: number;
  avgLatency: number;
}

export interface DealInfo {
  merchant: string;
  category: string;
  discount: string;
}
