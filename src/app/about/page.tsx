import type { Metadata } from 'next';
import AboutClient from './AboutClient';

export const metadata: Metadata = {
  title: 'About the Developer | عن المطور - Tarek Ragab',
  description:
    'About Tarek Ragab, the developer of the BTC Gold Calculator. Full-Stack Software Engineer from Cairo, Egypt. Visit his portfolio at tarekragab.com. تعرف على مطور حاسبة الذهب BTC - طارق رجب، مهندس برمجيات متكامل من القاهرة.',
  keywords: [
    'Tarek Ragab', 'طارق رجب', 'gold calculator developer', 'مطور حاسبة الذهب',
    'full stack engineer Egypt', 'مهندس برمجيات مصر', 'tarekragab.com',
    'BTC gold calculator about',
  ],
  metadataBase: new URL('https://gold.tarekragab.com'),
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About the Developer — Tarek Ragab | حاسبة الذهب BTC',
    description:
      'Tarek Ragab is a Full-Stack Software Engineer from Cairo, Egypt and the creator of the BTC Gold Calculator.',
    url: 'https://gold.tarekragab.com/about',
    siteName: 'BTC Gold Calculator',
    type: 'profile',
    images: [{ url: '/logo.png', width: 512, height: 512, alt: 'Tarek Ragab — Developer' }],
  },
};

export default function AboutPage() {
  return <AboutClient />;
}
