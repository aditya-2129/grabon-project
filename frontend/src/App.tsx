import { useDeliveryEvents } from './useDeliveryEvents';
import { DeliveryDonut, ChannelSuccessChart, LatencyChart, VariantHeatmap } from './Charts';
import { CopyViewer } from './CopyViewer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, Send, CheckCircle2, XCircle, BarChart3, Zap } from 'lucide-react';

export default function App() {
  const { events, dedupedEvents, channelStats, isConnected, isSimulating, dealInfo, summary } = useDeliveryEvents();

  return (
    <div className="min-h-screen bg-background text-foreground font-sans relative overflow-x-hidden">
      {/* Background gradient mesh */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent-blue/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent-purple/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 md:py-10 space-y-8">
        {/* ── Header ── */}
        <header className="glass rounded-2xl p-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center shadow-lg shadow-accent-blue/20">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gradient">GrabOn Deal Distribution</h1>
                <p className="text-muted-foreground text-sm mt-0.5">
                  Live Webhook Delivery Dashboard
                </p>
              </div>
            </div>
            <Badge variant={isConnected ? "default" : "secondary"} className={`text-sm py-1.5 px-4 rounded-full transition-all ${isConnected ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/15 text-red-400 border border-red-500/30'}`}>
              <span className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-emerald-400 animate-pulse-glow' : 'bg-red-400'}`}></span>
              {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>
        </header>

        {/* ── Active Simulation Banner ── */}
        {isSimulating && dealInfo && (
          <div className="animate-slide-up">
            <Card className="border-l-4 border-l-accent-blue bg-accent-blue/5 shadow-none border-border/30 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-accent-blue/5 to-accent-purple/5" />
              <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-accent-blue/20 flex items-center justify-center">
                    <Activity className="text-accent-blue w-4 h-4 animate-pulse" />
                  </div>
                  <span className="font-semibold text-accent-blue text-sm tracking-wide uppercase">Active Simulation</span>
                </div>
                <div className="text-lg font-semibold text-foreground/90">
                  {dealInfo.merchant} <span className="text-muted-foreground mx-2">•</span> {dealInfo.category} <span className="text-muted-foreground mx-2">•</span> {dealInfo.discount}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatCard
            title="Total Outputs"
            value={summary.total}
            icon={<Send className="w-5 h-5" />}
            iconColor="from-accent-blue to-blue-600"
            delay={0}
          />
          <StatCard
            title="Success Rate"
            value={`${summary.successRate}%`}
            icon={<BarChart3 className="w-5 h-5" />}
            iconColor="from-emerald-400 to-emerald-600"
            valueClass="text-emerald-400"
            delay={1}
          />
          <StatCard
            title="Delivered"
            value={summary.totalDelivered}
            icon={<CheckCircle2 className="w-5 h-5" />}
            iconColor="from-emerald-400 to-teal-600"
            delay={2}
          />
          <StatCard
            title="Failed"
            value={summary.totalFailed}
            icon={<XCircle className="w-5 h-5" />}
            iconColor="from-red-400 to-rose-600"
            valueClass="text-red-400"
            delay={3}
          />
        </div>

        {/* ── Analytics Charts ── */}
        <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <h2 className="text-2xl font-bold flex items-center gap-3 mt-12 mb-6">
            <div className="w-8 h-8 rounded-lg bg-accent-purple/20 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-accent-purple" />
            </div>
            Analytics
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="lg:col-span-1">
              <DeliveryDonut
                delivered={summary.totalDelivered}
                failed={summary.totalFailed}
                pending={summary.totalPending}
                total={summary.total}
              />
            </div>
            <div className="lg:col-span-1">
              <ChannelSuccessChart stats={channelStats} />
            </div>
            <div className="lg:col-span-1">
              <LatencyChart stats={channelStats} />
            </div>
            <div className="lg:col-span-1">
              <VariantHeatmap events={events} />
            </div>
          </div>
        </div>

        {/* ── Channel Distribution & Event Log ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mt-6">
          <ChannelDistribution stats={channelStats} />
          <EventLog events={events} />
        </div>

        {/* ── Generated Copies ── */}
        <CopyViewer events={dedupedEvents} />
      </div>
    </div>
  );
}

/* ── Stat Card Component ── */
function StatCard({
  title,
  value,
  icon,
  iconColor,
  valueClass = '',
  delay = 0,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconColor: string;
  valueClass?: string;
  delay?: number;
}) {
  return (
    <Card className="glass card-hover animate-fade-in border-border/30" style={{ animationDelay: `${delay * 0.1}s` }}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</CardTitle>
        <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${iconColor} flex items-center justify-center text-white shadow-md`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-4xl font-bold tabular-nums ${valueClass}`}>{value}</div>
      </CardContent>
    </Card>
  );
}

/* ── Channel Distribution ── */
function ChannelDistribution({ stats }: { stats: import('./types').ChannelStats[] }) {
  return (
    <Card className="glass border-border/30 card-hover">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Channel Distribution</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {stats.map((stat) => {
          const percentage = stat.total > 0 ? (stat.delivered / stat.total) * 100 : 0;
          return (
            <div key={stat.channel} className="flex items-center justify-between text-sm group">
              <span className="w-24 capitalize text-muted-foreground group-hover:text-foreground transition-colors">{stat.channel}</span>
              <Progress value={percentage} className="h-2 flex-1 mx-4" />
              <span className="w-14 text-right tabular-nums text-muted-foreground font-mono text-xs">
                {stat.delivered}/{stat.total}
              </span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

/* ── Event Log ── */
function EventLog({ events }: { events: import('./types').DeliveryEvent[] }) {
  return (
    <Card className="glass border-border/30 flex flex-col max-h-[400px] card-hover">
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-glow" />
          Live Delivery Log
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0 relative">
        <ScrollArea className="h-[300px] px-6 pb-6">
          {events.length === 0 ? (
            <div className="text-muted-foreground text-center py-12 flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center">
                <Activity className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <p className="text-sm">Waiting for events...</p>
            </div>
          ) : (
            <div className="space-y-2">
              {events.map((event, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border/30 bg-background/30 text-sm hover:bg-muted/20 transition-colors group">
                  <div className="flex flex-col">
                    <span className="font-semibold capitalize text-foreground/90">{event.channel}</span>
                    <span className="text-muted-foreground text-xs uppercase tracking-wider mt-0.5">
                      {event.variant} • {event.language}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-muted-foreground font-mono text-xs">{event.latencyMs}ms</span>
                    <Badge variant={event.status === 'delivered' ? 'default' : event.status === 'failed' ? 'destructive' : 'secondary'}
                      className={event.status === 'delivered' ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25" : event.status === 'failed' ? 'bg-red-500/15 text-red-400 border border-red-500/30' : ""}>
                      {event.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
