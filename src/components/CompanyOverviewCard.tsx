import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Building2, DollarSign, BarChart3, Activity, Target, Globe } from 'lucide-react';
import { CompanyOverview, QuoteData } from '../types';

interface CompanyOverviewCardProps {
  overview: CompanyOverview;
  quote: QuoteData | null;
  isLoading: boolean;
}

function fmt(n: number, prefix = ''): string {
  if (n >= 1e12) return `${prefix}${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `${prefix}${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${prefix}${(n / 1e6).toFixed(1)}M`;
  return `${prefix}${n.toFixed(2)}`;
}

function pct(n: number) { return `${(n * 100).toFixed(1)}%`; }

export function CompanyOverviewCard({ overview, quote, isLoading }: CompanyOverviewCardProps) {
  if (isLoading) {
    return (
      <div className="glass-panel p-5 space-y-4">
        <div className="loading-shimmer h-8 w-2/3" />
        <div className="loading-shimmer h-4 w-full" />
        <div className="grid grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => <div key={i} className="loading-shimmer h-16 rounded-lg" />)}
        </div>
      </div>
    );
  }

  const priceUp = (quote?.changePercent ?? 0) >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-5"
    >
      {/* Company Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h2 className="text-xl font-serif font-semibold text-surface-900 truncate tracking-tight">{overview.name}</h2>
            <span className="tag-blue font-mono font-bold">{overview.symbol}</span>
            <span className="tag bg-surface-50 border border-surface-200 text-surface-500 font-mono">{overview.exchange}</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-surface-600 font-medium">
              <Building2 className="w-3.5 h-3.5" />{overview.sector}
            </span>
            <span className="text-surface-300">·</span>
            <span className="text-xs text-surface-600 font-medium">{overview.industry}</span>
          </div>
        </div>

        {/* Live Price */}
        {quote && (
          <div className="text-right ml-4 flex-shrink-0">
            <div className="text-3xl font-mono font-bold text-surface-900 tracking-tight">
              ${quote.price.toFixed(2)}
            </div>
            <div className={`flex items-center justify-end gap-1 text-sm font-medium mt-0.5 ${priceUp ? 'text-emerald-600' : 'text-red-600'}`}>
              {priceUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {quote.change >= 0 ? '+' : ''}{quote.change.toFixed(2)} ({quote.changePercent >= 0 ? '+' : ''}{quote.changePercent.toFixed(2)}%)
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-surface-600 leading-relaxed mb-6 line-clamp-2">{overview.description}</p>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Market Cap', value: fmt(overview.marketCap, '$'), icon: DollarSign, color: 'text-brand-700' },
          { label: 'P/E Ratio', value: overview.peRatio > 0 ? overview.peRatio.toFixed(1) + 'x' : 'N/A', icon: BarChart3, color: 'text-amber-700' },
          { label: 'EPS (TTM)', value: `$${overview.eps.toFixed(2)}`, icon: Activity, color: 'text-emerald-700' },
          { label: 'Beta', value: overview.beta.toFixed(2), icon: Activity, color: overview.beta > 1.5 ? 'text-red-600' : 'text-surface-500' },
          { label: 'Revenue Growth', value: (overview.quarterlyRevenueGrowthYOY >= 0 ? '+' : '') + pct(overview.quarterlyRevenueGrowthYOY), icon: TrendingUp, color: overview.quarterlyRevenueGrowthYOY >= 0 ? 'text-emerald-700' : 'text-red-600' },
          { label: 'Profit Margin', value: pct(overview.profitMargin), icon: Target, color: 'text-purple-700' },
          { label: 'ROE', value: pct(overview.returnOnEquityTTM), icon: BarChart3, color: 'text-brand-700' },
          { label: 'Analyst Target', value: overview.analystTargetPrice > 0 ? `$${overview.analystTargetPrice.toFixed(0)}` : 'N/A', icon: Globe, color: 'text-amber-700' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="metric-card bg-surface-50 border border-surface-100">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Icon className={`w-3.5 h-3.5 ${color}`} />
              <span className="metric-label text-[10px] text-surface-500 font-semibold">{label}</span>
            </div>
            <span className={`text-base font-bold font-mono text-surface-900`}>{value}</span>
          </div>
        ))}
      </div>

      {/* 52-Week Range */}
      {quote && (
        <div className="p-4 rounded-xl bg-surface-50 border border-surface-200">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-surface-500 font-medium">52-Week Low</span>
            <span className="text-surface-800 font-semibold">52-Week Range</span>
            <span className="text-surface-500 font-medium">52-Week High</span>
          </div>
          <div className="relative h-2 bg-surface-200 rounded-full overflow-hidden">
            <div
              className="absolute h-full bg-brand-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, ((quote.price - overview.week52Low) / (overview.week52High - overview.week52Low)) * 100))}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs mt-2 font-mono font-medium">
            <span className="text-surface-600">${overview.week52Low.toFixed(2)}</span>
            <span className="text-brand-700 font-bold bg-brand-50 px-2 py-0.5 rounded-md border border-brand-100 shadow-sm">Current: ${quote.price.toFixed(2)}</span>
            <span className="text-surface-600">${overview.week52High.toFixed(2)}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
