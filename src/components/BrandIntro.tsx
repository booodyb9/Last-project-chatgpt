import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useContent } from '../contexts/ContentContext';

export default function BrandIntro({ onComplete }: { onComplete: () => void }) {
  const { getContent } = useContent();
  const introSettings = getContent('brand_intro');
  const [isVisible, setIsVisible] = useState(true);
  const [showSkip, setShowSkip] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const parsedSettings = useMemo(() => {
    try {
      if (introSettings?.body) {
        const parsed = JSON.parse(introSettings.body);
        return parsed[0] || {};
      }
    } catch(e) {}
    return {
      enabled: true,
      logoUrl: '/logo.svg',
      audioUrl: '', // Add a default minimal audio if needed
      title: 'زجاج الرياض',
      duration: 2500
    };
  }, [introSettings]);

  useEffect(() => {
    if (parsedSettings.enabled && sessionStorage.getItem('brandIntroPlayed') !== 'true') {
      document.body.style.overflow = 'hidden';
    }
  
    // Check session storage
    if (sessionStorage.getItem('brandIntroPlayed') === 'true' || !parsedSettings.enabled) {
      setIsVisible(false);
      document.body.style.overflow = 'auto';
      onComplete();
      return;
    }

    // Attempt to play audio
    if (parsedSettings.audioUrl) {
      audioRef.current = new Audio(parsedSettings.audioUrl);
      audioRef.current.play().catch(e => console.log('Audio autoplay blocked', e));
    }

    // Show skip button after a short delay just in case it gets stuck
    const skipTimer = setTimeout(() => {
      setShowSkip(true);
    }, 1500);

    const timer = setTimeout(() => {
      completeIntro();
    }, parsedSettings.duration || 2500);

    return () => {
      clearTimeout(timer);
      clearTimeout(skipTimer);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [parsedSettings, onComplete]);

  const completeIntro = () => {
    document.body.style.overflow = 'auto';
    sessionStorage.setItem('brandIntroPlayed', 'true');
    setIsVisible(false);
    setTimeout(() => {
      onComplete();
    }, 500);
  };

  if (!parsedSettings.enabled || sessionStorage.getItem('brandIntroPlayed') === 'true') {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/90 backdrop-blur-2xl"
          dir="rtl"
        >
          {/* Glass background effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-sky-50/50 rounded-full blur-3xl opacity-50" />
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-tr from-transparent via-white to-transparent opacity-60" />
          </div>

          <div className="relative z-10 flex flex-col items-center justify-center gap-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, filter: 'blur(20px)' }}
              animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative"
            >
              <img 
                src={parsedSettings.logoUrl || '/logo.svg'} 
                alt="Logo" 
                className="w-32 h-32 md:w-40 md:h-40 object-contain drop-shadow-xl" 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://ugvdoabczcnxluzxehga.supabase.co/storage/v1/object/public/media/logo.png';
                }}
              />
              {/* Light Sweep */}
              <motion.div
                initial={{ left: '-100%', opacity: 0 }}
                animate={{ left: '200%', opacity: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
                className="absolute top-0 bottom-0 w-20 bg-gradient-to-r from-transparent via-white/80 to-transparent skew-x-[-30deg]"
                style={{ mixBlendMode: 'overlay' }}
              />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20, clipPath: 'inset(100% 0 0 0)' }}
              animate={{ opacity: 1, y: 0, clipPath: 'inset(0% 0 0 0)' }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight"
            >
              {parsedSettings.title || 'زجاج الرياض'}
            </motion.h1>
          </div>

          <AnimatePresence>
            {showSkip && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={completeIntro}
                className="absolute bottom-10 px-6 py-2 bg-white/50 hover:bg-white/80 backdrop-blur-md rounded-full text-sm font-medium text-slate-600 transition-colors border border-white/50 shadow-sm"
              >
                تخطي
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
