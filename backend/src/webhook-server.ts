// Mock Webhook Delivery Server with SSE Support (broadcasts to React dashboard)

import express from "express";
import type { Server as HttpServer } from "node:http";
import type { AddressInfo } from "node:net";
import type { DeliveryStatus } from "./types.js";

interface WebhookResponse {
  status: DeliveryStatus;
  channel: string;
  timestamp: string;
  message: string;
}

let httpServer: HttpServer | null = null;

// SSE clients — connected browsers
type SSEClient = {
  id: string;
  res: express.Response;
};
const sseClients: SSEClient[] = [];

let eventCounter = 0;

/**
 * Broadcast an event to all connected SSE clients.
 */
function broadcastSSE(eventType: string, data: unknown) {
  const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try {
      client.res.write(payload);
    } catch {
      // Client disconnected
    }
  }
}

/**
 * Notify dashboard that a simulation is starting.
 */
export function notifySimulationStart(info: {
  merchant: string;
  category: string;
  discount: string;
}) {
  broadcastSSE("simulation_start", info);
}

/**
 * Notify dashboard that a simulation is complete.
 */
export function notifySimulationEnd() {
  broadcastSSE("simulation_end", {});
}

/**
 * Start the mock webhook server on port 3456 (fixed for dashboard proxy).
 */
export async function startWebhookServer(): Promise<string> {
  const app = express();
  app.use(express.json());

  // CORS for dashboard dev server
  app.use((_req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
  });

  // SSE endpoint for dashboard
  app.get("/events", (_req: express.Request, res: express.Response) => {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    });

    res.write(`data: ${JSON.stringify({ type: "connected" })}\n\n`);

    const clientId = `client-${Date.now()}`;
    const client: SSEClient = { id: clientId, res };
    sseClients.push(client);

    console.error(`[SSE] Client connected: ${clientId} (${sseClients.length} total)`);

    _req.on("close", () => {
      const idx = sseClients.indexOf(client);
      if (idx !== -1) sseClients.splice(idx, 1);
      console.error(`[SSE] Client disconnected: ${clientId} (${sseClients.length} total)`);
    });
  });

  const channels = [
    "email",
    "whatsapp",
    "push",
    "glance",
    "payu",
    "instagram",
  ];

  // Create webhook endpoints for each channel
  for (const channel of channels) {
    app.post(`/webhook/${channel}`, async (req: express.Request, res: express.Response) => {
      // Fast latency (10-50ms)
      const latency = Math.floor(Math.random() * 40) + 10;
      await new Promise((resolve) => setTimeout(resolve, latency));

      // Randomize delivery status
      const roll = Math.random();
      let status: DeliveryStatus;
      let message: string;

      if (roll < 0.75) {
        status = "delivered";
        message = `Successfully delivered to ${channel}`;
      } else if (roll < 0.9) {
        status = "failed";
        message = `Delivery to ${channel} failed: ${getRandomFailureReason(channel)}`;
      } else {
        status = "pending";
        message = `Delivery to ${channel} pending — queued for retry`;
      }

      const response: WebhookResponse = {
        status,
        channel,
        timestamp: new Date().toISOString(),
        message,
      };

      // Broadcast delivery event to SSE clients
      eventCounter++;
      broadcastSSE("delivery", {
        id: `evt-${eventCounter}`,
        channel,
        variant: req.body?.variant ?? "unknown",
        language: req.body?.language ?? "unknown",
        status,
        attempt: req.body?.attempt ?? 1,
        latencyMs: latency,
        timestamp: new Date().toISOString(),
        message,
        content: req.body?.content ?? null,
      });

      const statusCode =
        status === "delivered" ? 200 : status === "failed" ? 500 : 202;
      res.status(statusCode).json(response);
    });
  }

  app.get("/health", (_req: express.Request, res: express.Response) => {
    res.json({ status: "ok", channels, sseClients: sseClients.length });
  });

  const PORT = 3456;

  return new Promise((resolve, reject) => {
    httpServer = app.listen(PORT, () => {
      const baseUrl = `http://127.0.0.1:${PORT}`;
      console.error(`[Webhook] Server started on ${baseUrl}`);
      console.error(`[Webhook] Dashboard: http://localhost:5173`);
      resolve(baseUrl);
    });

    httpServer.on("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "EADDRINUSE") {
        // Port already in use — server might already be running
        console.error(`[Webhook] Port ${PORT} already in use, reusing existing server`);
        resolve(`http://127.0.0.1:${PORT}`);
      } else {
        reject(err);
      }
    });
  });
}

/**
 * Stop the mock webhook server.
 */
export async function stopWebhookServer(): Promise<void> {
  // Close all SSE connections
  for (const client of sseClients) {
    try { client.res.end(); } catch { /* ignore */ }
  }
  sseClients.length = 0;

  if (httpServer) {
    return new Promise((resolve) => {
      httpServer!.close(() => {
        console.error("[Webhook] Server stopped");
        httpServer = null;
        resolve();
      });
    });
  }
}

function getRandomFailureReason(channel: string): string {
  const reasons: Record<string, string[]> = {
    email: ["SMTP timeout", "Mailbox full", "Invalid address"],
    whatsapp: ["API timeout", "User not on WhatsApp", "Template not approved"],
    push: ["Token expired", "FCM unavailable", "Notifications disabled"],
    glance: ["SDK timeout", "Slot unavailable", "Region not supported"],
    payu: ["Gateway timeout", "Session expired", "Slot occupied"],
    instagram: ["API rate limit", "Upload failed", "Caption policy violation"],
  };

  const channelReasons = reasons[channel] ?? ["Unknown error"];
  return channelReasons[Math.floor(Math.random() * channelReasons.length)]!;
}
