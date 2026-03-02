// ============================================================
// Output Formatter
// Formats delivery simulation results into readable Markdown
// ============================================================

import type { DeliveryResult } from "./types.js";
import { CHANNELS } from "./types.js";

interface DealSummary {
  merchant: string;
  category: string;
  discount: string;
}

/**
 * Format delivery simulation results into a Markdown string.
 */
export function formatDeliveryResults(
  deal: DealSummary,
  totalCopies: number,
  deliveryResults: DeliveryResult[]
): string {
  const sections: string[] = [];

  // Header
  sections.push(`# � Webhook Delivery Simulation Results`);
  sections.push(``);
  sections.push(
    `**Merchant:** ${deal.merchant} | **Category:** ${deal.category} | **Discount:** ${deal.discount}`
  );
  sections.push(``);

  // Overall stats
  const delivered = deliveryResults.filter(
    (r) => r.status === "delivered"
  ).length;
  const failed = deliveryResults.filter((r) => r.status === "failed").length;
  const pending = deliveryResults.filter((r) => r.status === "pending").length;
  const total = deliveryResults.length;
  const successRate =
    total > 0 ? ((delivered / total) * 100).toFixed(1) : "0";

  sections.push(`## Overall Summary`);
  sections.push(``);
  sections.push(`| Metric | Value |`);
  sections.push(`|--------|-------|`);
  sections.push(`| Total Copies Delivered | ${total} / ${totalCopies} |`);
  sections.push(`| ✅ Delivered | ${delivered} |`);
  sections.push(`| ❌ Failed | ${failed} |`);
  sections.push(`| ⏳ Pending | ${pending} |`);
  sections.push(`| **Success Rate** | **${successRate}%** |`);
  sections.push(``);

  // Per-channel breakdown
  sections.push(`## Per-Channel Breakdown`);
  sections.push(``);
  sections.push(
    `| Channel | Delivered | Failed | Pending | Success Rate |`
  );
  sections.push(
    `|---------|-----------|--------|---------|--------------|`
  );

  const channelEmojis: Record<string, string> = {
    email: "📧",
    whatsapp: "💬",
    push: "🔔",
    glance: "📱",
    payu: "💳",
    instagram: "📸",
  };

  const channelNames: Record<string, string> = {
    email: "Email",
    whatsapp: "WhatsApp",
    push: "Push Notification",
    glance: "Glance Lock Screen",
    payu: "PayU Checkout",
    instagram: "Instagram",
  };

  for (const channel of CHANNELS) {
    const channelResults = deliveryResults.filter(
      (r) => r.channel === channel
    );
    if (channelResults.length === 0) continue;

    const chDelivered = channelResults.filter(
      (r) => r.status === "delivered"
    ).length;
    const chFailed = channelResults.filter(
      (r) => r.status === "failed"
    ).length;
    const chPending = channelResults.filter(
      (r) => r.status === "pending"
    ).length;
    const chTotal = channelResults.length;
    const chRate =
      chTotal > 0 ? ((chDelivered / chTotal) * 100).toFixed(0) : "0";

    const emoji = channelEmojis[channel] ?? "📌";
    const name = channelNames[channel] ?? channel;
    sections.push(
      `| ${emoji} ${name} | ${chDelivered} | ${chFailed} | ${chPending} | ${chRate}% |`
    );
  }
  sections.push(``);

  // Retry logs
  const retriedResults = deliveryResults.filter((r) => r.attempts > 1);
  if (retriedResults.length > 0) {
    sections.push(`## 🔄 Retry Log (${retriedResults.length} copies retried)`);
    sections.push(``);
    sections.push(
      `| Channel | Variant | Language | Attempts | Final Status | Latency |`
    );
    sections.push(
      `|---------|---------|----------|----------|-------------|---------|`
    );

    for (const r of retriedResults) {
      const statusEmoji =
        r.status === "delivered"
          ? "✅"
          : r.status === "failed"
            ? "❌"
            : "⏳";
      const totalLatency = r.retryLog.reduce(
        (sum, log) => sum + log.latencyMs,
        0
      );
      sections.push(
        `| ${r.channel} | ${r.variant} | ${r.language} | ${r.attempts} | ${statusEmoji} ${r.status} | ${totalLatency}ms |`
      );
    }
    sections.push(``);

    // Detailed retry breakdown for first few
    const showDetailed = retriedResults.slice(0, 5);
    if (showDetailed.length > 0) {
      sections.push(`### Detailed Retry Breakdown (showing first ${showDetailed.length})`);
      sections.push(``);

      for (const r of showDetailed) {
        sections.push(
          `**${r.channel}/${r.variant}/${r.language}:**`
        );
        for (const log of r.retryLog) {
          const logEmoji =
            log.status === "delivered"
              ? "✅"
              : log.status === "failed"
                ? "❌"
                : "⏳";
          sections.push(
            `- Attempt ${log.attempt}: ${logEmoji} ${log.status} (${log.latencyMs}ms)`
          );
        }
        sections.push(``);
      }
    }
  }

  return sections.join("\n");
}
