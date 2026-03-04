'use client';

import { useEffect, useState } from 'react';
import type { Language, Theme } from '@/lib/types';

interface Props {
  children: (lang: Language) => React.ReactNode;
  titleEn: string;
  titleAr: string;
}

export default function InfoPageLayout({ children, titleEn, titleAr }: Readonly<Props>) {
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read saved language preference
    const savedLang = localStorage.getItem('language') as Language | null;
    if (savedLang === 'ar' || savedLang === 'en') {
      setLanguage(savedLang);
    } else {
      const browserLangs = navigator.languages?.length
        ? Array.from(navigator.languages)
        : [navigator.language || ''];
      const isArabic = browserLangs.some(l => l?.toLowerCase().startsWith('ar'));
      if (isArabic) setLanguage('ar');
    }

    // Read saved theme preference
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme === 'dark' || savedTheme === 'light') {
      setTheme(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }

    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute('lang', language);
    document.documentElement.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
  }, [language, mounted]);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme, mounted]);

  function toggleLanguage() {
    const next: Language = language === 'en' ? 'ar' : 'en';
    setLanguage(next);
    localStorage.setItem('language', next);
  }

  function toggleTheme() {
    const next: Theme = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('theme', next);
  }

  const ar = language === 'ar';

  if (!mounted) return null;

  return (
    <div className="app-layout" data-theme={theme}>
      <header className="app-header">
        <div className="title-row">
          <div className="title-left">
            <a href="/" className="back-link" aria-label={ar ? 'العودة إلى الحاسبة' : 'Back to calculator'}>
              <i className={`fas ${ar ? 'fa-arrow-right' : 'fa-arrow-left'}`} aria-hidden="true" />
              <span>{ar ? 'الحاسبة' : 'Calculator'}</span>
            </a>
            <h1>{ar ? titleAr : titleEn}</h1>
          </div>

          <nav className="header-nav" aria-label={ar ? 'روابط التنقل' : 'Navigation links'}>
            <a href="/guide" className="nav-link" title={ar ? 'دليل الاستخدام' : 'How to use'}>
              <i className="fas fa-book-open" aria-hidden="true" />
              <span className="nav-link-text">{ar ? 'الدليل' : 'Guide'}</span>
            </a>
            <a href="/about" className="nav-link" title={ar ? 'عن المطور' : 'About'}>
              <i className="fas fa-user-circle" aria-hidden="true" />
              <span className="nav-link-text">{ar ? 'عن المطور' : 'About'}</span>
            </a>
          </nav>

          <div className="title-actions">
            <button
              className="icon-btn"
              onClick={toggleLanguage}
              title={ar ? 'تغيير اللغة' : 'Toggle Language'}
              aria-label="Toggle language"
            >
              <i className="fas fa-language" />
            </button>
            <button
              className="icon-btn"
              onClick={toggleTheme}
              title={ar ? 'تغيير المظهر' : 'Toggle theme'}
              aria-label="Toggle theme"
            >
              <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`} />
            </button>
          </div>
        </div>
      </header>

      <div className="container">
        <main className="info-page">
          {children(language)}
        </main>
      </div>

      <footer className="app-footer info-page-footer">
        <div className="footer-info">
          <p>
            {ar ? 'بواسطة ' : 'Created by '}
            <a href="https://tarekragab.com" target="_blank" rel="noopener noreferrer">
              Tarek Ragab
            </a>
            {' · '}
            <a href="/">{ar ? 'الحاسبة' : 'Calculator'}</a>
            {' · '}
            <a href="/about">{ar ? 'عن المطور' : 'About'}</a>
            {' · '}
            <a href="/guide">{ar ? 'الدليل' : 'Guide'}</a>
          </p>
          <p className="disclaimer">
            {ar
              ? 'الأسعار للمرجع فقط. يرجى التحقق من المصادر الرسمية.'
              : 'Prices are for reference only. Verify with official sources.'}
          </p>
        </div>
      </footer>
    </div>
  );
}
