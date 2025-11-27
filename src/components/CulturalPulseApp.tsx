'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import html2canvas from 'html2canvas';
import { 
  MapPin, 
  Music, 
  Activity, 
  ChevronRight, 
  RefreshCw, 
  Share2, 
  Trophy,
  Info,
  Users,
  Heart,
  Utensils,
  Plane,
  Shield,
  Globe,
  BookOpen,
  Car,
  Flag,
  Languages,
  Download,
  Link as LinkIcon,
  Github
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import regionalData from '@/data/regional_profiles_complete.json';
import tribesData from '@/data/cultural_tribes.json';

const MapComponent = dynamic(() => import('./MapComponent'), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-slate-800 animate-pulse rounded-xl"></div>
});

// Tipos de perfil completo
type ProfileDimensions = {
  music_rock: number;
  music_pop: number;
  music_reggaeton: number;
  music_classical: number;
  music_traditional: number;
  food_adventurous: number;
  food_social: number;
  mobility_car: number;
  mobility_public: number;
  mobility_active: number;
  politics_leftright: number;
  politics_environment: number;
  politics_equality: number;
  values_care: number;
  values_authority: number;
  values_purity: number;
  social_immigration: number;
  social_lgbt: number;
  social_abortion: number;
  social_feminism: number;
  culture_reading: number;
  culture_sports: number;
  culture_museums: number;
  identity_spanish: number;
  identity_regional: number;
  religiosity: number;
  socioeconomic_education: number;
  socioeconomic_income: number;
};

// --- DATOS DE REFERENCIA (Procesados del CSV NORPOL 2024) ---
const REGIONAL_PROFILES = regionalData.regions as Record<string, ProfileDimensions & { count: number }>;
const NATIONAL_AVG = regionalData.national as ProfileDimensions & { count: number };
const TRIBES = tribesData.tribes as Record<string, ProfileDimensions>;

// Helper para codificar/decodificar respuestas en URL
const encodeAnswers = (answers: Record<string, number>): string => {
  const keys = ['music_rock', 'music_pop', 'music_reggaeton', 'music_classical', 'music_traditional',
    'politics_leftright', 'politics_environment', 'politics_equality', 'values_authority',
    'social_lgbt', 'social_immigration', 'social_abortion', 'culture_reading', 'culture_sports',
    'food_adventurous', 'food_social', 'mobility_public', 'mobility_car', 'identity_spanish',
    'identity_regional', 'religiosity'];
  const values = keys.map(k => answers[k]?.toString() || '');
  return btoa(values.join(',')); // Base64 encode
};

const decodeAnswers = (encoded: string): Record<string, number> => {
  try {
    const keys = ['music_rock', 'music_pop', 'music_reggaeton', 'music_classical', 'music_traditional',
      'politics_leftright', 'politics_environment', 'politics_equality', 'values_authority',
      'social_lgbt', 'social_immigration', 'social_abortion', 'culture_reading', 'culture_sports',
      'food_adventurous', 'food_social', 'mobility_public', 'mobility_car', 'identity_spanish',
      'identity_regional', 'religiosity'];
    const values = atob(encoded).split(',');
    const answers: Record<string, number> = {};
    keys.forEach((key, i) => {
      if (values[i] && values[i] !== '') {
        answers[key] = parseFloat(values[i]);
      }
    });
    return answers;
  } catch {
    return {};
  }
};

