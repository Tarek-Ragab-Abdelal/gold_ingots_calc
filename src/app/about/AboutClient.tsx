'use client';

import InfoPageLayout from '@/components/InfoPageLayout';
import type { Language } from '@/lib/types';

const socialLinks = [
  {
    icon: 'fa-globe',
    labelEn: 'Portfolio',
    labelAr: 'الموقع الشخصي',
    href: 'https://tarekragab.com',
    descEn: 'tarekragab.com',
    descAr: 'tarekragab.com',
  },
  {
    icon: 'fa-linkedin',
    labelEn: 'LinkedIn',
    labelAr: 'لينكد إن',
    href: 'https://www.linkedin.com/in/tarek-ragab/',
    descEn: 'Connect professionally',
    descAr: 'تواصل معي مهنياً',
  },
  {
    icon: 'fa-upwork',
    labelEn: 'Upwork',
    labelAr: 'أبورك',
    href: 'https://www.upwork.com/freelancers/~01f068ac7a77a08223',
    descEn: 'Hire me on Upwork',
    descAr: 'وظّفني على أبورك',
  },
  {
    icon: 'fa-github',
    labelEn: 'GitHub',
    labelAr: 'جيت هاب',
    href: 'https://github.com/Tarek-Ragab-Abdelal',
    descEn: 'Open-source projects',
    descAr: 'مشاريع مفتوحة المصدر',
  },
  {
    icon: 'fa-code-branch',
    labelEn: 'This App\'s Source',
    labelAr: 'كود التطبيق',
    href: 'https://github.com/Tarek-Ragab-Abdelal/gold_ingots_calc',
    descEn: 'gold_ingots_calc on GitHub',
    descAr: 'gold_ingots_calc على GitHub',
  },
];

const skills = {
  en: [
    '.NET & C#', 'React & TypeScript', 'Node.js', 'Azure Cloud',
    'Python & Data Pipelines', 'Flutter (Desktop & Mobile)',
    'SQL Server & PostgreSQL', 'IoT & Embedded Systems (C++)',
  ],
  ar: [
    '.NET و C#', 'React و TypeScript', 'Node.js', 'Azure Cloud',
    'Python وتحليل البيانات', 'Flutter (سطح المكتب والجوال)',
    'SQL Server و PostgreSQL', 'أنظمة IoT والمدمجة (C++)',
  ],
};

