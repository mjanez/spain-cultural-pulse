import 'server-only';

const dictionaries = {
  es: () => import('@/dictionaries/es.json').then((module) => module.default),
  en: () => import('@/dictionaries/en.json').then((module) => module.default),
  eu: () => import('@/dictionaries/eu.json').then((module) => module.default),
  ca: () => import('@/dictionaries/ca.json').then((module) => module.default),
  val: () => import('@/dictionaries/val.json').then((module) => module.default),
  gl: () => import('@/dictionaries/gl.json').then((module) => module.default),
};

export const getDictionary = async (locale: string) => {
  if (locale in dictionaries) {
    return dictionaries[locale as keyof typeof dictionaries]();
  }
  // Fallback a español por defecto
  return dictionaries.es();
};
