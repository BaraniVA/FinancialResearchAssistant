import React from 'react';
import { motion } from 'framer-motion';
import { Mic, TrendingUp, TrendingDown, Minus, MessageSquare, Target, Zap, AlertTriangle, ThumbsUp } from 'lucide-react';

interface EarningsAnalysis {
  sentimentScore: number;
  managementTone: string;
  guidanceChange: 'raised' | 'maintained' | 'lowered' | 'withdrawn';
  guidanceSummary: string;
  keyThemes: string[];
  positiveSignals: string[];
  negativeSignals: string[];
}

interface EarningsIntelligencePanelProps {
  analysis: EarningsAnalysis | null;
  isLoading: boolean;
  onAnalyze: () => void;
  symbol: string;
}

const guidanceConfig = {
  raised: { color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: TrendingUp, label: 'Guidance Raised' },
  maintained: { color: 'text-surface-700', bg: 'bg-surface-50 border-surface-200', icon: Minus, label: 'Guidance Maintained' },
  lowered: { color: 'text-red-700', bg: 'bg-red-50 border-red-200', icon: TrendingDown, label: 'Guidance Lowered' },
  withdrawn: { color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: AlertTriangle, label: 'Guidance Withdrawn' },
};

export function EarningsIntelligencePanel({ analysis, isLoading, onAnalyze, symbol }: EarningsIntelligencePanelProps) {
  const guidance = analysis ? guidanceConfig[analysis.guidanceChange] : null;
  const GuidanceIcon = guidance?.icon;

  return (
    <div className="glass-panel p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center">
            <Mic className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-serif font-semibold text-surface-900 tracking-tight">Earnings Intelligence</h3>
            <p className="text-[11px] text-surface-500 font-medium">Management tone & guidance analysis</p>
          </div>
        </div>
        <button onClick={onAnalyze} disabled={isLoading} className="btn-primary text-xs py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white shadow-sm border-none">
          {isLoading ? <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Parsing</> : <><Zap className="w-3 h-3" /> {analysis ? 'Refresh' : 'Analyze Call'}</>}
        </button>
      </div>

      {!analysis && !isLoading && (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-10 bg-surface-50/50 rounded-xl border border-dashed border-surface-200">
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mb-3">
            <Mic className="w-6 h-6 text-amber-500" />
          </div>
          <p className="text-sm font-medium text-surface-700 mb-1">Earnings Call Intelligence</p>
          <p className="text-xs text-surface-500 max-w-xs">Sentiment scoring and guidance detection</p>
        </div>
      )}

      {isLoading && (
        <div className="flex-1 space-y-3 animate-pulse mt-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-surface-100 rounded-xl" />)}
        </div>
      )}

      {analysis && !isLoading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 space-y-5 overflow-y-auto mt-2">
          {/* Guidance Change Banner */}
          <div className={`flex items-center gap-3 p-4 rounded-xl border ${guidance?.bg} shadow-sm`}>
            <div className={`p-2 rounded-lg bg-white shadow-subtle ${guidance?.color}`}>
              {GuidanceIcon && <GuidanceIcon className="w-5 h-5" />}
            </div>
            <div>
              <div className={`text-sm font-bold tracking-tight ${guidance?.color}`}>{guidance?.label}</div>
              <div className="text-sm text-surface-700 font-medium mt-0.5">{analysis.guidanceSummary}</div>
            </div>
          </div>

          {/* Sentiment Score */}
          <div className="p-4 rounded-xl bg-surface-50 border border-surface-200 shadow-subtle">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-surface-600 font-semibold uppercase tracking-wider">Management Sentiment</span>
              <span className={`text-sm font-bold font-mono px-2 py-0.5 rounded border ${analysis.sentimentScore > 20 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : analysis.sentimentScore < -20 ? 'text-red-700 bg-red-50 border-red-200' : 'text-surface-700 bg-surface-100 border-surface-200'}`}>
                {analysis.sentimentScore > 0 ? '+' : ''}{analysis.sentimentScore}
              </span>
            </div>
            <div className="relative h-2.5 bg-surface-200 rounded-full overflow-hidden mb-3">
              <div
                className={`absolute h-full rounded-full transition-all duration-1000 ${analysis.sentimentScore >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}
                style={{
                  left: analysis.sentimentScore >= 0 ? '50%' : `${50 + analysis.sentimentScore / 2}%`,
                  width: `${Math.abs(analysis.sentimentScore) / 2}%`,
                }}
              />
              <div className="absolute top-0 left-1/2 w-px h-full bg-surface-400" />
            </div>
            <p className="text-xs text-surface-700 italic font-serif leading-relaxed">{analysis.managementTone}</p>
          </div>

          {/* Key Themes */}
          <div>
            <p className="section-header">Key Themes</p>
            <div className="flex flex-wrap gap-2">
              {analysis.keyThemes.map((t, i) => (
                <span key={i} className="tag-gold text-[11px] px-2.5 py-1">
                  <Target className="w-3 h-3" />
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Signals */}
          <div className="grid grid-cols-1 gap-4">
            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
              <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-3">Positive Signals</p>
              <div className="space-y-2.5">
                {analysis.positiveSignals.map((s, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-surface-800 font-medium">
                    <ThumbsUp className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    {s}
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-red-50/50 border border-red-100">
              <p className="text-[11px] font-bold text-red-800 uppercase tracking-wider mb-3">Concerns Raised</p>
              <div className="space-y-2.5">
                {analysis.negativeSignals.map((s, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-surface-800 font-medium">
                    <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    {s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
