import { useDeliveryEvents } from './useDeliveryEvents';
import { DeliveryDonut, ChannelSuccessChart, LatencyChart, VariantHeatmap } from './Charts';
import { CopyViewer } from './CopyViewer';

export default function App() {
  const { events, channelStats, isConnected, isSimulating, dealInfo, summary } = useDeliveryEvents();

  return (
    <div className="dashboard">
      <header className="header">
        <div>
          <h1>GrabOn Deal Distribution</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Live Webhook Delivery Dashboard
          </p>
        </div>
        <div className="status-badge">
          <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></span>
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
      </header>

      {isSimulating && dealInfo && (
        <div className="card" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--accent-blue)' }}>
          <div className="card-label">Active Simulation</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>
            {dealInfo.merchant} — {dealInfo.category} — {dealInfo.discount}
          </div>
        </div>
      )}

      <div className="summary-cards">
        <div className="card">
          <div className="card-label">Total Outputs</div>
          <div className="card-value">{summary.total}</div>
        </div>
        <div className="card">
          <div className="card-label">Success Rate</div>
          <div className="card-value" style={{ color: 'var(--accent-green)' }}>
            {summary.successRate}%
          </div>
        </div>
        <div className="card">
          <div className="card-label">Delivered</div>
          <div className="card-value">{summary.totalDelivered}</div>
        </div>
        <div className="card">
          <div className="card-label">Failed</div>
          <div className="card-value" style={{ color: 'var(--accent-red)' }}>
            {summary.totalFailed}
          </div>
        </div>
      </div>

      {/* ── Analytics Charts ── */}
      <h2 className="section-title">📊 Analytics</h2>
      <div className="charts-grid">
        <DeliveryDonut
          delivered={summary.totalDelivered}
          failed={summary.totalFailed}
          pending={summary.totalPending}
          total={summary.total}
        />
        <ChannelSuccessChart stats={channelStats} />
        <LatencyChart stats={channelStats} />
        <VariantHeatmap events={events} />
      </div>

      <div className="stats-grid">
        <div className="card">
          <h2 style={{ marginBottom: '1.5rem' }}>Channel Distribution</h2>
          <div className="channel-list">
            {channelStats.map((stat) => (
              <div key={stat.channel} className="channel-item">
                <div className="channel-name">{stat.channel}</div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${stat.total > 0 ? (stat.delivered / stat.total) * 100 : 0}%` }}
                  ></div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.85rem' }}>
                  {stat.delivered}/{stat.total}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 style={{ marginBottom: '1.5rem' }}>Live Delivery Log</h2>
          <div className="event-log">
            {events.length === 0 ? (
              <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                Waiting for events...
              </div>
            ) : (
              events.map((event, i) => (
                <div key={i} className="event-item">
                  <div>
                    <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{event.channel}</span>
                    <span style={{ color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>
                      ({event.variant}, {event.language})
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{event.latencyMs}ms</span>
                    <span className={`status-tag ${event.status}`}>
                      {event.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Generated Copies ── */}
      <CopyViewer events={events} />
    </div>
  );
}
