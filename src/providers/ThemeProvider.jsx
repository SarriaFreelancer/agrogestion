import React, { createContext, useContext, useState } from 'react';

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
  return `${(parsed >> 16) & 255}, ${(parsed >> 8) & 255}, ${parsed & 255}`;
};

export function ThemeProvider({ children }) {
  const [currentThemeId, setCurrentThemeId] = useState('Verde Agro');
  const [modoOscuroGlobal, setModoOscuroGlobal] = useState(false);

  const applyTheme = (themeId, isDark = false) => {
    const finalThemeName = THEME_CONFIG[themeId] ? themeId : 'Verde Agro';
    const themeData = THEME_CONFIG[finalThemeName];
    const root = document.documentElement;

    // Colores primarios siempre se aplican
    root.style.setProperty('--primary-color', themeData.primary);
    root.style.setProperty('--primary-light', themeData.light);
    root.style.setProperty('--primary-dark', themeData.dark);
    root.style.setProperty('--primary-rgb', hexToRgb(themeData.primary));
    root.style.setProperty('--primary-light-rgb', hexToRgb(themeData.light));
    root.style.setProperty('--primary-dark-rgb', hexToRgb(themeData.dark));

    // modoOscuro === 0 => modo claro, modoOscuro !== 0 => modo oscuro
    // isDark viene como true cuando modoOscuro === 1
    const isLightMode = !isDark;
    const isBlanco = finalThemeName === 'Blanco Completo';
    const isNoche = finalThemeName === 'Noche Clásica';
    const isPizarra = finalThemeName === 'Tema Principal';

    if (isBlanco) {
      // Tema Blanco Completo
      root.style.setProperty('--primary-rgb', isLightMode ? '15, 23, 42' : '248, 250, 252');
      root.style.setProperty('--primary-light-rgb', isLightMode ? '30, 41, 59' : '203, 213, 225');
      root.style.setProperty('--bg-gradient', isLightMode ? '#f8fafc' : '#020617');
      root.style.setProperty('--sidebar-bg', isLightMode ? '#ffffff' : '#0f172a');
      root.style.setProperty('--glass-bg', isLightMode ? 'rgba(255, 255, 255, 0.95)' : 'rgba(15, 23, 42, 0.85)');
      root.style.setProperty('--glass-border', isLightMode ? 'rgba(203, 213, 225, 0.8)' : 'rgba(255, 255, 255, 0.12)');
      root.style.setProperty('--input-bg', isLightMode ? '#ffffff' : 'rgba(15, 23, 42, 0.6)');
      root.style.setProperty('--table-row-bg', isLightMode ? '#ffffff' : 'rgba(15, 23, 42, 0.4)');
      root.style.setProperty('--text-main', isLightMode ? '#0f172a' : '#f8fafc');
      root.style.setProperty('--text-contrast', isLightMode ? '#0f172a' : '#ffffff');
      root.style.setProperty('--text-muted', isLightMode ? '#475569' : '#94a3b8');
      root.style.setProperty('--sidebar-text', isLightMode ? '#0f172a' : '#ffffff');
      root.style.setProperty('--sidebar-text-muted', isLightMode ? '#475569' : '#94a3b8');
    } else if (isNoche) {
      // Tema Noche Clásica
      root.style.setProperty('--primary-rgb', isLightMode ? '15, 23, 42' : '16, 185, 129');
      root.style.setProperty('--primary-light-rgb', isLightMode ? '30, 41, 59' : '52, 211, 153');
      root.style.setProperty('--bg-gradient', isLightMode ? '#f1f5f9' : '#000000');
      root.style.setProperty('--sidebar-bg', isLightMode ? '#ffffff' : '#050505');
      root.style.setProperty('--glass-bg', isLightMode ? 'rgba(255, 255, 255, 0.92)' : '#0f1117');
      root.style.setProperty('--glass-border', isLightMode ? 'rgba(203, 213, 225, 0.8)' : 'rgba(255, 255, 255, 0.12)');
      root.style.setProperty('--input-bg', isLightMode ? '#ffffff' : 'rgba(255, 255, 255, 0.05)');
      root.style.setProperty('--table-row-bg', isLightMode ? '#ffffff' : 'rgba(255, 255, 255, 0.02)');
      root.style.setProperty('--text-main', isLightMode ? '#0f172a' : '#f8fafc');
      root.style.setProperty('--text-contrast', isLightMode ? '#0f172a' : '#ffffff');
      root.style.setProperty('--text-muted', isLightMode ? '#475569' : '#94a3b8');
      root.style.setProperty('--sidebar-text', isLightMode ? '#0f172a' : '#ffffff');
      root.style.setProperty('--sidebar-text-muted', isLightMode ? '#475569' : 'rgba(255, 255, 255, 0.7)');
    } else {
      // Temas normales (Verde Agro, Azul Océano, Tierra Café, etc.)
      if (isLightMode) {
        // Modo claro: fondo suave, texto oscuro de máximo contraste
        root.style.setProperty('--bg-gradient', 'linear-gradient(135deg, #f8fafc 0%, #eef2f6 100%)');
        root.style.setProperty('--sidebar-bg', '#0f172a');
        root.style.setProperty('--glass-bg', 'rgba(255, 255, 255, 0.92)');
        root.style.setProperty('--glass-border', 'rgba(203, 213, 225, 0.85)');
        root.style.setProperty('--input-bg', '#ffffff');
        root.style.setProperty('--table-row-bg', '#ffffff');
        root.style.setProperty('--text-main', '#0f172a');
        root.style.setProperty('--text-contrast', '#0f172a');
        root.style.setProperty('--text-muted', '#475569');
        root.style.setProperty('--sidebar-text', '#ffffff');
        root.style.setProperty('--sidebar-text-muted', 'rgba(255, 255, 255, 0.75)');
      } else {
        // Modo oscuro: fondo oscuro profundo con texto blanco nítido
        root.style.setProperty('--bg-gradient', `linear-gradient(135deg, #090d16 0%, color-mix(in srgb, ${themeData.dark} 25%, #090d16) 100%)`);
        root.style.setProperty('--sidebar-bg', isPizarra ? '#0f172a' : `color-mix(in srgb, ${themeData.dark} 45%, #000000)`);
        root.style.setProperty('--glass-bg', `color-mix(in srgb, ${themeData.dark} 18%, rgba(15, 23, 42, 0.88))`);
        root.style.setProperty('--glass-border', 'rgba(255, 255, 255, 0.12)');
        root.style.setProperty('--input-bg', 'rgba(15, 23, 42, 0.6)');
        root.style.setProperty('--table-row-bg', 'rgba(15, 23, 42, 0.35)');
        root.style.setProperty('--text-main', '#f8fafc');
        root.style.setProperty('--text-contrast', '#ffffff');
        root.style.setProperty('--text-muted', '#94a3b8');
        root.style.setProperty('--sidebar-text', '#ffffff');
        root.style.setProperty('--sidebar-text-muted', 'rgba(255, 255, 255, 0.75)');
      }
    }

    root.style.setProperty('--color-surface', isLightMode ? 'rgba(255, 255, 255, 0.9)' : themeData.glass);
    root.style.setProperty('--color-primary', themeData.primary);
    root.style.setProperty('--color-foreground', isLightMode ? '#0f172a' : '#f8fafc');
    root.style.setProperty('--color-muted', isLightMode ? '#475569' : '#94a3b8');

    if (isLightMode) {
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
    }

    setCurrentThemeId(finalThemeName);
    setModoOscuroGlobal(!isLightMode);
  };

  const toggleThemeMode = () => {
    const nextIsDark = !modoOscuroGlobal;
    applyTheme(currentThemeId, nextIsDark);
    return nextIsDark;
  };

  return (
    <ThemeContext.Provider value={{ currentThemeId, applyTheme, modoOscuroGlobal, setModoOscuroGlobal, toggleThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
