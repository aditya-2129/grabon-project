import { useState, useMemo } from 'react';
import type { DeliveryEvent, CopyContent } from './types';

const CHANNEL_ICONS: Record<string, string> = {
  email: '📧', whatsapp: '💬', push: '🔔',
  glance: '📱', payu: '💳', instagram: '📸',
};

const VARIANT_LABELS: Record<string, string> = {
  urgency: '⚡ Urgency', value: '💰 Value', social_proof: '👥 Social Proof',
};

const LANG_LABELS: Record<string, string> = {
  en: '🇬🇧 EN', hi: '🇮🇳 HI', te: '🇮🇳 TE',
};

function renderContent(content: CopyContent) {
  switch (content.type) {
    case 'email':
      return (
        <div className="copy-content-inner">
          <div className="copy-field">
            <span className="copy-field-label">Subject</span>
            <span className="copy-field-value">{content.data.subject}</span>
          </div>
          <div className="copy-field">
            <span className="copy-field-label">Headline</span>
            <span className="copy-field-value">{content.data.body_headline}</span>
          </div>
          <div className="copy-field">
            <span className="copy-field-label">CTA</span>
            <span className="copy-cta">{content.data.cta}</span>
          </div>
        </div>
      );
    case 'whatsapp':
    case 'glance':
    case 'payu':
      return (
        <div className="copy-content-inner">
          <p className="copy-text">{content.data}</p>
        </div>
      );
    case 'push':
      return (
        <div className="copy-content-inner">
          <div className="copy-field">
            <span className="copy-field-label">Title</span>
            <span className="copy-field-value copy-bold">{content.data.title}</span>
          </div>
          <div className="copy-field">
            <span className="copy-field-label">Body</span>
            <span className="copy-field-value">{content.data.body}</span>
          </div>
        </div>
      );
    case 'instagram':
      return (
        <div className="copy-content-inner">
          <p className="copy-text">{content.data.caption}</p>
          <div className="copy-hashtags">
            {content.data.hashtags.map((tag) => (
              <span key={tag} className="copy-hashtag">#{tag}</span>
            ))}
          </div>
        </div>
      );
    default:
      return <p className="copy-text" style={{ opacity: 0.5 }}>Unknown format</p>;
  }
}

export function CopyViewer({ events }: { events: DeliveryEvent[] }) {
  const [filterChannel, setFilterChannel] = useState<string>('all');
  const [filterVariant, setFilterVariant] = useState<string>('all');
  const [filterLang, setFilterLang] = useState<string>('all');

  // Deduplicate: keep the latest event per channel/variant/language
  const copies = useMemo(() => {
    const seen = new Map<string, DeliveryEvent>();
    for (const evt of events) {
      if (!evt.content) continue;
      const key = `${evt.channel}-${evt.variant}-${evt.language}`;
      if (!seen.has(key)) {
        seen.set(key, evt);
      }
    }
    return Array.from(seen.values());
  }, [events]);

  const filtered = useMemo(() => {
    return copies.filter((e) => {
      if (filterChannel !== 'all' && e.channel !== filterChannel) return false;
      if (filterVariant !== 'all' && e.variant !== filterVariant) return false;
      if (filterLang !== 'all' && e.language !== filterLang) return false;
      return true;
    });
  }, [copies, filterChannel, filterVariant, filterLang]);

  const channels = ['all', 'email', 'whatsapp', 'push', 'glance', 'payu', 'instagram'];
  const variants = ['all', 'urgency', 'value', 'social_proof'];
  const langs = ['all', 'en', 'hi', 'te'];

  return (
    <div className="copy-viewer">
      <div className="copy-viewer-header">
        <h2 className="section-title">📝 Generated Copies ({copies.length}/54)</h2>
        <div className="copy-filters">
          <div className="filter-group">
            <label className="filter-label">Channel</label>
            <div className="filter-pills">
              {channels.map((ch) => (
                <button
                  key={ch}
                  className={`filter-pill ${filterChannel === ch ? 'active' : ''}`}
                  onClick={() => setFilterChannel(ch)}
                >
                  {ch === 'all' ? 'All' : `${CHANNEL_ICONS[ch]} ${ch}`}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <label className="filter-label">Variant</label>
            <div className="filter-pills">
              {variants.map((v) => (
                <button
                  key={v}
                  className={`filter-pill ${filterVariant === v ? 'active' : ''}`}
                  onClick={() => setFilterVariant(v)}
                >
                  {v === 'all' ? 'All' : VARIANT_LABELS[v]}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <label className="filter-label">Language</label>
            <div className="filter-pills">
              {langs.map((l) => (
                <button
                  key={l}
                  className={`filter-pill ${filterLang === l ? 'active' : ''}`}
                  onClick={() => setFilterLang(l)}
                >
                  {l === 'all' ? 'All' : LANG_LABELS[l]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="copy-empty">
          {copies.length === 0
            ? 'Waiting for copies to arrive…'
            : 'No copies match the current filters.'}
        </div>
      ) : (
        <div className="copy-grid">
          {filtered.map((evt) => (
            <div key={`${evt.channel}-${evt.variant}-${evt.language}`} className="copy-card">
              <div className="copy-card-header">
                <div className="copy-card-badges">
                  <span className="copy-badge channel-badge">{CHANNEL_ICONS[evt.channel]} {evt.channel}</span>
                  <span className="copy-badge variant-badge">{VARIANT_LABELS[evt.variant]}</span>
                  <span className="copy-badge lang-badge">{LANG_LABELS[evt.language]}</span>
                </div>
                <span className={`status-tag ${evt.status}`}>{evt.status}</span>
              </div>
              {evt.content && renderContent(evt.content)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
