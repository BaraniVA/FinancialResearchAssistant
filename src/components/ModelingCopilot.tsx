import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Table2, Calculator, ArrowRight, TrendingUp, TrendingDown, Target, HelpCircle } from 'lucide-react';
import { CompanyOverview, KPIData } from '../types';

interface ModelingCopilotProps {
  overview: CompanyOverview;
  kpis: KPIData;
  symbol: string;
}

export function ModelingCopilot({ overview, kpis, symbol }: ModelingCopilotProps) {
  const [activeModel, setActiveTab] = useState<'3statement' | 'sensitivity'>('3statement');

  // Base assumptions
  const baseRevenue = kpis.revenue || overview.marketCap * 0.1; // Fallback if revenue missing
  const growthRate = kpis.revenueGrowth;
  const margin = kpis.operatingMargin;
  const taxRate = 0.21;
  
  // Forecast 3 Years
  const forecast = [1, 2, 3].map(year => {
    const rev = baseRevenue * Math.pow(1 + growthRate, year);
    const opInc = rev * margin;
    const taxes = opInc > 0 ? opInc * taxRate : 0;
    const netInc = opInc - taxes;
    
    // Simplistic Balance Sheet & Cash Flow skeleton
    const receivables = rev * 0.12; 
    const inventory = rev * 0.08;
    const payables = rev * 0.09;
    
    const dac = rev * 0.04; // Depreciation & Amortization
    const capex = rev * 0.06;
    const fcf = netInc + dac - capex - ((receivables + inventory) - payables)*0.1;

    return {
      year: new Date().getFullYear() + year,
      revenue: rev,
      opInc: opInc,
      netInc: netInc,
      fcf: fcf,
      assets: receivables + inventory + (capex*year),
      liabilities: payables,
    };
  });

  const fmt = (num: number) => `$${(num / 1e9).toFixed(1)}B`;

  // Sensitivity Analysis Scenarios (Revenue Growth vs. Operating Margin)
  const marginSensitivities = [margin - 0.05, margin, margin + 0.05];
  const growthSensitivities = [growthRate - 0.05, growthRate, growthRate + 0.05];

  return (
    <div className="glass-panel p-5 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shadow-sm">
            <Calculator className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-serif font-semibold text-surface-900 tracking-tight">Financial Modeling Copilot</h3>
            <p className="text-[11px] text-surface-500 font-medium">Auto-populating skeleton models & sensitivity</p>
          </div>
        </div>
        
        {/* Toggle */}
        <div className="flex items-center gap-1 bg-surface-100 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('3statement')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeModel === '3statement' ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-500 hover:text-surface-700'}`}
          >
            3-Statement
          </button>
          <button 
            onClick={() => setActiveTab('sensitivity')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeModel === 'sensitivity' ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-500 hover:text-surface-700'}`}
          >
            Sensitivity
          </button>
        </div>
      </div>

      {activeModel === '3statement' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="bg-surface-50 border border-surface-200 rounded-xl overflow-hidden">
            <div className="p-3 border-b border-surface-200 bg-white/50 flex justify-between items-center">
              <span className="text-xs font-bold text-surface-700 uppercase tracking-wider">Income Statement Skeleton</span>
              <span className="tag bg-white border-surface-200 text-surface-500 text-[10px]">Base Assumption: {(growthRate*100).toFixed(1)}% Growth</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-surface-100 text-surface-600 border-b border-surface-200">
                    <th className="p-2.5 font-medium">Line Item</th>
                    <th className="p-2.5 font-mono text-right font-medium">Current</th>
                    {forecast.map(f => <th key={f.year} className="p-2.5 font-mono text-right text-brand-700">{f.year}E</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100 bg-white">
                  <tr className="hover:bg-surface-50 transition-colors">
                    <td className="p-2.5 font-medium text-surface-800">Total Revenue</td>
                    <td className="p-2.5 text-right font-mono text-surface-600">{fmt(baseRevenue)}</td>
                    {forecast.map(f => <td key={f.year} className="p-2.5 text-right font-mono font-medium text-surface-900">{fmt(f.revenue)}</td>)}
                  </tr>
                  <tr className="hover:bg-surface-50 transition-colors">
                    <td className="p-2.5 font-medium text-surface-800">Operating Income (EBIT)</td>
                    <td className="p-2.5 text-right font-mono text-surface-600">{fmt(baseRevenue * margin)}</td>
                    {forecast.map(f => <td key={f.year} className="p-2.5 text-right font-mono text-surface-800">{fmt(f.opInc)}</td>)}
                  </tr>
                  <tr className="hover:bg-surface-50 transition-colors">
                    <td className="p-2.5 font-medium text-surface-800">Taxes (21%)</td>
                    <td className="p-2.5 text-right font-mono text-surface-600">{fmt(Math.max(0, baseRevenue * margin * taxRate))}</td>
                    {forecast.map(f => <td key={f.year} className="p-2.5 text-right font-mono text-red-600/80">({fmt(f.opInc > 0 ? f.opInc * taxRate : 0)})</td>)}
                  </tr>
                  <tr className="bg-brand-50/30">
                    <td className="p-2.5 font-bold text-surface-900">Net Income</td>
                    <td className="p-2.5 text-right font-mono text-surface-600 font-bold">{fmt((baseRevenue * margin) - Math.max(0, baseRevenue * margin * taxRate))}</td>
                    {forecast.map(f => <td key={f.year} className="p-2.5 text-right font-mono font-bold text-brand-700">{fmt(f.netInc)}</td>)}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-surface-50 border border-surface-200 rounded-xl overflow-hidden">
             <div className="p-3 border-b border-surface-200 bg-white/50">
              <span className="text-xs font-bold text-surface-700 uppercase tracking-wider">Cash Flow Skeleton</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <tbody className="divide-y divide-surface-100 bg-white">
                  <tr className="hover:bg-surface-50 transition-colors">
                    <td className="p-2.5 font-medium text-surface-800">Net Income</td>
                    <td className="p-2.5 text-right font-mono text-surface-600">—</td>
                    {forecast.map(f => <td key={f.year} className="p-2.5 text-right font-mono text-surface-800">{fmt(f.netInc)}</td>)}
                  </tr>
                   <tr className="hover:bg-surface-50 transition-colors">
                    <td className="p-2.5 font-medium text-surface-800">D&A (4% Rev)</td>
                    <td className="p-2.5 text-right font-mono text-surface-600">—</td>
                    {forecast.map(f => <td key={f.year} className="p-2.5 text-right font-mono text-surface-800">{fmt(f.revenue * 0.04)}</td>)}
                  </tr>
                  <tr className="hover:bg-surface-50 transition-colors">
                    <td className="p-2.5 font-medium text-surface-800">CapEx (6% Rev)</td>
                    <td className="p-2.5 text-right font-mono text-surface-600">—</td>
                    {forecast.map(f => <td key={f.year} className="p-2.5 text-right font-mono text-red-600/80">({fmt(f.revenue * 0.06)})</td>)}
                  </tr>
                  <tr className="bg-emerald-50/30">
                    <td className="p-2.5 font-bold text-surface-900 flex items-center gap-1.5"><ArrowRight className="w-3 h-3 text-emerald-600"/> Free Cash Flow</td>
                    <td className="p-2.5 text-right font-mono text-surface-600 font-bold">—</td>
                    {forecast.map(f => <td key={f.year} className="p-2.5 text-right font-mono font-bold text-emerald-700">{fmt(f.fcf)}</td>)}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {activeModel === 'sensitivity' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="bg-white border border-surface-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-surface-900 mb-1">Valuation Sensitivity (Year 3 Free Cash Flow)</h4>
                <p className="text-xs text-surface-500">Matrix compares Revenue Growth vs. Operating Margins</p>
              </div>
              <Target className="w-5 h-5 text-blue-500" />
            </div>

            <div className="overflow-x-auto mt-4 border border-surface-200 rounded-lg">
              <table className="w-full text-xs text-center">
                <thead>
                  <tr className="bg-surface-50">
                    <th className="p-3 border-r border-b border-surface-200 bg-surface-100 w-1/4">
                      <div className="text-[10px] text-surface-500 font-bold uppercase">Margin →</div>
                      <div className="text-[10px] text-surface-500 font-bold uppercase mt-1">Growth ↓</div>
                    </th>
                    {marginSensitivities.map((m, i) => (
                      <th key={i} className={`p-3 border-b border-surface-200 font-mono font-bold ${i === 1 ? 'bg-blue-50 text-blue-800' : 'text-surface-700'}`}>
                        {(m * 100).toFixed(1)}%
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-200 bg-white">
                  {growthSensitivities.map((g, gi) => (
                    <tr key={gi}>
                      <td className={`p-3 border-r border-surface-200 font-mono font-bold text-left ${gi === 1 ? 'bg-blue-50 text-blue-800' : 'text-surface-700'}`}>
                        {(g * 100).toFixed(1)}%
                      </td>
                      {marginSensitivities.map((m, mi) => {
                        // Calculate Year 3 FCF for this exact scenario
                        const r3 = baseRevenue * Math.pow(1 + g, 3);
                        const op3 = r3 * m;
                        const tax3 = op3 > 0 ? op3 * taxRate : 0;
                        const ni3 = op3 - tax3;
                        const fcf3 = ni3 + (r3 * 0.04) - (r3 * 0.06); // simple approx
                        
                        const isBase = gi === 1 && mi === 1;
                        const isBear = gi === 0 && mi === 0;
                        const isBull = gi === 2 && mi === 2;

                        let bg = 'hover:bg-surface-50';
                        if (isBase) bg = 'bg-blue-600 text-white shadow-inner font-bold';
                        else if (isBear) bg = 'bg-red-50 text-red-700';
                        else if (isBull) bg = 'bg-emerald-50 text-emerald-700';

                        return (
                          <td key={mi} className={`p-3 font-mono transition-colors ${bg}`}>
                            {fmt(fcf3)}
                            {isBase && <div className="text-[9px] font-sans font-medium opacity-80 mt-0.5">BASE CASE</div>}
                            {isBear && <div className="text-[9px] font-sans font-medium opacity-80 mt-0.5">BEAR CASE</div>}
                            {isBull && <div className="text-[9px] font-sans font-medium opacity-80 mt-0.5">BULL CASE</div>}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 flex items-start gap-2 bg-surface-50 p-3 rounded-lg border border-surface-100">
               <HelpCircle className="w-4 h-4 text-surface-400 flex-shrink-0 mt-0.5"/>
               <p className="text-[11px] text-surface-600 leading-relaxed font-medium">
                 This auto-generated skeleton uses {symbol}'s trailing 12-month metrics to forecast out 3 years. Capital expenditures are modeled at 6% of revenue, D&A at 4%. The sensitivity matrix allows you to immediately visualize the impact of macro margin compression or growth acceleration on terminal cash flows.
               </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
