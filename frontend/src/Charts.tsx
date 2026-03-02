import type { ChannelStats, DeliveryEvent } from './types';

// ─── Color palette ──────────────────────────────────────────
const COLORS = {
  delivered: '#10b981',
  failed: '#ef4444',
  pending: '#f59e0b',
  bg: '#1a1b23',
  border: '#2e303d',
  text: '#a0a6b5',
  textBright: '#f0f1f5',
};

const CHANNEL_COLORS: Record<string, string> = {
  email: '#3b82f6',
  whatsapp: '#22c55e',
  push: '#f59e0b',
  glance: '#a855f7',
  payu: '#ec4899',
  instagram: '#f97316',
};

const CHANNEL_ICONS: Record<string, string> = {
  email: '📧',
  whatsapp: '💬',
  push: '🔔',
  glance: '📱',
  payu: '💳',
  instagram: '📸',
};

// ─── 1. Delivery Donut ──────────────────────────────────────
export function DeliveryDonut({
  delivered,
  failed,
  pending,
  total,
}: {
  delivered: number;
  failed: number;
  pending: number;
  total: number;
}) {
  const r = 70;
  const cx = 90;
  const cy = 90;
  const circumference = 2 * Math.PI * r;

  const segments = [
    { value: delivered, color: COLORS.delivered, label: 'Delivered' },
    { value: failed, color: COLORS.failed, label: 'Failed' },
    { value: pending, color: COLORS.pending, label: 'Pending' },
  ];

  let offset = 0;

  return (
    <div className="chart-card">
      <h3 className="chart-title">Delivery Status</h3>
      <div className="donut-container">
        <svg viewBox="0 0 180 180" className="donut-svg">
          {/* Background ring */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={COLORS.border} strokeWidth="16" />
          {/* Data segments */}
          {total > 0 &&
            segments.map((seg, i) => {
              const dashLength = (seg.value / total) * circumference;
              const currentOffset = offset;
              offset += dashLength;
              return (
                <circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth="16"
                  strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                  strokeDashoffset={-currentOffset}
                  strokeLinecap="round"
                  className="donut-segment"
                  style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }}
                />
              );
            })}
          {/* Center text */}
          <text x={cx} y={cy - 8} textAnchor="middle" fill={COLORS.textBright} fontSize="28" fontWeight="700">
            {total}
          </text>
          <text x={cx} y={cy + 14} textAnchor="middle" fill={COLORS.text} fontSize="11">
            total
          </text>
        </svg>
        <div className="donut-legend">
          {segments.map((seg) => (
            <div key={seg.label} className="legend-item">
              <span className="legend-dot" style={{ backgroundColor: seg.color }}></span>
              <span className="legend-label">{seg.label}</span>
              <span className="legend-value">{seg.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 2. Channel Success Chart ───────────────────────────────
export function ChannelSuccessChart({ stats }: { stats: ChannelStats[] }) {
  return (
    <div className="chart-card">
      <h3 className="chart-title">Channel Success Rate</h3>
      <div className="bar-chart">
        {stats.map((s) => {
          const rate = s.total > 0 ? Math.round((s.delivered / s.total) * 100) : 0;
          return (
            <div key={s.channel} className="bar-row">
              <div className="bar-label">
                <span className="bar-icon">{CHANNEL_ICONS[s.channel]}</span>
                <span>{s.channel}</span>
              </div>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{
                    width: `${rate}%`,
                    backgroundColor: rate === 100 ? COLORS.delivered : rate > 50 ? CHANNEL_COLORS[s.channel] : COLORS.failed,
                  }}
                ></div>
              </div>
              <span className="bar-value" style={{ color: rate === 100 ? COLORS.delivered : COLORS.text }}>
                {rate}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── 3. Latency Chart ───────────────────────────────────────
export function LatencyChart({ stats }: { stats: ChannelStats[] }) {
  const maxLatency = Math.max(...stats.map((s) => s.avgLatency), 1);

  return (
    <div className="chart-card">
      <h3 className="chart-title">Avg Latency by Channel</h3>
      <div className="latency-chart">
        <svg viewBox={`0 0 ${stats.length * 60} 140`} className="latency-svg">
          {/* Horizontal grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((frac) => (
            <line
              key={frac}
              x1="0"
              y1={120 - frac * 100}
              x2={stats.length * 60}
              y2={120 - frac * 100}
              stroke={COLORS.border}
              strokeWidth="0.5"
            />
          ))}
          {/* Bars */}
          {stats.map((s, i) => {
            const barHeight = maxLatency > 0 ? (s.avgLatency / maxLatency) * 100 : 0;
            const x = i * 60 + 15;
            return (
              <g key={s.channel}>
                <rect
                  x={x}
                  y={120 - barHeight}
                  width="30"
                  height={barHeight}
                  rx="4"
                  fill={CHANNEL_COLORS[s.channel]}
                  opacity="0.85"
                  className="latency-bar"
                />
                <text
                  x={x + 15}
                  y={115 - barHeight}
                  textAnchor="middle"
                  fill={COLORS.textBright}
                  fontSize="9"
                  fontWeight="600"
                >
                  {s.avgLatency > 0 ? `${s.avgLatency}ms` : ''}
                </text>
                <text x={x + 15} y={135} textAnchor="middle" fill={COLORS.text} fontSize="8">
                  {CHANNEL_ICONS[s.channel]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// ─── 4. Variant × Channel Heatmap ───────────────────────────
export function VariantHeatmap({ events }: { events: DeliveryEvent[] }) {
  const channels = ['email', 'whatsapp', 'push', 'glance', 'payu', 'instagram'];
  const variants = ['urgency', 'value', 'social_proof'];
  const languages = ['en', 'hi', 'te'];

  // Build lookup: channel-variant → best status across all languages
  const lookup = new Map<string, 'delivered' | 'failed' | 'pending' | null>();
  for (const ch of channels) {
    for (const v of variants) {
      const key = `${ch}-${v}`;
      const langStatuses = languages.map((lang) => {
        const evt = events.find((e) => e.channel === ch && e.variant === v && e.language === lang);
        return evt?.status ?? null;
      });
      // Aggregate: all delivered → green, any failed → red, any pending → yellow, else gray
      if (langStatuses.some((s) => s === 'delivered')) {
        const allDelivered = langStatuses.every((s) => s === 'delivered' || s === null);
        const anyFailed = langStatuses.some((s) => s === 'failed');
        lookup.set(key, anyFailed ? 'failed' : allDelivered ? 'delivered' : 'pending');
      } else if (langStatuses.some((s) => s === 'failed')) {
        lookup.set(key, 'failed');
      } else if (langStatuses.some((s) => s === 'pending')) {
        lookup.set(key, 'pending');
      } else {
        lookup.set(key, null);
      }
    }
  }

  const statusColor = (status: string | null) => {
    if (status === 'delivered') return COLORS.delivered;
    if (status === 'failed') return COLORS.failed;
    if (status === 'pending') return COLORS.pending;
    return COLORS.border;
  };

  const variantLabel = (v: string) => {
    if (v === 'urgency') return '⚡ Urgency';
    if (v === 'value') return '💰 Value';
    return '👥 Social';
  };

  return (
    <div className="chart-card">
      <h3 className="chart-title">Variant × Channel Matrix</h3>
      <div className="heatmap">
        {/* Header row */}
        <div className="heatmap-row heatmap-header">
          <div className="heatmap-label"></div>
          {channels.map((ch) => (
            <div key={ch} className="heatmap-col-header">
              {CHANNEL_ICONS[ch]}
            </div>
          ))}
        </div>
        {/* Data rows */}
        {variants.map((v) => (
          <div key={v} className="heatmap-row">
            <div className="heatmap-label">{variantLabel(v)}</div>
            {channels.map((ch) => {
              const status = lookup.get(`${ch}-${v}`) ?? null;
              return (
                <div
                  key={ch}
                  className="heatmap-cell"
                  style={{ backgroundColor: statusColor(status), opacity: status ? 0.85 : 0.3 }}
                  title={`${ch} / ${v}: ${status ?? 'no data'}`}
                ></div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
