export const PLATFORM_CONFIGS = {
  CODEFORCES: {
    API_BASE: 'https://codeforces.com/api',
    RATING_RANGES: {
      EASY_MAX: 1300,
      MEDIUM_MAX: 1900,
    }
  },
  LEETCODE: {
    API_BASE: 'https://leetcode.com/graphql',
  }
} as const;

export const RATING_BANDS = {
  below1000: { min: 0, max: 999, label: '< 1000', color: '#94a3b8' },
  range1000to1199: { min: 1000, max: 1199, label: '1000-1199', color: '#10b981' },
  range1200to1399: { min: 1200, max: 1399, label: '1200-1399', color: '#059669' },
  range1400to1599: { min: 1400, max: 1599, label: '1400-1599', color: '#06b6d4' },
  range1600to1799: { min: 1600, max: 1799, label: '1600-1799', color: '#3b82f6' },
  range1800to1999: { min: 1800, max: 1999, label: '1800-1999', color: '#8b5cf6' },
  range2000to2199: { min: 2000, max: 2199, label: '2000-2199', color: '#f59e0b' },
  range2200to2399: { min: 2200, max: 2399, label: '2200-2399', color: '#d97706' },
  range2400to2599: { min: 2400, max: 2599, label: '2400-2599', color: '#ea580c' },
  range2600to2799: { min: 2600, max: 2799, label: '2600-2799', color: '#dc2626' },
  range2800to2999: { min: 2800, max: 2999, label: '2800-2999', color: '#991b1b' },
  above3000: { min: 3000, max: Infinity, label: '3000+', color: '#7c2d12' },
  unrated: { min: 0, max: 0, label: 'Unrated', color: '#64748b' }
} as const;
