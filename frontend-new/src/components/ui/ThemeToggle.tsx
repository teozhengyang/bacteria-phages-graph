'use client';

import React from 'react';
import { Moon, Sun } from 'lucide-react';

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isLoading?: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, toggleTheme, isLoading = false }) => {
  return (
    <button
      onClick={toggleTheme}
      disabled={isLoading}
      className="bg-white/20 backdrop-blur-md rounded-full p-3 text-white hover:bg-white/30 transition-all duration-300 hover:scale-110 shadow-lg border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
};

export default ThemeToggle;
