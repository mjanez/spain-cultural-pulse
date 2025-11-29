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
  Github,
  Check,
  X,
  TrendingUp
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
import { calculateTopParties } from '@/lib/partyCalculator';

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
  const [toast, setToast] = useState<{show: boolean, message: string, type: 'success' | 'error'}>({show: false, message: '', type: 'success'});
  const [copied, setCopied] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const shareDropdownRef = useRef<HTMLDivElement>(null);
  
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

  // Auto-hide toast
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({...toast, show: false});
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // Función para mostrar toast
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({show: true, message, type});
  };

  // Función para compartir
  const copyLinkToClipboard = async () => {
    try {
      const encoded = encodeAnswers(answers);
      const baseUrl = window.location.origin + window.location.pathname;
      const shareUrl = `${baseUrl}?a=${encoded}`;
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      showToast(dict.results.link_copied || '¡Enlace copiado!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      showToast(dict.results.share_failed || 'Error al copiar', 'error');
    }
  };

  // Funciones para compartir en redes sociales
  const shareToTwitter = () => {
    const encoded = encodeAnswers(answers);
    const shareUrl = `${window.location.origin}${window.location.pathname}?a=${encoded}`;
    const text = `${dict.results.share_twitter || '¡Descubre tu perfil cultural en España!'} 🇪🇸`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const shareToFacebook = () => {
    const encoded = encodeAnswers(answers);
    const shareUrl = `${window.location.origin}${window.location.pathname}?a=${encoded}`;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const shareToWhatsApp = () => {
    const encoded = encodeAnswers(answers);
    const shareUrl = `${window.location.origin}${window.location.pathname}?a=${encoded}`;
    const text = `${dict.results.share_whatsapp || '¡Mira mi perfil cultural en España!'} 🇪🇸`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + shareUrl)}`, '_blank');
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
                src="/flags/simple/val.png" 
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
                src="/flags/simple/val.png" 
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
      
      // Incluir regionId y displayName del perfil
      const regionData = REGIONAL_PROFILES[region] as any;
      return { 
        region, 
        regionId: region, 
        displayName: regionData?.displayName || region,
        diff 
      };
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

    // Clasificación de tribu usando todas las 28 dimensiones con pesos balanceados
    let tribeId = 'middle_class_moderate';
    let minTribeDistance = Infinity;

    Object.entries(TRIBES).forEach(([id, tribeProfile]) => {
      const tribeDiffs = [
        // Música (5 dimensiones, peso x1.2 cada una)
        Math.pow(userProfile.music_rock - tribeProfile.music_rock, 2) * 1.2,
        Math.pow(userProfile.music_pop - tribeProfile.music_pop, 2) * 1.2,
        Math.pow(userProfile.music_reggaeton - tribeProfile.music_reggaeton, 2) * 1.2,
        Math.pow(userProfile.music_classical - tribeProfile.music_classical, 2) * 1.2,
        Math.pow(userProfile.music_traditional - tribeProfile.music_traditional, 2) * 1.2,
        // Política (3 dimensiones, peso x4)
        Math.pow(userProfile.politics_leftright - tribeProfile.politics_leftright, 2) * 4,
        Math.pow(userProfile.politics_environment - tribeProfile.politics_environment, 2) * 4,
        Math.pow(userProfile.politics_equality - tribeProfile.politics_equality, 2) * 4,
        // Valores morales (3 dimensiones, peso x3.5)
        Math.pow(userProfile.values_care - tribeProfile.values_care, 2) * 3.5,
        Math.pow(userProfile.values_authority - tribeProfile.values_authority, 2) * 3.5,
        Math.pow(userProfile.values_purity - tribeProfile.values_purity, 2) * 3.5,
        // Temas sociales (4 dimensiones, peso x3)
        Math.pow(userProfile.social_immigration - tribeProfile.social_immigration, 2) * 3,
        Math.pow(userProfile.social_lgbt - tribeProfile.social_lgbt, 2) * 3,
        Math.pow(userProfile.social_abortion - tribeProfile.social_abortion, 2) * 3,
        Math.pow(userProfile.social_feminism - tribeProfile.social_feminism, 2) * 3,
        // Cultura (3 dimensiones, peso x1.5)
        Math.pow(userProfile.culture_reading - tribeProfile.culture_reading, 2) * 1.5,
        Math.pow(userProfile.culture_sports - tribeProfile.culture_sports, 2) * 1.5,
        Math.pow(userProfile.culture_museums - tribeProfile.culture_museums, 2) * 1.5,
        // Identidad (2 dimensiones, peso x2.5)
        Math.pow(userProfile.identity_spanish - tribeProfile.identity_spanish, 2) * 2.5,
        Math.pow(userProfile.identity_regional - tribeProfile.identity_regional, 2) * 2.5,
        // Religión (peso x2)
        Math.pow(userProfile.religiosity - tribeProfile.religiosity, 2) * 2,
        // Gastronomía (2 dimensiones, peso x0.8)
        Math.pow(userProfile.food_adventurous - tribeProfile.food_adventurous, 2) * 0.8,
        Math.pow(userProfile.food_social - tribeProfile.food_social, 2) * 0.8,
        // Movilidad (3 dimensiones, peso x1.2)
        Math.pow(userProfile.mobility_car - tribeProfile.mobility_car, 2) * 1.2,
        Math.pow(userProfile.mobility_public - tribeProfile.mobility_public, 2) * 1.2,
        Math.pow(userProfile.mobility_active - tribeProfile.mobility_active, 2) * 1.2,
        // Socioeconómico (2 dimensiones, peso x0.5)
        Math.pow(userProfile.socioeconomic_education - tribeProfile.socioeconomic_education, 2) * 0.5,
        Math.pow(userProfile.socioeconomic_income - tribeProfile.socioeconomic_income, 2) * 0.5,
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

    // Calcular distancia cultural respecto a la media nacional española
    // Comparamos tu perfil con el perfil promedio de España (NATIONAL_AVG)
    // Usamos los mismos pesos que para calcular las regiones
    const weights = {
      music: 1.0,
      politics: 4.0,
      food: 0.8,
      mobility: 1.2,
      values: 3.5,
      social: 3.0,
      culture: 1.5,
      identity: 2.5,
      religion: 2.0,
      socioeco: 0.3
    };

    const nationalDiffs = [
      // Música (5 dimensiones)
      Math.abs(userProfile.music_rock - NATIONAL_AVG.music_rock) / 10 * weights.music,
      Math.abs(userProfile.music_pop - NATIONAL_AVG.music_pop) / 10 * weights.music,
      Math.abs(userProfile.music_reggaeton - NATIONAL_AVG.music_reggaeton) / 10 * weights.music,
      Math.abs(userProfile.music_classical - NATIONAL_AVG.music_classical) / 10 * weights.music,
      Math.abs(userProfile.music_traditional - NATIONAL_AVG.music_traditional) / 10 * weights.music,
      // Política (3 dimensiones)
      Math.abs(userProfile.politics_leftright - NATIONAL_AVG.politics_leftright) / 10 * weights.politics,
      Math.abs(userProfile.politics_environment - NATIONAL_AVG.politics_environment) / 10 * weights.politics,
      Math.abs(userProfile.politics_equality - NATIONAL_AVG.politics_equality) / 10 * weights.politics,
      // Valores (3 dimensiones)
      Math.abs(userProfile.values_care - NATIONAL_AVG.values_care) / 10 * weights.values,
      Math.abs(userProfile.values_authority - NATIONAL_AVG.values_authority) / 10 * weights.values,
      Math.abs(userProfile.values_purity - NATIONAL_AVG.values_purity) / 10 * weights.values,
      // Social (4 dimensiones)
      Math.abs(userProfile.social_immigration - NATIONAL_AVG.social_immigration) / 10 * weights.social,
      Math.abs(userProfile.social_lgbt - NATIONAL_AVG.social_lgbt) / 10 * weights.social,
      Math.abs(userProfile.social_abortion - NATIONAL_AVG.social_abortion) / 10 * weights.social,
      Math.abs(userProfile.social_feminism - NATIONAL_AVG.social_feminism) / 10 * weights.social,
      // Cultura (3 dimensiones)
      Math.abs(userProfile.culture_reading - NATIONAL_AVG.culture_reading) / 10 * weights.culture,
      Math.abs(userProfile.culture_sports - NATIONAL_AVG.culture_sports) / 10 * weights.culture,
      Math.abs(userProfile.culture_museums - NATIONAL_AVG.culture_museums) / 10 * weights.culture,
      // Identidad (2 dimensiones)
      Math.abs(userProfile.identity_spanish - NATIONAL_AVG.identity_spanish) / 10 * weights.identity,
      Math.abs(userProfile.identity_regional - NATIONAL_AVG.identity_regional) / 10 * weights.identity,
      // Otros
      Math.abs(userProfile.religiosity - NATIONAL_AVG.religiosity) / 10 * weights.religion,
      Math.abs(userProfile.food_adventurous - NATIONAL_AVG.food_adventurous) / 10 * weights.food,
      Math.abs(userProfile.food_social - NATIONAL_AVG.food_social) / 10 * weights.food,
      Math.abs(userProfile.mobility_car - NATIONAL_AVG.mobility_car) / 10 * weights.mobility,
      Math.abs(userProfile.mobility_public - NATIONAL_AVG.mobility_public) / 10 * weights.mobility,
      Math.abs(userProfile.mobility_active - NATIONAL_AVG.mobility_active) / 10 * weights.mobility,
      Math.abs(userProfile.socioeconomic_education - NATIONAL_AVG.socioeconomic_education) / 10 * weights.socioeco,
      Math.abs(userProfile.socioeconomic_income - NATIONAL_AVG.socioeconomic_income) / 10 * weights.socioeco,
    ];
    
    // Calcular similitud con la media usando las MISMAS dimensiones del radar "Tu vs España"
    // Dimensiones agregadas (igual que el radar chart)
    const userMusicAvg = (userProfile.music_rock + userProfile.music_pop + userProfile.music_reggaeton + userProfile.music_classical + userProfile.music_traditional) / 5;
    const nationalMusicAvg = (NATIONAL_AVG.music_rock + NATIONAL_AVG.music_pop + NATIONAL_AVG.music_reggaeton + NATIONAL_AVG.music_classical + NATIONAL_AVG.music_traditional) / 5;
    
    const userSocialAvg = (userProfile.social_lgbt + userProfile.social_immigration + userProfile.social_abortion + userProfile.social_feminism) / 4;
    const nationalSocialAvg = (NATIONAL_AVG.social_lgbt + NATIONAL_AVG.social_immigration + NATIONAL_AVG.social_abortion + NATIONAL_AVG.social_feminism) / 4;
    
    const userIdentityAvg = (userProfile.identity_spanish + userProfile.identity_regional) / 2;
    const nationalIdentityAvg = (NATIONAL_AVG.identity_spanish + NATIONAL_AVG.identity_regional) / 2;
    
    const userCultureAvg = (userProfile.culture_reading + userProfile.culture_sports + userProfile.culture_museums) / 3;
    const nationalCultureAvg = (NATIONAL_AVG.culture_reading + NATIONAL_AVG.culture_sports + NATIONAL_AVG.culture_museums) / 3;
    
    const userMobilityAvg = (userProfile.mobility_public + userProfile.mobility_car + userProfile.mobility_active) / 3;
    const nationalMobilityAvg = (NATIONAL_AVG.mobility_public + NATIONAL_AVG.mobility_car + NATIONAL_AVG.mobility_active) / 3;
    
    // Diferencias en dimensiones del radar (0-10)
    const radarDiffs = [
      Math.abs(userMusicAvg - nationalMusicAvg),
      Math.abs(userProfile.politics_leftright - NATIONAL_AVG.politics_leftright),
      Math.abs(userSocialAvg - nationalSocialAvg),
      Math.abs(userIdentityAvg - nationalIdentityAvg),
      Math.abs(userCultureAvg - nationalCultureAvg),
      Math.abs(userMobilityAvg - nationalMobilityAvg),
      Math.abs(userProfile.food_adventurous - NATIONAL_AVG.food_adventurous)
    ];
    
    // Distancia promedio en las dimensiones del radar
    const avgRadarDiff = radarDiffs.reduce((sum, diff) => sum + diff, 0) / radarDiffs.length;
    
    // Calcular índice de similitud (inversamente proporcional a la diferencia)
    // Si avgRadarDiff es 0 → 10/10, si es 5+ (muy diferente) → 1/10
    const similarityIndex = Math.max(1, Math.min(10, Math.round(10 - (avgRadarDiff / 5) * 9)));
    
    // Calcular cuántas dimensiones están cerca (diff < 1.0)
    const dimensionsClose = radarDiffs.filter(diff => diff < 1.0).length;
    const regionsCloser = 7 - dimensionsClose; // Invertir: si todas cercanas → 0 regiones más cercanas
    
    // Categoría descriptiva basada en el índice
    const getSimilarityCategory = (index: number): string => {
      if (index >= 9) return 'Muy cercano';
      if (index >= 7) return 'Cercano';
      if (index >= 5) return 'Moderado';
      if (index >= 3) return 'Alejado';
      return 'Muy alejado';
    };
    const similarityCategory = getSimilarityCategory(similarityIndex);
    
    // Obtener displayName del mejor match
    const bestMatchData = REGIONAL_PROFILES[matchScores[0].region] as any;
    const bestMatchDisplayName = bestMatchData?.displayName || matchScores[0].region;

    // Calcular los 3 partidos políticos más afines usando el módulo externo
    const topParties = calculateTopParties(userProfile, matchScores);

    return {
      userProfile,
      bestMatch: matchScores[0].region,
      bestMatchDisplayName,
      matchScores,
      tribeId,
      tribeName,
      tribeDescription,
      dynamicMaxDistance,
      similarityIndex,
      similarityCategory,
      regionsCloser,
      avgRadarDiff,
      topParties
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
    
    // Validación: si no hay pregunta, volver a home
    if (!q) {
      setView('home');
      setCurrentQuestionIndex(0);
      return null;
    }
    
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
      <div className="min-h-screen bg-slate-950 text-white font-sans">
        {/* Toast Notification */}
        {toast.show && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] animate-slide-down">
            <div className={`flex items-center gap-3 px-6 py-3 rounded-xl shadow-2xl backdrop-blur-md border ${
              toast.type === 'success' 
                ? 'bg-green-500/90 border-green-400/50' 
                : 'bg-red-500/90 border-red-400/50'
            }`}>
              {toast.type === 'success' ? (
                <Check className="w-5 h-5 text-white" />
              ) : (
                <X className="w-5 h-5 text-white" />
              )}
              <span className="text-white font-semibold">{toast.message}</span>
            </div>
          </div>
        )}

        {/* Navbar Sticky */}
        <nav className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/50">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              {/* Botón Reiniciar */}
              <button 
                onClick={() => {
                  sessionStorage.clear();
                  window.location.reload();
                }} 
                className="text-gray-400 hover:text-white flex items-center gap-2 transition-colors"
                title={dict.results?.restart || 'Reiniciar'}
              >
                <RefreshCw size={18} />
                <span className="hidden md:inline text-sm">{dict.results?.restart || 'Reiniciar'}</span>
              </button>
              
              {/* Botón GitHub */}
              <a 
                href={process.env.GITHUB_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white flex items-center gap-2 transition-colors"
                aria-label={dict.home?.github_link || 'GitHub'}
                title={dict.home?.github_link || 'Ver código fuente'}
              >
                <Github className="w-4 h-4" />
                <span className="hidden md:inline text-sm">{dict.home?.github_link || 'GitHub'}</span>
              </a>
              
              {/* Botón Compartir con menú desplegable */}
              <div className="relative" ref={shareDropdownRef}>
                <button 
                  onClick={() => setShareMenuOpen(!shareMenuOpen)}
                  className="text-pink-400 hover:text-pink-300 flex items-center gap-2 font-semibold transition-colors"
                >
                  {copied ? <Check size={18} className="text-green-400" /> : <Share2 size={18} />}
                  <span className="hidden md:inline text-sm">{dict.results?.share || 'Compartir'}</span>
                </button>
                
                {shareMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-600/50 shadow-2xl overflow-hidden backdrop-blur-md">
                    <button
                      onClick={copyLinkToClipboard}
                      className="w-full px-4 py-3 text-left flex items-center gap-3 text-white hover:bg-slate-700/50 hover:text-pink-300 transition-all duration-200"
                    >
                      <LinkIcon className="w-4 h-4" />
                      <span className="text-sm">{dict.results?.copy_link || 'Copiar enlace'}</span>
                    </button>
                    <button
                      onClick={() => {
                        shareToTwitter();
                        setShareMenuOpen(false);
                      }}
                      className="w-full px-4 py-3 text-left flex items-center gap-3 text-white hover:bg-slate-700/50 hover:text-blue-400 transition-all duration-200"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                      <span className="text-sm">Twitter</span>
                    </button>
                    <button
                      onClick={() => {
                        shareToFacebook();
                        setShareMenuOpen(false);
                      }}
                      className="w-full px-4 py-3 text-left flex items-center gap-3 text-white hover:bg-slate-700/50 hover:text-blue-500 transition-all duration-200"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                      <span className="text-sm">Facebook</span>
                    </button>
                    <button
                      onClick={() => {
                        shareToWhatsApp();
                        setShareMenuOpen(false);
                      }}
                      className="w-full px-4 py-3 text-left flex items-center gap-3 text-white hover:bg-slate-700/50 hover:text-green-400 transition-all duration-200"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                      <span className="text-sm">WhatsApp</span>
                    </button>
                  </div>
                )}
              </div>
              
              {/* Selector de idioma - solo bandera en móvil */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                  className="flex items-center gap-1 md:gap-2 px-2 py-1.5 md:px-3 md:py-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors border border-slate-700/50"
                  aria-label={dict.language?.select || 'Language'}
                  title={dict.language?.select || 'Seleccionar idioma'}
                >
                  {currentLang === 'val' ? (
                    <div className="w-5 h-5 overflow-hidden rounded-sm flex-shrink-0">
                      <Image 
                        src="/flags/simple/val.png" 
                        alt="Valencian flag" 
                        width={20} 
                        height={20} 
                      />
                    </div>
                  ) : (
                    <span className={`fi fi-${
                      currentLang === 'es' ? 'es' : 
                      currentLang === 'en' ? 'gb' : 
                      currentLang === 'eu' ? 'es-pv' : 
                      currentLang === 'ca' ? 'es-ct' : 
                      currentLang === 'gl' ? 'es-ga' : 'es'
                    } fis text-lg`}></span>
                  )}
                  <span className="hidden md:inline text-xs text-gray-300">
                    {currentLang.toUpperCase()}
                  </span>
                </button>
                
                {langDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-40 md:w-44 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-600/50 shadow-2xl overflow-hidden backdrop-blur-md z-50">
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
                          src="/flags/simple/val.png" 
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
            </div>
          </div>
        </nav>

        {/* Contenido principal con padding-top para navbar */}
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 md:py-8">
          {/* Sección de resultados con animaciones */}
          <div className="animate-fade-in">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-3xl p-8 text-center shadow-2xl shadow-indigo-900/50 relative overflow-hidden animate-slide-up">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
              <Trophy className="w-12 h-12 mx-auto text-yellow-300 mb-4 animate-bounce" />
              <h2 className="text-lg uppercase tracking-widest opacity-80 mb-2">{dict.results.your_tribe}</h2>
              <h1 className="text-4xl md:text-6xl font-black mb-4 text-white drop-shadow-lg">
                {results.tribeName}
              </h1>
              <p className="text-indigo-100 max-w-lg mx-auto">
                {results.tribeDescription}
              </p>
            </div>

          <div className="grid md:grid-cols-2 gap-6 my-6">
            
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 animate-slide-up animation-delay-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <MapPin className="text-pink-500" />
                  <h3 className="text-xl font-bold">{dict.results.cultural_home}</h3>
                  <div className="group relative">
                    <Info className="w-4 h-4 text-gray-400 hover:text-pink-400 cursor-help transition-colors" />
                    <div className="absolute left-0 top-6 w-64 p-3 bg-slate-800 border border-slate-700 rounded-lg text-xs text-gray-300 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 shadow-xl">
                      {dict.results.cultural_home_tooltip}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="h-64 w-full rounded-xl overflow-hidden mb-6 relative bg-slate-800/50" style={{isolation: 'isolate'}}>
                <MapComponent scores={results.matchScores} maxDistance={results.dynamicMaxDistance} />
              </div>
              
              <div className="text-center py-4">
                <p className="text-gray-400 text-sm mb-2">{dict.results.affinity}</p>
                <div className="text-4xl font-bold text-pink-400 mb-2">{results.bestMatchDisplayName}</div>
                
                {/* Estadística de distancia cultural con la media nacional */}
                <div className="mt-4 p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-indigo-400" />
                    <span className="text-gray-300">
                      {dict.results.similarity_with_avg}: <span className="font-bold text-indigo-300">{results.similarityIndex}/10</span>
                      <span className="text-xs text-gray-400 ml-2">({results.similarityCategory})</span>
                    </span>
                    <div className="group relative">
                      <Info className="w-3.5 h-3.5 text-gray-400 hover:text-indigo-400 cursor-help transition-colors" />
                      <div className="absolute left-0 top-6 w-72 p-3 bg-slate-800 border border-slate-700 rounded-lg text-xs text-gray-300 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 shadow-xl">
                        {dict.results.similarity_tooltip}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    <span className="font-semibold text-green-400">{results.regionsCloser}</span> {dict.results.regions_closer_text}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-gray-500 uppercase tracking-wider">{dict.results.top_5 || 'Top 5 regiones más afines'}</p>
                {results.matchScores.slice(0, 5).map((match, i) => {
                  // Escala de afinidad: 1 (mejor) a 19 (peor)
                  const affinityScore = i + 1;
                  
                  // Usar directamente el ID de la región como nombre de archivo
                  const basePath = process.env.PAGES_BASE_PATH || '';
                  const flagPath = `${basePath}/flags/autonomias/${match.regionId}.jpg`;
                  const displayName = match.displayName || match.region;
                  
                  // Colores graduales en tonos de verde (verde oscuro → verde claro)
                  const getAffinityColor = (score: number) => {
                    if (score === 1) return 'from-green-700 to-green-600';
                    if (score === 2) return 'from-green-600 to-green-500';
                    if (score === 3) return 'from-green-500 to-green-400';
                    if (score === 4) return 'from-green-400 to-green-300';
                    return 'from-green-300 to-green-200';
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
                      key={match.regionId} 
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                        i === 0 
                          ? `${getBgColor(affinityScore)} ring-2 ring-emerald-400/30` 
                          : 'bg-slate-800 border-slate-700'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <div className="relative">
                          {/* Bandera de la autonomía */}
                          <Image 
                            src={flagPath}
                            alt={`Bandera de ${displayName}`}
                            width={40}
                            height={40}
                            className="rounded-lg object-cover border-2 border-slate-600 shadow-md"
                          />
                          {/* Badge con número de ranking */}
                          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold bg-slate-900 text-white shadow-lg border-2 border-green-500">
                            {affinityScore}
                          </span>
                        </div>
                        <span className={`font-medium ${i === 0 ? 'text-white' : ''}`}>{displayName}</span>
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

              {/* Identidad: Española ← → Regional */}
              <div className="mt-6 pt-6 border-t border-slate-700">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">{dict.results.identity_label || 'Tu Identidad'}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded border border-slate-600 overflow-hidden shadow-sm flex-shrink-0">
                        <Image 
                          src={`${process.env.PAGES_BASE_PATH || ''}/flags/españa.jpg`}
                          alt="España"
                          width={20}
                          height={20}
                          className="object-contain w-full h-full"
                        />
                      </div>
                      <span className="font-medium text-red-400">{results.userProfile.identity_spanish.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-green-400">{results.userProfile.identity_regional.toFixed(1)}</span>
                      <div className="w-5 h-5 rounded border border-slate-600 overflow-hidden shadow-sm flex-shrink-0">
                        <Image 
                          src={`${process.env.PAGES_BASE_PATH || ''}/flags/autonomias/${results.matchScores[0].regionId}.jpg`}
                          alt={results.matchScores[0].displayName || results.matchScores[0].region}
                          width={20}
                          height={20}
                          className="object-contain w-full h-full"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-600 to-yellow-500"
                      style={{ width: `${(results.userProfile.identity_spanish / (results.userProfile.identity_spanish + results.userProfile.identity_regional)) * 100}%` }}
                    ></div>
                    <div 
                      className="absolute inset-y-0 right-0 bg-gradient-to-l from-green-600 to-emerald-500"
                      style={{ width: `${(results.userProfile.identity_regional / (results.userProfile.identity_spanish + results.userProfile.identity_regional)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-center animate-slide-up animation-delay-200">
              <div className="flex items-center gap-2 mb-4 self-start w-full">
                <Activity className="text-cyan-500" />
                <h3 className="text-xl font-bold">{dict.results.you_vs_spain}</h3>
                <div className="group relative">
                  <Info className="w-4 h-4 text-gray-400 hover:text-cyan-400 cursor-help transition-colors" />
                  <div className="absolute left-0 top-6 w-64 p-3 bg-slate-800 border border-slate-700 rounded-lg text-xs text-gray-300 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 shadow-xl">
                    Comparativa de tus valores en dimensiones culturales clave versus la media nacional española.
                  </div>
                </div>
              </div>
              
              {/* Radar Chart con tooltips mejorados */}
              <div className="w-full h-64 text-xs mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="subject" stroke="#94a3b8" />
                    <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
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
                      contentStyle={{ 
                        backgroundColor: '#0f172a', 
                        borderColor: '#334155', 
                        borderRadius: '8px',
                        padding: '12px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
                      }}
                      labelStyle={{ color: '#f1f5f9', fontWeight: 'bold', marginBottom: '4px' }}
                      itemStyle={{ color: '#cbd5e1' }}
                      formatter={(value: number, name: string) => {
                        const percentage = ((value / 10) * 100).toFixed(0);
                        return [`${value.toFixed(1)}/10 (${percentage}%)`, name];
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              
              {/* Divider */}
              <div className="w-full border-t border-slate-700 my-4"></div>
              
              {/* Political Quadrant */}
              <div className="w-full">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="text-purple-500" />
                  <h3 className="text-lg font-bold">{dict.results.political_position}</h3>
                  <div className="group relative">
                    <Info className="w-4 h-4 text-gray-400 hover:text-purple-400 cursor-help transition-colors" />
                    <div className="absolute left-0 top-6 w-64 p-3 bg-slate-800 border border-slate-700 rounded-lg text-xs text-gray-300 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 shadow-xl">
                      Tu posición en el espectro político bidimensional (económico y social) comparada con el promedio español.
                    </div>
                  </div>
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
                      top: `${96 - (politicalY / 10) * 92}%`
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
                      top: `${96 - (NATIONAL_AVG.values_authority / 10) * 92}%`
                    }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-cyan-400">
                      {dict.results.political_quadrants.spain}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 text-center text-xs text-gray-500 space-y-1">
                  <div>
                    <span className="text-white font-semibold">{dict.results.political_quadrants.you}:</span> {politicalX.toFixed(1)}/10 {dict.results.political_quadrants.left_right_short} · {politicalY.toFixed(1)}/10 {dict.results.political_quadrants.auth_lib_short}
                  </div>
                </div>
              </div>

              {/* Political Parties Section */}
              <div className="w-full mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="text-amber-500" />
                  <h3 className="text-lg font-bold">{dict.results.closest_parties}</h3>
                  <div className="group relative">
                    <Info className="w-4 h-4 text-gray-400 hover:text-amber-400 cursor-help transition-colors" />
                    <div className="absolute left-0 top-6 w-64 p-3 bg-slate-800 border border-slate-700 rounded-lg text-xs text-gray-300 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 shadow-xl">
                      {dict.results.closest_parties_info}
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-slate-800/50 to-slate-800/30 rounded-xl p-4 border border-slate-700/50">
                  <div className="flex gap-6 justify-center items-center">
                    {results.topParties.map((party, idx) => {
                      const isRectangular = party.logo_shape === 'rectangular';
                      return (
                        <div key={party.id} className="flex flex-col items-center gap-2">
                          <a 
                            href={party.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="transition-all hover:scale-110 hover:brightness-110"
                            title={`${party.name_es} - ${Math.round(party.similarity)}% ${dict.results.closest_parties_info || 'afín'}`}
                          >
                            <div className="relative">
                              <img 
                                src={party.logo} 
                                alt={party.name_short}
                                className={`${isRectangular ? 'w-20 h-16 rounded-lg' : 'w-16 h-16 rounded-full'} object-contain border-3 shadow-xl bg-white/5 p-1`}
                                style={{ borderColor: party.color, borderWidth: '3px' }}
                              />
                              {idx === 0 && (
                                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-xs font-bold text-white shadow-lg border-2 border-slate-900">
                                  1
                                </div>
                              )}
                            </div>
                          </a>
                          <div className="text-center">
                            <div className="text-sm font-bold" style={{ color: party.color }}>
                              {party.name_short}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
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

        </div>
      </div>
    );
  }

  return null;
}