function AboutContent({ lang }: { lang: Language }) {
  const ar = lang === 'ar';
  const skillList = ar ? skills.ar : skills.en;

  return (
    <>
      {/* Developer Profile */}
      <article className="info-article about-profile">
        <div className="about-avatar" aria-hidden="true">
          <i className="fas fa-user-circle" />
        </div>
        <header className="info-article-header">
          <h2>Tarek Ragab</h2>
          <p className="about-title">
            {ar
              ? 'مهندس برمجيات متكامل ومطور Azure — القاهرة، مصر'
              : 'Full-Stack Software Engineer & Azure Cloud Developer — Cairo, Egypt'}
          </p>
        </header>
        <p className="info-article-intro">
          {ar
            ? 'طارق رجب مهندس برمجيات بخبرة تزيد عن ٤ سنوات في بناء تطبيقات الويب عالية الأداء، وخطوط بيانات قابلة للتوسع، وحلول سحابية متكاملة. متخصص في .NET وReact وAzure، وأسلوبه يبدأ دائماً من الأثر التجاري وينتهي بأنظمة قابلة للصيانة وتجربة مستخدم مدروسة.'
            : 'Tarek Ragab is a Full-Stack Software Engineer with 4+ years of experience building high-performance web applications, scalable data pipelines, and cloud solutions. Specializing in .NET, React, and Azure, his approach starts with business impact and ends with maintainable systems and purposeful UX.'}
        </p>
      </article>

      {/* About This App */}
      <article className="info-article">
        <header className="info-article-header">
          <h2>{ar ? 'عن حاسبة الذهب BTC' : 'About the BTC Gold Calculator'}</h2>
        </header>
        <p>
          {ar
            ? 'حاسبة الذهب BTC أداة مجانية تتيح حساب أسعار الذهب اللحظية في مصر بدقة عالية. تدعم عيارات ١٨ و٢١ و٢٤، والسبائك بأوزان مختلفة، وتحويل المبالغ المالية إلى ذهب والعكس. صُممت أولاً للهاتف المحمول مع دعم كامل للغتين العربية والإنجليزية.'
            : 'The BTC Gold Calculator is a free tool providing accurate live gold price calculations for the Egyptian market. It supports 18K, 21K, and 24K gold, various ingot sizes, and both gold-to-money and money-to-gold conversions. Designed mobile-first with full Arabic and English support.'}
        </p>
        <ul className="about-features">
          <li>
            <i className="fas fa-check-circle" aria-hidden="true" />
            {ar ? 'أسعار لحظية من مصادر متعددة' : 'Live prices from multiple market sources'}
          </li>
          <li>
            <i className="fas fa-check-circle" aria-hidden="true" />
            {ar ? 'دعم كامل للغة العربية (RTL)' : 'Full Arabic language & RTL support'}
          </li>
          <li>
            <i className="fas fa-check-circle" aria-hidden="true" />
            {ar ? 'حساب الرسوم التلقائي لكل نوع ذهب' : 'Automatic fee calculation per gold type'}
          </li>
          <li>
            <i className="fas fa-check-circle" aria-hidden="true" />
            {ar ? 'حفظ الحسابات محلياً بدون إنشاء حساب' : 'Local history saving — no account needed'}
          </li>
          <li>
            <i className="fas fa-check-circle" aria-hidden="true" />
            {ar ? 'تصميم استجابي يعمل على جميع الأجهزة' : 'Responsive design — works on all devices'}
          </li>
          <li>
            <i className="fas fa-check-circle" aria-hidden="true" />
            {ar ? 'مفتوح المصدر على GitHub' : 'Open-source on GitHub'}
          </li>
        </ul>
      </article>

      {/* Skills */}
      <article className="info-article">
        <header className="info-article-header">
          <h2>{ar ? 'المهارات التقنية' : 'Technical Skills'}</h2>
        </header>
        <div className="skills-grid">
          {skillList.map((skill, i) => (
            <span key={i} className="skill-badge">
              <i className="fas fa-code" aria-hidden="true" />
              {skill}
            </span>
          ))}
        </div>
      </article>

      {/* Social Links */}
      <article className="info-article">
        <header className="info-article-header">
          <h2>{ar ? 'تواصل معي' : 'Connect with Me'}</h2>
        </header>
        <div className="social-links-grid">
          {socialLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="social-card"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={ar ? link.labelAr : link.labelEn}
            >
              <i className={`fab ${link.icon}`} aria-hidden="true" />
              <div>
                <strong>{ar ? link.labelAr : link.labelEn}</strong>
                <span>{ar ? link.descAr : link.descEn}</span>
              </div>
            </a>
          ))}
        </div>
      </article>

      {/* CTA */}
      <article className="info-article info-article-cta">
        <div className="cta-content">
          <h2>{ar ? 'جرّب الحاسبة الآن' : 'Try the Calculator'}</h2>
          <p>
            {ar
              ? 'احسب قيمة ذهبك أو خطّط لمدخراتك بسهولة مع أسعار لحظية دقيقة.'
              : 'Calculate your gold\'s value or plan your savings with accurate live prices.'}
          </p>
          <a href="/" className="cta-btn">
            <i className="fas fa-calculator" aria-hidden="true" />
            {ar ? 'افتح الحاسبة' : 'Open Calculator'}
          </a>
        </div>
      </article>
    </>
  );
}

export default function AboutClient() {
  return (
    <InfoPageLayout titleEn="About the Developer" titleAr="عن المطور">
      {(lang) => <AboutContent lang={lang} />}
    </InfoPageLayout>
  );
}
