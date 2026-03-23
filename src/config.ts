// Configuration constants
export const CONFIG = {
  GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY || '',
  API_NINJAS_KEY: import.meta.env.VITE_API_NINJAS_KEY || '',
  SEC_EDGAR_BASE_URL: 'https://data.sec.gov',
  RATE_LIMIT_DELAY: 12000,
} as const;
