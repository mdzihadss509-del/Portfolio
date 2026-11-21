'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

type Theme = 'dark' | 'light';

function systemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function storedTheme(): Theme | null {
  try {
    const saved = localStorage.getItem('hades-theme');
    return saved === 'light' || saved === 'dark' ? saved : null;
  } catch {
    return null;
  }
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: light)');
    const syncFromSystemOrStorage = () => {
      const next = storedTheme() || (media.matches ? 'light' : 'dark');
      applyTheme(next);
      setTheme(next);
    };

    syncFromSystemOrStorage();

    const handleSystemChange = () => {
      if (storedTheme()) return;
      const next = media.matches ? 'light' : 'dark';
      applyTheme(next);
      setTheme(next);
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== 'hades-theme') return;
      const next = event.newValue === 'light' || event.newValue === 'dark'
        ? event.newValue
        : systemTheme();
      applyTheme(next);
      setTheme(next);
    };

    media.addEventListener('change', handleSystemChange);
    window.addEventListener('storage', handleStorage);
    return () => {
      media.removeEventListener('change', handleSystemChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  function toggle() {
    const current = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
    const next: Theme = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    setTheme(next);
    try {
      localStorage.setItem('hades-theme', next);
    } catch {
      // The theme remains active for this page even when storage is unavailable.
    }
  }

  return (
    <button
      className="icon-button"
      type="button"
      aria-label="Toggle color theme"
      aria-pressed={theme === 'light'}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      data-active-theme={theme}
      onClick={toggle}
    >
      <Sun className="theme-toggle-icon theme-toggle-sun" size={17} aria-hidden="true" />
      <Moon className="theme-toggle-icon theme-toggle-moon" size={17} aria-hidden="true" />
    </button>
  );
}
