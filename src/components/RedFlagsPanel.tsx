import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, AlertTriangle, AlertCircle, Info, ChevronDown, ChevronUp, Scan, CheckCircle } from 'lucide-react';
import { CompanyOverview, KPIData } from '../types';

interface RedFlag {
  severity: 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
}

interface RedFlagsPanelProps {
  overview: CompanyOverview;
  kpis: KPIData | null;
  redFlags: RedFlag[];
  isLoading: boolean;
  onScan: () => void;
}

const severityConfig = {
  high: {
    color: 'text-red-700',
    bg: 'bg-red-50 border-red-200',
    badge: 'risk-badge-high',
    icon: AlertTriangle,
    label: 'HIGH RISK',
  },
  medium: {
    color: 'text-amber-700',
    bg: 'bg-amber-50 border-amber-200',
    badge: 'risk-badge-medium',
    icon: AlertCircle,
    label: 'MEDIUM',
  },
  low: {
    color: 'text-blue-700',
    bg: 'bg-blue-50 border-blue-200',
    badge: 'tag-blue',
    icon: Info,
    label: 'LOW',
  },
};

const categoryColors: Record<string, string> = {
  revenue: 'tag-red',
  debt: 'tag-gold',
  governance: 'tag-purple',
  operations: 'tag-blue',
  regulatory: 'tag-red',
  accounting: 'tag-gold',
};

function RedFlagCard({ flag, index }: { flag: RedFlag; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = severityConfig[flag.severity];
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className={`rounded-xl border p-4 ${cfg.bg} transition-all duration-200 shadow-sm`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg bg-white shadow-sm flex-shrink-0 ${cfg.color}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <span className={`text-sm font-bold ${cfg.color} tracking-tight`}>{flag.title}</span>
            <button
              onClick={() => setExpanded(!expanded)}
              className={`flex-shrink-0 transition-colors ${cfg.color} hover:opacity-70`}
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className={cfg.badge}>{cfg.label}</span>
            <span className={categoryColors[flag.category] || 'tag-blue'}>
              {flag.category.toUpperCase()}
            </span>
          </div>
          <AnimatePresence>
            {expanded && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-sm text-surface-800 leading-relaxed font-medium"
              >
                {flag.description}
              </motion.p>
            )}
          </AnimatePresence>
          {!expanded && (
            <p className="text-sm text-surface-700 line-clamp-1 font-medium">{flag.description}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function RedFlagsPanel({ overview, kpis, redFlags, isLoading, onScan }: RedFlagsPanelProps) {
  const highCount = redFlags.filter(f => f.severity === 'high').length;
  const mediumCount = redFlags.filter(f => f.severity === 'medium').length;
  const lowCount = redFlags.filter(f => f.severity === 'low').length;

  const riskScore = redFlags.length === 0 ? null :
    Math.max(0, 100 - (highCount * 30 + mediumCount * 15 + lowCount * 5));

  return (
    <div className="space-y-4">
      {/* Header Panel */}
      <div className="glass-panel p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-semibold text-surface-900 tracking-tight">Risk & Red Flag Detection</h3>
              <p className="text-[11px] text-surface-500 font-medium">AI-powered forensic analysis — {overview.name}</p>
            </div>
          </div>
          <button
            onClick={onScan}
            disabled={isLoading || !kpis}
            className="btn-primary text-xs py-1.5 px-3 bg-red-600 hover:bg-red-700 shadow-sm"
          >
            {isLoading ? (
              <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Scanning</>
            ) : (
              <><Scan className="w-3 h-3" /> {redFlags.length > 0 ? 'Re-scan' : 'Scan for Risks'}</>
            )}
          </button>
        </div>

        {/* Risk Score */}
        {riskScore !== null && !isLoading && (
          <div className="p-4 rounded-xl bg-surface-50 border border-surface-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-surface-600 font-semibold uppercase tracking-wider">Portfolio Health Score</span>
              <span className={`text-xl font-bold font-mono ${riskScore >= 70 ? 'text-emerald-600' : riskScore >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                {riskScore}/100
              </span>
            </div>
            <div className="relative h-2.5 bg-surface-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${riskScore}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={`absolute h-full rounded-full ${riskScore >= 70 ? 'bg-emerald-500' : riskScore >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
              />
            </div>
            <div className="flex items-center gap-4 mt-3">
              {highCount > 0 && <span className="text-[11px] text-red-700 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-200">{highCount} High Risk</span>}
              {mediumCount > 0 && <span className="text-[11px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">{mediumCount} Medium</span>}
              {lowCount > 0 && <span className="text-[11px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">{lowCount} Low</span>}
            </div>
          </div>
        )}

        {/* KPI Snapshot */}
        {kpis && (
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              { label: 'Revenue Growth', value: `${(kpis.revenueGrowth * 100).toFixed(1)}%`, ok: kpis.revenueGrowth > 0 },
              { label: 'Debt/Equity', value: kpis.debtToEquity.toFixed(2), ok: kpis.debtToEquity < 1.5 },
              { label: 'Current Ratio', value: kpis.currentRatio.toFixed(2), ok: kpis.currentRatio >= 1.0 },
            ].map(({ label, value, ok }) => (
              <div key={label} className="bg-white border border-surface-100 rounded-lg p-3 text-center shadow-subtle">
                <div className={`text-base font-bold font-mono ${ok ? 'text-emerald-600' : 'text-red-600'}`}>{value}</div>
                <div className="text-[10px] text-surface-500 mt-1 font-medium">{label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="glass-panel p-10 flex flex-col items-center justify-center bg-surface-50/50">
          <div className="w-12 h-12 rounded-full border-4 border-red-100 border-t-red-600 animate-spin mb-4" />
          <p className="text-base font-medium text-surface-800 mb-1">Running forensic scan...</p>
          <p className="text-sm text-surface-500">Checking revenue trends, leverage, governance signals</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && redFlags.length === 0 && kpis && (
        <div className="glass-panel p-12 flex flex-col items-center justify-center text-center bg-surface-50/50 border-dashed border-surface-300">
          <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4">
            <CheckCircle className="w-6 h-6 text-emerald-600" />
          </div>
          <p className="text-base font-semibold text-surface-900 mb-1">No red flags detected</p>
          <p className="text-sm text-surface-500">Click "Scan for Risks" to run an AI forensic analysis</p>
        </div>
      )}

      {!isLoading && !kpis && (
        <div className="glass-panel p-12 flex flex-col items-center justify-center text-center bg-surface-50/50 border-dashed border-surface-300">
          <ShieldAlert className="w-10 h-10 text-surface-400 mx-auto mb-3" />
          <p className="text-sm text-surface-500 font-medium">Search for a company first, then run risk detection</p>
        </div>
      )}

      {/* Red Flags List */}
      {!isLoading && redFlags.length > 0 && (
        <div className="space-y-3">
          {/* Sort: high first */}
          {[...redFlags]
            .sort((a, b) => { const order = { high: 0, medium: 1, low: 2 }; return order[a.severity] - order[b.severity]; })
            .map((flag, i) => (
              <RedFlagCard key={i} flag={flag} index={i} />
            ))}
        </div>
      )}

      {/* Disclaimer */}
      {redFlags.length > 0 && !isLoading && (
        <div className="bg-surface-50 border border-surface-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-surface-500 mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-surface-600 leading-relaxed font-medium">
              Red flags are AI-generated and based on available financial data. Always validate with primary sources (SEC filings, earnings transcripts) before making investment decisions.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
