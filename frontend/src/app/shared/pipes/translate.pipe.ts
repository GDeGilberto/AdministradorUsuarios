import { Pipe, PipeTransform, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { TranslationService } from '../../core/services/translation.service';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false
})
export class TranslatePipe implements PipeTransform, OnDestroy {
  private subscription?: Subscription;
  private lastKey?: string;
  private lastValue: string = '';

  constructor(
    private translationService: TranslationService,
    private cdr: ChangeDetectorRef
  ) {
    this.subscription = this.translationService.currentLang$.subscribe(() => {
      if (this.lastKey) {
        this.lastValue = this.translationService.translate(this.lastKey);
        this.cdr.markForCheck();
      }
    });
  }

  transform(key: string, params?: Record<string, string>): string {
    if (!key) return '';
    this.lastKey = key;
    this.lastValue = this.translationService.translate(key, params);
    return this.lastValue;
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
