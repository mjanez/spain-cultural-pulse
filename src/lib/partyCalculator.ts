import partiesData from '@/data/political_parties.json';
import regionConfig from '@/data/region_config.json';

interface MatchScore {
  regionId: string;
  region: string;
  displayName?: any;
  diff?: number;
  distance?: number;
  similarity?: number;
}

interface UserProfile {
  politics_leftright: number;
  values_authority: number;
  politics_environment: number;
  politics_equality: number;
  social_immigration: number;
  social_lgbt: number;
  identity_spanish: number;
  identity_regional: number;
  [key: string]: number;
}

interface PartyResult {
  id: string;
  similarity: number;
  [key: string]: any;
}

/**
 * Pesos para el cálculo de similitud con partidos políticos.
 * El eje izquierda-derecha es absolutamente dominante (x200).
 * El eje autoritario-libertario es secundario (x30).
 * Las demás dimensiones tienen peso casi despreciable.
 */
const WEIGHTS = {
  politics_leftright: 200,
  values_authority: 30,
  politics_environment: 0.5,
  politics_equality: 0.5,
  social_immigration: 0.3,
  social_lgbt: 0.3,
  identity_spanish: 2,
  identity_regional: 3
};

/**
 * Obtiene las regiones nacionalistas desde la configuración
 */
function getNationalistRegionIds(): string[] {
  const regions = regionConfig.regions as Record<string, any>;
  return Object.keys(regions).filter(key => regions[key].nationalist === true);
}

/**
 * Verifica si una región es nacionalista
 */
function isRegionNationalist(regionId: string): boolean {
  const regions = regionConfig.regions as Record<string, any>;
  return regions[regionId]?.nationalist === true;
}

/**
 * Obtiene el mapa de partidos regionales por región desde el JSON de partidos
 */
function buildRegionPartyMap(): Record<string, string[]> {
  const PARTIES = partiesData.parties as Record<string, any>;
  const map: Record<string, string[]> = {};
  
  Object.entries(PARTIES).forEach(([id, party]) => {
    if (party.scope === 'regional' && Array.isArray(party.regions)) {
      party.regions.forEach((region: string) => {
        if (!map[region]) {
          map[region] = [];
        }
        map[region].push(id);
      });
    }
  });
  
  return map;
}

/**
 * Calcula los 3 partidos políticos más afines al perfil del usuario
 */
export function calculateTopParties(
  userProfile: UserProfile,
  matchScores: MatchScore[]
): PartyResult[] {
  const PARTIES = partiesData.parties as Record<string, any>;
  const partyDistances: Array<{party: string, distance: number, data: any}> = [];
  const regionPartyMap = buildRegionPartyMap();

  const bestRegion = matchScores[0].regionId;
  const isNationalistRegion = isRegionNationalist(bestRegion);

  Object.entries(PARTIES).forEach(([id, partyProfile]) => {
    if (partyProfile.scope === 'regional' && !partyProfile.regions.includes(bestRegion)) {
      return;
    }

    const isRegionalMatch = isNationalistRegion && regionPartyMap[bestRegion]?.includes(id);
    const regionalBonus = isRegionalMatch ? 0.85 : 1.0;

    const identityWeightMultiplier = isNationalistRegion ? 15 : 1;

    const partyDiffs = [
      Math.pow(userProfile.politics_leftright - partyProfile.politics_leftright, 2) * WEIGHTS.politics_leftright,
      Math.pow(userProfile.values_authority - partyProfile.values_authority, 2) * WEIGHTS.values_authority,
      Math.pow(userProfile.politics_environment - partyProfile.politics_environment, 2) * WEIGHTS.politics_environment,
      Math.pow(userProfile.politics_equality - partyProfile.politics_equality, 2) * WEIGHTS.politics_equality,
      Math.pow(userProfile.social_immigration - partyProfile.social_immigration, 2) * WEIGHTS.social_immigration,
      Math.pow(userProfile.social_lgbt - partyProfile.social_lgbt, 2) * WEIGHTS.social_lgbt,
      Math.pow(userProfile.identity_spanish - partyProfile.identity_spanish, 2) * WEIGHTS.identity_spanish * identityWeightMultiplier,
      Math.pow(userProfile.identity_regional - partyProfile.identity_regional, 2) * WEIGHTS.identity_regional * identityWeightMultiplier,
    ];

    const partyDist = Math.sqrt(partyDiffs.reduce((sum, val) => sum + val, 0)) * regionalBonus;
    partyDistances.push({ party: id, distance: partyDist, data: partyProfile });
  });

  return partyDistances
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3)
    .map(p => ({
      id: p.party,
      ...p.data,
      similarity: Math.max(0, Math.min(100, 100 - (p.distance / 50) * 100))
    }));
}

/**
 * Obtiene la lista de IDs de regiones nacionalistas desde la configuración.
 */
export function getNationalistRegions(): string[] {
  return getNationalistRegionIds();
}

/**
 * Verifica si una región específica es nacionalista consultando la configuración.
 */
export function isNationalistRegion(regionId: string): boolean {
  return isRegionNationalist(regionId);
}

/**
 * Obtiene los IDs de partidos regionales que participan en una región específica.
 */
export function getRegionalParties(regionId: string): string[] {
  const map = buildRegionPartyMap();
  return map[regionId] || [];
}
