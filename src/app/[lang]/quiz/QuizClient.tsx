'use client';

import { useState } from 'react';
import { calculateTribe } from '@/app/actions';

export default function QuizClient({ dict, lang }: { dict: any, lang: string }) {
  const [result, setResult] = useState<any>(null);

  async function handleSubmit(formData: FormData) {
    const tribe = await calculateTribe(formData, lang);
    setResult(tribe);
  }

  if (!dict) return <div>Loading...</div>;

  return (
    <main className="flex min-h-screen flex-col items-center p-24 bg-gray-100 text-black">
      <h1 className="text-4xl font-bold mb-8">{dict.quiz.title}</h1>
      
      {!result ? (
        <form action={handleSubmit} className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="age">
              {dict.quiz.age_label}
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="age"
              name="age"
              type="number"
              placeholder={dict.quiz.age_placeholder}
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="politics">
              {dict.quiz.politics_label}
            </label>
            <input
              className="w-full"
              id="politics"
              name="politics"
              type="range"
              min="0"
              max="10"
              defaultValue="5"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{dict.quiz.politics_left}</span>
              <span>{dict.quiz.politics_center}</span>
              <span>{dict.quiz.politics_right}</span>
            </div>
          </div>

          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            type="submit"
          >
            {dict.quiz.submit_button}
          </button>
        </form>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl w-full text-center">
          <h2 className="text-3xl font-bold mb-4 text-indigo-600">{result.name}</h2>
          <p className="text-xl mb-6">{result.description}</p>
          
          <div className="grid grid-cols-2 gap-8 text-left">
            <div>
              <h3 className="font-bold mb-2 border-b pb-1">{dict.quiz.tv_shows}</h3>
              <ul className="list-disc pl-5">
                {result.topTV.map((tv: string) => (
                  <li key={tv}>{tv}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-2 border-b pb-1">{dict.quiz.games}</h3>
              <ul className="list-disc pl-5">
                {result.topGames.map((game: string) => (
                  <li key={game}>{game}</li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t">
            <p className="text-sm text-gray-500">
              {dict.quiz.avg_age}: {result.avgAge.toFixed(1)} | {dict.quiz.avg_politics}: {result.avgPolitics.toFixed(1)}
            </p>
          </div>
          
          <button 
            onClick={() => setResult(null)}
            className="mt-8 text-blue-500 hover:underline"
          >
            {dict.quiz.retry_button}
          </button>
        </div>
      )}
    </main>
  );
}
