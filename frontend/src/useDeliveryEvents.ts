import { useState, useEffect, useCallback, useRef } from 'react';
import type { DeliveryEvent, ChannelStats, Channel } from './types';

const ALL_CHANNELS: Channel[] = ['email', 'whatsapp', 'push', 'glance', 'payu', 'instagram'];

export function useDeliveryEvents() {
  const [events, setEvents] = useState<DeliveryEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [dealInfo, setDealInfo] = useState<{ merchant: string; category: string; discount: string } | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const es = new EventSource('/events');
    eventSourceRef.current = es;

    es.onopen = () => {
      setIsConnected(true);
    };

    es.addEventListener('delivery', (e) => {
      const event: DeliveryEvent = JSON.parse(e.data);
      setEvents((prev) => [event, ...prev]);
    });

    es.addEventListener('simulation_start', (e) => {
      const data = JSON.parse(e.data);
      setDealInfo(data);
      setIsSimulating(true);
      setEvents([]);
    });

    es.addEventListener('simulation_end', () => {
      setIsSimulating(false);
    });

    es.onerror = () => {
      setIsConnected(false);
      setTimeout(() => {
        if (eventSourceRef.current === es) {
          connect();
        }
      }, 2000);
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      eventSourceRef.current?.close();
    };
  }, [connect]);

  const channelStats: ChannelStats[] = ALL_CHANNELS.map((channel) => {
    const channelEvents = events.filter((e) => e.channel === channel);
    // Deduplicate — only keep the latest event per channel/variant/language
    const uniqueKeys = new Set<string>();
    const dedupedEvents: DeliveryEvent[] = [];
    for (const evt of channelEvents) {
      const key = `${evt.channel}-${evt.variant}-${evt.language}`;
      if (!uniqueKeys.has(key)) {
        uniqueKeys.add(key);
        dedupedEvents.push(evt);
      }
    }

    return {
      channel,
      delivered: dedupedEvents.filter((e) => e.status === 'delivered').length,
      failed: dedupedEvents.filter((e) => e.status === 'failed').length,
      pending: dedupedEvents.filter((e) => e.status === 'pending').length,
      total: dedupedEvents.length,
      avgLatency: dedupedEvents.length > 0
        ? Math.round(dedupedEvents.reduce((s, e) => s + e.latencyMs, 0) / dedupedEvents.length)
        : 0,
    };
  });

  const totalDelivered = channelStats.reduce((s, c) => s + c.delivered, 0);
  const totalFailed = channelStats.reduce((s, c) => s + c.failed, 0);
  const totalPending = channelStats.reduce((s, c) => s + c.pending, 0);
  const total = totalDelivered + totalFailed + totalPending;
  const successRate = total > 0 ? Math.round((totalDelivered / total) * 100) : 0;

  return {
    events,
    channelStats,
    isConnected,
    isSimulating,
    dealInfo,
    summary: { totalDelivered, totalFailed, totalPending, total, successRate },
  };
}
