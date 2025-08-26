import { THEME_STORAGE_KEY, DEFAULT_THEME } from '../constants';
import { Theme } from '../types';

export class ThemeService {
  private static instance: ThemeService;
  private currentTheme: Theme;

  private constructor() {
    this.currentTheme = this.getStoredTheme();
    this.applyTheme(this.currentTheme);
  }

  public static getInstance(): ThemeService {
    if (!ThemeService.instance) {
      ThemeService.instance = new ThemeService();
    }
    return ThemeService.instance;
  }

  private getStoredTheme(): Theme {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      return (stored as Theme) || DEFAULT_THEME;
    }
    return DEFAULT_THEME;
  }

  private applyTheme(theme: Theme): void {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  }

  public getCurrentTheme(): Theme {
    return this.currentTheme;
  }

  public toggleTheme(): Theme {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.applyTheme(this.currentTheme);
    return this.currentTheme;
  }

  public setTheme(theme: Theme): void {
    this.currentTheme = theme;
    this.applyTheme(theme);
  }
}
