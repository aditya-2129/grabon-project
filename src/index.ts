#!/usr/bin/env node
// ============================================================
// GrabOn Multi-Channel Deal Distribution MCP Server
// Two-tool architecture:
//   1. distribute_deal — returns prompt for Claude to generate copies
//   2. simulate_delivery — runs webhook simulation on generated copies
// ============================================================

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { buildGenerationPrompt } from "./prompts.js";
import {
  startWebhookServer,
  stopWebhookServer,
  notifySimulationStart,
  notifySimulationEnd,
} from "./webhook-server.js";
import { deliverAll } from "./delivery.js";
import { formatDeliveryResults } from "./formatter.js";

// Module-level webhook URL — server starts once and stays alive
let webhookBaseUrl: string | null = null;

// Create the MCP server
const server = new McpServer(
  {
    name: "grabon-deal-distribution",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
    instructions: `You are GrabOn's multi-channel deal distribution assistant. When a user asks to distribute a deal:

1. First call the 'distribute_deal' tool with the deal parameters. It will return formatting instructions.
2. Generate all 54 copy variants (6 channels × 3 A/B variants × 3 languages) following the returned instructions EXACTLY.
3. IMPORTANT: Output the copies as a valid JSON array following the exact schema specified.
4. Then call 'simulate_delivery' with the generated JSON to simulate webhook delivery.
5. Present both the generated copies and delivery results to the user.`,
  }
);

// ─── Tool 1: distribute_deal ────────────────────────────────
// Returns formatting instructions for Claude to generate copies
server.tool(
  "distribute_deal",
  "Prepare a merchant deal for multi-channel distribution. Returns the formatting instructions and constraints that Claude should follow to generate 54 copy variants (6 channels × 3 A/B variants × 3 languages: EN, HI, TE). After calling this tool, generate all 54 copies as a JSON array, then call simulate_delivery with the JSON.",
  {
    merchant_id: z
      .string()
      .describe("Merchant name or identifier (e.g., 'Zomato', 'Myntra')"),
    category: z
      .string()
      .describe(
        "Deal category (e.g., 'Food', 'Fashion & Beauty', 'Travel', 'Electronics', 'Health')"
      ),
    discount_value: z
      .number()
      .positive()
      .describe("Discount amount (e.g., 20 for 20% or 100 for ₹100)"),
    discount_type: z
      .enum(["percentage", "flat"])
      .describe("Type of discount: 'percentage' for % off, 'flat' for ₹ off"),
    expiry_timestamp: z
      .string()
      .describe(
        "Expiry date/time in ISO 8601 format (e.g., '2025-12-31T23:59:59+05:30')"
      ),
    min_order_value: z
      .number()
      .min(0)
      .describe("Minimum order value in ₹ to apply the discount"),
    max_redemptions: z
      .number()
      .int()
      .positive()
      .describe("Maximum number of times this deal can be redeemed"),
    exclusive_flag: z
      .boolean()
      .describe("Whether this deal is exclusive to GrabOn"),
  },
  async (args) => {
    console.error(`\n${"=".repeat(60)}`);
    console.error(
      `[MCP] distribute_deal called for ${args.merchant_id} (${args.category})`
    );
    console.error(`${"=".repeat(60)}\n`);

    // Build the generation prompt with all constraints
    const prompt = buildGenerationPrompt({
      merchant_id: args.merchant_id,
      category: args.category,
      discount_value: args.discount_value,
      discount_type: args.discount_type,
      expiry_timestamp: args.expiry_timestamp,
      min_order_value: args.min_order_value,
      max_redemptions: args.max_redemptions,
      exclusive_flag: args.exclusive_flag,
    });

    return {
      content: [
        {
          type: "text" as const,
          text: `# Deal Distribution Instructions for ${args.merchant_id}

## Your Task
Generate ALL 54 copy variants for this deal following the instructions below. Then call the \`simulate_delivery\` tool with the generated JSON array.

---

${prompt}

---

## NEXT STEP
After generating the 54 copy JSON array above, call the \`simulate_delivery\` tool with:
- \`deal_merchant\`: "${args.merchant_id}"
- \`deal_category\`: "${args.category}"
- \`deal_discount\`: "${args.discount_type === "percentage" ? `${args.discount_value}%` : `₹${args.discount_value}`}"
- \`copies_json\`: The complete JSON array you just generated (as a string)`,
        },
      ],
    };
  }
);

