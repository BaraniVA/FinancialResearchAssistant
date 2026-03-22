import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SendHorizontal, MessageSquare, Loader, BookOpen } from 'lucide-react';

interface SemanticSearchPanelProps {
  onSearch: (query: string) => void;
  result: { answer: string; citations: string[]; confidence: number } | null;
  isLoading: boolean;
  symbol: string;
}

const EXAMPLE_QUERIES = [
  'What are the main revenue drivers?',
  'How has operating margin trended?',
  'What are the biggest risk factors?',
  'What is management guidance for next quarter?',
  'How does R&D spending compare to peers?',
  'Are there any going concern risks?',
];

export function SemanticSearchPanel({ onSearch, result, isLoading, symbol }: SemanticSearchPanelProps) {
  const [query, setQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState<Array<{query: string; answer: string; confidence: number}>>([]);

  const handleSearch = () => {
    const q = query.trim();
    if (!q || isLoading) return;
    onSearch(q);
    setQuery('');
  };

  // Track results
  React.useEffect(() => {
    if (result && !isLoading) {
      setSearchHistory(prev => [{ query: result.answer.slice(0, 0), answer: result.answer, confidence: result.confidence }, ...prev.slice(0, 4)]);
    }
  }, [result, isLoading]);

  return (
    <div className="glass-panel p-5 flex flex-col h-full">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center">
          <Search className="w-4 h-4 text-brand-600" />
        </div>
        <div>
          <h3 className="text-lg font-serif font-semibold text-surface-900 tracking-tight">Semantic Search</h3>
          <p className="text-[11px] text-surface-500 font-medium">Ask anything about {symbol}</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-5">
        <textarea
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSearch(); } }}
          placeholder="Ask a natural language question about this company's filings, financials, or risks..."
          rows={3}
          className="input-field resize-none pr-12 text-sm shadow-sm"
        />
        <button
          onClick={handleSearch}
          disabled={!query.trim() || isLoading}
          className="absolute bottom-3 right-3 p-1.5 bg-brand-800 hover:bg-brand-900 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors text-white shadow-sm"
        >
          {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <SendHorizontal className="w-4 h-4" />}
        </button>
      </div>

      {/* Example Queries */}
      {!result && !isLoading && (
        <div className="mb-4">
          <p className="text-[11px] text-surface-500 font-bold uppercase tracking-wider mb-2.5">Example Queries</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_QUERIES.map(q => (
              <button
                key={q}
                onClick={() => { setQuery(q); }}
                className="text-[11px] font-medium px-3 py-1.5 rounded-full bg-surface-50 border border-surface-200 
                           text-surface-600 hover:text-surface-900 hover:bg-white hover:border-surface-300 hover:shadow-subtle 
                           transition-all duration-200 text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center bg-surface-50/50 rounded-xl border border-dashed border-surface-200">
          <div className="text-center">
            <div className="w-10 h-10 rounded-full border-4 border-brand-100 border-t-brand-600 animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-surface-800">Querying AI research assistant...</p>
            <p className="text-xs text-surface-500 mt-1">Analyzing SEC filings and transcripts</p>
          </div>
        </motion.div>
      )}

      {/* Result */}
      {result && !isLoading && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex-1 overflow-y-auto space-y-4">
          {/* Answer */}
          <div className="p-4 rounded-xl bg-brand-50/50 border border-brand-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4 text-brand-600" />
              <span className="text-xs font-bold text-brand-800 uppercase tracking-wider">AI Response</span>
              <span className="ml-auto tag-blue text-[10px] font-bold">{result.confidence}% confidence</span>
            </div>
            <p className="text-sm text-surface-800 leading-relaxed font-serif">{result.answer}</p>
          </div>

          {/* Confidence Bar */}
          <div className="p-4 rounded-xl bg-surface-50 border border-surface-200 shadow-subtle">
            <div className="flex items-center justify-between text-xs text-surface-600 font-semibold mb-2">
              <span>Confidence Level</span>
              <span className="font-mono font-bold text-surface-800">{result.confidence}%</span>
            </div>
            <div className="h-2 bg-surface-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${result.confidence}%` }}
                className={`h-full rounded-full transition-all duration-1000 ${result.confidence >= 70 ? 'bg-emerald-500' : result.confidence >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
              />
            </div>
          </div>

          {/* Citations */}
          {result.citations.length > 0 && (
            <div className="p-4 rounded-xl bg-white border border-surface-100 shadow-subtle">
              <div className="flex items-center gap-1.5 mb-3">
                <BookOpen className="w-4 h-4 text-surface-500" />
                <span className="text-[11px] font-bold text-surface-600 uppercase tracking-wider">Sources</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.citations.map((c, i) => (
                  <span key={i} className="text-xs font-medium px-2.5 py-1 rounded-md bg-surface-50 border border-surface-200 text-surface-700">{c}</span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {!result && !isLoading && (
        <div className="flex-1 flex items-center justify-center bg-surface-50/50 rounded-xl border border-dashed border-surface-200 mt-4">
          <div className="text-center py-6">
            <Search className="w-8 h-8 text-surface-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-surface-700">Ask a question about {symbol}'s</p>
            <p className="text-xs text-surface-500">filings, financials, or business</p>
          </div>
        </div>
      )}
    </div>
  );
}
