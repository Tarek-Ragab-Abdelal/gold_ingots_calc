import type { Metadata } from 'next';
import GuideClient from './GuideClient';

export const metadata: Metadata = {
  title: 'How to Use the Gold Calculator | دليل استخدام حاسبة الذهب',
  description:
    'Step-by-step guide to using the BTC Gold Calculator. Learn how to check live gold prices, calculate gold value, convert money to gold, and save your calculations. كيفية استخدام حاسبة الذهب BTC: دليل خطوة بخطوة.',
  keywords: [
    'gold calculator guide', 'how to use gold calculator', 'دليل حاسبة الذهب',
    'كيفية استخدام حاسبة الذهب', 'gold price Egypt tutorial', 'gold ingots calculator tutorial',
    'حاسبة سبائك الذهب', 'gold savings calculator how to',
  ],
  metadataBase: new URL('https://gold.tarekragab.com'),
  alternates: { canonical: '/guide' },
  openGraph: {
    title: 'How to Use the Gold Calculator | دليل استخدام حاسبة الذهب',
    description: 'Step-by-step guide to using the BTC Gold Calculator for Egyptian gold prices.',
    url: 'https://gold.tarekragab.com/guide',
    siteName: 'BTC Gold Calculator',
    type: 'article',
    images: [{ url: '/logo.png', width: 512, height: 512, alt: 'BTC Gold Calculator Guide' }],
  },
};

export default function GuidePage() {
  return <GuideClient />;
}