// ─── Tool 2: simulate_delivery ──────────────────────────────
// Takes generated copies and simulates webhook delivery
server.tool(
  "simulate_delivery",
  "Simulate webhook delivery for the generated deal copies. Takes the JSON array of 54 copies produced by Claude and delivers each one to mock channel endpoints with retry logic. Returns delivery success rates and retry logs.",
  {
    deal_merchant: z.string().describe("Merchant name for this deal"),
    deal_category: z.string().describe("Deal category"),
    deal_discount: z.string().describe("Discount description (e.g., '20%' or '₹500')"),
    copies_json: z
      .string()
      .describe(
        "The JSON array of 54 generated copy variants as a string. Each item must have: channel, variant, language, content."
      ),
  },
  async (args) => {
    console.error(`\n${"=".repeat(60)}`);
    console.error(
      `[MCP] simulate_delivery called for ${args.deal_merchant}`
    );
    console.error(`${"=".repeat(60)}\n`);

    try {
      // Parse the copies JSON
      let copies: Array<{
        channel: string;
        variant: string;
        language: string;
        content: unknown;
      }>;

      try {
        const parsed = JSON.parse(args.copies_json);
        if (!Array.isArray(parsed)) {
          throw new Error("Expected a JSON array");
        }
        copies = parsed;
      } catch (parseError) {
        // Try to extract JSON array from the string
        const match = args.copies_json.match(/\[[\s\S]*\]/);
        if (match) {
          copies = JSON.parse(match[0]);
        } else {
          throw new Error(
            `Failed to parse copies JSON: ${(parseError as Error).message}`
          );
        }
      }

      console.error(`[MCP] Parsed ${copies.length} copies`);

      // Ensure webhook server is running (should already be from boot)
      if (!webhookBaseUrl) {
        webhookBaseUrl = await startWebhookServer();
      }

      // Notify dashboard
      notifySimulationStart({
        merchant: args.deal_merchant,
        category: args.deal_category,
        discount: args.deal_discount,
      });

      // Step 2: Deliver all copies
      console.error("[MCP] Delivering copies to webhook endpoints...");
      const deliveryResults = await deliverAll(
        copies.map((c) => ({
          channel: c.channel as "email" | "whatsapp" | "push" | "glance" | "payu" | "instagram",
          variant: c.variant as "urgency" | "value" | "social_proof",
          language: c.language as "en" | "hi" | "te",
          content: c.content as any,
        })),
        webhookBaseUrl
      );

      // Step 3: Format results
      const output = formatDeliveryResults(
        {
          merchant: args.deal_merchant,
          category: args.deal_category,
          discount: args.deal_discount,
        },
        copies.length,
        deliveryResults
      );

      console.error(
        `[MCP] ✅ Delivery simulation complete for ${args.deal_merchant}!\n`
      );

      return {
        content: [
          {
            type: "text" as const,
            text: output,
          },
        ],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(`[MCP] ❌ Error: ${errorMessage}`);

      return {
        content: [
          {
            type: "text" as const,
            text: `## ❌ Delivery Simulation Failed\n\n**Error:** ${errorMessage}\n\nPlease ensure the copies JSON is a valid array with the correct structure.`,
          },
        ],
        isError: true,
      };
    } finally {
      notifySimulationEnd();
      // Keep webhook server alive for dashboard SSE
    }
  }
);

// Start the server with stdio transport
async function main() {
  console.error("[MCP] Starting GrabOn Deal Distribution MCP Server...");
  console.error(
    "[MCP] Tools: distribute_deal, simulate_delivery"
  );

  // Start webhook server once at boot — keeps SSE alive for dashboard
  webhookBaseUrl = await startWebhookServer();

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("[MCP] Server connected and ready!");
}

main().catch((error) => {
  console.error("[MCP] Fatal error:", error);
  process.exit(1);
});
