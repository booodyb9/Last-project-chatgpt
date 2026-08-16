import { useState } from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { useContent } from '../contexts/ContentContext';

const glassStyles = [
  {
    id: 'clear',
    nameAr: 'شفاف',
    nameEn: 'Clear',
    style: {
      backdropFilter: 'blur(0px)',
      backgroundColor: 'rgba(255, 255, 255, 0.02)',
      boxShadow: 'inset 0 0 10px rgba(255,255,255,0.05), 0 4px 30px rgba(0, 0, 0, 0.1)',
      backgroundImage: 'none',
      borderColor: 'rgba(255, 255, 255, 0.1)'
    }
  },
  {
    id: 'frosted',
    nameAr: 'مثلج (ساندبلاست)',
    nameEn: 'Frosted (Sandblasted)',
    style: {
      backdropFilter: 'blur(16px) saturate(150%)',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      boxShadow: 'inset 0 0 20px rgba(255,255,255,0.3), 0 4px 30px rgba(0, 0, 0, 0.1)',
      backgroundImage: 'none',
      borderColor: 'rgba(255, 255, 255, 0.4)'
    }
  },
  {
    id: 'tinted',
    nameAr: 'ملون (برونزي)',
    nameEn: 'Tinted (Bronze)',
    style: {
      backdropFilter: 'blur(2px) brightness(0.6) sepia(0.3)',
      backgroundColor: 'rgba(120, 80, 50, 0.3)',
      boxShadow: 'inset 0 0 15px rgba(120,80,50,0.3), 0 4px 30px rgba(0, 0, 0, 0.2)',
      backgroundImage: 'none',
      borderColor: 'rgba(120, 80, 50, 0.3)'
    }
  },
  {
    id: 'reflective',
    nameAr: 'عاكس (أزرق)',
    nameEn: 'Reflective (Blue)',
    style: {
      backdropFilter: 'blur(2px) brightness(0.8) contrast(1.1)',
      backgroundColor: 'rgba(30, 64, 175, 0.15)',
      backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.05) 30%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.2) 100%)',
      boxShadow: 'inset 0 0 20px rgba(255,255,255,0.4), 0 8px 32px rgba(0, 0, 0, 0.3)',
      borderColor: 'rgba(255, 255, 255, 0.4)'
    }
  }
];

export default function GlassVisualizer() {
  const [activeStyle, setActiveStyle] = useState(glassStyles[0].id);
  const { language } = useLanguage();
  const { getContent } = useContent();
  const visualizerContent = getContent('visualizer_content');

  const currentStyle = glassStyles.find(s => s.id === activeStyle)?.style || glassStyles[0].style;

  return (
    <section className="py-24 bg-gray-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          {visualizerContent?.body ? (
            <div className="prose prose-lg mx-auto text-gray-600" dangerouslySetInnerHTML={{ __html: visualizerContent.body }} />
          ) : (
            <>
              <h2 className="text-[#0ea5e9] text-sm font-bold tracking-widest uppercase mb-4">
                {language === 'ar' ? 'المحاكي البصري' : 'Visualizer'}
              </h2>
              <h3 className="text-3xl md:text-5xl font-extrabold text-[#0F172A] leading-tight">
                {language === 'ar' ? 'اكتشف أنواع الزجاج' : 'Explore Glass Types'}
              </h3>
              <p className="text-gray-600 mt-6 leading-relaxed">
                {language === 'ar' 
                  ? 'شاهد الفرق بين أنواع الزجاج المختلفة وكيف تؤثر على الرؤية والإضاءة لتختار ما يناسب مساحتك.'
                  : 'See the difference between various glass types and how they affect visibility and lighting to choose what suits your space.'}
              </p>
            </>
          )}
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8 items-center justify-center">
          {/* Controls */}
          <div className="w-full lg:w-1/3 flex flex-col gap-3">
            {glassStyles.map(style => (
              <button
                key={style.id}
                onClick={() => setActiveStyle(style.id)}
                className={`p-4 border-2 transition-all flex items-center justify-between font-bold ${
                  activeStyle === style.id 
                    ? 'border-[#0284C7] bg-gray-50 text-[#0F172A] shadow-md' 
                    : 'border-transparent bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                <span>{language === 'ar' ? style.nameAr : style.nameEn}</span>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${activeStyle === style.id ? 'border-[#0284C7]' : 'border-gray-400'}`}>
                  {activeStyle === style.id && <div className="w-2 h-2 bg-[#0284C7] rounded-full" />}
                </div>
              </button>
            ))}
          </div>

          {/* Visualizer Frame */}
          <div className="w-full lg:w-2/3 max-w-3xl">
            <div className="relative rounded-sm overflow-hidden shadow-2xl aspect-video bg-gray-200 border-[12px] border-[#0F172A]">
              {/* Background Image (The view outside) */}
              <img loading="lazy" decoding="async" 
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
                alt="Room view" 
                className="absolute inset-0 w-full h-full object-cover"
              />
              
              {/* Glass Pane */}
              <div className="absolute inset-0 p-4 sm:p-6 md:p-12" style={{ perspective: '1000px' }}>
                <div 
                  className="w-full h-full rounded-2xl border transition-all duration-700 ease-in-out relative overflow-hidden"
                  style={{
                    WebkitBackdropFilter: currentStyle.backdropFilter,
                    backdropFilter: currentStyle.backdropFilter,
                    backgroundColor: currentStyle.backgroundColor,
                    boxShadow: currentStyle.boxShadow,
                    backgroundImage: currentStyle.backgroundImage,
                    borderColor: currentStyle.borderColor,
                    transform: 'translateZ(0)',
                  }}
                >
                  {/* Subtle top edge highlight */}
                  <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
                  
                  {/* Subtle glare sweep that animates repeatedly to mimic glass shine */}
                  <motion.div 
                    initial={{ x: '-150%' }}
                    animate={{ x: '150%' }}
                    transition={{ duration: 3, ease: 'linear', repeat: Infinity, repeatDelay: 5 }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-25deg] pointer-events-none w-1/2"
                  />
                </div>
              </div>

              {/* Window Frame Inner Details */}
              <div className="absolute inset-0 shadow-[inset_0_0_50px_rgba(0,0,0,0.6)] pointer-events-none"></div>
            </div>
            <div className="mt-4 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0284C7] animate-pulse"></span>
              {language === 'ar' ? 'صورة تفاعلية للمحاكاة' : 'Interactive Simulation Image'}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
