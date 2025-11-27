import { getDictionary } from '@/lib/dictionaries';
import MatchClient from './MatchClient';

const locales = ['es', 'en', 'eu', 'ca', 'val', 'gl'];

export async function generateStaticParams() {
  return locales.map((lang) => ({
    lang,
  }));
}

export default async function MatchPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return <MatchClient dict={dict} lang={lang} />;
}
