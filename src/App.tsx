import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, ShieldAlert, FileText, Search, Mic, TrendingUp, Calculator } from 'lucide-react';

import { Header } from './components/Header';
import { CompanySearch } from './components/CompanySearch';
import { CompanyOverviewCard } from './components/CompanyOverviewCard';
import { AIAnalysisPanel } from './components/AIAnalysisPanel';
import { SECFilingsPanel } from './components/SECFilingsPanel';
import { SemanticSearchPanel } from './components/SemanticSearchPanel';
import { BenchmarkPanel } from './components/BenchmarkPanel';
import { RedFlagsPanel } from './components/RedFlagsPanel';
import { EarningsIntelligencePanel } from './components/EarningsIntelligencePanel';

import { ModelingCopilot } from './components/ModelingCopilot';

import {
  fetchCompanyOverview,
  fetchQuote,
  fetchSECFilings,
  buildKPIData,
  analyzeCompanyWithAI,
  detectRedFlags,
  semanticSearch,
  analyzeEarningsCall,
} from './services/api';

import { CompanyOverview, QuoteData, SECFiling, KPIData } from './types';

interface EarningsAnalysis {
  sentimentScore: number;
  managementTone: string;
  guidanceChange: 'raised' | 'maintained' | 'lowered' | 'withdrawn';
  guidanceSummary: string;
  keyThemes: string[];
  positiveSignals: string[];
  negativeSignals: string[];
}

