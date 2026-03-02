# 📢 GrabOn Multi-Channel Deal Distribution MCP Server

> **Project 06 — GrabOn Vibe Coder Challenge**
> _The 'One-to-Many' Merchant Rail: One deal in, 54 formatted outputs across 6 channels._

Build a fully spec-compliant MCP server that turns one merchant deal payload into six fully formatted, localized deal placements across every channel GrabOn operates — simultaneously.

---

## 🏗️ Architecture

```
┌──────────────────┐     stdio      ┌──────────────────────────┐
│  Claude Desktop  │◄──────────────►│  MCP Server (index.ts)   │
│  (MCP Client)    │                │  distribute_deal tool     │
└──────────────────┘                └──────────┬───────────────┘
                                               │
                              ┌────────────────┼────────────────┐
                              ▼                ▼                ▼
                     ┌────────────┐   ┌──────────────┐  ┌──────────────┐
                     │  LLM Call  │   │   Delivery   │  │   Formatter  │
                     │  (llm.ts)  │   │ (delivery.ts)│  │(formatter.ts)│
                     │  via MCP   │   │  retry logic │  │  markdown    │
                     │  sampling  │   └──────┬───────┘  └──────────────┘
                     └────────────┘          │
                                    ┌────────▼─────────┐
                                    │  Webhook Server  │
                                    │(webhook-server.ts)│
                                    │  mock endpoints  │
                                    └──────────────────┘
```

**Key Design Decision:** No external API keys needed. The server uses MCP's `sampling/createMessage` to leverage Claude Desktop's own LLM for copy generation.

---

## 📋 Features

- **6 Channels:** Email (HTML), WhatsApp, Push Notification, Glance Lock Screen, PayU Checkout Banner, Instagram
- **3 A/B Variants:** Urgency-driven, Value-driven, Social-proof-driven (meaningfully different, not synonym swaps)
- **3 Languages:** English, Hindi (culturally natural Devanagari), Telugu (culturally accurate Telugu script)
- **54 Total Outputs** per deal (6 × 3 × 3)
- **Webhook Delivery Simulation:** Mock endpoints with realistic latency, randomized statuses, and channel-specific failure reasons
- **Retry Logic:** Up to 3 retries with exponential backoff (1s → 2s → 4s)
- **Formatted Output:** Clean Markdown with per-channel breakdown, delivery success rates, and retry logs

---

## 🛠️ Tech Stack

- **Runtime:** Node.js with TypeScript (ES2022, ESM)
- **MCP SDK:** `@modelcontextprotocol/sdk` v1.27+
- **Validation:** Zod
- **Mock Webhooks:** Express.js
- **Transport:** Stdio (for Claude Desktop integration)

---

## 📦 Project Structure

```
src/
├── index.ts           # Main MCP server — registers distribute_deal tool
├── types.ts           # Type definitions, enums, interfaces
├── prompts.ts         # Prompt templates for 54-copy generation
├── llm.ts             # MCP sampling integration (Claude generates copies)
├── webhook-server.ts  # Express mock webhook endpoints (6 channels)
├── delivery.ts        # Delivery service with retry + exponential backoff
└── formatter.ts       # Markdown output formatter
```

---

## 🚀 Setup & Usage

### Prerequisites

- Node.js 18+
- Claude Desktop

### Build

```bash
npm install
npm run build
```

### Connect to Claude Desktop

Add to your Claude Desktop config file at `%APPDATA%\Claude\claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "grabon-deal-distribution": {
      "command": "node",
      "args": ["C:\\Users\\aditya\\Desktop\\New folder\\dist\\index.js"]
    }
  }
}
```

Then restart Claude Desktop. The `distribute_deal` tool will appear in Claude's tool list.

### Demo Prompts

Try these in Claude Desktop:

1. **Food Deal:**

   > "Distribute a deal for Zomato, Food category, 20% off, minimum order ₹200, expires tonight at midnight, 1000 max redemptions, exclusive to GrabOn."

2. **Fashion Deal:**

   > "Distribute a Myntra deal for Fashion & Beauty, flat ₹500 off on orders above ₹2000, valid till March 15th, 5000 redemptions, not exclusive."

3. **Travel Deal:**
   > "Distribute a MakeMyTrip deal — Travel category, 15% off, min ₹3000, expires March 30th, 2000 redemptions, GrabOn exclusive."

---

## 🔧 `distribute_deal` Tool Schema

| Parameter          | Type                   | Description                                      |
| ------------------ | ---------------------- | ------------------------------------------------ |
| `merchant_id`      | string                 | Merchant name (e.g., "Zomato")                   |
| `category`         | string                 | Deal category (e.g., "Food", "Fashion & Beauty") |
| `discount_value`   | number                 | Discount amount (e.g., 20 for 20%)               |
| `discount_type`    | "percentage" \| "flat" | Type of discount                                 |
| `expiry_timestamp` | string                 | ISO 8601 expiry date                             |
| `min_order_value`  | number                 | Minimum order value in ₹                         |
| `max_redemptions`  | number                 | Max redemption count                             |
| `exclusive_flag`   | boolean                | GrabOn exclusive?                                |

---

## 📊 Channel Format Constraints

| Channel      | Format             | Constraint                  |
| ------------ | ------------------ | --------------------------- |
| 📧 Email     | HTML snippet       | Subject + headline + CTA    |
| 💬 WhatsApp  | Plain text         | Max 160 characters          |
| 🔔 Push      | Title + Body       | 50 chars + 100 chars        |
| 📱 Glance    | Lock screen card   | 160 chars, no context       |
| 💳 PayU      | Checkout banner    | 40 chars, action-oriented   |
| 📸 Instagram | Caption + Hashtags | Engaging caption + 5-8 tags |

---

## ⚖️ Design Decisions & Tradeoffs

1. **MCP Sampling vs External LLM API:** Using Claude Desktop's own LLM via `sampling/createMessage` eliminates external API key management. Tradeoff: copy generation quality depends on the host LLM's capabilities.

2. **In-process Webhook Server:** The mock webhook server runs inside the same Node.js process (different port). This simplifies deployment but means the simulation is local-only.

3. **Batch Delivery:** Copies are delivered in batches of 6 (one per channel) to balance concurrency with server load. This is configurable in `delivery.ts`.

4. **Exponential Backoff:** Retry delays double each attempt (1s → 2s → 4s). Max 3 retries keeps total wait time under 10 seconds per copy.

5. **Fault-tolerant Parsing:** The LLM response parser handles markdown fences, whitespace, and partial JSON. Invalid individual copies are skipped rather than failing the entire operation.

---

## 📄 License

ISC
"# grabon-project" 
