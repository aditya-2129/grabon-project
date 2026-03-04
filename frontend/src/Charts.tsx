import type { ChannelStats, DeliveryEvent } from './types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, MessageCircle, Bell, Smartphone, CreditCard, Camera, Zap, DollarSign, Users } from 'lucide-react';

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

// ─── Channel icon components ────────────────────────────────
const CHANNEL_ICON_COMPONENTS: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  email: Mail,
  whatsapp: MessageCircle,
  push: Bell,
  glance: Smartphone,
  payu: CreditCard,
  instagram: Camera,
};

function ChannelIcon({ channel, className = 'w-4 h-4' }: { channel: string; className?: string }) {
  const Icon = CHANNEL_ICON_COMPONENTS[channel];
  if (!Icon) return null;
  return <Icon className={className} style={{ color: CHANNEL_COLORS[channel] }} />;
}

// ─── Variant icon components ────────────────────────────────
const VARIANT_ICON_COMPONENTS: Record<string, { icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; label: string; color: string }> = {
  urgency: { icon: Zap, label: 'Urgency', color: '#f59e0b' },
  value: { icon: DollarSign, label: 'Value', color: '#10b981' },
  social_proof: { icon: Users, label: 'Social', color: '#a855f7' },
};

function VariantIcon({ variant, className = 'w-3.5 h-3.5' }: { variant: string; className?: string }) {
  const info = VARIANT_ICON_COMPONENTS[variant];
  if (!info) return null;
  const Icon = info.icon;
  return <Icon className={className} style={{ color: info.color }} />;
}

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
    <Card className="glass border-border/30 h-full card-hover">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Delivery Status</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center pt-4">
        <div className="relative w-[180px] h-[180px]">
          {/* SVG donut ring (rotated) */}
          <svg viewBox="0 0 180 180" className="-rotate-90 w-full h-full absolute inset-0">
            {/* Background ring */}
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor" className="text-muted/20" strokeWidth="14" />
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
                    strokeWidth="14"
                    strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                    strokeDashoffset={-currentOffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                    style={{ filter: `drop-shadow(0 0 6px ${seg.color}40)` }}
                  />
                );
              })}
          </svg>
          {/* Center text (NOT rotated) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-foreground tabular-nums">{total}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider mt-0.5">total</span>
          </div>
        </div>
        <div className="flex gap-5 mt-6 text-sm flex-wrap justify-center">
          {segments.map((seg) => (
            <div key={seg.label} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: seg.color, boxShadow: `0 0 8px ${seg.color}50` }}></span>
              <span className="text-muted-foreground text-xs">{seg.label}</span>
              <span className="font-bold text-foreground/90 tabular-nums">{seg.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── 2. Channel Success Chart ───────────────────────────────
export function ChannelSuccessChart({ stats }: { stats: ChannelStats[] }) {
  return (
    <Card className="glass border-border/30 h-full card-hover">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Channel Success Rate</CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {stats.map((s) => {
          const rate = s.total > 0 ? Math.round((s.delivered / s.total) * 100) : 0;
          return (
            <div key={s.channel} className="flex items-center gap-3 text-sm group">
              <div className="w-24 text-muted-foreground flex items-center gap-2 group-hover:text-foreground transition-colors">
                <ChannelIcon channel={s.channel} className="w-4 h-4" />
                <span className="capitalize truncate text-xs font-medium">{s.channel}</span>
              </div>
              <div className="flex-1 h-2.5 rounded-full bg-muted/40 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${rate}%`,
                    background: rate === 100
                      ? `linear-gradient(90deg, ${COLORS.delivered}, ${COLORS.delivered}cc)`
                      : rate > 50
                        ? `linear-gradient(90deg, ${CHANNEL_COLORS[s.channel]}, ${CHANNEL_COLORS[s.channel]}cc)`
                        : `linear-gradient(90deg, ${COLORS.failed}, ${COLORS.failed}cc)`,
                    boxShadow: rate > 0 ? `0 0 10px ${rate === 100 ? COLORS.delivered : CHANNEL_COLORS[s.channel]}30` : 'none',
                  }}
                ></div>
              </div>
              <span className="w-10 text-right font-bold tabular-nums text-xs" style={{ color: rate === 100 ? COLORS.delivered : 'inherit' }}>
                {rate}%
              </span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

// ─── 3. Latency Chart ───────────────────────────────────────
export function LatencyChart({ stats }: { stats: ChannelStats[] }) {
  const maxLatency = Math.max(...stats.map((s) => s.avgLatency), 1);

  // Color-code latency: low = green, mid = yellow, high = red
  const latencyColor = (ms: number) => {
    const ratio = ms / maxLatency;
    if (ratio <= 0.4) return COLORS.delivered;
    if (ratio <= 0.7) return COLORS.pending;
    return COLORS.failed;
  };

  return (
    <Card className="glass border-border/30 h-full card-hover">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          Avg Latency by Channel
          <span className="text-[10px] font-normal text-muted-foreground ml-auto tracking-wider uppercase">
            max {maxLatency}ms
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 overflow-hidden">
        <div className="flex items-end gap-1.5 h-[200px] px-1">
          {stats.map((s) => {
            const pct = maxLatency > 0 ? (s.avgLatency / maxLatency) * 100 : 0;
            const color = CHANNEL_COLORS[s.channel];
            const lColor = latencyColor(s.avgLatency);
            return (
              <div key={s.channel} className="flex-1 min-w-0 flex flex-col items-center gap-1 group h-full justify-end">
                {/* Value badge */}
                <div
                  className="text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-full transition-all duration-300 group-hover:scale-110"
                  style={{
                    color: lColor,
                    backgroundColor: `${lColor}18`,
                    border: `1px solid ${lColor}30`,
                  }}
                >
                  {s.avgLatency > 0 ? `${s.avgLatency}ms` : '—'}
                </div>
                {/* Bar container */}
                <div className="w-full flex-1 flex items-end relative max-h-[140px]">
                  {/* Background track */}
                  <div className="absolute inset-0 rounded-lg bg-muted/10 border border-border/20" />
                  {/* Animated bar */}
                  <div
                    className="relative w-full rounded-lg transition-all duration-700 ease-out group-hover:brightness-125"
                    style={{
                      height: `${Math.max(pct, 4)}%`,
                      background: `linear-gradient(180deg, ${color} 0%, ${color}60 100%)`,
                      boxShadow: `0 0 20px ${color}30, inset 0 1px 0 ${color}50`,
                    }}
                  >
                    {/* Shine overlay */}
                    <div
                      className="absolute inset-0 rounded-lg opacity-30"
                      style={{
                        background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 45%, rgba(255,255,255,0.15) 55%, transparent 100%)`,
                      }}
                    />
                  </div>
                </div>
                {/* Channel label */}
                <div className="flex flex-col items-center gap-0.5 pt-1">
                  <ChannelIcon channel={s.channel} className="w-3.5 h-3.5 transition-transform duration-200 group-hover:scale-125" />
                  <span className="text-[8px] text-muted-foreground capitalize font-medium tracking-wide group-hover:text-foreground transition-colors truncate w-full text-center">
                    {s.channel}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        {/* Scale reference lines */}
        <div className="flex justify-between px-1 mt-2 border-t border-border/20 pt-1.5">
          <span className="text-[8px] text-muted-foreground/50 tabular-nums">0ms</span>
          <span className="text-[8px] text-muted-foreground/50 tabular-nums">{Math.round(maxLatency / 2)}ms</span>
          <span className="text-[8px] text-muted-foreground/50 tabular-nums">{maxLatency}ms</span>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── 4. Variant × Channel Heatmap ───────────────────────────
export function VariantHeatmap({ events }: { events: DeliveryEvent[] }) {
  const channels = ['email', 'whatsapp', 'push', 'glance', 'payu', 'instagram'];
  const variants = ['urgency', 'value', 'social_proof'];
  const languages = ['en', 'hi', 'te'];

  // Build lookup: channel-variant → best status across all languages + count
  const lookup = new Map<string, { status: 'delivered' | 'failed' | 'pending' | null; count: number }>();
  for (const ch of channels) {
    for (const v of variants) {
      const key = `${ch}-${v}`;
      const langStatuses = languages.map((lang) => {
        const evt = events.find((e) => e.channel === ch && e.variant === v && e.language === lang);
        return evt?.status ?? null;
      });
      const count = langStatuses.filter((s) => s !== null).length;
      if (langStatuses.some((s) => s === 'delivered')) {
        const allDelivered = langStatuses.every((s) => s === 'delivered' || s === null);
        const anyFailed = langStatuses.some((s) => s === 'failed');
        lookup.set(key, { status: anyFailed ? 'failed' : allDelivered ? 'delivered' : 'pending', count });
      } else if (langStatuses.some((s) => s === 'failed')) {
        lookup.set(key, { status: 'failed', count });
      } else if (langStatuses.some((s) => s === 'pending')) {
        lookup.set(key, { status: 'pending', count });
      } else {
        lookup.set(key, { status: null, count: 0 });
      }
    }
  }

  const statusColor = (status: string | null) => {
    if (status === 'delivered') return COLORS.delivered;
    if (status === 'failed') return COLORS.failed;
    if (status === 'pending') return COLORS.pending;
    return COLORS.border;
  };

  const statusIcon = (status: string | null) => {
    if (status === 'delivered') return '✓';
    if (status === 'failed') return '✕';
    if (status === 'pending') return '●';
    return '';
  };

  return (
    <Card className="glass border-border/30 h-full card-hover">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Variant × Channel Matrix</CardTitle>
      </CardHeader>
      <CardContent className="pt-4 overflow-hidden">
        <div className="flex flex-col gap-1">
          {/* Header row */}
          <div className="flex items-center gap-1 mb-2">
            <div className="w-16 shrink-0" />
            {channels.map((ch) => (
              <div key={ch} className="flex-1 min-w-0 flex justify-center" title={ch}>
                <ChannelIcon channel={ch} className="w-4 h-4" />
              </div>
            ))}
          </div>
          {/* Data rows */}
          {variants.map((v) => {
            const info = VARIANT_ICON_COMPONENTS[v];
            return (
              <div
                key={v}
                className="flex items-center gap-1 py-1.5 px-1 -mx-1 rounded-lg transition-colors duration-200 hover:bg-muted/10 group"
              >
                <div className="w-16 shrink-0 text-[10px] font-medium text-muted-foreground truncate flex items-center gap-1 group-hover:text-foreground transition-colors" title={info?.label}>
                  <VariantIcon variant={v} className="w-3 h-3 shrink-0" />
                  <span className="truncate">{info?.label}</span>
                </div>
                {channels.map((ch) => {
                  const entry = lookup.get(`${ch}-${v}`);
                  const status = entry?.status ?? null;
                  const count = entry?.count ?? 0;
                  const color = statusColor(status);
                  return (
                    <div
                      key={ch}
                      className="flex-1 flex items-center justify-center h-9 rounded-lg transition-all duration-300 hover:scale-105 cursor-pointer relative overflow-hidden"
                      style={{
                        backgroundColor: status ? `${color}18` : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${status ? `${color}35` : 'rgba(255,255,255,0.04)'}`,
                        boxShadow: status === 'delivered' ? `0 0 16px ${color}15` : 'none',
                      }}
                      title={`${ch} / ${info?.label}: ${status ?? 'no data'} (${count}/3 langs)`}
                    >
                      {/* Status icon */}
                      <span
                        className="text-xs font-bold transition-transform duration-200 group-hover:scale-110"
                        style={{
                          color: color,
                          opacity: status ? 1 : 0.15,
                          animation: status === 'pending' ? 'pulse 2s ease-in-out infinite' : 'none',
                        }}
                      >
                        {statusIcon(status)}
                      </span>
                      {/* Language count badge */}
                      {status && count > 0 && (
                        <span
                          className="absolute top-0.5 right-1 text-[7px] font-bold tabular-nums"
                          style={{ color: `${color}80` }}
                        >
                          {count}/3
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-border/20">
          {[
            { status: 'delivered', label: 'Delivered', icon: '✓' },
            { status: 'failed', label: 'Failed', icon: '✕' },
            { status: 'pending', label: 'Pending', icon: '●' },
          ].map((item) => (
            <div key={item.status} className="flex items-center gap-1.5 text-[10px]">
              <span
                className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold"
                style={{
                  color: statusColor(item.status),
                  backgroundColor: `${statusColor(item.status)}18`,
                  border: `1px solid ${statusColor(item.status)}30`,
                }}
              >
                {item.icon}
              </span>
              <span className="text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Export icon helpers for use in other components
export { ChannelIcon, VariantIcon, CHANNEL_COLORS, VARIANT_ICON_COMPONENTS };