export default function App() {
  // Main company data
  const [symbol, setSymbol] = useState<string>('');
  const [overview, setOverview] = useState<CompanyOverview | null>(null);
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [filings, setFilings] = useState<SECFiling[]>([]);
  const [kpis, setKpis] = useState<KPIData | null>(null);

  // Loading states
  const [isLoadingCompany, setIsLoadingCompany] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isLoadingRedFlags, setIsLoadingRedFlags] = useState(false);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [isLoadingEarnings, setIsLoadingEarnings] = useState(false);

  // Analysis results
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [redFlags, setRedFlags] = useState<any[]>([]);
  const [searchResult, setSearchResult] = useState<any>(null);
  const [earningsAnalysis, setEarningsAnalysis] = useState<EarningsAnalysis | null>(null);

  // Benchmark companies
  const [benchmarkCompanies, setBenchmarkCompanies] = useState<{ symbol: string; kpis: KPIData }[]>([]);
  const [isLoadingBenchmark, setIsLoadingBenchmark] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [isOnline] = useState(navigator.onLine);

  // Refs for scrolling the "story"
  const topRef = useRef<HTMLDivElement>(null);
  const aiRef = useRef<HTMLDivElement>(null);
  const riskRef = useRef<HTMLDivElement>(null);
  const earningsRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const benchmarkRef = useRef<HTMLDivElement>(null);
  const modelingRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const SECTIONS = [
    { label: 'Executive Summary', icon: TrendingUp, ref: topRef },
    { label: 'AI Deep Dive', icon: BarChart3, ref: aiRef },
    { label: 'Risk & Red Flags', icon: ShieldAlert, ref: riskRef },
    { label: 'Modeling Copilot', icon: Calculator, ref: modelingRef },
    { label: 'Earnings Intel', icon: Mic, ref: earningsRef },
    { label: 'Semantic Search', icon: Search, ref: searchRef },
    { label: 'Peer Benchmarks', icon: BarChart3, ref: benchmarkRef },
  ];

  // ─── Auto-Triggering Analyses ──────────────────────────────────────────────

  const runAIAnalysis = async (sym: string, ov: CompanyOverview) => {
    setIsLoadingAI(true);
    try {
      const result = await analyzeCompanyWithAI(sym, ov);
      setAiAnalysis(result);
    } catch { setError('AI analysis failed. Check your Gemini API key.'); }
    finally { setIsLoadingAI(false); }
  };

  const runRedFlagScan = async (sym: string, ov: CompanyOverview, kp: KPIData) => {
    setIsLoadingRedFlags(true);
    try {
      const flags = await detectRedFlags(sym, ov, kp);
      setRedFlags(flags);
    } catch { setError('Red flag scan failed.'); }
    finally { setIsLoadingRedFlags(false); }
  };

  const runEarningsIntel = async (sym: string, ov: CompanyOverview) => {
    setIsLoadingEarnings(true);
    try {
      const result = await analyzeEarningsCall(sym, ov);
      setEarningsAnalysis(result);
    } catch { setError('Earnings analysis failed.'); }
    finally { setIsLoadingEarnings(false); }
  };

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleSearch = useCallback(async (sym: string) => {
    setSymbol(sym);
    setIsLoadingCompany(true);
    setError(null);
    setAiAnalysis(null);
    setRedFlags([]);
    setSearchResult(null);
    setEarningsAnalysis(null);

    // Scroll to top when starting a new search
    topRef.current?.scrollIntoView({ behavior: 'smooth' });

    try {
      const [ov, qt, fl] = await Promise.all([
        fetchCompanyOverview(sym),
        fetchQuote(sym),
        fetchSECFilings(sym),
      ]);
      setOverview(ov);
      setQuote(qt);
      setFilings(fl);
      const kpiData = buildKPIData(sym, ov);
      setKpis(kpiData);

      // Auto-trigger the rest of the story asynchronously to build out the report
      runAIAnalysis(sym, ov);
      runRedFlagScan(sym, ov, kpiData);
      runEarningsIntel(sym, ov);

    } catch (err) {
      setError(`Failed to load data for ${sym}. Please try again.`);
    } finally {
      setIsLoadingCompany(false);
    }
  }, []);

  const handleSemanticSearch = useCallback(async (query: string) => {
    if (!overview) return;
    setIsLoadingSearch(true);
    try {
      const result = await semanticSearch(query, symbol, overview);
      setSearchResult(result);
    } catch { setError('Semantic search failed.'); }
    finally { setIsLoadingSearch(false); }
  }, [overview, symbol]);

  const handleAddToBenchmark = useCallback(async (sym: string) => {
    if (benchmarkCompanies.some(c => c.symbol === sym)) return;
    if (benchmarkCompanies.length >= 5) { setError('Maximum 5 companies in benchmark'); return; }
    setIsLoadingBenchmark(true);
    try {
      const ov = await fetchCompanyOverview(sym);
      const kpiData = buildKPIData(sym, ov);
      setBenchmarkCompanies(prev => [...prev, { symbol: sym, kpis: kpiData }]);
      setTimeout(() => scrollToSection(benchmarkRef), 100);
    } catch { setError(`Failed to load ${sym} for benchmark.`); }
    finally { setIsLoadingBenchmark(false); }
  }, [benchmarkCompanies]);

  const handleRemoveFromBenchmark = (sym: string) => {
    setBenchmarkCompanies(prev => prev.filter(c => c.symbol !== sym));
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#fdfdfc] text-surface-800" style={{ fontFamily: '"Inter", sans-serif' }}>
      <Header isOnline={isOnline} isLoading={isLoadingCompany} />

      <div className="flex flex-1 overflow-hidden">
        {/* ── Left Sidebar ── */}
        <aside className="w-64 flex-shrink-0 border-r border-surface-200 overflow-y-auto p-3 space-y-3 bg-surface-50/50">
          <CompanySearch
            onSearch={handleSearch}
            onAddToBenchmark={handleAddToBenchmark}
            isLoading={isLoadingCompany}
            currentSymbol={symbol || undefined}
          />

          {/* Table of Contents (Navigation) */}
          {overview && (
            <div className="glass-panel p-2">
              <p className="text-[10px] font-bold text-surface-500 uppercase tracking-wider px-3 pt-2 mb-2">Report Contents</p>
              <nav className="space-y-0.5">
                {SECTIONS.map(({ label, icon: Icon, ref }) => (
                  <button
                    key={label}
                    onClick={() => scrollToSection(ref)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all duration-200 group hover:bg-surface-100/50 text-surface-600 hover:text-surface-900"
                  >
                    <Icon className="w-3.5 h-3.5 flex-shrink-0 text-surface-400 group-hover:text-surface-600" />
                    <span className="text-xs font-medium">{label}</span>
                  </button>
                ))}
              </nav>
            </div>
          )}

          {/* SEC Filings attached to sidebar for easy reference */}
          {overview && (
            <SECFilingsPanel filings={filings} isLoading={isLoadingCompany} symbol={symbol} />
          )}
        </aside>

        {/* ── Main Content (The "Story") ── */}
        <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
          {/* Welcome Screen */}
          {!symbol && !isLoadingCompany && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="h-full flex flex-col items-center justify-center text-center p-8 max-w-3xl mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-surface-50 border border-surface-200 flex items-center justify-center mb-6 shadow-sm">
                <BarChart3 className="w-8 h-8 text-surface-800" />
              </div>
              <h1 className="text-3xl font-serif font-semibold text-surface-900 mb-4 tracking-tight">
                AI Financial Research
              </h1>
              <p className="text-sm text-surface-500 mb-10 leading-relaxed max-w-lg">
                Enter a ticker to generate an instant, continuous executive report. The AI will autonomously scan SEC filings, extract key risks, parse recent earnings transcripts, and evaluate sentiment—all formatted as a cohesive story.
              </p>
              <div className="grid grid-cols-2 gap-4 text-left w-full">
                {[
                  { icon: TrendingUp, title: 'Continuous Story', desc: 'Read your analysis top-to-bottom without clicking tabs.' },
                  { icon: ShieldAlert, title: 'Auto-Scanning', desc: 'Red flags and anomalies are parsed instantly.' },
                  { icon: Mic, title: 'Earnings Intel', desc: 'Tone analysis automatically triggered on load.' },
                  { icon: BarChart3, title: 'Peer Benchmarking', desc: 'Compare your target against competitors dynamically.' },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="glass-card p-4 flex items-start gap-3">
                    <div className="p-2 bg-surface-50 rounded-md border border-surface-100 flex-shrink-0">
                      <Icon className="w-4 h-4 text-surface-700" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-surface-900">{title}</div>
                      <div className="text-[10px] text-surface-500 mt-1">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Loading Initial State */}
          {isLoadingCompany && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="loading-shimmer h-48 rounded-xl" />
              <div className="loading-shimmer h-64 rounded-xl" />
              <div className="loading-shimmer h-64 rounded-xl" />
            </div>
          )}

          {/* Continuous Report Flow */}
          {symbol && !isLoadingCompany && overview && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto pb-20 space-y-8">
              
              {/* 1. Executive Summary */}
              <div ref={topRef} className="scroll-mt-8 space-y-6">
                <CompanyOverviewCard overview={overview} quote={quote} isLoading={isLoadingCompany} />
              </div>

              {/* 2. AI Deep Dive */}
              <div ref={aiRef} className="scroll-mt-8 min-h-[300px]">
                <AIAnalysisPanel
                  overview={overview}
                  analysis={aiAnalysis}
                  isLoading={isLoadingAI}
                  onAnalyze={() => runAIAnalysis(symbol, overview)}
                />
              </div>

              <div className="border-t border-dashed border-surface-200" />

              {/* 3. Risk & Red Flags */}
              <div ref={riskRef} className="scroll-mt-8 min-h-[300px]">
                <RedFlagsPanel
                  overview={overview}
                  kpis={kpis}
                  redFlags={redFlags}
                  isLoading={isLoadingRedFlags}
                  onScan={() => { if(kpis) runRedFlagScan(symbol, overview, kpis) }}
                />
              </div>

              <div className="border-t border-dashed border-surface-200" />

              {/* 3.5 Financial Modeling */}
              {kpis && (
                <div ref={modelingRef} className="scroll-mt-8 min-h-[300px]">
                  <ModelingCopilot
                    overview={overview}
                    kpis={kpis}
                    symbol={symbol}
                  />
                </div>
              )}

              {kpis && <div className="border-t border-dashed border-surface-200" />}

              {/* 4. Earnings Intel */}
              <div ref={earningsRef} className="scroll-mt-8 min-h-[300px]">
                <EarningsIntelligencePanel
                  analysis={earningsAnalysis}
                  isLoading={isLoadingEarnings}
                  onAnalyze={() => runEarningsIntel(symbol, overview)}
                  symbol={symbol}
                />
              </div>

              <div className="border-t border-dashed border-surface-200" />

              {/* 5. Semantic Search */}
              <div ref={searchRef} className="scroll-mt-8 min-h-[300px]">
                <SemanticSearchPanel
                  onSearch={handleSemanticSearch}
                  result={searchResult}
                  isLoading={isLoadingSearch}
                  symbol={symbol}
                />
              </div>

              <div className="border-t border-dashed border-surface-200" />

              {/* 6. Benchmark */}
              <div ref={benchmarkRef} className="scroll-mt-8 min-h-[300px]">
                <BenchmarkPanel
                  companies={benchmarkCompanies}
                  onRemove={handleRemoveFromBenchmark}
                  isLoading={isLoadingBenchmark}
                />
              </div>

            </motion.div>
          )}
        </main>
      </div>

      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm shadow-floating flex items-center gap-3"
          >
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 ml-2 text-lg leading-none">×</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
