import CulturalPulseApp from '@/components/CulturalPulseApp';
import { getDictionary } from '@/lib/dictionaries';

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  return <CulturalPulseApp dict={dict} lang={lang} />;
}

