import type { Language } from '@/lib/types';

interface Props {
  language: Language;
}

export default function AppFooter({ language }: Readonly<Props>) {
  const ar = language === 'ar';

  return (
    <footer className="app-footer">
      <h3>{ar ? 'ادعم المطور' : 'Support the Developer'}</h3>

      <div className="support-buttons">
        <a
          href="https://www.buymeacoffee.com/tarekragab"
          className="support-btn coffee"
          aria-label="Buy Me A Coffee"
          target="_blank"
          rel="noopener noreferrer"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
            width={120}
            alt="Buy Me A Coffee"
          />
        </a>
        <a
          href="https://www.ko-fi.com/tarekragab"
          className="support-btn kofi"
          aria-label="Ko-fi"
          target="_blank"
          rel="noopener noreferrer"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://storage.ko-fi.com/cdn/kofi2.png?v=3"
            width={120}
            alt="Ko-fi"
          />
        </a>
      </div>

      <div className="footer-social">
        <a
          href="https://www.linkedin.com/in/tarek-ragab/"
          className="social-link"
          aria-label={ar ? 'لينكد إن' : 'LinkedIn'}
          title="LinkedIn"
          target="_blank"
          rel="noopener noreferrer"
        >
          <i className="fab fa-linkedin" aria-hidden="true" />
          <span>LinkedIn</span>
        </a>
        <a
          href="https://www.upwork.com/freelancers/~01f068ac7a77a08223"
          className="social-link"
          aria-label={ar ? 'أبورك' : 'Upwork'}
          title="Upwork"
          target="_blank"
          rel="noopener noreferrer"
        >
          <i className="fab fa-upwork" aria-hidden="true" />
          <span>Upwork</span>
        </a>
        <a
          href="https://github.com/Tarek-Ragab-Abdelal"
          className="social-link"
          aria-label="GitHub"
          title="GitHub"
          target="_blank"
          rel="noopener noreferrer"
        >
          <i className="fab fa-github" aria-hidden="true" />
          <span>GitHub</span>
        </a>
      </div>

      <div className="footer-info">
        <p>
          {ar
            ? '© 2025 حاسبة الذهب BTC. جميع الحقوق محفوظة.'
            : '© 2025 BTC Gold Calculator. All rights reserved.'}
        </p>
        <p>
          {ar ? 'بواسطة ' : 'Created by '}
          <a
            href="https://tarekragab.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Tarek Ragab portfolio (opens in new tab)"
          >
            Tarek Ragab
          </a>
          {' · '}
          <a href="/about" aria-label={ar ? 'عن المطور' : 'About the developer'}>
            {ar ? 'عن المطور' : 'About'}
          </a>
          {' · '}
          <a href="/guide" aria-label={ar ? 'دليل الاستخدام' : 'How to use guide'}>
            {ar ? 'دليل الاستخدام' : 'Guide'}
          </a>
        </p>
        <p className="disclaimer">
          {ar
            ? 'الأسعار للمرجع فقط. يرجى التحقق من المصادر الرسمية.'
            : 'Prices are for reference only. Verify with official sources.'}
        </p>
      </div>
    </footer>
  );
}
