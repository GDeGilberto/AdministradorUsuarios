import { es } from './es';
import { en } from './en';

export type SupportedLang = 'es' | 'en';

export const TRANSLATIONS: Record<SupportedLang, Record<string, string>> = {
  es,
  en
};
