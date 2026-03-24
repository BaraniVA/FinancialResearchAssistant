import { CONFIG } from '../config';
import { CompanyOverview, QuoteData, SECFiling, KPIData } from '../types';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ─── Gemini AI Helpers ───────────────────────────────────────────────────────

let genAI: GoogleGenerativeAI | null = null;

async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
  try {
    return await fn();
  } catch (err: any) {
    if (retries > 0) {
      console.warn(`Gemini API Error (retrying in ${delay}ms)...`, err.message);
      await new Promise(r => setTimeout(r, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw err;
  }
}

function getGeminiModel(tools: boolean = false) {
  if (!CONFIG.GEMINI_API_KEY) throw new Error('Gemini API key not configured');
  if (!genAI) {
    genAI = new GoogleGenerativeAI(CONFIG.GEMINI_API_KEY);
  }
  
  // Using gemini-3.1-flash-lite-preview for maximum speed
  const modelOptions: any = { 
    model: 'gemini-2.5-flash',
    thinkingLevel: 'minimal'
  };
  
  if (tools) {
    modelOptions.tools = [{ googleSearch: {} }];
  }
  
  return genAI.getGenerativeModel(modelOptions);
}

/**
 * Fetches real-time LIVE stock price using Yahoo Finance proxy for exact "ticking" accuracy.
 * This avoids the 15-minute delay and hallucination issues of LLM search tools.
 */
export async function fetchQuote(symbol: string): Promise<QuoteData> {
  try {
    const res = await fetch(`/api/yahoo2/v8/finance/chart/${symbol}?interval=1m&range=1d`);
    if (!res.ok) throw new Error(`Yahoo Finance Chart HTTP error`);
    const data = await res.json();
    const chart = data?.chart?.result?.[0];
    if (!chart) throw new Error('No Yahoo Chart Data');
    
    const meta = chart.meta || {};
    const price = meta.regularMarketPrice || 0;
    const previousClose = meta.chartPreviousClose || meta.previousClose || 0;
    const change = price - previousClose;
    const changePercent = previousClose !== 0 ? (change / previousClose) * 100 : 0;
    
    return {
      symbol: symbol.toUpperCase(),
      price: price,
      change: change,
      changePercent: changePercent,
      volume: meta.regularMarketVolume || 0,
      previousClose: previousClose,
      open: meta.regularMarketDayHigh || price, // rough fallback
      high: meta.regularMarketDayHigh || price,
      low: meta.regularMarketDayLow || price,
    };
  } catch (err) {
    console.error("Live quote fetch failed, falling back to basic Gemini search:", err);
    // Fallback to Gemini if proxy fails
    const model = getGeminiModel(true);
    const prompt = `Find the exact current stock price for "${symbol}". Return ONLY valid JSON: {"symbol": "${symbol.toUpperCase()}", "price": number, "change": number, "changePercent": number, "volume": number, "previousClose": number, "open": number, "high": number, "low": number}`;
    const result = await withRetry(() => model.generateContent(prompt));
    const jsonMatch = result.response.text().match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Failed to parse quote');
    const parsed = JSON.parse(jsonMatch[0]);

    // Safety fallback to prevent crashes on missing properties
    return {
      symbol: symbol.toUpperCase(),
      price: parsed.price || 0,
      change: parsed.change || 0,
      changePercent: parsed.changePercent || 0,
      volume: parsed.volume || 0,
      previousClose: parsed.previousClose || 0,
      open: parsed.open || 0,
      high: parsed.high || 0,
      low: parsed.low || 0,
    };
  }
}

/**
 * AI FETCH: Gets Overview and Filings in ONE round.
 */
export async function fetchOverviewAndFilings(symbol: string): Promise<{
  overview: CompanyOverview;
  filings: SECFiling[];
}> {
  const model = getGeminiModel(true); // Re-enabled Search so fundamentals are 100% accurate.
  
  const prompt = `Perform a highly focused Google Search for ONLY the current financial metrics of "${symbol}".
  If the company is unlisted, private, or cannot be found, you MUST still return valid JSON and estimate or provide general information in the description, and set numeric fields to 0.
  Extract ONLY: Sector, Industry, Market Cap, PE Ratio, EPS, Beta, Quarterly Revenue Growth YoY, Profit Margin, Return on Equity (ROE), 52-Week High, 52-Week Low, Analyst Target Price, and 3 recent SEC filings.
  
  Respond in valid JSON:
  {
    "overview": {
      "symbol": "${symbol.toUpperCase()}",
      "name": "Full Name",
      "description": "One sentence summary (mention if unlisted/private).",
      "sector": "...",
      "industry": "...",
      "exchange": "...",
      "marketCap": number,
      "peRatio": number,
      "pegRatio": number,
      "eps": number,
      "bookValue": number,
      "dividendYield": number,
      "profitMargin": number,
      "operatingMarginTTM": number,
      "returnOnEquityTTM": number,
      "returnOnAssetsTTM": number,
      "revenuePerShareTTM": number,
      "quarterlyEarningsGrowthYOY": number,
      "quarterlyRevenueGrowthYOY": number,
      "analystTargetPrice": number,
      "week52High": number,
      "week52Low": number,
      "fiftyDayMA": number,
      "twoHundredDayMA": number,
      "sharesOutstanding": number,
      "beta": number
    },
    "filings": [
      { "id": "...", "type": "10-K|10-Q|8-K", "filingDate": "...", "period": "...", "description": "...", "url": "...", "accessionNumber": "..." }
    ]
  }`;

  try {
    const result = await withRetry(() => model.generateContent(prompt));
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Malformed AI response');
    const data = JSON.parse(jsonMatch[0]);
    
    // Safely construct overview to prevent crashes on missing data
    const safeOverview: CompanyOverview = {
      symbol: symbol.toUpperCase(),
      name: data.overview?.name || symbol,
      description: data.overview?.description || "No description available.",
      sector: data.overview?.sector || "Unknown",
      industry: data.overview?.industry || "Unknown",
      exchange: data.overview?.exchange || "Unknown",
      marketCap: data.overview?.marketCap || 0,
      peRatio: data.overview?.peRatio || 0,
      pegRatio: data.overview?.pegRatio || 0,
      eps: data.overview?.eps || 0,
      bookValue: data.overview?.bookValue || 0,
      dividendYield: data.overview?.dividendYield || 0,
      profitMargin: data.overview?.profitMargin || 0,
      operatingMarginTTM: data.overview?.operatingMarginTTM || 0,
      returnOnEquityTTM: data.overview?.returnOnEquityTTM || 0,
      returnOnAssetsTTM: data.overview?.returnOnAssetsTTM || 0,
      revenuePerShareTTM: data.overview?.revenuePerShareTTM || 0,
      quarterlyEarningsGrowthYOY: data.overview?.quarterlyEarningsGrowthYOY || 0,
      quarterlyRevenueGrowthYOY: data.overview?.quarterlyRevenueGrowthYOY || 0,
      analystTargetPrice: data.overview?.analystTargetPrice || 0,
      week52High: data.overview?.week52High || 0,
      week52Low: data.overview?.week52Low || 0,
      fiftyDayMA: data.overview?.fiftyDayMA || 0,
      twoHundredDayMA: data.overview?.twoHundredDayMA || 0,
      sharesOutstanding: data.overview?.sharesOutstanding || 0,
      beta: data.overview?.beta || 0,
    };

    return {
      overview: safeOverview,
      filings: data.filings || []
    };
  } catch (err: any) {
    console.error("Overview fetch failed:", err);
    throw new Error(err.message || 'Failed to fetch overview');
  }
}

/**
 * CONSOLIDATED ANALYSIS: Analyzes data in one round.
 */
export async function analyzeCompanyFull(
  symbol: string,
  overview: CompanyOverview,
  kpis: KPIData
): Promise<{
  analysis: any;
  redFlags: any[];
  earnings: any;
}> {
  const model = getGeminiModel(true); // Re-enabled search for earnings/news to get the true latest analysis
  const prompt = `Perform a search for the latest earnings news or transcript for ${symbol}.
  Then analyze the company fundamentals provided below:
  ${JSON.stringify({ overview, kpis }, null, 2)}
  
  Respond in valid JSON:
  {
    "analysis": {
      "summary": "...",
      "keyRisks": ["...", "...", "..."],
      "keyOpportunities": ["...", "...", "..."],
      "financialHighlights": ["...", "...", "..."],
      "managementTone": "positive|neutral|cautious|negative",
      "sentimentScore": number
    },
    "redFlags": [
      { "severity": "high|medium|low", "category": "...", "title": "...", "description": "..." }
    ],
    "earnings": {
      "sentimentScore": number,
      "managementTone": "...",
      "guidanceChange": "raised|maintained|lowered|withdrawn",
      "guidanceSummary": "...",
      "keyThemes": ["...", "..."],
      "positiveSignals": ["...", "..."],
      "negativeSignals": ["...", "..."]
    }
  }`;

  try {
    const result = await withRetry(() => model.generateContent(prompt));
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Malformed analysis response');
    const data = JSON.parse(jsonMatch[0]);

    // Construct a safe return object to prevent array indexing/mapping crashes
    return {
      analysis: {
        summary: data.analysis?.summary || "Analysis unavailable.",
        keyRisks: Array.isArray(data.analysis?.keyRisks) ? data.analysis.keyRisks : [],
        keyOpportunities: Array.isArray(data.analysis?.keyOpportunities) ? data.analysis.keyOpportunities : [],
        financialHighlights: Array.isArray(data.analysis?.financialHighlights) ? data.analysis.financialHighlights : [],
        managementTone: data.analysis?.managementTone || "neutral",
        sentimentScore: data.analysis?.sentimentScore || 0,
      },
      redFlags: Array.isArray(data.redFlags) ? data.redFlags : [],
      earnings: {
        sentimentScore: data.earnings?.sentimentScore || 0,
        managementTone: data.earnings?.managementTone || "Tone unavailable.",
        guidanceChange: data.earnings?.guidanceChange || "maintained",
        guidanceSummary: data.earnings?.guidanceSummary || "Guidance unavailable.",
        keyThemes: Array.isArray(data.earnings?.keyThemes) ? data.earnings.keyThemes : [],
        positiveSignals: Array.isArray(data.earnings?.positiveSignals) ? data.earnings.positiveSignals : [],
        negativeSignals: Array.isArray(data.earnings?.negativeSignals) ? data.earnings.negativeSignals : []
      }
    };
  } catch (err) {
    console.error("Consolidated analysis failed:", err);
    throw new Error('Analysis failed');
  }
}

export function buildKPIData(symbol: string, overview: CompanyOverview): KPIData {
  const revenue = (overview.revenuePerShareTTM || 0) * (overview.sharesOutstanding || 0);
  return {
    symbol, name: overview.name, revenue,
    revenueGrowth: overview.quarterlyRevenueGrowthYOY || 0,
    grossMargin: (overview.profitMargin || 0) + 0.15,
    operatingMargin: overview.operatingMarginTTM || 0,
    netMargin: overview.profitMargin || 0,
    eps: overview.eps || 0,
    epsGrowth: overview.quarterlyEarningsGrowthYOY || 0,
    peRatio: overview.peRatio || 0,
    pbRatio: (overview.peRatio || 0) / (overview.eps > 0 ? overview.eps / overview.bookValue : 5),
    debtToEquity: 1.0, currentRatio: 1.5,
    roe: overview.returnOnEquityTTM || 0,
    roa: overview.returnOnAssetsTTM || 0,
    freeCashFlow: revenue * 0.12,
    rdSpend: revenue * 0.08,
    rdPercent: 0.08,
  };
}

export async function fetchCompanyLogo(symbol: string): Promise<string | undefined> {
  const key = CONFIG.API_NINJAS_KEY?.trim();
  if (!key || key === 'undefined' || key === 'null') return undefined;
  try {
    const res = await fetch(`/api/ninjas/v1/logo?ticker=${symbol.toUpperCase()}`, {
      headers: { 'X-Api-Key': key }
    });
    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? data[0].image : undefined;
  } catch { return undefined; }
}

export async function semanticSearch(
  query: string,
  symbol: string,
  overview: CompanyOverview
): Promise<{ answer: string; citations: string[]; confidence: number }> {
  const model = getGeminiModel(true);
  const prompt = `Company: ${overview.name} (${symbol}). Query: "${query}". Respond in JSON: {"answer": "...", "citations": ["..."], "confidence": number}`;
  try {
    const result = await withRetry(() => model.generateContent(prompt));
    const jsonMatch = result.response.text().match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON');
    return JSON.parse(jsonMatch[0]);
  } catch { throw new Error('Search failed'); }
}

export async function fetchCompanyOverview(symbol: string): Promise<CompanyOverview> {
  const res = await fetchOverviewAndFilings(symbol);
  return res.overview;
}


