// ============================================================
// Delivery Service with Retry Logic
// Fast retries optimized for Claude Desktop timeout limits
// ============================================================

import type {
  ChannelCopy,
  DeliveryResult,
  DeliveryStatus,
  RetryLogEntry,
} from "./types.js";

const MAX_RETRIES = 2; // Reduced from 3 to speed up
const BASE_DELAY_MS = 200; // Fast retries: 200ms, 400ms
const CONCURRENT_BATCH_SIZE = 18; // Higher concurrency for speed

/**
 * Deliver a single copy to its channel webhook with retry logic.
 */
export async function deliverToChannel(
  copy: ChannelCopy,
  webhookBaseUrl: string
): Promise<DeliveryResult> {
  const retryLog: RetryLogEntry[] = [];
  let finalStatus: DeliveryStatus = "failed";
  let attempts = 0;

  for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
    attempts = attempt;
    const startTime = Date.now();

    try {
      const response = await fetch(
        `${webhookBaseUrl}/webhook/${copy.channel}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            channel: copy.channel,
            variant: copy.variant,
            language: copy.language,
            content: copy.content,
            attempt,
          }),
        }
      );

      const data = (await response.json()) as { status: DeliveryStatus };
      const latencyMs = Date.now() - startTime;

      retryLog.push({
        attempt,
        status: data.status,
        timestamp: new Date().toISOString(),
        latencyMs,
      });

      if (data.status === "delivered") {
        finalStatus = "delivered";
        break;
      }

      finalStatus = data.status;

      // Retry with short delay
      if (attempt <= MAX_RETRIES) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      retryLog.push({
        attempt,
        status: "failed",
        timestamp: new Date().toISOString(),
        latencyMs,
      });

      if (attempt <= MAX_RETRIES) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  return {
    channel: copy.channel,
    variant: copy.variant,
    language: copy.language,
    status: finalStatus,
    attempts,
    timestamp: new Date().toISOString(),
    retryLog,
  };
}

/**
 * Deliver all copies concurrently in batches.
 */
export async function deliverAll(
  copies: ChannelCopy[],
  webhookBaseUrl: string
): Promise<DeliveryResult[]> {
  console.error(
    `[Delivery] Starting delivery of ${copies.length} copies...`
  );

  const results: DeliveryResult[] = [];

  // Process in larger batches for speed
  for (let i = 0; i < copies.length; i += CONCURRENT_BATCH_SIZE) {
    const batch = copies.slice(i, i + CONCURRENT_BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map((copy) => deliverToChannel(copy, webhookBaseUrl))
    );
    results.push(...batchResults);
  }

  const delivered = results.filter((r) => r.status === "delivered").length;
  const failed = results.filter((r) => r.status === "failed").length;
  const pending = results.filter((r) => r.status === "pending").length;

  console.error(
    `[Delivery] Done! Delivered: ${delivered}, Failed: ${failed}, Pending: ${pending}`
  );

  return results;
}
