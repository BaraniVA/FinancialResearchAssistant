// Central type definitions for the Financial Research Assistant

export interface CompanyOverview {
  symbol: string;
  name: string;
  description: string;
  sector: string;
  industry: string;
  exchange: string;
  marketCap: number;
  peRatio: number;
  pegRatio: number;
  eps: number;
  bookValue: number;
  dividendYield: number;
  profitMargin: number;
  operatingMarginTTM: number;
  returnOnEquityTTM: number;
  returnOnAssetsTTM: number;
  revenuePerShareTTM: number;
  quarterlyEarningsGrowthYOY: number;
  quarterlyRevenueGrowthYOY: number;
  analystTargetPrice: number;
  week52High: number;
  week52Low: number;
  fiftyDayMA: number;
  twoHundredDayMA: number;
  sharesOutstanding: number;
  beta: number;
}

export interface QuoteData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  previousClose: number;
  open: number;
  high: number;
  low: number;
}

export interface SECFiling {
  id: string;
  type: '10-K' | '10-Q' | '8-K' | 'DEF 14A' | 'S-1';
  filingDate: string;
  period: string;
  description: string;
  url: string;
  accessionNumber: string;
}

export interface FilingAnalysis {
  summary: string;
  keyRisks: string[];
  keyOpportunities: string[];
  financialHighlights: string[];
  managementTone: 'positive' | 'neutral' | 'cautious' | 'negative';
  sentimentScore: number; // -100 to 100
  redFlags: RedFlag[];
}

export interface RedFlag {
  severity: 'high' | 'medium' | 'low';
  category: 'revenue' | 'debt' | 'governance' | 'operations' | 'regulatory' | 'accounting';
  title: string;
  description: string;
  evidence?: string;
}

export interface KPIData {
  symbol: string;
  name: string;
  revenue: number;
  revenueGrowth: number;
  grossMargin: number;
  operatingMargin: number;
  netMargin: number;
  eps: number;
  epsGrowth: number;
  peRatio: number;
  pbRatio: number;
  debtToEquity: number;
  currentRatio: number;
  roe: number;
  roa: number;
  freeCashFlow: number;
  rdSpend: number;
  rdPercent: number;
}

export interface EarningsTranscriptAnalysis {
  symbol: string;
  quarter: string;
  date: string;
  sentimentScore: number;
  managementTone: string;
  guidanceChange: 'raised' | 'maintained' | 'lowered' | 'withdrawn';
  guidanceSummary: string;
  keyThemes: string[];
  positiveSignals: string[];
  negativeSignals: string[];
  analystSentiment: string;
}

export interface SearchResult {
  query: string;
  answer: string;
  sources: string[];
  confidence: number;
  citations: string[];
}

export interface CompanyData {
  overview: CompanyOverview | null;
  quote: QuoteData | null;
  filings: SECFiling[];
  kpis: KPIData | null;
  isLoading: boolean;
  error: string | null;
}

export type AppView = 'research' | 'benchmark' | 'filings' | 'risk' | 'search';
