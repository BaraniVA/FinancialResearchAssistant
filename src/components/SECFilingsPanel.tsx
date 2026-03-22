import React from 'react';
import { motion } from 'framer-motion';
import { FileText, ExternalLink, Calendar, AlertCircle } from 'lucide-react';
import { SECFiling } from '../types';

interface SECFilingsPanelProps {
  filings: SECFiling[];
  isLoading: boolean;
  symbol: string;
}

const filingColors: Record<string, string> = {
  '10-K': 'tag-blue',
  '10-Q': 'tag-green',
  '8-K': 'tag-gold',
  'DEF 14A': 'tag-purple',
  'S-1': 'tag-red',
};

const filingDescriptions: Record<string, string> = {
  '10-K': 'Annual Report',
  '10-Q': 'Quarterly Report',
  '8-K': 'Current Report',
  'DEF 14A': 'Proxy Statement',
  'S-1': 'Registration Statement',
};

export function SECFilingsPanel({ filings, isLoading, symbol }: SECFilingsPanelProps) {
  const secEdgarUrl = `https://www.sec.gov/cgi-bin/browse-edgar?CIK=${symbol}&owner=exclude&action=getcompany`;

  return (
    <div className="glass-panel p-4 mb-2 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-surface-600" />
          <h3 className="text-sm font-serif font-medium text-surface-900 tracking-tight">SEC Filings</h3>
          <span className="tag-blue">{filings.length}</span>
        </div>
        <a
          href={secEdgarUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost text-[11px] py-1 px-2"
        >
          <ExternalLink className="w-3 h-3" />
          EDGAR
        </a>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => <div key={i} className="loading-shimmer h-14 rounded-md" />)}
        </div>
      ) : (
        <div className="space-y-2">
          {filings.map((filing, i) => (
            <motion.div
              key={filing.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white border border-surface-200 p-2.5 rounded-md hover:bg-surface-50 hover:border-surface-300 transition-all duration-200 group shadow-subtle"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={filingColors[filing.type] || 'tag-blue'}>{filing.type}</span>
                    <span className="text-[9px] text-surface-500 uppercase tracking-wider">{filingDescriptions[filing.type]}</span>
                  </div>
                  <p className="text-[11px] font-medium text-surface-800 truncate">{filing.description}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-[10px] text-surface-500">
                      <Calendar className="w-2.5 h-2.5" />
                      {new Date(filing.filingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="text-[10px] text-surface-500">Period: {filing.period}</span>
                  </div>
                </div>
                <a
                  href={filing.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 p-1.5 rounded text-surface-400 hover:text-surface-800 hover:bg-surface-200 transition-all opacity-0 group-hover:opacity-100"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!isLoading && filings.length === 0 && (
        <div className="text-center py-6 border border-dashed border-surface-200 rounded-md bg-surface-50/50 mt-2">
          <AlertCircle className="w-6 h-6 text-surface-400 mx-auto mb-2" />
          <p className="text-xs text-surface-500">No filings found for {symbol}</p>
        </div>
      )}
    </div>
  );
}
