import React from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Lightbulb, Activity } from 'lucide-react';
import { CompanyOverview } from '../types';

interface AIAnalysisPanelProps {
  overview: CompanyOverview;
  analysis: {
    summary: string;
    keyRisks: string[];
    keyOpportunities: string[];
    financialHighlights: string[];
    managementTone: 'positive' | 'neutral' | 'cautious' | 'negative';
    sentimentScore: number;
  } | null;
  isLoading: boolean;
  onAnalyze: () => void;
}

const toneConfig = {
  positive: { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', label: 'Positive', icon: TrendingUp },
  neutral: { color: 'text-slate-300', bg: 'bg-white/5 border-white/10', label: 'Neutral', icon: Activity },
  cautious: { color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', label: 'Cautious', icon: AlertTriangle },
  negative: { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', label: 'Negative', icon: TrendingDown },
};

export function AIAnalysisPanel({ overview, analysis, isLoading, onAnalyze }: AIAnalysisPanelProps) {
  const tone = analysis ? toneConfig[analysis.managementTone] : null;
  const ToneIcon = tone?.icon;

  return (
    <div className="glass-panel p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center">
            <Brain className="w-4 h-4 text-brand-600" />
          </div>
          <div>
            <h3 className="text-base font-serif font-semibold text-surface-900 tracking-tight">AI Analysis</h3>
            <p className="text-[10px] text-surface-500 font-medium">Gemini 2.0 Flash</p>
          </div>
        </div>
        <button
          onClick={onAnalyze}
          disabled={isLoading}
          className="btn-primary text-xs py-1.5 px-3"
        >
          {isLoading ? (
            <><span className="w-3 h-3 border-2 border-brand-200 border-t-white rounded-full animate-spin inline-block" /> Analyzing</>
          ) : (
            <><Brain className="w-3 h-3" /> {analysis ? 'Re-analyze' : 'Analyze'}</>
          )}
        </button>
      </div>

      {!analysis && !isLoading && (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-10 bg-surface-50/50 rounded-xl border border-dashed border-surface-200">
          <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center mb-3">
            <Brain className="w-6 h-6 text-brand-400" />
          </div>
          <p className="text-sm font-medium text-surface-700 mb-1">Run AI analysis</p>
          <p className="text-xs text-surface-500 max-w-xs">Generate instant insights on risks, opportunities, and overall sentiment.</p>
        </div>
      )}

      {isLoading && (
        <div className="flex-1 space-y-3 animate-pulse mt-4">
          <div className="h-20 bg-surface-100 rounded-lg" />
          <div className="h-24 bg-surface-100 rounded-lg" />
          <div className="h-20 bg-surface-100 rounded-lg" />
        </div>
      )}

      {analysis && !isLoading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 space-y-5 overflow-y-auto mt-2">
          {/* Sentiment Score */}
          <div className="p-4 rounded-xl bg-surface-50 border border-surface-200 shadow-subtle">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-surface-600 font-semibold uppercase tracking-wider">Sentiment Score</span>
              <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[11px] font-bold ${tone?.bg} ${tone?.color}`}>
                {ToneIcon && <ToneIcon className="w-3 h-3" />}
                {tone?.label}
              </div>
            </div>
            <div className="relative h-2.5 bg-surface-200 rounded-full overflow-hidden">
              <div
                className={`absolute h-full rounded-full transition-all duration-1000 ${analysis.sentimentScore >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}
                style={{
                  left: analysis.sentimentScore >= 0 ? '50%' : `${50 + analysis.sentimentScore / 2}%`,
                  width: `${Math.abs(analysis.sentimentScore) / 2}%`
                }}
              />
              <div className="absolute top-0 left-1/2 w-px h-full bg-surface-400" />
            </div>
            <div className="flex justify-between text-[10px] text-surface-500 mt-2 font-medium">
              <span>Bearish</span>
              <span className="font-mono font-bold text-surface-700">{analysis.sentimentScore > 0 ? '+' : ''}{analysis.sentimentScore}</span>
              <span>Bullish</span>
            </div>
          </div>

          {/* Summary */}
          <div className="p-4 rounded-xl bg-brand-50 border border-brand-100 shadow-subtle">
            <p className="text-[11px] font-bold text-brand-800 uppercase tracking-wider mb-2">Executive Summary</p>
            <p className="text-sm text-surface-800 leading-relaxed font-serif">{analysis.summary}</p>
          </div>

          {/* Financial Highlights */}
          <div>
            <p className="section-header">Financial Highlights</p>
            <div className="space-y-2">
              {analysis.financialHighlights.map((h, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-surface-700">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Risks */}
          <div>
            <p className="section-header">Key Risks</p>
            <div className="space-y-2">
              {analysis.keyRisks.map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-surface-700">
                  <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span>{r}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Opportunities */}
          <div>
            <p className="section-header">Opportunities</p>
            <div className="space-y-2">
              {analysis.keyOpportunities.map((o, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-surface-700">
                  <Lightbulb className="w-4 h-4 text-brand-600 mt-0.5 flex-shrink-0" />
                  <span>{o}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
