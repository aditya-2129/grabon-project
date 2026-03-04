# 📢 GrabOn Multi-Channel Deal Distribution MCP Server

> **Project 06 — GrabOn Vibe Coder Challenge**
> _The 'One-to-Many' Merchant Rail: One deal in, 54 formatted outputs across 6 channels._

A fully spec-compliant MCP server that turns a single merchant deal payload into **54 production-ready marketing copies** — formatted for 6 channels, differentiated across 3 A/B variant strategies, and culturally localized into English, Hindi, and Telugu — then simulates webhook delivery with retry logic and real-time dashboard visualization.

---

## 📑 Table of Contents

- [Why This Matters](#-why-this-matters)
- [Architecture](#%EF%B8%8F-architecture)
- [The distribute_deal Tool](#-the-distribute_deal-tool)
- [6 Channels × Format Constraints](#-6-channels--format-constraints)
- [3 A/B Variant Strategies](#-3-ab-variant-strategies)
- [Localization Strategy](#-localization-strategy)
- [Webhook Delivery Simulation](#-webhook-delivery-simulation)
- [Sample Output (Nykaa)](#-sample-output-nykaa--fashion--beauty-35-off)
- [Real-Time Dashboard](#-real-time-dashboard)
- [Setup & Usage](#-setup--usage)
- [Design Decisions & Tradeoffs](#%EF%B8%8F-design-decisions--tradeoffs)
- [Project Structure](#-project-structure)
- [Tech Stack](#%EF%B8%8F-tech-stack)

---

## 🧠 Why This Matters

GrabOn's pitch to every partner (Rakuten, PayU, InMobi, Poonawalla) is the same: **"One integration unlocks 145 distribution pipes."** Today, when a Zomato deal is uploaded into GrabOn's system, it takes manual work to format it for each channel. This project automates that pipeline.

A single `distribute_deal` call triggers:

1. **Copy generation** — 6 channels × 3 A/B variants × 3 languages = **54 unique outputs**
2. **Webhook delivery** — Each copy is delivered to its channel's mock endpoint with realistic failure simulation
3. **Retry logic** — Failed deliveries are retried with exponential backoff
4. **Real-time visualization** — A live dashboard shows every delivery event as it happens via SSE

This is the infrastructure play that lets GrabOn scale from 3,500 to 35,000 merchant integrations without proportionally scaling headcount.

---

## 🏗️ Architecture

```
                                         ┌─────────────────────────────────┐
                                         │        Claude Desktop           │
                                         │         (MCP Client)            │
                                         └──────────┬──────────────────────┘
                                                    │ stdio (MCP protocol)
                                                    ▼
                                         ┌─────────────────────────────────┐
                                         │    MCP Server (index.ts)        │
                                         │                                 │
                                         │  Tool 1: distribute_deal        │
                                         │   → Returns prompt + formatting │
                                         │     instructions for Claude to  │
                                         │     generate all 54 copies      │
                                         │                                 │
                                         │  Tool 2: simulate_delivery      │
                                         │   → Takes Claude's JSON output  │
                                         │     and fires webhook delivery  │
                                         └───────┬───────────┬─────────────┘
                                                 │           │
                              ┌──────────────────┘           └────────────────────┐
                              ▼                                                   ▼
                   ┌─────────────────────┐                             ┌─────────────────────┐
                   │   Prompt Engine     │                             │  Webhook Server      │
                   │   (prompts.ts)      │                             │  (webhook-server.ts) │
                   │                     │                             │                      │
                   │  Builds structured  │                             │  Express server on   │
                   │  prompt with deal   │                             │  port 3456 with:     │
                   │  context, channel   │                             │  • /webhook/:channel │
                   │  constraints, and   │                             │  • /events (SSE)     │
                   │  localization rules │                             │  • /health           │
                   └─────────────────────┘                             └──────────┬────────────┘
                                                                                  │ SSE stream
                                                                                  ▼
                                                                       ┌─────────────────────┐
                                                                       │  React Dashboard     │
                                                                       │  (frontend/)         │
                                                                       │                      │
                                                                       │  • Delivery Donut    │
                                                                       │  • Channel Success   │
                                                                       │  • Latency Chart     │
                                                                       │  • Variant Heatmap   │
                                                                       │  • Copy Viewer       │
                                                                       │  • Live Event Log    │
                                                                       └──────────────────────┘
```

### Two-Tool Design

The MCP server exposes **two tools** that work in sequence:

| Tool                | Purpose                           | Input                                                | Output                                             |
| ------------------- | --------------------------------- | ---------------------------------------------------- | -------------------------------------------------- |
| `distribute_deal`   | Generates formatting instructions | Deal parameters (merchant, category, discount, etc.) | Structured prompt for Claude to generate 54 copies |
| `simulate_delivery` | Simulates webhook delivery        | JSON array of 54 generated copies                    | Delivery results with success rates and retry logs |

**Why two tools instead of one?** This architecture leverages Claude Desktop's own LLM to generate the marketing copies. The `distribute_deal` tool returns a carefully crafted prompt with channel constraints, variant strategies, and localization rules. Claude generates the 54 copies, then passes them to `simulate_delivery` for webhook simulation. This means **no external API keys are needed** — it works on any Claude plan.

---

## 📦 The `distribute_deal` Tool

```
distribute_deal(
  merchant_id:       string    // e.g., "Zomato"
  category:          string    // e.g., "Food"
  discount_value:    number    // e.g., 20
  discount_type:     string    // "percentage" | "flat"
  expiry_timestamp:  string    // ISO timestamp
  min_order_value:   number    // e.g., 200
  max_redemptions:   number    // e.g., 1000
  exclusive_flag:    boolean   // GrabOn exclusive?
)
```

This matches the spec's required signature exactly. The tool:

1. Builds a deal context object from the parameters
2. Generates `prompts.ts`'s structured prompt with all channel constraints and localization rules
3. Returns the prompt to Claude with instructions to generate all 54 copies as strict JSON
4. Claude generates the copies and automatically calls `simulate_delivery`

---

## 📡 6 Channels × Format Constraints

Each channel has real-world format constraints that the copies must respect:

| Channel                | Format                                  | Constraint                           | Partner Context           |
| ---------------------- | --------------------------------------- | ------------------------------------ | ------------------------- |
| **Email**              | HTML snippet (subject + headline + CTA) | Rich formatting                      | Standard e-commerce       |
| **WhatsApp**           | Plain text                              | Max 160 chars                        | Business API limits       |
| **Push Notification**  | Title + Body                            | Title: 50 chars, Body: 100 chars     | FCM/APNs limits           |
| **Glance Lock Screen** | Plain text                              | 160 chars, must work without context | InMobi/Glance partnership |
| **PayU Checkout**      | Banner text                             | Max 40 chars, action-oriented        | PayU partnership          |
| **Instagram**          | Caption + Hashtags                      | Engaging caption + 5-8 hashtags      | Social media reach        |

The Glance and PayU channels are particularly interesting because they map directly to GrabOn's strategic partnerships with InMobi and PayU respectively. A Glance lock screen card must work without any app context (the user hasn't opened any app), and a PayU banner must be action-oriented because the user is mid-checkout.

---

## 🧪 3 A/B Variant Strategies

Each channel gets **3 meaningfully different** copy variants — not synonym swaps, but fundamentally different marketing angles:

| Variant          | Strategy                            | Example (Email Subject for Zomato 20% off)                          |
| ---------------- | ----------------------------------- | ------------------------------------------------------------------- |
| **Urgency**      | FOMO, scarcity, countdown           | "⏰ Only 2 hours left! Your 20% Zomato code expires at midnight"    |
| **Value**        | ROI, savings, getting more for less | "Save ₹200 on tonight's dinner — that's practically a free dessert" |
| **Social Proof** | Popularity, trending, community     | "47,000+ foodies grabbed this Zomato deal this week — your turn"    |

The prompt engineering in `prompts.ts` explicitly instructs Claude to make variants "MEANINGFULLY DIFFERENT in tone, angle, and messaging strategy. NOT just synonym swaps or minor word changes."

---

## 🌐 Localization Strategy

All 18 base copies (6 channels × 3 variants) are localized into 3 languages = **54 total outputs**.

| Language    | Script                | Approach                                                                                                                                                                                             |
| ----------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **English** | Latin                 | Standard marketing English, conversational tone                                                                                                                                                      |
| **Hindi**   | Devanagari + Hinglish | Devanagari for Email/Push/Glance. **Hinglish (Hindi-English mix) for WhatsApp** — because that's how Indians actually text about deals: _"Bhai jaldi! Nykaa pe 35% off sirf GrabOn pe"_              |
| **Telugu**  | Telugu script + Roman | Telugu script for Email/Push/Glance. **Roman transliteration for WhatsApp** — how Telugu speakers actually text: _"Chudandi! 35% off GrabOn lo"_. Uses distinct Telugu idioms, not translated Hindi. |

### Why this matters

The prompt explicitly tells Claude that Telugu and Hindi idioms are different. You don't say "लूट लो" in Telugu — the natural expression is "అదిరిపోయే ఆఫర్" (mind-blowing offer). The prompt also enforces **AVOID rules**: urgency variants must never cite crowd numbers (that's social proof), value variants must never say "hurry" (that's urgency). This ensures each variant reads like a fundamentally different marketing strategy.

---

## 🔄 Webhook Delivery Simulation

### How it works

The backend spins up an Express server on port 3456 with mock webhook endpoints for each channel (`/webhook/email`, `/webhook/whatsapp`, etc.). Each endpoint:

1. Adds realistic latency (10-50ms random)
2. Returns a randomized status: **75% delivered**, **15% failed**, **10% pending**
3. Includes channel-specific failure reasons (e.g., "SMTP timeout" for email, "FCM unavailable" for push, "Template not approved" for WhatsApp)

### Retry Logic

Failed and pending deliveries are retried with **exponential backoff**:

| Attempt | Delay     | Total wait |
| ------- | --------- | ---------- |
| 1st     | Immediate | 0ms        |
| 2nd     | 200ms     | 200ms      |
| 3rd     | 400ms     | 600ms      |

Max 3 attempts per delivery. Copies are delivered in concurrent batches of 18 for speed (optimized for Claude Desktop's timeout limits).

### Channel-specific failure reasons

```
email:     "SMTP timeout", "Mailbox full", "Invalid address"
whatsapp:  "API timeout", "User not on WhatsApp", "Template not approved"
push:      "Token expired", "FCM unavailable", "Notifications disabled"
glance:    "SDK timeout", "Slot unavailable", "Region not supported"
payu:      "Gateway timeout", "Session expired", "Slot occupied"
instagram: "API rate limit", "Upload failed", "Caption policy violation"
```

---

## 📋 Sample Output (Nykaa — Fashion & Beauty, 35% off)

Actual output from a live Claude Desktop demo run. Notice how each variant uses a **fundamentally different angle**:

### Variant Differentiation (Email Subject Lines)

| Variant     | English                                                                 | Hindi                                                             | Telugu                                                             |
| ----------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------ |
| **Urgency** | _"⏰ 3 days left — your exclusive 35% Nykaa code vanishes at midnight"_ | _"सिर्फ 3 दिन बाकी — Nykaa पर 35% छूट अब जा रही है!"_             | _"కేవలం 3 రోజులు — Nykaa 35% ఆఫర్ అర్థరాత్రి అయిపోతుంది!"_         |
| **Value**   | _"That ₹2000 Nykaa haul? Now just ₹1300. Do the math."_                 | _"₹2000 का Nykaa ऑर्डर अब सिर्फ ₹1300 में — पैसे वसूल!"_          | _"₹2000 Nykaa ఆర్డర్ ఇప్పుడు కేవలం ₹1300 — డబ్బు పూర్తిగా వసూల్!"_ |
| **Social**  | _"Thousands are already shopping Nykaa at 35% off — your turn"_         | _"हजारों लोग पहले से Nykaa पर 35% छूट ले रहे हैं — तुम कब लोगे?"_ | _"వేలమంది ఇప్పటికే Nykaa పై 35% ఆఫర్ తీసుకుంటున్నారు!"_            |

### WhatsApp — Natural Hinglish & Telugu

| Variant     | Hindi (Hinglish)                                                      | Telugu (Roman)                                                                  |
| ----------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| **Urgency** | _"Bhai jaldi! Nykaa pe 35% off sirf GrabOn pe. 3 din mein khatam!"_   | _"Jaldi cheyandi! Nykaa pe 35% off only GrabOn lo. 3 rojullo expire avutundi!"_ |
| **Value**   | _"Yaar! ₹1500 ka skincare? Ab ₹975 mein. Paise vasool deal hai 💰"_   | _"Chudandi! ₹1500 skincare? Ippudu ₹975 ki vastundi. Full paisa vasool 💰"_     |
| **Social**  | _"Hazaron log le rahe hain! Sabse hot beauty deal. Tu bhi le jaldi!"_ | _"Veladi mandi teeskuntunnaru! Hottest deal idi. Meeru miss avutara?"_          |

### Delivery Results

```
Total: 54/54 delivered (100% success rate)
9 copies required retries (exponential backoff)
Max attempts: 3 (instagram/urgency/te)
Latency range: 63ms – 141ms
```

## 📊 Real-Time Dashboard

The project includes a **Vite + React** dashboard that connects to the webhook server via **Server-Sent Events (SSE)** for real-time visualization.

### Dashboard Components

| Component                    | What it shows                                                                                                                                            |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Delivery Donut**           | SVG donut chart showing delivered/failed/pending counts with animated segments                                                                           |
| **Channel Success Rate**     | Per-channel success rates with color-coded progress bars                                                                                                 |
| **Latency Chart**            | CSS-based bar chart with gradient bars, color-coded latency badges (green/yellow/red), and channel-specific glow effects                                 |
| **Variant × Channel Matrix** | Interactive heatmap with status icons (✓/✕/●), language count badges, and row-hover highlighting                                                         |
| **Copy Viewer**              | Deep-dive browser for all 54 variants with filters for Channel, Variant, and Language — renders email HTML, WhatsApp text, push notification cards, etc. |
| **Live Event Log**           | Real-time scrolling log of every delivery event with status badges, latency, and attempt counts                                                          |

### SSE Integration

The webhook server broadcasts every delivery event to connected dashboard clients. Events include:

- `simulation_start` — Deal distribution begins (includes merchant info)
- `delivery` — Individual copy delivered/failed/pending (with latency, attempt count, content)
- `simulation_end` — All deliveries complete

---

## 🚀 Setup & Usage

### Prerequisites

- **Node.js 20+** (required by Vite 7 for the frontend)
- **npm 9+**
- **Claude Desktop** (any plan — no external API keys needed)

### 1. Build the Backend (MCP Server)

```bash
cd backend
npm install
npm run build
```

The server is started automatically by Claude Desktop. It spins up the webhook server on port 3456 when the first tool is invoked.

### 2. Run the Dashboard

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** to view the live dashboard. It will auto-connect to the webhook server's SSE endpoint.

### 3. Connect to Claude Desktop

Add to your Claude Desktop config file:

**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "grabon-deal-distribution": {
      "command": "node",
      "args": ["ABSOLUTE_PATH_TO_PROJECT/backend/dist/index.js"]
    }
  }
}
```

Replace `ABSOLUTE_PATH_TO_PROJECT` with the full path to this project directory. Then restart Claude Desktop. The `distribute_deal` and `simulate_delivery` tools will appear in Claude's tool list.

### 4. Demo Prompts

Try these in Claude Desktop:

**Food Deal (Zomato):**

> "Distribute a deal for Zomato, Food category, 20% off, minimum order ₹200, expires tonight at midnight, 1000 max redemptions, exclusive to GrabOn."

**Fashion Deal (Myntra):**

> "Distribute a Myntra deal for Fashion & Beauty, flat ₹500 off on orders above ₹2000, valid till March 15th, 5000 redemptions, not exclusive."

**Travel Deal (MakeMyTrip):**

> "Distribute a MakeMyTrip deal for Travel, 15% off on flights above ₹3000, expires end of this week, 2000 max redemptions, exclusive."

Each prompt will generate 54 copies, deliver them via webhooks, and display results in real-time on the dashboard.

---

## 🏛️ Design Decisions & Tradeoffs

### 1. Two-tool architecture vs. single tool

**Decision:** Split into `distribute_deal` (returns prompt) and `simulate_delivery` (handles delivery).
**Why:** This lets Claude's own LLM generate the copies, eliminating the need for external API keys. The MCP server acts as an orchestrator, not a copy generator.
**Tradeoff:** Requires two tool calls instead of one, but gains API-key-free operation and leverages Claude's superior multilingual generation capabilities.

### 2. Template fallback in llm.ts

**Decision:** Included a template-based copy generation system (`llm.ts`) with hardcoded patterns for each channel/variant/language combination.
**Why:** Acts as a deterministic fallback and development reference. The templates demonstrate the expected output structure and quality bar.
**Tradeoff:** Templates are less creative than LLM-generated copy, but they're always available and fast.

### 3. Fixed port 3456 for webhook server

**Decision:** Hardcoded the webhook server to port 3456.
**Why:** The frontend Vite proxy needs a known port. Dynamic ports would require IPC between the MCP server and the frontend dev server.
**Tradeoff:** Port conflicts are handled by detecting EADDRINUSE and reusing the existing server instance.

### 4. SSE over WebSocket for dashboard

**Decision:** Used Server-Sent Events instead of WebSocket for the real-time dashboard connection.
**Why:** SSE is simpler (unidirectional), auto-reconnects, and works through proxies. The dashboard only needs to receive events, not send them.
**Tradeoff:** No bidirectional communication, but the dashboard doesn't need to send data to the server.

### 5. Concurrent batched delivery

**Decision:** Deliver copies in batches of 18 with Promise.all instead of sequential delivery.
**Why:** Claude Desktop has timeout limits. Sequential delivery of 54 copies with retries could exceed the timeout window. Batched concurrent delivery keeps total time under 10 seconds.
**Tradeoff:** May cause brief port exhaustion under load, but this is a simulation environment.

### 6. Exponential backoff timing

**Decision:** Base delay of 200ms with factor of 2 (200ms → 400ms) instead of the classic 1s → 2s → 4s.
**Why:** Optimized for demo speed within Claude Desktop's timeout constraints. Real production deployment would use longer delays.
**Tradeoff:** Faster retries mean less time for transient failures to clear, but appropriate for a simulation.

---

## 📁 Project Structure

```
├── backend/
│   ├── src/
│   │   ├── index.ts            # MCP server entry (2 tools: distribute_deal, simulate_delivery)
│   │   ├── prompts.ts          # Structured prompt builder for 54-copy generation
│   │   ├── llm.ts              # Template-based copy generation (fallback)
│   │   ├── delivery.ts         # Delivery service with retry + exponential backoff
│   │   ├── webhook-server.ts   # Express mock webhooks + SSE broadcasting
│   │   ├── formatter.ts        # Markdown output formatter for delivery results
│   │   └── types.ts            # TypeScript types (Channel, Variant, Language, DealInput, etc.)
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx             # Main dashboard layout with stat cards + grids
│   │   ├── Charts.tsx          # SVG/CSS charts (Donut, Success Rate, Latency, Heatmap)
│   │   ├── CopyViewer.tsx      # Filterable viewer for all 54 copy variants
│   │   ├── useDeliveryEvents.ts # SSE hook for real-time event streaming
│   │   ├── types.ts            # Frontend TypeScript types
│   │   ├── index.css           # Design system (dark theme, glassmorphism, animations)
│   │   └── components/ui/      # Shadcn UI components (Card, Badge, Progress, etc.)
│   ├── package.json
│   └── vite.config.ts
│
├── claude_desktop_config.json  # Example Claude Desktop configuration
└── README.md                   # This file
```

---

## 🛠️ Tech Stack

| Layer             | Technology                                       | Why                                                    |
| ----------------- | ------------------------------------------------ | ------------------------------------------------------ |
| **MCP Server**    | Node.js, TypeScript, `@modelcontextprotocol/sdk` | Official MCP SDK for spec compliance                   |
| **Validation**    | Zod                                              | Runtime type validation for tool inputs                |
| **Webhooks**      | Express 5                                        | Lightweight HTTP server for mock endpoints             |
| **Frontend**      | React 19, Vite 7, TypeScript                     | Fast dev server with HMR                               |
| **UI Components** | Shadcn UI (Radix primitives)                     | Accessible, composable components                      |
| **Styling**       | Tailwind CSS 4, custom CSS                       | Utility-first with dark theme design system            |
| **Icons**         | Lucide React                                     | Consistent icon set                                    |
| **Charts**        | Custom SVG + CSS                                 | No chart library dependency — full control over design |

---
