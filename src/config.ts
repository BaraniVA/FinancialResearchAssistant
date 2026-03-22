// Configuration constants
export const CONFIG = {
  ALPHA_VANTAGE_API_KEY: import.meta.env.VITE_ALPHA_VANTAGE_API_KEY || '',
  GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY || '',
  ALPHA_VANTAGE_BASE_URL: 'https://www.alphavantage.co/query',
  SEC_EDGAR_BASE_URL: 'https://data.sec.gov',
  RATE_LIMIT_DELAY: 12000,
} as const;
