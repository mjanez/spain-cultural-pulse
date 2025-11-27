'use client';

import { useState } from 'react';

export default function MatchClient({ dict, lang }: { dict: any, lang: string }) {
  const [results, setResults] = useState<any[] | null>(null);

  async function handleSubmit(formData: FormData) {
    // Placeholder - redirect to main app
    window.location.href = `/${lang}/`;
  }

  if (!dict) return <div>Loading...</div>;

  return (
    <main className="flex min-h-screen flex-col items-center p-24 bg-gray-100 text-black">
      <h1 className="text-4xl font-bold mb-8">{dict.match.title}</h1>
      
      {!results ? (
        <form action={handleSubmit} className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="age">
              {dict.match.age_label}
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="age"
              name="age"
              type="number"
              placeholder={dict.match.age_placeholder}
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="politics">
              {dict.match.politics_label}
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
              <span>{dict.match.politics_left}</span>
              <span>{dict.match.politics_center}</span>
              <span>{dict.match.politics_right}</span>
            </div>
          </div>

          <button
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            type="submit"
          >
            {dict.match.submit_button}
          </button>
        </form>
      ) : (
        <div className="w-full max-w-4xl">
          <div className="bg-white p-8 rounded-lg shadow-md mb-8">
            <h2 className="text-3xl font-bold mb-6 text-center text-green-600">{dict.match.results_title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((region, index) => (
                <div 
                  key={region.id} 
                  className={`p-4 rounded border ${index === 0 ? 'border-green-500 bg-green-50 ring-2 ring-green-200' : 'border-gray-200'}`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-lg">{index + 1}. {region.name}</span>
                    <span className={`text-sm font-mono ${index === 0 ? 'text-green-700 font-bold' : 'text-gray-500'}`}>
                      {(region.score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${index === 0 ? 'bg-green-600' : 'bg-gray-400'} w-[var(--width)]`} 
                      style={{ '--width': `${region.score * 100}%` } as React.CSSProperties}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
                <button 
                    onClick={() => setResults(null)}
                    className="text-green-500 hover:underline"
                >
                    {dict.match.retry_button}
                </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
