import { useState, useMemo } from 'react';
import type { DeliveryEvent, CopyContent } from './types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { ChannelIcon, VariantIcon, VARIANT_ICON_COMPONENTS } from './Charts';

const LANG_LABELS: Record<string, string> = {
  en: 'EN', hi: 'HI', te: 'TE',
};

function renderContent(content: CopyContent) {
  switch (content.type) {
    case 'email':
      return (
        <div className="space-y-3 text-sm">
          <div className="flex flex-col gap-1.5 pb-3 border-b border-border/30">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Subject</span>
            <span className="text-foreground/90 font-medium">{content.data.subject}</span>
          </div>
          <div className="flex flex-col gap-1.5 pb-3 border-b border-border/30">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Headline</span>
            <span className="text-foreground/90 font-medium">{content.data.body_headline}</span>
          </div>
          <div className="flex flex-col gap-1.5 pt-1">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">CTA</span>
            <span className="inline-block mt-1 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-lg self-start text-center text-xs shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30 transition-shadow cursor-pointer">{content.data.cta}</span>
          </div>
        </div>
      );
    case 'whatsapp':
    case 'glance':
    case 'payu':
      return (
        <div className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
          <p>{content.data}</p>
        </div>
      );
    case 'push':
      return (
        <div className="space-y-3 text-sm">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Title</span>
            <span className="font-semibold text-foreground/90">{content.data.title}</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Body</span>
            <span className="text-foreground/80">{content.data.body}</span>
          </div>
        </div>
      );
    case 'instagram':
      return (
        <div className="space-y-3 text-sm">
          <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">{content.data.caption}</p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {content.data.hashtags.map((tag) => (
              <span key={tag} className="text-blue-400 font-medium hover:text-blue-300 transition-colors cursor-pointer text-xs">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      );
    default:
      return <p className="text-sm opacity-50 italic">Unknown format</p>;
  }
}

export function CopyViewer({ events }: { events: DeliveryEvent[] }) {
  const [filterChannel, setFilterChannel] = useState<string>('all');
  const [filterVariant, setFilterVariant] = useState<string>('all');
  const [filterLang, setFilterLang] = useState<string>('all');

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (filterChannel !== 'all' && e.channel !== filterChannel) return false;
      if (filterVariant !== 'all' && e.variant !== filterVariant) return false;
      if (filterLang !== 'all' && e.language !== filterLang) return false;
      return true;
    });
  }, [events, filterChannel, filterVariant, filterLang]);

  const channels = ['all', 'email', 'whatsapp', 'push', 'glance', 'payu', 'instagram'];
  const variants = ['all', 'urgency', 'value', 'social_proof'];
  const langs = ['all', 'en', 'hi', 'te'];

  return (
    <div className="space-y-6 mt-12 animate-fade-in" style={{ animationDelay: '0.4s' }}>
      {/* ── Filter Section ── */}
      <div className="glass rounded-2xl p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <h2 className="text-2xl font-bold flex items-center gap-3 m-0">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <FileText className="w-4 h-4 text-amber-400" />
            </div>
            Generated Copies
            <Badge variant="secondary" className="text-xs font-mono ml-2 bg-muted/50">{events.length}/54</Badge>
          </h2>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Channel</label>
            <div className="flex flex-wrap gap-2">
              {channels.map((ch) => (
                <Button
                  key={ch}
                  variant={filterChannel === ch ? 'default' : 'secondary'}
                  size="sm"
                  className={`rounded-full h-8 px-3.5 text-xs transition-all ${filterChannel === ch ? 'shadow-md' : 'bg-muted/30 hover:bg-muted/50'}`}
                  onClick={() => setFilterChannel(ch)}
                >
                  {ch === 'all' ? 'All' : (
                    <span className="flex items-center gap-1.5">
                      <ChannelIcon channel={ch} className="w-3.5 h-3.5" />
                      <span className="capitalize">{ch}</span>
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Variant</label>
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => (
                  <Button
                    key={v}
                    variant={filterVariant === v ? 'default' : 'outline'}
                    size="sm"
                    className={`rounded-full h-8 px-3.5 text-xs transition-all ${filterVariant === v ? 'shadow-md' : 'border-border/30 hover:border-border/60'}`}
                    onClick={() => setFilterVariant(v)}
                  >
                    {v === 'all' ? 'All' : (
                      <span className="flex items-center gap-1.5">
                        <VariantIcon variant={v} className="w-3.5 h-3.5" />
                        <span>{VARIANT_ICON_COMPONENTS[v]?.label}</span>
                      </span>
                    )}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Language</label>
              <div className="flex gap-2">
                {langs.map((l) => (
                  <Button
                    key={l}
                    variant={filterLang === l ? 'default' : 'outline'}
                    size="sm"
                    className={`rounded-full h-8 px-3.5 text-xs transition-all ${filterLang === l ? 'shadow-md' : 'border-border/30 hover:border-border/60'}`}
                    onClick={() => setFilterLang(l)}
                  >
                    {l === 'all' ? 'All' : LANG_LABELS[l]}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Copy Cards ── */}
      {filtered.length === 0 ? (
        <Card className="glass border-dashed border-2 border-border/30 py-20">
          <CardContent className="flex items-center justify-center text-muted-foreground text-center flex-col gap-4">
            <div className="w-16 h-16 rounded-2xl bg-muted/20 flex items-center justify-center">
              <FileText className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <p className="text-sm">
              {events.length === 0
                ? 'Waiting for copies to arrive…'
                : 'No copies match the current filters.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {filtered.map((evt, idx) => (
            <Card
              key={`${evt.channel}-${evt.variant}-${evt.language}`}
              className="glass card-hover border-border/20 group overflow-hidden flex flex-col h-full animate-fade-in"
              style={{ animationDelay: `${idx * 0.04}s` }}
            >
              <CardHeader className="bg-muted/20 border-b border-border/20 p-4 pb-3 flex flex-row items-center justify-between gap-2 m-0 space-y-0 relative">
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="secondary" className="bg-background/60 hover:bg-background/80 border border-border/30 capitalize font-medium text-[11px]">
                    <ChannelIcon channel={evt.channel} className="w-3 h-3 mr-1.5" /> {evt.channel}
                  </Badge>
                  <Badge variant="outline" className="border-border/30 bg-background/30 font-normal text-[10px]">
                    <VariantIcon variant={evt.variant} className="w-3 h-3 mr-1" /> {VARIANT_ICON_COMPONENTS[evt.variant]?.label}
                  </Badge>
                  <Badge variant="outline" className="border-border/30 bg-background/30 font-mono tracking-wider text-[10px]">{LANG_LABELS[evt.language]}</Badge>
                </div>
                <Badge 
                  variant={evt.status === 'delivered' ? 'default' : evt.status === 'failed' ? 'destructive' : 'secondary'}
                  className={`absolute top-0 right-0 rounded-none rounded-bl-lg px-3 py-1 text-[9px] uppercase tracking-widest font-semibold ${
                    evt.status === 'delivered' 
                      ? 'bg-emerald-500/15 text-emerald-400 border-l border-b border-emerald-500/20 hover:bg-emerald-500/25' 
                      : evt.status === 'failed'
                        ? 'bg-red-500/15 text-red-400 border-l border-b border-red-500/20'
                        : ''
                  }`}
                >
                  {evt.status}
                </Badge>
              </CardHeader>
              <CardContent className="flex-1 p-5">
                {evt.content && renderContent(evt.content)}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
