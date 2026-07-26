import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const THEME_CONFIG = {
  'Verde Agro': { primary: '#10B981', light: '#34D399', dark: '#059669', bg: 'linear-gradient(135deg, #090d16 0%, #0d131f 100%)', text: '#F9FAFB', muted: '#9CA3AF', glass: 'rgba(18, 25, 38, 0.75)', border: 'rgba(255, 255, 255, 0.08)', input: 'rgba(255, 255, 255, 0.04)' },
  'Azul Océano': { primary: '#1565C0', light: '#42A5F5', dark: '#0D47A1', bg: 'linear-gradient(135deg, #090d16 0%, #0b1528 100%)', text: '#F9FAFB', muted: '#9CA3AF', glass: 'rgba(18, 25, 38, 0.75)', border: 'rgba(255, 255, 255, 0.08)', input: 'rgba(255, 255, 255, 0.04)' },
  'Tierra Café': { primary: '#795548', light: '#A1887F', dark: '#4E342E', bg: 'linear-gradient(135deg, #090d16 0%, #17110e 100%)', text: '#F9FAFB', muted: '#9CA3AF', glass: 'rgba(18, 25, 38, 0.75)', border: 'rgba(255, 255, 255, 0.08)', input: 'rgba(255, 255, 255, 0.04)' },
  'Púrpura Real': { primary: '#6A1B9A', light: '#9C27B0', dark: '#4A148C', bg: 'linear-gradient(135deg, #090d16 0%, #150a1e 100%)', text: '#F9FAFB', muted: '#9CA3AF', glass: 'rgba(18, 25, 38, 0.75)', border: 'rgba(255, 255, 255, 0.08)', input: 'rgba(255, 255, 255, 0.04)' },
  'Naranja Atardecer': { primary: '#E65100', light: '#FF9800', dark: '#BF360C', bg: 'linear-gradient(135deg, #090d16 0%, #1c0e06 100%)', text: '#F9FAFB', muted: '#9CA3AF', glass: 'rgba(18, 25, 38, 0.75)', border: 'rgba(255, 255, 255, 0.08)', input: 'rgba(255, 255, 255, 0.04)' },
  'Gris Carbón': { primary: '#263238', light: '#455A64', dark: '#102027', bg: 'linear-gradient(135deg, #090d16 0%, #111619 100%)', text: '#F9FAFB', muted: '#9CA3AF', glass: 'rgba(18, 25, 38, 0.75)', border: 'rgba(255, 255, 255, 0.08)', input: 'rgba(255, 255, 255, 0.04)' },
  'Modo Nocturno': { primary: '#4F46E5', light: '#818CF8', dark: '#3730A3', bg: '#000000', text: '#ffffff', muted: '#aaaaaa', glass: 'rgba(25, 25, 25, 0.95)', border: 'rgba(255,255,255,0.15)', input: '#1a1a1a' },
  'Noche Clásica': { primary: '#000000', light: '#1a1a1a', dark: '#000000', bg: '#000000', text: '#F9FAFB', muted: '#9CA3AF', glass: '#050505', border: 'rgba(255, 255, 255, 0.1)', input: 'rgba(255, 255, 255, 0.05)' },
  'Blanco Completo': { primary: '#0f172a', light: '#333333', dark: '#000000', bg: '#ffffff', text: '#000000', muted: '#6B7280', glass: 'rgba(255, 255, 255, 0.95)', border: 'rgba(0, 0, 0, 0.1)', input: 'rgba(0, 0, 0, 0.05)' },
  'Tema Principal': { primary: '#1565C0', light: '#42A5F5', dark: '#0D47A1', bg: 'linear-gradient(135deg, #090d16 0%, #111827 100%)', text: '#F9FAFB', muted: '#9CA3AF', glass: 'rgba(17, 24, 39, 0.75)', border: 'rgba(255, 255, 255, 0.08)', input: 'rgba(255, 255, 255, 0.04)' }
};

export const hexToRgb = (hex) => {
  const normalized = hex.replace('#', '');
  const value = normalized.length === 3
    ? normalized.split('').map(char => char + char).join('')
    : normalized;
  const parsed = Number.parseInt(value, 16);
  return `${(parsed >> 16) & 255} ${(parsed >> 8) & 255} ${parsed & 255}`;
};

export function ThemeProvider({ children }) {
  const [currentThemeId, setCurrentThemeId] = useState('Verde Agro');
  const [modoOscuroGlobal, setModoOscuroGlobal] = useState(false); // Can be overridden by tenant config

  const applyTheme = (themeId, isDark = false) => {
    let finalTheme = THEME_CONFIG[themeId] ? themeId : 'Verde Agro';
    if (isDark && !['Modo Nocturno', 'Noche Clásica'].includes(finalTheme)) {
      finalTheme = 'Modo Nocturno';
    } else if (!isDark && finalTheme === 'Modo Nocturno') {
      finalTheme = 'Blanco Completo';
    }

    const theme = THEME_CONFIG[finalTheme];
    const root = document.documentElement;

    root.style.setProperty('--primary-color', theme.primary);
    root.style.setProperty('--primary-light', theme.light);
    root.style.setProperty('--primary-dark', theme.dark);
    root.style.setProperty('--primary-rgb', hexToRgb(theme.primary));
    root.style.setProperty('--primary-light-rgb', hexToRgb(theme.light));
    root.style.setProperty('--primary-dark-rgb', hexToRgb(theme.dark));
    
    root.style.setProperty('--bg-gradient', theme.bg);
    root.style.setProperty('--text-main', theme.text);
    root.style.setProperty('--text-contrast', theme.text);
    root.style.setProperty('--text-muted', theme.muted);
    root.style.setProperty('--glass-bg', theme.glass);
    root.style.setProperty('--glass-border', theme.border);
    root.style.setProperty('--input-bg', theme.input);
    
    root.style.setProperty('--sidebar-bg', isDark ? '#000000' : (finalTheme === 'Blanco Completo' ? '#ffffff' : theme.glass));
    root.style.setProperty('--sidebar-text', theme.text);
    root.style.setProperty('--sidebar-text-muted', theme.muted);
    
    root.style.setProperty('--color-background', isDark ? '#000' : '#fff');
    root.style.setProperty('--color-surface', theme.glass);
    root.style.setProperty('--color-primary', theme.primary);
    
    setCurrentThemeId(finalTheme);
  };

  return (
    <ThemeContext.Provider value={{ currentThemeId, applyTheme, modoOscuroGlobal, setModoOscuroGlobal }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
