import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, TrendingUp, Plus, ChevronRight } from 'lucide-react';

interface CompanySearchProps {
  onSearch: (symbol: string) => void;
  onAddToBenchmark?: (symbol: string) => void;
  isLoading: boolean;
  currentSymbol?: string;
}

const POPULAR = [
  { symbol: 'AAPL', name: 'Apple' },
  { symbol: 'MSFT', name: 'Microsoft' },
  { symbol: 'GOOGL', name: 'Alphabet' },
  { symbol: 'NVDA', name: 'NVIDIA' },
  { symbol: 'AMZN', name: 'Amazon' },
  { symbol: 'META', name: 'Meta' },
  { symbol: 'TSLA', name: 'Tesla' },
  { symbol: 'NFLX', name: 'Netflix' },
];

export function CompanySearch({ onSearch, onAddToBenchmark, isLoading, currentSymbol }: CompanySearchProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sym = query.trim().toUpperCase();
    if (sym) { onSearch(sym); setQuery(''); setIsFocused(false); }
  };

  const handleQuick = (symbol: string) => {
    onSearch(symbol);
    setQuery('');
    setIsFocused(false);
  };

  return (
    <div className="glass-panel p-4 mb-2 shadow-sm">
      <h2 className="text-sm font-serif font-medium text-surface-900 mb-3 tracking-tight">Company Search</h2>

      {/* Search Box */}
      <form onSubmit={handleSubmit} className="relative mb-4">
        <div className={`relative flex items-center transition-all duration-200 ${isFocused ? 'ring-2 ring-brand-500/20' : ''} rounded-lg bg-surface-50 border border-surface-200`}>
          <Search className="absolute left-3 w-4 h-4 text-surface-400" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 150)}
            placeholder="Ticker (e.g. AAPL)"
            className="w-full bg-transparent border-none px-3 py-2 pl-9 pr-20 text-sm text-surface-900 placeholder-surface-400 focus:outline-none focus:ring-0"
          />
          <div className="absolute right-1.5 flex items-center gap-1">
            {query && (
              <button type="button" onClick={() => setQuery('')} className="p-1 text-surface-400 hover:text-surface-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="submit"
              disabled={!query.trim() || isLoading}
              className="px-2.5 py-1 bg-surface-800 hover:bg-surface-900 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[11px] font-medium rounded transition-colors"
            >
              {isLoading ? '...' : 'Go'}
            </button>
          </div>
        </div>
      </form>

      {/* Popular Tickers */}
      <div>
        <p className="text-[10px] text-surface-500 mb-2 font-medium uppercase tracking-wider">Quick Access</p>
        <div className="grid grid-cols-2 gap-1.5">
          {POPULAR.map(({ symbol, name }) => (
            <motion.button
              key={symbol}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleQuick(symbol)}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-all duration-200 group
                ${currentSymbol === symbol
                  ? 'bg-brand-50 border border-brand-200 text-brand-800 shadow-sm'
                  : 'bg-white border border-surface-200 hover:bg-surface-50 text-surface-600 hover:text-surface-900 shadow-subtle'
                }`}
            >
              <div className="min-w-0 pr-2">
                <div className="text-[11px] font-bold font-mono">{symbol}</div>
                <div className="text-[9px] text-surface-500 truncate">{name}</div>
              </div>
              {currentSymbol === symbol ? (
                <div className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0" />
              ) : (
                <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-surface-400 flex-shrink-0" />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Add to Benchmark */}
      {currentSymbol && onAddToBenchmark && (
        <div className="border-t border-surface-200 my-4" />
      )}
      {currentSymbol && onAddToBenchmark && (
        <button
          onClick={() => onAddToBenchmark(currentSymbol)}
          className="w-full btn-secondary justify-center text-xs py-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          Add {currentSymbol} to Benchmark
        </button>
      )}

      {/* Data Source note */}
      <div className="mt-4 p-2.5 rounded-md bg-surface-50 border border-surface-200">
        <div className="flex items-start gap-2">
          <TrendingUp className="w-3 h-3 text-brand-600 mt-0.5 flex-shrink-0" />
          <p className="text-[10px] text-surface-500 leading-relaxed">
            Data via <span className="text-surface-700 font-medium">Gemini 3.1 Flash Lite Preview (Web Search)</span> &amp; <span className="text-surface-700 font-medium">SEC</span>. AI research via <span className="text-surface-700 font-medium">Google AI</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
