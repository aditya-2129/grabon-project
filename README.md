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
                               ┌───────────────┴───────────────┐
                               ▼                               ▼
                      ┌────────────────┐              ┌────────────────┐
                      │    LLM Call    │              │ Webhook Server │
                      │  (llm.ts) via  │              │ (broadcasts to  │
                      │  MCP sampling  │              │   dashboard)   │
                      └────────────────┘              └───────┬────────┘
                                                              │
                                                              ▼
                                                      ┌────────────────┐
                                                      │  React Dashboard│
                                                      │ (frontend src)  │
                                                      └────────────────┘
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
- **Real-time Dashboard:** React-based visualization tool connected via SSE for live simulation tracking.

---

## 📊 Dashboard

The project includes a **Vite + React** dashboard for real-time visualization of the distribution process.

### Features:

- **SVG Analytics:** Donut charts for status, bar charts for latency, and success rate heatmaps.
- **Copy Viewer:** Deep-dive into all 54 variants with filters for Channel, Variant, and Language.
- **SSE Integration:** Seamless real-time updates from the MCP server's simulation engine.

---

## 🚀 Setup & Usage

### Prerequisites

- Node.js 18+
- Claude Desktop

### 1. Build the Backend (MCP Server)

```bash
cd backend
npm install
npm run build
```

_(Note: The server will be automatically started by Claude Desktop, which will in turn spin up the webhook server on port 3456.)_

### 2. Build & Run Dashboard

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` to view the live dashboard.

### 3. Connect to Claude Desktop

Add to your Claude Desktop config file at `%APPDATA%\Claude\claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "grabon-deal-distribution": {
      "command": "node",
      "args": ["ABSOLUTE_PATH_TO_YOUR_PROJECT/backend/dist/index.js"]
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

---

## 🛠️ Tech Stack

- **Backend:** Node.js, TypeScript, MCP SDK, Express (Mock Webhooks)
- **Frontend:** React 19, Vite, TypeScript, Vanilla CSS, Custom SVGs

---

## 📄 License

ISC
