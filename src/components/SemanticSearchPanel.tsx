import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
  const [lastQuery, setLastQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState<Array<{query: string; answer: string; confidence: number; citations: string[]}>>([]);

  const handleSearch = (qOverride?: string) => {
    const q = qOverride || query.trim();
    if (!q || isLoading) return;
    setLastQuery(q);
    onSearch(q);
    setQuery('');
  };

  // Track results
  React.useEffect(() => {
    if (result && !isLoading && lastQuery) {
      // Avoid duplicate consecutive entries
      setSearchHistory(prev => {
        if (prev[0]?.query === lastQuery) return prev;
        return [{ query: lastQuery, answer: result.answer, confidence: result.confidence, citations: result.citations }, ...prev.slice(0, 4)];
      });
    }
  }, [result, isLoading, lastQuery]);

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
          onClick={() => handleSearch()}
          disabled={!query.trim() || isLoading}
          className="absolute bottom-3 right-3 p-1.5 bg-brand-800 hover:bg-brand-900 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors text-white shadow-sm"
        >
          {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <SendHorizontal className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pr-1 -mr-1 space-y-6">
        {/* Loading State */}
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-12 bg-surface-50/50 rounded-xl border border-dashed border-surface-200">
            <div className="w-10 h-10 rounded-full border-4 border-brand-100 border-t-brand-600 animate-spin mb-3" />
            <p className="text-sm font-medium text-surface-800">Querying AI research assistant...</p>
            <p className="text-xs text-surface-500 mt-1">Analyzing company data and web context</p>
          </motion.div>
        )}

        {/* Current Result */}
        {result && !isLoading && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="p-4 rounded-xl bg-brand-50/50 border border-brand-100 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-4 h-4 text-brand-600" />
                <span className="text-xs font-bold text-brand-800 uppercase tracking-wider">AI Response</span>
                <span className="ml-auto tag-blue text-[10px] font-bold">{result.confidence}% confidence</span>
              </div>
              <div className="text-sm text-surface-800 leading-relaxed font-serif">
                {result.answer.split('\n').map((line, i) => {
                  const isListItem = line.trim().startsWith('* ');
                  const content = isListItem ? line.trim().substring(2) : line;
                  if (!line.trim()) return <div key={i} className="h-2" />;

                  const parts = content.split(/(\*\*.*?\*\*)/g);
                  const formattedLine = parts.map((part, j) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                      return <strong key={j} className="font-bold text-surface-900">{part.slice(2, -2)}</strong>;
                    }
                    return <React.Fragment key={j}>{part}</React.Fragment>;
                  });

                  if (isListItem) {
                    return (
                      <div key={i} className="flex gap-2.5 mt-2 ml-1">
                        <span className="text-brand-500 text-[14px] leading-relaxed mb-1">•</span>
                        <span className="flex-1">{formattedLine}</span>
                      </div>
                    );
                  }
                  return <p key={i} className={i > 0 ? "mt-3" : ""}>{formattedLine}</p>;
                })}
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

        {/* Example Queries (Only show if no result and not loading) */}
        {!result && !isLoading && (
          <div>
            <p className="text-[11px] text-surface-500 font-bold uppercase tracking-wider mb-2.5">Example Queries</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_QUERIES.map(q => (
                <button
                  key={q}
                  onClick={() => handleSearch(q)}
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

        {/* Search History */}
        {searchHistory.length > 0 && (
          <div className="pt-4 border-t border-surface-100">
            <p className="text-[11px] text-surface-500 font-bold uppercase tracking-wider mb-3">Recent Searches</p>
            <div className="space-y-2">
              {searchHistory.map((item, i) => (
                <button
                  key={i}
                  onClick={() => handleSearch(item.query)}
                  className="w-full text-left p-2.5 rounded-lg border border-surface-100 hover:border-brand-200 hover:bg-brand-50/30 transition-all group"
                >
                  <p className="text-[11px] font-semibold text-surface-800 group-hover:text-brand-700 truncate">{item.query}</p>
                  <p className="text-[10px] text-surface-500 line-clamp-1 mt-0.5">{item.answer}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {!result && !isLoading && searchHistory.length === 0 && (
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
