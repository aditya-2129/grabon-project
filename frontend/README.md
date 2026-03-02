# 📊 GrabOn Distribution Dashboard

> **Real-time Visualization for Multi-Channel Deal Distribution**

This is the React-based frontend dashboard that connects to the GrabOn MCP Server's mock webhook server via Server-Sent Events (SSE). It provides live analytics, delivery status visualization, and a deep-dive viewer for the 54 generated copy variants.

## 📋 Features

- **Live SSE Integration:** Real-time updates as deals are distributed and delivered across 6 channels.
- **Analytics Charts (SVG-based):**
  - **Delivery Status Donut:** Breakdown of Successful, Failed, and Pending deliveries.
  - **Success Rate Bar Chart:** Comparison of delivery performance across channels.
  - **Latency Chart:** Visualizes average response times per channel.
  - **Variant × Channel Matrix:** A heatmap showing coverage across A/B variants and channels.
- **Copy Viewer:**
  - View all **54 variants** in one place.
  - Filter by Channel, Variant (Urgency/Value/Social Proof), and Language (EN/HI/TE).
  - Channel-specific UI rendering for Email, WhatsApp, Push, Glance, PayU, and Instagram.
- **Live Event Log:** A scrolling feed of the latest delivery attempts.

## 🛠️ Tech Stack

- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite
- **Styling:** Vanilla CSS (Modern design with glassmorphism and animations)
- **Charts:** Custom SVG components (No heavy chart libraries)
- **Communication:** Server-Sent Events (SSE)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- The GrabOn MCP Server running. Start the backend as described in the [root README](../README.md); it automatically provides the `/events` SSE stream.

### Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Open `http://localhost:5173` in your browser.

## 🏗️ Architecture

The dashboard establishes a persistent connection to `http://localhost:3456/events` (the webhook server). When a simulation starts, it clears the state and begins streaming delivery events, updating the charts and Copy Viewer in real-time.

---

## 📄 License

ISC
