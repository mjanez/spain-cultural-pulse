'use server';

import { findTribe, getRegionalMatch, UserProfile } from '@/lib/data';

export async function calculateTribe(formData: FormData, lang: string = 'en') {
  const age = parseInt(formData.get('age') as string) || 30;
  const politics = parseInt(formData.get('politics') as string) || 5;
  
  // Mock values for now as we don't have the full questionnaire mapping
  const values = Array(11).fill(3);
  const music = Array(14).fill(0);

  const profile: UserProfile = { age, politics, values, music };
  
  const tribe = await findTribe(profile, lang);
  return tribe;
}

export async function calculateMatch(formData: FormData, lang: string = 'en') {
  const age = parseInt(formData.get('age') as string) || 30;
  const politics = parseInt(formData.get('politics') as string) || 5;
  
  const profile: UserProfile = { age, politics, values: [], music: [] };
  
  const matches = await getRegionalMatch(profile, lang);
  return matches;
}
