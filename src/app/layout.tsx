import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BTC Gold Calculator | حاسبة الذهب - أسعار الذهب في مصر',
  description: 'احسب أسعار الذهب في مصر بدقة. حاسبة الذهب الاحترافية بأسعار لحظية لعيار 21 و18 و24. Calculate live gold prices in Egypt with Arabic and English support.',
  keywords: [
    'gold calculator', 'حاسبة الذهب', 'أسعار الذهب', 'gold prices Egypt',
    'سعر الذهب مصر', 'عيار 21', 'عيار 18', 'كيلو ذهب', 'gold ingots',
    'BTC gold', 'gold price calculator', 'سعر الذهب اليوم',
  ],
  manifest: '/manifest.json',
  metadataBase: new URL('https://gold.tarekragab.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'BTC Gold Calculator | حاسبة الذهب',
    description: 'احسب أسعار الذهب في مصر بدقة. Calculate live gold prices in Egypt with Arabic and English support.',
    url: 'https://gold.tarekragab.com/',
    siteName: 'BTC Gold Calculator',
    locale: 'ar_EG',
    alternateLocale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'BTC Gold Calculator',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'BTC Gold Calculator | حاسبة الذهب',
    description: 'احسب أسعار الذهب في مصر بدقة. Calculate live gold prices in Egypt.',
    images: ['/logo.png'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Gold Calc',
  },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
    shortcut: '/logo.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export const viewport: Viewport = {
  themeColor: '#1C1917',
  viewportFit: 'cover',
};

// Inline script that runs before React hydration to apply the correct language
// direction immediately, preventing a flash of wrong layout for Arabic users.
// Logic mirrors StorageManager.getLanguage(): saved preference wins, then
// navigator.languages / navigator.language are used as fallback.
const langDetectScript = `
(function () {
  try {
    var saved = localStorage.getItem('language');
    if (saved === 'ar') {
      document.documentElement.setAttribute('lang', 'ar');
      document.documentElement.setAttribute('dir', 'rtl');
      return;
    }
    if (saved === 'en') return;
    var langs = (navigator.languages && navigator.languages.length)
      ? Array.from(navigator.languages)
      : [navigator.language || ''];
    var isArabic = langs.some(function (l) { return l && l.toLowerCase().startsWith('ar'); });
    if (isArabic) {
      document.documentElement.setAttribute('lang', 'ar');
      document.documentElement.setAttribute('dir', 'rtl');
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        {/* Runs synchronously before render to set correct lang/dir for RTL users */}
        <script dangerouslySetInnerHTML={{ __html: langDetectScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
