import { getDictionary } from '@/lib/dictionaries';
import QuizClient from './QuizClient';

const locales = ['es', 'en', 'eu', 'ca', 'val', 'gl'];

export async function generateStaticParams() {
  return locales.map((lang) => ({
    lang,
  }));
}

export default async function QuizPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return <QuizClient dict={dict} lang={lang} />;
}

