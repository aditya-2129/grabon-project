import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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

  const getDedupedEvents = useCallback((rawEvents: DeliveryEvent[]) => {
    const seen = new Map<string, DeliveryEvent>();
    for (const evt of rawEvents) {
      const key = `${evt.channel}-${evt.variant}-${evt.language}`;
      if (!seen.has(key)) {
        seen.set(key, evt);
      }
    }
    return Array.from(seen.values());
  }, []);

  const channelStats: ChannelStats[] = useMemo(() => {
    const deduped = getDedupedEvents(events);
    
    return ALL_CHANNELS.map((channel) => {
      const chEvents = deduped.filter((e) => e.channel === channel);

      return {
        channel,
        delivered: chEvents.filter((e) => e.status === 'delivered').length,
        failed: chEvents.filter((e) => e.status === 'failed').length,
        pending: chEvents.filter((e) => e.status === 'pending').length,
        total: chEvents.length,
        avgLatency: chEvents.length > 0
          ? Math.round(chEvents.reduce((s, e) => s + e.latencyMs, 0) / chEvents.length)
          : 0,
      };
    });
  }, [events, getDedupedEvents]);

  const totalDelivered = channelStats.reduce((s, c) => s + c.delivered, 0);
  const totalFailed = channelStats.reduce((s, c) => s + c.failed, 0);
  const totalPending = channelStats.reduce((s, c) => s + c.pending, 0);
  const total = totalDelivered + totalFailed + totalPending;
  const successRate = total > 0 ? Math.round((totalDelivered / total) * 100) : 0;

  return {
    events,
    dedupedEvents: getDedupedEvents(events),
    channelStats,
    isConnected,
    isSimulating,
    dealInfo,
    summary: { totalDelivered, totalFailed, totalPending, total, successRate },
  };
}
