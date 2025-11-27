import { getDictionary } from '@/lib/dictionaries';
import MatchClient from './MatchClient';

export default async function MatchPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return <MatchClient dict={dict} lang={lang} />;
}
