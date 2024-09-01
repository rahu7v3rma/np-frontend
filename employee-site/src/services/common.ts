export const BASE_API_URL =
  process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:8000/';

export const GROW_ENV: 'DEV' | 'PRODUCTION' = process.env.NEXT_PUBLIC_GROW_PROD
  ? 'PRODUCTION'
  : 'DEV';

export const COMMON = {
  stringFormat(s: string, ...args: any[]) {
    return s.replace(/{([0-9]+)}/g, (match, index) =>
      typeof args[index] === 'undefined' ? match : args[index],
    );
  },
};