export default function CulturalPulseApp({ dict, lang }: { dict: any, lang?: string }) {
  const [view, setView] = useState('home');
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const shareDropdownRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  
  const currentLang = lang || 'es';
  
  // Restore state from URL or sessionStorage on mount
  useEffect(() => {
    // Primero intentar cargar desde URL
    const urlParams = new URLSearchParams(window.location.search);
    const encodedAnswers = urlParams.get('a');
    
    if (encodedAnswers) {
      const decodedAnswers = decodeAnswers(encodedAnswers);
      if (Object.keys(decodedAnswers).length > 0) {
        setAnswers(decodedAnswers);
        setView('results');
        return;
      }
    }
    
    // Si no hay URL, cargar desde sessionStorage
    const savedView = sessionStorage.getItem('quizView');
    const savedAnswers = sessionStorage.getItem('quizAnswers');
    const savedQuestionIndex = sessionStorage.getItem('quizQuestionIndex');
    
    if (savedView) setView(savedView);
    if (savedAnswers) setAnswers(JSON.parse(savedAnswers));
    if (savedQuestionIndex) setCurrentQuestionIndex(parseInt(savedQuestionIndex));
  }, []);

  // Save state to sessionStorage whenever it changes
  useEffect(() => {
    if (view !== 'home') {
      sessionStorage.setItem('quizView', view);
      sessionStorage.setItem('quizAnswers', JSON.stringify(answers));
      sessionStorage.setItem('quizQuestionIndex', currentQuestionIndex.toString());
    }
  }, [view, answers, currentQuestionIndex]);
  
  const switchLanguage = (newLang: string) => {
    const currentPath = window.location.pathname;
    const basePath = process.env.PAGES_BASE_PATH || '';
    
    // Remover basePath si existe para procesar solo la ruta relativa
    const relativePath = basePath ? currentPath.replace(basePath, '') : currentPath;
    
    // Eliminar el segmento de idioma actual
    const pathWithoutLang = relativePath.replace(/^\/(es|en|eu|ca|val|gl)(\/.*)?$/, '$2') || '/';
    
    // Reconstruir la ruta completa con basePath + nuevo idioma + ruta sin idioma
    const newPath = `${basePath}/${newLang}${pathWithoutLang === '/' ? '' : pathWithoutLang}`;
    window.location.href = newPath + window.location.search;
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
      }
      if (shareDropdownRef.current && !shareDropdownRef.current.contains(event.target as Node)) {
        setShareMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Funciones para compartir
  const generateShareUrl = () => {
    const encoded = encodeAnswers(answers);
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?a=${encoded}`;
  };

  const copyLinkToClipboard = async () => {
    try {
      const shareUrl = generateShareUrl();
      await navigator.clipboard.writeText(shareUrl);
      alert(dict.results.link_copied);
      setShareMenuOpen(false);
    } catch (err) {
      alert(dict.results.share_failed);
    }
  };

  const downloadResultsImage = async () => {
    if (!resultsRef.current) return;
    
    try {
      const canvas = await html2canvas(resultsRef.current, {
        backgroundColor: '#020617',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        foreignObjectRendering: true,
        scrollY: -window.scrollY,
        scrollX: -window.scrollX,
        windowWidth: resultsRef.current.scrollWidth,
        windowHeight: resultsRef.current.scrollHeight
      });
      
      const link = document.createElement('a');
      link.download = `cultural-pulse-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      alert(dict.results.image_downloaded);
      setShareMenuOpen(false);
    } catch (err) {
      console.error('Error generating image:', err);
      alert(dict.results.share_failed);
    }
  };

  // Language Selector Component
  const LanguageSelector = () => (
    <div className="absolute top-6 right-6 z-50" ref={dropdownRef}>
      <button
        onClick={() => setLangDropdownOpen(!langDropdownOpen)}
        className="flex items-center gap-2 md:gap-3 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-md rounded-xl px-3 py-2 md:px-4 md:py-2.5 border border-slate-600/50 shadow-xl hover:shadow-pink-500/20 transition-all duration-300 hover:scale-105 cursor-pointer"
        aria-label={dict.language?.select || 'Language'}
      >
        <Languages className="w-3 h-3 md:w-4 md:h-4 text-pink-400" />
        <div className="flex items-center gap-2">
          {currentLang === 'val' ? (
            <div className="w-4 h-4 overflow-hidden rounded-sm flex-shrink-0">
              <Image 
                src="/flags/val.png" 
                alt="Valencian flag" 
                width={16} 
                height={16} 
              />
            </div>
          ) : (
            <span className={`fi fi-${
              currentLang === 'es' ? 'es' : 
              currentLang === 'en' ? 'gb' : 
              currentLang === 'eu' ? 'es-pv' : 
              currentLang === 'ca' ? 'es-ct' : 
              currentLang === 'gl' ? 'es-ga' : 'es'
            } fis`}></span>
          )}
          <span className="text-xs md:text-sm font-semibold text-white">
            {currentLang.toUpperCase()}
          </span>
        </div>
        <ChevronRight className={`w-2.5 h-2.5 md:w-3 md:h-3 text-pink-400 transition-transform duration-200 ${langDropdownOpen ? 'rotate-90' : ''}`} />
      </button>
      
      {langDropdownOpen && (
        <div className="absolute top-full right-0 mt-2 w-40 md:w-44 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-600/50 shadow-2xl overflow-hidden backdrop-blur-md">
          <button
            onClick={() => {
              switchLanguage('es');
              setLangDropdownOpen(false);
            }}
            className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-all duration-200 ${
              currentLang === 'es' 
                ? 'bg-pink-500/20 text-pink-300 font-semibold' 
                : 'text-white hover:bg-slate-700/50 hover:text-pink-300'
            }`}
          >
            <span className="fi fi-es fis"></span>
            <span className="text-sm">{dict.language?.es || 'Español'}</span>
          </button>
          <button
            onClick={() => {
              switchLanguage('en');
              setLangDropdownOpen(false);
            }}
            className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-all duration-200 ${
              currentLang === 'en' 
                ? 'bg-pink-500/20 text-pink-300 font-semibold' 
                : 'text-white hover:bg-slate-700/50 hover:text-pink-300'
            }`}
          >
            <span className="fi fi-gb fis"></span>
            <span className="text-sm">{dict.language?.en || 'English'}</span>
          </button>
          <button
            onClick={() => {
              switchLanguage('eu');
              setLangDropdownOpen(false);
            }}
            className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-all duration-200 ${
              currentLang === 'eu' 
                ? 'bg-pink-500/20 text-pink-300 font-semibold' 
                : 'text-white hover:bg-slate-700/50 hover:text-pink-300'
            }`}
          >
            <span className="fi fi-es-pv fis"></span>
            <span className="text-sm">{dict.language?.eu || 'Euskara'}</span>
          </button>
          <button
            onClick={() => {
              switchLanguage('ca');
              setLangDropdownOpen(false);
            }}
            className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-all duration-200 ${
              currentLang === 'ca' 
                ? 'bg-pink-500/20 text-pink-300 font-semibold' 
                : 'text-white hover:bg-slate-700/50 hover:text-pink-300'
            }`}
          >
            <span className="fi fi-es-ct fis"></span>
            <span className="text-sm">{dict.language?.ca || 'Català'}</span>
          </button>
          <button
            onClick={() => {
              switchLanguage('val');
              setLangDropdownOpen(false);
            }}
            className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-all duration-200 ${
              currentLang === 'val' 
                ? 'bg-pink-500/20 text-pink-300 font-semibold' 
                : 'text-white hover:bg-slate-700/50 hover:text-pink-300'
            }`}
          >
            <div className="w-4 h-4 overflow-hidden rounded-sm flex-shrink-0">
              <Image 
                src="/flags/val.png" 
                alt="Valencian flag" 
                width={21} 
                height={16} 
                className="object-cover object-left" 
                style={{marginLeft: 0}}
              />
            </div>
            <span className="text-sm">Valencià</span>
          </button>
          <button
            onClick={() => {
              switchLanguage('gl');
              setLangDropdownOpen(false);
            }}
            className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-all duration-200 ${
              currentLang === 'gl' 
                ? 'bg-pink-500/20 text-pink-300 font-semibold' 
                : 'text-white hover:bg-slate-700/50 hover:text-pink-300'
            }`}
          >
            <span className="fi fi-es-ga fis"></span>
            <span className="text-sm">{dict.language?.gl || 'Galego'}</span>
          </button>
        </div>
      )}
    </div>
  );

  const QUIZ_QUESTIONS = useMemo(() => [
    {
      id: 'music_rock',
      category: dict.quiz.categories.culture,
      text: dict.quiz.questions.music_rock || '¿Cuánto te gusta el rock?',
      icon: <Music className="w-6 h-6 text-purple-500" />,
      min: 0, max: 10, step: 1,
      labels: {0: dict.quiz.labels.nothing || 'Nada', 10: dict.quiz.labels.much || 'Mucho'} as Record<number, string>
    },
    {
      id: 'music_pop',
      category: dict.quiz.categories.culture,
      text: dict.quiz.questions.music_pop || '¿Cuánto te gusta el pop?',
      icon: <Music className="w-6 h-6 text-pink-500" />,
      min: 0, max: 10, step: 1,
      labels: {0: dict.quiz.labels.nothing || 'Nada', 10: dict.quiz.labels.much || 'Mucho'} as Record<number, string>
    },
    {
      id: 'music_reggaeton',
      category: dict.quiz.categories.culture,
      text: dict.quiz.questions.music_reggaeton || '¿Cuánto te gusta el reggaeton?',
      icon: <Music className="w-6 h-6 text-yellow-500" />,
      min: 0, max: 10, step: 1,
      labels: {0: dict.quiz.labels.nothing || 'Nada', 10: dict.quiz.labels.much || 'Mucho'} as Record<number, string>
    },
    {
      id: 'music_classical',
      category: dict.quiz.categories.culture,
      text: dict.quiz.questions.music_classical || '¿Cuánto te gusta la música clásica?',
      icon: <Music className="w-6 h-6 text-indigo-500" />,
      min: 0, max: 10, step: 1,
      labels: {0: dict.quiz.labels.nothing || 'Nada', 10: dict.quiz.labels.much || 'Mucho'} as Record<number, string>
    },
    {
      id: 'music_traditional',
      category: dict.quiz.categories.lifestyle,
      text: dict.quiz.questions.traditional || '¿Cuánto te gusta la música tradicional (flamenco, folk)?',
      icon: <Heart className="w-6 h-6 text-red-500" />,
      min: 0, max: 10, step: 1,
      labels: {0: dict.quiz.labels.nothing || 'Nada', 10: dict.quiz.labels.much || 'Mucho'} as Record<number, string>
    },
    // Política y Valores
    {
      id: 'politics_leftright',
      category: dict.quiz.categories.values,
      text: dict.quiz.questions.politics || 'Políticamente, ¿te consideras de izquierdas o derechas?',
      icon: <Users className="w-6 h-6 text-blue-500" />,
      min: 0, max: 10, step: 1,
      labels: {0: dict.quiz.labels.left || 'Izquierda', 10: dict.quiz.labels.right || 'Derecha'} as Record<number, string>
    },
    {
      id: 'politics_environment',
      category: dict.quiz.categories.values,
      text: dict.quiz.questions.politics_environment,
      icon: <Heart className="w-6 h-6 text-green-500" />,
      min: 0, max: 10, step: 1,
      labels: {0: dict.quiz.labels.nothing, 10: dict.quiz.labels.very_important} as Record<number, string>
    },
    {
      id: 'politics_equality',
      category: dict.quiz.categories.values,
      text: dict.quiz.questions.politics_equality,
      icon: <Users className="w-6 h-6 text-cyan-500" />,
      min: 0, max: 10, step: 1,
      labels: {0: dict.quiz.labels.nothing, 10: dict.quiz.labels.totally} as Record<number, string>
    },
    {
      id: 'values_authority',
      category: dict.quiz.categories.values,
      text: dict.quiz.questions.values_authority,
      icon: <Shield className="w-6 h-6 text-slate-500" />,
      min: 0, max: 10, step: 1,
      labels: {0: dict.quiz.labels.individual_freedom, 10: dict.quiz.labels.strong_authority} as Record<number, string>
    },
    // Temas Sociales
    {
      id: 'social_lgbt',
      category: dict.quiz.categories.values,
      text: dict.quiz.questions.social_lgbt,
      icon: <Heart className="w-6 h-6 text-pink-500" />,
      min: 0, max: 10, step: 1,
      labels: {0: dict.quiz.labels.nothing, 10: dict.quiz.labels.totally} as Record<number, string>
    },
    {
      id: 'social_immigration',
      category: dict.quiz.categories.values,
      text: dict.quiz.questions.social_immigration,
      icon: <Globe className="w-6 h-6 text-blue-500" />,
      min: 0, max: 10, step: 1,
      labels: {0: dict.quiz.labels.restrictive, 10: dict.quiz.labels.open} as Record<number, string>
    },
    {
      id: 'social_abortion',
      category: dict.quiz.categories.values,
      text: dict.quiz.questions.social_abortion,
      icon: <Users className="w-6 h-6 text-purple-500" />,
      min: 0, max: 10, step: 1,
      labels: {0: dict.quiz.labels.no, 10: dict.quiz.labels.yes_totally} as Record<number, string>
    },
    // Cultura
    {
      id: 'culture_reading',
      category: dict.quiz.categories.culture,
      text: dict.quiz.questions.culture_reading,
      icon: <BookOpen className="w-6 h-6 text-amber-500" />,
      min: 0, max: 10, step: 1,
      labels: {0: dict.quiz.labels.never, 10: dict.quiz.labels.very_often} as Record<number, string>
    },
    {
      id: 'culture_sports',
      category: dict.quiz.categories.lifestyle,
      text: dict.quiz.questions.culture_sports,
      icon: <Activity className="w-6 h-6 text-red-500" />,
      min: 0, max: 10, step: 1,
      labels: {0: dict.quiz.labels.no_importance, 10: dict.quiz.labels.very_important} as Record<number, string>
    },
    // Gastronomía
    {
      id: 'food_adventurous',
      category: dict.quiz.categories.lifestyle,
      text: dict.quiz.questions.food_adventurous,
      icon: <Utensils className="w-6 h-6 text-orange-500" />,
      min: 0, max: 10, step: 1,
      labels: {0: dict.quiz.labels.selective, 10: dict.quiz.labels.everything} as Record<number, string>
    },
    {
      id: 'food_social',
      category: dict.quiz.categories.lifestyle,
      text: dict.quiz.questions.food_social,
      icon: <Utensils className="w-6 h-6 text-yellow-500" />,
      min: 0, max: 10, step: 1,
      labels: {0: dict.quiz.labels.almost_never, 10: dict.quiz.labels.very_often} as Record<number, string>
    },
    // Movilidad
    {
      id: 'mobility_public',
      category: dict.quiz.categories.lifestyle,
      text: dict.quiz.questions.mobility_public,
      icon: <Plane className="w-6 h-6 text-sky-500" />,
      min: 0, max: 10, step: 1,
      labels: {0: dict.quiz.labels.never, 10: dict.quiz.labels.constantly} as Record<number, string>
    },
    {
      id: 'mobility_car',
      category: dict.quiz.categories.lifestyle,
      text: dict.quiz.questions.mobility_car,
      icon: <Car className="w-6 h-6 text-slate-500" />,
      min: 0, max: 10, step: 1,
      labels: {0: dict.quiz.labels.never, 10: dict.quiz.labels.always} as Record<number, string>
    },
    // Identidad
    {
      id: 'identity_spanish',
      category: dict.quiz.categories.identity || 'Identidad',
      text: dict.quiz.questions.identity_spanish,
      icon: <Flag className="w-6 h-6 text-red-500" />,
      min: 0, max: 10, step: 1,
      labels: {0: dict.quiz.labels.not_at_all, 10: dict.quiz.labels.very_spanish} as Record<number, string>
    },
    {
      id: 'identity_regional',
      category: dict.quiz.categories.identity || 'Identidad',
      text: dict.quiz.questions.identity_regional,
      icon: <MapPin className="w-6 h-6 text-blue-500" />,
      min: 0, max: 10, step: 1,
      labels: {0: dict.quiz.labels.spain_first, 10: dict.quiz.labels.region_first} as Record<number, string>
    },
    // Religiosidad
    {
      id: 'religiosity',
      category: dict.quiz.categories.values,
      text: dict.quiz.questions.religiosity,
      icon: <Heart className="w-6 h-6 text-purple-500" />,
      min: 0, max: 10, step: 1,
      labels: {0: dict.quiz.labels.no_importance, 10: dict.quiz.labels.very_important} as Record<number, string>
    }
  ], [dict]);

  const handleAnswer = (value: number) => {
    const currentQ = QUIZ_QUESTIONS[currentQuestionIndex];
    setAnswers(prev => ({ ...prev, [currentQ.id]: value }));
    
    // Auto-advance to next question after a short delay
    setTimeout(() => {
      if (currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        setView('calculating');
        setTimeout(() => setView('results'), 1500);
      }
    }, 400); // 400ms delay for smooth UX
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setView('calculating');
      setTimeout(() => setView('results'), 2000);
    }
  };

  const results = useMemo(() => {
    if (view !== 'results') return null;

    // Crear perfil completo del usuario con valores respondidos + defaults
    const userProfile: ProfileDimensions = {
      music_rock: answers.music_rock ?? NATIONAL_AVG.music_rock,
      music_pop: answers.music_pop ?? NATIONAL_AVG.music_pop,
      music_reggaeton: answers.music_reggaeton ?? NATIONAL_AVG.music_reggaeton,
      music_classical: answers.music_classical ?? NATIONAL_AVG.music_classical,
      music_traditional: answers.music_traditional ?? NATIONAL_AVG.music_traditional,
      food_adventurous: answers.food_adventurous ?? NATIONAL_AVG.food_adventurous,
      food_social: answers.food_social ?? NATIONAL_AVG.food_social,
      mobility_car: answers.mobility_car ?? NATIONAL_AVG.mobility_car,
      mobility_public: answers.mobility_public ?? NATIONAL_AVG.mobility_public,
      mobility_active: NATIONAL_AVG.mobility_active,
      politics_leftright: answers.politics_leftright ?? NATIONAL_AVG.politics_leftright,
      politics_environment: answers.politics_environment ?? NATIONAL_AVG.politics_environment,
      politics_equality: answers.politics_equality ?? NATIONAL_AVG.politics_equality,
      values_care: NATIONAL_AVG.values_care,
      values_authority: answers.values_authority ?? NATIONAL_AVG.values_authority,
      values_purity: NATIONAL_AVG.values_purity,
      social_immigration: answers.social_immigration ?? NATIONAL_AVG.social_immigration,
      social_lgbt: answers.social_lgbt ?? NATIONAL_AVG.social_lgbt,
      social_abortion: answers.social_abortion ?? NATIONAL_AVG.social_abortion,
      social_feminism: NATIONAL_AVG.social_feminism,
      culture_reading: answers.culture_reading ?? NATIONAL_AVG.culture_reading,
      culture_sports: answers.culture_sports ?? NATIONAL_AVG.culture_sports,
      culture_museums: NATIONAL_AVG.culture_museums,
      identity_spanish: answers.identity_spanish ?? NATIONAL_AVG.identity_spanish,
      identity_regional: answers.identity_regional ?? NATIONAL_AVG.identity_regional,
      religiosity: answers.religiosity ?? NATIONAL_AVG.religiosity,
      socioeconomic_education: NATIONAL_AVG.socioeconomic_education,
      socioeconomic_income: NATIONAL_AVG.socioeconomic_income,
    };

    // Calcular distancia ponderada normalizada con TODAS las dimensiones
    let bestMatch = { region: '', score: Infinity };
    const matchScores = Object.entries(REGIONAL_PROFILES).map(([region, profile]) => {
      // Pesos por categoría (amplificados para mayor diferenciación regional)
      const weights = {
        music: 1.0,  // Música menor peso (menos variación regional)
        politics: 4.0,  // Valores políticos MUY importantes (alta variación)
        food: 0.8,  // Estilo de vida menor
        mobility: 1.2,  // Movilidad moderada (urbano vs rural)
        values: 3.5,  // Valores morales MUY importantes
        social: 3.0,  // Temas sociales muy importantes (alta variación)
        culture: 1.5,  // Cultura moderada
        identity: 2.5,  // Identidad importante (variación regional)
        religion: 2.0,  // Religiosidad importante
        socioeco: 0.3  // Socioeconómico muy bajo peso
      };

      // Calcular diferencias absolutas normalizadas (0-1) y ponderadas
      const weightedDiffs = [
        // Música (5 dimensiones)
        Math.abs(userProfile.music_rock - profile.music_rock) / 10 * weights.music,
        Math.abs(userProfile.music_pop - profile.music_pop) / 10 * weights.music,
        Math.abs(userProfile.music_reggaeton - profile.music_reggaeton) / 10 * weights.music,
        Math.abs(userProfile.music_classical - profile.music_classical) / 10 * weights.music,
        Math.abs(userProfile.music_traditional - profile.music_traditional) / 10 * weights.music,
        // Política (3 dimensiones)
        Math.abs(userProfile.politics_leftright - profile.politics_leftright) / 10 * weights.politics,
        Math.abs(userProfile.politics_environment - profile.politics_environment) / 10 * weights.politics,
        Math.abs(userProfile.politics_equality - profile.politics_equality) / 10 * weights.politics,
        // Valores (3 dimensiones)
        Math.abs(userProfile.values_care - profile.values_care) / 10 * weights.values,
        Math.abs(userProfile.values_authority - profile.values_authority) / 10 * weights.values,
        Math.abs(userProfile.values_purity - profile.values_purity) / 10 * weights.values,
        // Social (4 dimensiones)
        Math.abs(userProfile.social_immigration - profile.social_immigration) / 10 * weights.social,
        Math.abs(userProfile.social_lgbt - profile.social_lgbt) / 10 * weights.social,
        Math.abs(userProfile.social_abortion - profile.social_abortion) / 10 * weights.social,
        Math.abs(userProfile.social_feminism - profile.social_feminism) / 10 * weights.social,
        // Cultura (3 dimensiones)
        Math.abs(userProfile.culture_reading - profile.culture_reading) / 10 * weights.culture,
        Math.abs(userProfile.culture_sports - profile.culture_sports) / 10 * weights.culture,
        Math.abs(userProfile.culture_museums - profile.culture_museums) / 10 * weights.culture,
        // Identidad (2 dimensiones)
        Math.abs(userProfile.identity_spanish - profile.identity_spanish) / 10 * weights.identity,
        Math.abs(userProfile.identity_regional - profile.identity_regional) / 10 * weights.identity,
        // Otros
        Math.abs(userProfile.religiosity - profile.religiosity) / 10 * weights.religion,
        Math.abs(userProfile.food_adventurous - profile.food_adventurous) / 10 * weights.food,
        Math.abs(userProfile.food_social - profile.food_social) / 10 * weights.food,
        Math.abs(userProfile.mobility_car - profile.mobility_car) / 10 * weights.mobility,
        Math.abs(userProfile.mobility_public - profile.mobility_public) / 10 * weights.mobility,
        Math.abs(userProfile.mobility_active - profile.mobility_active) / 10 * weights.mobility,
        Math.abs(userProfile.socioeconomic_education - profile.socioeconomic_education) / 10 * weights.socioeco,
        Math.abs(userProfile.socioeconomic_income - profile.socioeconomic_income) / 10 * weights.socioeco,
      ];

      const diff = weightedDiffs.reduce((sum, val) => sum + val, 0);

      if (diff < bestMatch.score) {
        bestMatch = { region, score: diff };
      }
      return { region, diff };
    }).sort((a, b) => a.diff - b.diff);

    // Calcular maxDistance dinámico basado en datos reales
    // Usamos el percentil 90 para tener mejor rango dinámico
    const sortedDiffs = matchScores.map(m => m.diff).sort((a, b) => a - b);
    const p90Index = Math.floor(sortedDiffs.length * 0.9);
    const dynamicMaxDistance = sortedDiffs[p90Index] || 20;
    
    // Debug: Log top 5 matches con distancia dinámica
    console.log('Top 5 regional matches:', matchScores.slice(0, 5).map(m => ({
      region: m.region,
      diff: m.diff.toFixed(2),
      match: `${Math.max(0, 100 * (1 - m.diff / dynamicMaxDistance)).toFixed(1)}%`
    })));
    console.log('Dynamic maxDistance:', dynamicMaxDistance.toFixed(2));

    // Clasificación de tribu basada en distancia a arquetipos (15 dimensiones críticas)
    let tribeId = 'middle_class_moderate';
    let minTribeDistance = Infinity;

    Object.entries(TRIBES).forEach(([id, tribeProfile]) => {
      const tribeDiffs = [
        // Dimensiones políticas (peso x3)
        Math.pow(userProfile.politics_leftright - tribeProfile.politics_leftright, 2) * 3,
        Math.pow(userProfile.politics_equality - tribeProfile.politics_equality, 2) * 3,
        Math.pow(userProfile.politics_environment - tribeProfile.politics_environment, 2) * 2,
        // Valores morales (peso x3)
        Math.pow(userProfile.values_authority - tribeProfile.values_authority, 2) * 3,
        Math.pow(userProfile.values_purity - tribeProfile.values_purity, 2) * 2,
        Math.pow(userProfile.values_care - tribeProfile.values_care, 2) * 2,
        // Temas sociales (peso x2.5)
        Math.pow(userProfile.social_lgbt - tribeProfile.social_lgbt, 2) * 2.5,
        Math.pow(userProfile.social_abortion - tribeProfile.social_abortion, 2) * 2.5,
        Math.pow(userProfile.social_immigration - tribeProfile.social_immigration, 2) * 2,
        // Identidad y religión (peso x2)
        Math.pow(userProfile.identity_spanish - tribeProfile.identity_spanish, 2) * 2,
        Math.pow(userProfile.religiosity - tribeProfile.religiosity, 2) * 2,
        // Cultura y estilo de vida (peso x1)
        Math.pow(userProfile.music_traditional - tribeProfile.music_traditional, 2),
        Math.pow(userProfile.culture_reading - tribeProfile.culture_reading, 2),
        Math.pow(userProfile.mobility_car - tribeProfile.mobility_car, 2),
        Math.pow(userProfile.food_adventurous - tribeProfile.food_adventurous, 2),
      ];
      
      const tribeDist = Math.sqrt(tribeDiffs.reduce((sum, val) => sum + val, 0));
      
      if (tribeDist < minTribeDistance) {
        minTribeDistance = tribeDist;
        tribeId = id;
      }
    });

    // Obtener nombre y descripción traducidos
    const tribeName = dict.tribes?.[tribeId]?.name || tribeId;
    const tribeDescription = dict.tribes?.[tribeId]?.description || '';

    return {
      userProfile,
      bestMatch: matchScores[0].region,
      matchScores,
      tribeId,
      tribeName,
      tribeDescription,
      dynamicMaxDistance
    };
  }, [view, answers, dict]);

  if (view === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white flex flex-col items-center justify-center p-6 font-sans">
        <LanguageSelector />
        
        {/* GitHub Link - Top Left */}
        <a 
          href={process.env.GITHUB_REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-6 left-6 z-50 group bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-md rounded-xl px-3 py-2 md:px-4 md:py-2.5 border border-slate-600/50 shadow-xl hover:shadow-pink-500/20 transition-all duration-300 hover:scale-105"
          aria-label={dict.home.github_link}
        >
          <div className="flex items-center gap-2 md:gap-3">
            <Github className="w-3 h-3 md:w-4 md:h-4 text-pink-400 flex-shrink-0" />
            <span className="text-xs md:text-sm font-semibold text-white whitespace-nowrap max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out">
              {dict.home.github_link}
            </span>
          </div>
        </a>
        
        <div className="max-w-md w-full text-center space-y-6">
          <div className="animate-bounce bg-white/10 p-4 rounded-full inline-block backdrop-blur-sm">
            <Activity className="w-16 h-16 text-pink-400" />
          </div>
          <h1 className="text-5xl font-bold tracking-tight">{dict.home.title} <span className="text-pink-400">{dict.home.title_highlight}</span>
          </h1>
          <p className="text-lg text-gray-200 font-light">
            {dict.home.subtitle}
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-300 my-8">
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <Music className="w-6 h-6 mx-auto mb-2 text-cyan-400" />
              <span>{dict.home.music_tastes}</span>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <Users className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
              <span>{dict.home.social_values}</span>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <Utensils className="w-6 h-6 mx-auto mb-2 text-orange-400" />
              <span>{dict.home.gastronomy}</span>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <BookOpen className="w-6 h-6 mx-auto mb-2 text-amber-400" />
              <span>{dict.home.culture}</span>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <Flag className="w-6 h-6 mx-auto mb-2 text-red-400" />
              <span>{dict.home.identity}</span>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <Shield className="w-6 h-6 mx-auto mb-2 text-slate-400" />
              <span>{dict.home.politics}</span>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <Car className="w-6 h-6 mx-auto mb-2 text-sky-400" />
              <span>{dict.home.mobility}</span>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <Heart className="w-6 h-6 mx-auto mb-2 text-pink-400" />
              <span>{dict.home.religion}</span>
            </div>
          </div>

          <button 
            onClick={() => setView('quiz')}
            className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl text-xl font-bold shadow-lg shadow-purple-900/50 hover:scale-105 transition-transform flex items-center justify-center gap-2"
          >
            {dict.home.start_button} <ChevronRight />
          </button>
          <p className="text-xs text-white/40 mt-4 flex items-center justify-center gap-2">
            <Globe className="w-4 h-4" />
            {dict.home.footer.text}{' '}
            <a 
                href={dict.home.footer.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold hover:text-white/60 inline-flex items-center gap-1"
            >
                {dict.home.footer.linkText}
                <ChevronRight className="w-3 h-3" />
            </a>
          </p>

          {/* Attribution Section */}
          <div className="flex justify-center mt-4">
            <a 
              href="https://creativecommons.org/licenses/by/4.0/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="opacity-60 hover:opacity-100 transition-opacity"
              title={dict.home.cc_license_title}
            >
              <img 
                src="https://mirrors.creativecommons.org/presskit/buttons/88x31/svg/by.svg" 
                alt={dict.home.cc_license_alt}
                className="h-8"
              />
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'quiz') {
    const q = QUIZ_QUESTIONS[currentQuestionIndex];
    const progress = ((currentQuestionIndex) / QUIZ_QUESTIONS.length) * 100;

    return (
      <div className="min-h-screen bg-slate-900 text-white p-6 flex flex-col items-center justify-center">
        <LanguageSelector />
        
        {/* Back to Home Button */}
        <button 
          onClick={() => {
            sessionStorage.clear();
            setView('home');
            setAnswers({});
            setCurrentQuestionIndex(0);
          }}
          className="absolute top-6 left-6 text-gray-400 hover:text-white flex items-center gap-2 transition-colors"
          aria-label={dict.quiz.back_home}
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          <span className="text-sm font-medium">{dict.quiz.back_home}</span>
        </button>
        
        <div className="w-full max-w-lg">
          <div className="w-full bg-gray-700 h-2 rounded-full mb-8">
            {/* eslint-disable-next-line */}
            <div 
              className="bg-pink-500 h-2 rounded-full transition-all duration-500 w-[var(--width)]" 
              style={{ '--width': `${progress}%` } as React.CSSProperties}
            ></div>
          </div>

          <div className="bg-slate-800 border border-slate-700 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              {q.icon}
            </div>
            
            <span className="text-pink-400 text-sm font-bold tracking-wider uppercase mb-2 block">
              {q.category}
            </span>
            
            <h2 className="text-2xl font-bold mb-8 leading-relaxed">
              {q.text}
            </h2>

            <div className="space-y-6">
              <div className="flex justify-between text-sm text-gray-400 px-1">
                <span>{q.labels?.[q.min] || 'Nada'}</span>
                <span>{q.labels?.[q.max] || 'Mucho'}</span>
              </div>
              
              <input 
                type="range" 
                min={q.min} 
                max={q.max} 
                step={q.step}
                title={q.text}
                className="w-full h-4 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-pink-500 hover:accent-pink-400"
                onChange={(e) => handleAnswer(parseFloat(e.target.value))}
              />
              
              <div className="text-center text-3xl font-bold text-white/90">
                {answers[q.id] ?? "?"}
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-xs text-gray-400">
                {dict.quiz.question_progress || `Pregunta ${currentQuestionIndex + 1} de ${QUIZ_QUESTIONS.length}`}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'calculating') {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <RefreshCw className="w-16 h-16 animate-spin text-pink-500 mb-4" />
        <h2 className="text-2xl font-bold animate-pulse">{dict.quiz.calculating}</h2>
        <p className="text-gray-400 mt-2">{dict.quiz.comparing}</p>
      </div>
    );
  }

  if (view === 'results' && results) {
    // Agregar dimensiones por bloques para visualización más clara
    const radarData = [
      { 
        subject: dict.results.radar.music, 
        A: parseFloat(((results.userProfile.music_rock + results.userProfile.music_pop + results.userProfile.music_reggaeton + results.userProfile.music_classical + results.userProfile.music_traditional) / 5).toFixed(2)), 
        B: parseFloat(((NATIONAL_AVG.music_rock + NATIONAL_AVG.music_pop + NATIONAL_AVG.music_reggaeton + NATIONAL_AVG.music_classical + NATIONAL_AVG.music_traditional) / 5).toFixed(2)), 
        fullMark: 10 
      },
      { 
        subject: dict.results.radar.politics, 
        A: parseFloat(results.userProfile.politics_leftright.toFixed(2)), 
        B: parseFloat(NATIONAL_AVG.politics_leftright.toFixed(2)), 
        fullMark: 10 
      },
      { 
        subject: dict.results.radar.social_values, 
        A: parseFloat(((results.userProfile.social_lgbt + results.userProfile.social_immigration + results.userProfile.social_abortion + results.userProfile.social_feminism) / 4).toFixed(2)), 
        B: parseFloat(((NATIONAL_AVG.social_lgbt + NATIONAL_AVG.social_immigration + NATIONAL_AVG.social_abortion + NATIONAL_AVG.social_feminism) / 4).toFixed(2)), 
        fullMark: 10 
      },
      { 
        subject: dict.results.radar.identity, 
        A: parseFloat(((results.userProfile.identity_spanish + results.userProfile.identity_regional) / 2).toFixed(2)), 
        B: parseFloat(((NATIONAL_AVG.identity_spanish + NATIONAL_AVG.identity_regional) / 2).toFixed(2)), 
        fullMark: 10 
      },
      { 
        subject: dict.results.radar.culture, 
        A: parseFloat(((results.userProfile.culture_reading + results.userProfile.culture_sports + results.userProfile.culture_museums) / 3).toFixed(2)), 
        B: parseFloat(((NATIONAL_AVG.culture_reading + NATIONAL_AVG.culture_sports + NATIONAL_AVG.culture_museums) / 3).toFixed(2)), 
        fullMark: 10 
      },
      { 
        subject: dict.results.radar.mobility, 
        A: parseFloat(((results.userProfile.mobility_public + results.userProfile.mobility_car + results.userProfile.mobility_active) / 3).toFixed(2)), 
        B: parseFloat(((NATIONAL_AVG.mobility_public + NATIONAL_AVG.mobility_car + NATIONAL_AVG.mobility_active) / 3).toFixed(2)), 
        fullMark: 10 
      },
      { 
        subject: dict.results.radar.gastronomy, 
        A: parseFloat(results.userProfile.food_adventurous.toFixed(2)), 
        B: parseFloat(NATIONAL_AVG.food_adventurous.toFixed(2)), 
        fullMark: 10 
      },
    ];
    
    // Calcular posición en el cuadrante político
    const politicalX = results.userProfile.politics_leftright; // 0=izq, 10=der
    const politicalY = results.userProfile.values_authority; // 0=libertario, 10=autoritario

    return (
      <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 font-sans">
        <LanguageSelector />
        
        <div className="max-w-4xl mx-auto space-y-6">
          
          <div className="flex justify-between items-center mb-8">
            <button onClick={() => {
              sessionStorage.clear();
              window.location.reload();
            }} className="text-gray-400 hover:text-white flex items-center gap-2">
              <RefreshCw size={18} /> {dict.results.restart}
            </button>
            
            {/* GitHub Link - centered */}
            <a 
              href={process.env.GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
              aria-label={dict.home.github_link}
            >
              <Github className="w-4 h-4" />
              <span>{dict.home.github_link}</span>
            </a>
            
            {/* Share Menu */}
            <div className="relative" ref={shareDropdownRef}>
              <button 
                onClick={() => setShareMenuOpen(!shareMenuOpen)}
                className="text-pink-400 hover:text-pink-300 flex items-center gap-2 font-bold"
              >
                <Share2 size={18} /> {dict.results.share}
              </button>
              
              {shareMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-600/50 shadow-2xl overflow-hidden backdrop-blur-md z-50">
                  <button
                    onClick={copyLinkToClipboard}
                    className="w-full px-4 py-3 text-left flex items-center gap-3 text-white hover:bg-slate-700/50 hover:text-pink-300 transition-all duration-200"
                  >
                    <LinkIcon className="w-4 h-4" />
                    <span className="text-sm">{dict.results.copy_link}</span>
                  </button>
                  <button
                    onClick={downloadResultsImage}
                    className="w-full px-4 py-3 text-left flex items-center gap-3 text-white hover:bg-slate-700/50 hover:text-pink-300 transition-all duration-200"
                  >
                    <Download className="w-4 h-4" />
                    <span className="text-sm">{dict.results.download_image}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Contenedor con ref para captura de imagen */}
          <div ref={resultsRef}>
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-3xl p-8 text-center shadow-2xl shadow-indigo-900/50 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
              <Trophy className="w-12 h-12 mx-auto text-yellow-300 mb-4" />
              <h2 className="text-lg uppercase tracking-widest opacity-80 mb-2">{dict.results.your_tribe}</h2>
              <h1 className="text-4xl md:text-6xl font-black mb-4 text-white drop-shadow-lg">
                {results.tribeName}
              </h1>
              <p className="text-indigo-100 max-w-lg mx-auto">
                {results.tribeDescription}
              </p>
            </div>

          <div className="grid md:grid-cols-2 gap-6 my-6">
            
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <MapPin className="text-pink-500" />
                <h3 className="text-xl font-bold">{dict.results.cultural_home}</h3>
              </div>
              
              <div className="h-64 w-full rounded-xl overflow-hidden mb-6 relative bg-slate-800/50" style={{isolation: 'isolate'}}>
                 <MapComponent scores={results.matchScores} maxDistance={results.dynamicMaxDistance} />
              </div>
              
              <div className="text-center py-4">
                <p className="text-gray-400 text-sm mb-2">{dict.results.affinity}</p>
                <div className="text-4xl font-bold text-pink-400 mb-6">{results.bestMatch}</div>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-gray-500 uppercase tracking-wider">{dict.results.top_5 || 'Top 5 regiones más afines'}</p>
                {results.matchScores.slice(0, 5).map((match, i) => {
                  // Escala de afinidad: 1 (mejor) a 19 (peor)
                  const affinityScore = i + 1;
                  
                  // Colores graduales en tonos de verde (verde oscuro → verde claro)
                  const getAffinityColor = (score: number) => {
                    if (score === 1) return 'from-green-700 to-green-600';
                    if (score === 2) return 'from-green-600 to-green-500';
                    if (score === 3) return 'from-green-500 to-green-400';
                    if (score === 4) return 'from-green-400 to-green-300';
                    return 'from-green-300 to-green-200';
                  };
                  
                  const getTextColor = (score: number) => {
                    if (score === 1) return 'text-green-400';
                    if (score === 2) return 'text-green-300';
                    if (score === 3) return 'text-lime-400';
                    if (score === 4) return 'text-lime-300';
                    return 'text-lime-200';
                  };
                  
                  const getBgColor = (score: number) => {
                    if (score === 1) return 'bg-green-700/20 border-green-600/40';
                    if (score === 2) return 'bg-green-600/20 border-green-500/40';
                    if (score === 3) return 'bg-green-500/20 border-green-400/40';
                    if (score === 4) return 'bg-green-400/20 border-green-300/40';
                    return 'bg-green-300/20 border-green-200/40';
                  };
                  
                  return (
                    <div 
                      key={match.region} 
                      className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                        i === 0 
                          ? `${getBgColor(affinityScore)} ring-2 ring-emerald-400/30` 
                          : 'bg-slate-800 border-slate-700'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-gradient-to-br ${getAffinityColor(affinityScore)} text-white shadow-lg`}>
                          {affinityScore}
                        </span>
                        <span className={`font-medium ${i === 0 ? 'text-white' : ''}`}>{match.region}</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-20 bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full bg-gradient-to-r ${getAffinityColor(affinityScore)}`}
                            style={{ width: `${100 - (affinityScore - 1) * 5}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-center">
              <div className="flex items-center gap-3 mb-4 self-start w-full">
                <Activity className="text-cyan-500" />
                <h3 className="text-xl font-bold">{dict.results.you_vs_spain}</h3>
              </div>
              
              {/* Radar Chart */}
              <div className="w-full h-64 text-xs mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="subject" stroke="#94a3b8" />
                    <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
                    <Radar
                      name={dict.results.radar.you}
                      dataKey="A"
                      stroke="#ec4899"
                      strokeWidth={3}
                      fill="#ec4899"
                      fillOpacity={0.3}
                    />
                    <Radar
                      name={dict.results.radar.national_avg}
                      dataKey="B"
                      stroke="#06b6d4"
                      strokeWidth={2}
                      fill="#06b6d4"
                      fillOpacity={0.1}
                    />
                    <Legend />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              
              {/* Divider */}
              <div className="w-full border-t border-slate-700 my-4"></div>
              
              {/* Political Quadrant */}
              <div className="w-full">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="text-purple-500" />
                  <h3 className="text-lg font-bold">{dict.results.political_position}</h3>
                </div>
                
                <div className="relative w-full aspect-square max-w-sm mx-auto bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4">
                  {/* Etiquetas de cuadrantes */}
                  <div className="absolute top-2 left-2 text-xs text-red-400 font-bold">{dict.results.political_quadrants.auth_left}</div>
                  <div className="absolute top-2 right-2 text-xs text-blue-400 font-bold text-right">{dict.results.political_quadrants.auth_right}</div>
                  <div className="absolute bottom-2 left-2 text-xs text-green-400 font-bold">{dict.results.political_quadrants.lib_left}</div>
                  <div className="absolute bottom-2 right-2 text-xs text-purple-400 font-bold text-right">{dict.results.political_quadrants.lib_right}</div>
                  
                  {/* Cruz central (ejes X e Y) */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="absolute w-full border-t-2 border-slate-600"></div>
                    <div className="absolute h-full border-l-2 border-slate-600"></div>
                  </div>
                  
                  {/* Etiquetas de ejes */}
                  <div className="absolute left-1/2 -translate-x-1/2 -top-3 text-xs text-slate-400">{dict.results.political_quadrants.authoritarian}</div>
                  <div className="absolute left-1/2 -translate-x-1/2 -bottom-0 text-xs text-slate-400">{dict.results.political_quadrants.libertarian}</div>
                  <div className="absolute top-1/2 -translate-y-1/2 left-0 text-xs text-slate-400 ">{dict.results.political_quadrants.left}</div>
                  <div className="absolute top-1/2 -translate-y-1/2 right-0 text-xs text-slate-400 ">{dict.results.political_quadrants.right}</div>
                  
                  {/* Punto del usuario */}
                  <div 
                    className="absolute w-4 h-4 bg-pink-500 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 z-10"
                    style={{
                      left: `${4 + (politicalX / 10) * 92}%`,
                      top: `${4 + (politicalY / 10) * 92}%`
                    }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-bold text-pink-400">
                      {dict.results.political_quadrants.you}
                    </div>
                  </div>
                  
                  {/* Punto promedio nacional */}
                  <div 
                    className="absolute w-3 h-3 bg-cyan-500 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${4 + (NATIONAL_AVG.politics_leftright / 10) * 92}%`,
                      top: `${4 + (NATIONAL_AVG.values_authority / 10) * 92}%`
                    }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-cyan-400">
                      {dict.results.political_quadrants.spain}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 text-center text-sm text-gray-400">
                  <p>{dict.results.political_quadrants.left_right_axis}: <span className="text-white font-bold">{politicalX.toFixed(1)}/10</span></p>
                  <p>{dict.results.political_quadrants.auth_lib_axis}: <span className="text-white font-bold">{politicalY.toFixed(1)}/10</span></p>
                </div>
              </div>
            </div>

          </div>

            <div className="bg-slate-800/50 rounded-2xl p-4 flex gap-4 items-start text-sm text-gray-400">
              <Info className="shrink-0 mt-1" />
              <p dangerouslySetInnerHTML={{ __html: dict.results.info }}></p>
            </div>

            {/* Attribution Section */}
            <div className="flex justify-center mt-4">
              <a 
                href="https://creativecommons.org/licenses/by/4.0/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="opacity-60 hover:opacity-100 transition-opacity"
                title={dict.home.cc_license_title}
              >
                <img 
                  src="https://mirrors.creativecommons.org/presskit/buttons/88x31/svg/by.svg" 
                  alt={dict.home.cc_license_alt}
                  className="h-8"
                />
              </a>
            </div>
          </div>
          {/* Fin contenedor captura imagen */}

        </div>
      </div>
    );
  }

  return null;
}
