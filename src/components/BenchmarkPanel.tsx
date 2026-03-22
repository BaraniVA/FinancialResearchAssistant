import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';
import { BarChart3, Plus, X, TrendingUp, TrendingDown, Users } from 'lucide-react';
import { KPIData } from '../types';

interface BenchmarkPanelProps {
  companies: { symbol: string; kpis: KPIData }[];
  onRemove: (symbol: string) => void;
  isLoading: boolean;
}

type KPIMetric = {
  key: keyof KPIData;
  label: string;
  format: (v: number) => string;
  higherIsBetter: boolean;
};

const METRICS: KPIMetric[] = [
  { key: 'revenueGrowth', label: 'Revenue Growth', format: v => `${(v * 100).toFixed(1)}%`, higherIsBetter: true },
  { key: 'operatingMargin', label: 'Operating Margin', format: v => `${(v * 100).toFixed(1)}%`, higherIsBetter: true },
  { key: 'netMargin', label: 'Net Margin', format: v => `${(v * 100).toFixed(1)}%`, higherIsBetter: true },
  { key: 'roe', label: 'ROE', format: v => `${(v * 100).toFixed(1)}%`, higherIsBetter: true },
  { key: 'peRatio', label: 'P/E Ratio', format: v => `${v.toFixed(1)}x`, higherIsBetter: false },
  { key: 'debtToEquity', label: 'Debt/Equity', format: v => v.toFixed(2), higherIsBetter: false },
  { key: 'rdPercent', label: 'R&D / Revenue', format: v => `${(v * 100).toFixed(1)}%`, higherIsBetter: true },
  { key: 'epsGrowth', label: 'EPS Growth', format: v => `${(v * 100).toFixed(1)}%`, higherIsBetter: true },
];

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-900 border border-white/10 rounded-lg p-2.5 text-xs shadow-xl">
        <p className="text-slate-400 mb-1 font-medium">{label}</p>
        {payload.map((p: any) => (
          <div key={p.name} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: p.fill }} />
            <span style={{ color: p.fill }} className="font-mono">{p.name}: {p.value?.toFixed(2)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function BenchmarkPanel({ companies, onRemove, isLoading }: BenchmarkPanelProps) {
  const [activeMetric, setActiveMetric] = useState<KPIMetric>(METRICS[0]);
  const [chartType, setChartType] = useState<'bar' | 'radar'>('bar');

  if (companies.length === 0) {
    return (
      <div className="glass-panel p-12 flex flex-col items-center justify-center text-center min-h-[300px] border-dashed border-surface-300 bg-surface-50/50">
        <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center mb-4">
          <Users className="w-6 h-6 text-brand-600" />
        </div>
        <h3 className="text-sm font-semibold text-surface-900 mb-1">No Companies Added</h3>
        <p className="text-xs text-surface-500 max-w-xs">
          Search for companies and add them to the benchmark using the <span className="text-brand-600 font-medium">+ Add to Benchmark</span> button.
        </p>
      </div>
    );
  }

  // Build bar chart data
  const barData = [{
    metric: activeMetric.label,
    ...Object.fromEntries(companies.map(c => [c.symbol, Number(c.kpis[activeMetric.key]) || 0])),
  }];

  // Build table data
  const metricsToShow = METRICS;

  // Find best value per metric
  const getBestSymbol = (metric: KPIMetric) => {
    const vals = companies.map(c => ({ symbol: c.symbol, val: Number(c.kpis[metric.key]) || 0 }));
    return metric.higherIsBetter
      ? vals.reduce((a, b) => a.val > b.val ? a : b).symbol
      : vals.reduce((a, b) => a.val < b.val ? a : b).symbol;
  };

  // Build radar data
  const radarData = METRICS.map(m => {
    const entry: any = { metric: m.label.replace(' ', '\n') };
    companies.forEach((c, i) => {
      const val = Number(c.kpis[m.key]) || 0;
      // Normalize to 0-100 for radar
      entry[c.symbol] = Math.min(100, Math.max(0, val * (m.key === 'peRatio' || m.key === 'debtToEquity' ? 10 : 100)));
    });
    return entry;
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {/* Header */}
      <div className="glass-panel p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-brand-700" />
            <h3 className="text-lg font-serif font-semibold text-surface-900 tracking-tight">Peer Benchmarking</h3>
            <span className="tag-blue ml-2">{companies.length} companies</span>
          </div>
          <div className="flex items-center gap-1 bg-surface-100 p-1 rounded-md">
            {(['bar', 'radar'] as const).map(t => (
              <button key={t} onClick={() => setChartType(t)}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${chartType === t ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-500 hover:text-surface-700'}`}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Company Pills */}
        <div className="flex flex-wrap gap-2 mt-4">
          {companies.map((c, i) => (
            <div key={c.symbol} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium shadow-sm bg-white"
              style={{ borderColor: `${COLORS[i]}40`, color: COLORS[i] }}>
              <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />
              <span className="text-surface-800">{c.symbol}</span>
              <button onClick={() => onRemove(c.symbol)} className="ml-1 text-surface-400 hover:text-surface-800 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Metric Selector + Chart */}
      <div className="glass-panel p-5">
        <div className="flex flex-wrap gap-2 mb-6">
          {METRICS.map(m => (
            <button key={m.key as string}
              onClick={() => setActiveMetric(m)}
              className={`text-[11px] px-3 py-1.5 rounded-full border transition-all ${activeMetric.key === m.key ? 'bg-brand-50 border-brand-300 text-brand-800 font-semibold shadow-sm' : 'bg-white border-surface-200 text-surface-600 hover:text-surface-900 hover:bg-surface-50 shadow-subtle'}`}>
              {m.label}
            </button>
          ))}
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart data={barData} barGap={8}>
                <XAxis dataKey="metric" tick={{ fill: '#737373', fontSize: 11 }} axisLine={{stroke: '#e5e5e5'}} tickLine={false} />
                <YAxis tick={{ fill: '#737373', fontSize: 11 }} axisLine={{stroke: '#e5e5e5'}} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{fill: '#f5f5f5'}} />
                {companies.map((c, i) => (
                  <Bar key={c.symbol} dataKey={c.symbol} fill={COLORS[i]} radius={[4, 4, 0, 0]} maxBarSize={60} />
                ))}
              </BarChart>
            ) : (
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e5e5e5" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: '#737373', fontSize: 10 }} />
                {companies.map((c, i) => (
                  <Radar key={c.symbol} name={c.symbol} dataKey={c.symbol}
                    stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.15} strokeWidth={2} />
                ))}
              </RadarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* KPI Comparison Table */}
      <div className="glass-panel overflow-hidden">
        <div className="p-4 border-b border-surface-200 bg-surface-50/50">
          <h4 className="text-xs font-semibold text-surface-700 uppercase tracking-wider">Full KPI Comparison</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-surface-200 bg-surface-50">
                <th className="text-left p-3.5 text-surface-600 font-semibold">Metric</th>
                {companies.map((c, i) => (
                  <th key={c.symbol} className="p-3.5 text-center font-bold font-mono" style={{ color: COLORS[i] }}>{c.symbol}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {metricsToShow.map((metric, ri) => {
                const best = getBestSymbol(metric);
                return (
                  <tr key={metric.key as string} className="hover:bg-surface-50/50 transition-colors">
                    <td className="p-3.5 text-surface-700 flex items-center gap-2 font-medium">
                      {metric.higherIsBetter ? <TrendingUp className="w-3.5 h-3.5 text-surface-400" /> : <TrendingDown className="w-3.5 h-3.5 text-surface-400" />}
                      {metric.label}
                    </td>
                    {companies.map(c => {
                      const val = Number(c.kpis[metric.key]) || 0;
                      const isBest = c.symbol === best;
                      return (
                        <td key={c.symbol} className={`p-3.5 text-center font-mono ${isBest ? 'font-bold text-emerald-700 bg-emerald-50/30' : 'text-surface-600 font-medium'}`}>
                          <span className={`${isBest ? 'inline-flex items-center gap-1.5' : ''}`}>
                            {isBest && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />}
                            {metric.format(val)}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="p-3 bg-surface-50 border-t border-surface-200">
          <p className="text-[10px] text-surface-500 flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            Highlighted values indicate best performer per metric
          </p>
        </div>
      </div>
    </motion.div>
  );
}
