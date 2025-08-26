import { useState, useCallback, useEffect } from 'react';
import { ThemeService } from '../services/themeService';
import { Theme } from '../types';

export function useTheme() {
  const themeService = ThemeService.getInstance();
  const [theme, setTheme] = useState<Theme>(themeService.getCurrentTheme());

  const toggleTheme = useCallback(() => {
    const newTheme = themeService.toggleTheme();
    setTheme(newTheme);
  }, [themeService]);

  const setThemeValue = useCallback((newTheme: Theme) => {
    themeService.setTheme(newTheme);
    setTheme(newTheme);
  }, [themeService]);

  useEffect(() => {
    setTheme(themeService.getCurrentTheme());
  }, [themeService]);

  return {
    theme,
    toggleTheme,
    setTheme: setThemeValue,
  };
}
