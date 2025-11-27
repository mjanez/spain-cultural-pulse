import { getDictionary } from '@/lib/dictionaries';
import QuizClient from './QuizClient';

export default async function QuizPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return <QuizClient dict={dict} lang={lang} />;
}

