import CulturalPulseApp from '@/components/CulturalPulseApp';
import { getDictionary } from '@/lib/dictionaries';

const locales = ['es', 'en', 'eu', 'ca', 'val', 'gl'];

export async function generateStaticParams() {
  return locales.map((lang) => ({
    lang,
  }));
}

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  return <CulturalPulseApp dict={dict} lang={lang} />;
}

