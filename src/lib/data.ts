import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { getDictionary } from './dictionaries';

const CSV_PATH = path.join(process.cwd(), 'data', 'NORPOL_dataset_limpios_2024.csv');

export interface UserProfile {
  age: number;
  politics: number; // 0-10
  values: number[]; // Array of 11 numbers (1-5)
  music: number[]; // Array of 14 numbers (0/1)
}

export interface Tribe {
  id: string;
  name: string;
  description: string;
  avgAge: number;
  avgPolitics: number;
  topTV: string[];
  topGames: string[];
}

let cachedData: any[] | null = null;

export async function getData() {
  if (cachedData) return cachedData;

  const fileContent = fs.readFileSync(CSV_PATH, 'utf8');
  const result = Papa.parse(fileContent, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });
  
  cachedData = result.data;
  return cachedData;
}

export async function getTribes(lang: string = 'en'): Promise<Tribe[]> {
  const dict = await getDictionary(lang);
  const t = dict.results.tribes;

  return [
    {
      id: 'pop-culture-centrists',
      name: t.average,
      description: 'Average citizen description placeholder',
      avgAge: 39.6,
      avgPolitics: 4.9,
      topTV: ['Friends', 'La Que Se Avecina', 'Game of Thrones'],
      topGames: ['Mario', 'FIFA', 'Fortnite']
    },
    {
      id: 'streaming-mainstream',
      name: t.explorer,
      description: 'Explorer description placeholder',
      avgAge: 44.1,
      avgPolitics: 5.2,
      topTV: ['La Casa de Papel', 'Breaking Bad', 'Los Bridgerton'],
      topGames: ['Candy Crush', 'Tetris', 'Los Sims']
    },
    {
      id: 'progressive-bingers',
      name: t.rebel,
      description: 'Rebel description placeholder',
      avgAge: 46.9,
      avgPolitics: 3.5,
      topTV: ['The Walking Dead', 'Game of Thrones', 'Merlí'],
      topGames: ['Call of Duty', 'The Last of Us', 'Animal Crossing']
    },
    {
      id: 'traditional-conservatives',
      name: t.guardian,
      description: 'Guardian description placeholder',
      avgAge: 65.6,
      avgPolitics: 7.1,
      topTV: ['CSI', 'La Promesa', 'Amar es para siempre'],
      topGames: ['Mahjong', 'Solitaire', 'Candy Crush']
    }
  ];
}

export async function findTribe(profile: UserProfile, lang: string = 'en'): Promise<Tribe> {
  const tribes = await getTribes(lang);
  
  // Simple distance metric based on Age and Politics (since we know those for sure)
  // We could include values if we knew what they meant.
  
  let bestTribe = tribes[0];
  let minDistance = Infinity;

  for (const tribe of tribes) {
    // Normalize differences
    const ageDiff = Math.abs(profile.age - tribe.avgAge) / 50; // approx range 18-90
    const polDiff = Math.abs(profile.politics - tribe.avgPolitics) / 10;
    
    const distance = ageDiff + polDiff * 2; // Weight politics more?
    
    if (distance < minDistance) {
      minDistance = distance;
      bestTribe = tribe;
    }
  }
  
  return bestTribe;
}

export async function getRegionalMatch(profile: UserProfile, lang: string = 'en') {
  const data = await getData();
  if (!data) return [];

  const dict: any = await getDictionary(lang);

  // Group by CCAA (D7_CCAA)
  const regions: Record<number, { count: number, score: number }> = {};
  
  data.forEach((row: any) => {
    const regionId = row['D7_CCAA'];
    if (!regionId) return;

    if (!regions[regionId]) regions[regionId] = { count: 0, score: 0 };
    
    // Calculate similarity score
    let rowAge = row['D3'];
    if (typeof rowAge !== 'number') rowAge = 40;
    
    let rowPol = row['P5_1'];
    if (typeof rowPol !== 'number') rowPol = 5;

    const ageDiff = Math.abs(profile.age - rowAge) / 50;
    const polDiff = Math.abs(profile.politics - rowPol) / 10;
    
    const similarity = 1 - (ageDiff + polDiff) / 2; // 0 to 1
    
    regions[regionId].count++;
    regions[regionId].score += similarity;
  });

  // Average score per region
  const result = Object.entries(regions).map(([id, stats]) => ({
    id: parseInt(id),
    score: stats.score / stats.count,
    name: (dict.regions && dict.regions[id as keyof typeof dict.regions]) || 'Unknown'
  })).sort((a, b) => b.score - a.score);

  return result;
}
