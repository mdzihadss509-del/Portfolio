'use client';

import { useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem('hades-theme');
    } catch {
      // Storage may be unavailable in restricted browser contexts; dark mode is the default.
    }
    document.documentElement.dataset.theme = saved === 'light' ? 'light' : 'dark';
  }, []);

  function toggle() {
    const current = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem('hades-theme', next);
    } catch {
      // Keep the current-page theme usable even when browser storage is unavailable.
    }
  }

  return (
    <button className="icon-button" aria-label="Toggle color theme" onClick={toggle}>
      <Sun className="theme-toggle-icon theme-toggle-sun" size={17} />
      <Moon className="theme-toggle-icon theme-toggle-moon" size={17} />
    </button>
  );
}
