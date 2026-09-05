import { Injectable, PLATFORM_ID, Inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { TRANSLATIONS, SupportedLang } from '../../i18n';

export type { SupportedLang };

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private isBrowser: boolean;
  private currentLangSubject: BehaviorSubject<SupportedLang>;
  public currentLang$: Observable<SupportedLang>;
  public currentLangSignal = signal<SupportedLang>('es');

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    let initialLang: SupportedLang = 'es';

    if (this.isBrowser) {
      const savedLang = localStorage.getItem('app_lang') as SupportedLang;
      if (savedLang && (savedLang === 'es' || savedLang === 'en')) {
        initialLang = savedLang;
      }
    }

    this.currentLangSubject = new BehaviorSubject<SupportedLang>(initialLang);
    this.currentLang$ = this.currentLangSubject.asObservable();
    this.currentLangSignal.set(initialLang);
  }

  get currentLang(): SupportedLang {
    return this.currentLangSubject.value;
  }

  setLanguage(lang: SupportedLang): void {
    if (lang !== 'es' && lang !== 'en') return;
    
    if (this.isBrowser) {
      localStorage.setItem('app_lang', lang);
    }
    this.currentLangSubject.next(lang);
    this.currentLangSignal.set(lang);
  }

  translate(key: string, params?: Record<string, string>): string {
    const lang = this.currentLang;
    const dictionary = TRANSLATIONS[lang] || TRANSLATIONS['es'];
    let text = dictionary[key] || TRANSLATIONS['es'][key] || key;

    if (params) {
      Object.keys(params).forEach(paramKey => {
        text = text.replace(`{${paramKey}}`, params[paramKey]);
      });
    }

    return text;
  }
}
