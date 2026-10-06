import { useState, useMemo, lazy, Suspense } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';
import { ChevronRight, ChevronLeft, ArrowLeft, Phone, ShieldCheck, MapPin, Sparkles, Image as ImageIcon } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useContent } from '../contexts/ContentContext';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Navigation, Parallax } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';

const AIVisionAssistant = lazy(() => import('./AIVisionAssistant'));

const defaultHeroImages = [
  { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', alt: 'واجهات زجاجية حديثة', visible: true, isDefault: true },
  { url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', alt: 'قواطع زجاجية', visible: true }
];

export default function Hero() {
  const [isAiVisionOpen, setIsAiVisionOpen] = useState(false);
  const { language } = useLanguage();
  const { getContent } = useContent();
  const heroImagesContent = getContent('hero_images');

  const heroImages = useMemo(() => {
    let images = [];
    if (heroImagesContent?.body) {
      try {
        const parsed = JSON.parse(heroImagesContent.body);
        images = parsed.filter((img: any) => img.url && typeof img.url === 'string' && img.url.trim() !== '' && img.visible !== false);
      } catch (e) {}
    }
    if (images.length === 0) images = defaultHeroImages;

    // Sort: isDefault first
    return images.sort((a: any, b: any) => {
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      return 0;
    });
  }, [heroImagesContent]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  const isAr = language === 'ar';

  return (
    <div className="relative min-h-[95vh] md:min-h-screen flex items-center overflow-hidden bg-slate-50" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Preload Main Hero Image for LCP */}
      {heroImages[0]?.url && (
        <Helmet>
          <link rel="preload" as="image" href={heroImages[0].url} fetchPriority="high" />
        </Helmet>
      )}

      {/* Background Slider */}
      <div className="absolute inset-0 z-0">
        <Swiper
          modules={[Autoplay, EffectFade, Navigation, Parallax]}
          effect="fade"
          speed={1500}
          parallax={true}
          lazyPreloadPrevNext={1}
          autoplay={{ delay: 6000, disableOnInteraction: false }}
          navigation={{ nextEl: '.swiper-button-next-custom', prevEl: '.swiper-button-prev-custom' }}
          className="w-full h-full group"
        >
          {heroImages.map((img: any, index: number) => (
            <SwiperSlide key={index} className="overflow-hidden bg-white">
              <div className="w-full h-full" data-swiper-parallax="20%" data-swiper-parallax-scale="1.05">
                <img
                  src={img.url}
                  alt={img.alt || 'صورة'}
                  loading={index === 0 ? "eager" : "lazy"}
                  decoding="async"
                  fetchPriority={index === 0 ? "high" : "auto"}
                  className="w-full h-full object-cover transform transition-transform duration-[15000ms] ease-linear hover:scale-110"
                />
              </div>
            </SwiperSlide>
          ))}
          
          {heroImages.length > 1 && (
            <>
              <div className="absolute inset-y-0 right-0 z-50 flex items-center pr-4 md:pr-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <button className="swiper-button-next-custom bg-white/40 hover:bg-white/70 border border-white/40 backdrop-blur-md p-4 rounded-full text-slate-800 transition-all transform hover:scale-105 active:scale-95 shadow-lg" aria-label="Next Slide">
                  {isAr ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </button>
              </div>
              <div className="absolute inset-y-0 left-0 z-50 flex items-center pl-4 md:pl-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <button className="swiper-button-prev-custom bg-white/40 hover:bg-white/70 border border-white/40 backdrop-blur-md p-4 rounded-full text-slate-800 transition-all transform hover:scale-105 active:scale-95 shadow-lg" aria-label="Previous Slide">
                  {isAr ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                </button>
              </div>
            </>
          )}
        </Swiper>
        
        {/* Luxury Light Overlays */}
        <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px] z-10 pointer-events-none"></div>
        <div className={`absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent z-10 pointer-events-none ${isAr ? 'rtl:bg-gradient-to-l' : ''}`}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full pt-20 pb-24 md:pb-32 flex flex-col justify-center h-full">
        
        <div className="max-w-3xl">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {/* Top Badge */}
            <motion.div variants={itemVariants} className="mb-6 inline-block">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-white shadow-sm backdrop-blur-md">
                <Sparkles className="w-4 h-4 text-sky-600" />
                <span className="text-slate-800 text-xs sm:text-sm font-bold tracking-widest uppercase">
                  {isAr ? 'الشركة الرائدة في الرياض' : 'Leading Glass Company in Riyadh'}
                </span>
              </div>
            </motion.div>
            
            {/* Main Headline */}
            <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl lg:text-[5rem] font-bold text-slate-900 leading-[1.1] tracking-tight mb-6">
              {heroImages[0]?.title ? (
                 <>{heroImages[0].title}</>
              ) : (
                isAr ? (
                  <>أرقى أعمال <br/><span className="text-sky-600 relative inline-block">الزجاج الحديث<div className="absolute -bottom-2 left-0 right-0 h-1 bg-sky-200/50 rounded-full"></div></span></>
                ) : (
                  <>Premium <br/><span className="text-sky-600 relative inline-block">Modern Glass<div className="absolute -bottom-2 left-0 right-0 h-1 bg-sky-200/50 rounded-full"></div></span></>
                )
              )}
            </motion.h1>
            
            {/* Description */}
            <motion.p variants={itemVariants} className="text-lg md:text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl font-medium">
              {heroImages[0]?.description ? (
                <>{heroImages[0].description}</>
              ) : (
                isAr 
                  ? 'نقدم حلولاً مبتكرة وعصرية لتركيب الزجاج للمشاريع التجارية والسكنية. جودة استثنائية، دقة في التنفيذ، وتصاميم هندسية متطورة تعكس فخامة المكان.'
                  : 'We provide innovative glass installation solutions for commercial and residential projects. Exceptional quality, precise execution, and advanced architectural designs.'
              )}
            </motion.p>
            
            {/* CTA Buttons */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row flex-wrap gap-4 mt-4">
              <a
                href="#services"
                className="group relative flex items-center justify-center gap-3 bg-sky-600 text-white px-8 py-4 font-bold text-base overflow-hidden rounded-xl hover:bg-sky-700 transition-colors duration-300 shadow-lg shadow-sky-600/20"
              >
                <span className="relative z-10">{heroImages[0]?.ctaText || (isAr ? 'استكشف خدماتنا' : 'Explore Services')}</span>
                {isAr ? <ArrowLeft className="w-5 h-5 relative z-10 group-hover:-translate-x-1 transition-transform" /> : <ChevronRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />}
              </a>
              <button
                onClick={() => setIsAiVisionOpen(true)}
                className="group relative flex items-center justify-center gap-3 bg-[#0F172A] text-white px-8 py-4 font-bold text-base overflow-hidden rounded-xl hover:bg-gray-800 transition-colors duration-300 shadow-lg shadow-gray-900/20 border border-gray-700"
              >
                <ImageIcon className="w-5 h-5 text-sky-400" />
                <span className="relative z-10">{isAr ? 'أرسل صورة لفكرتك' : 'Send an image'}</span>
                <Sparkles className="w-4 h-4 text-sky-400" />
              </button>
              <a
                href={`https://wa.me/966510233706`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center gap-2 bg-white text-slate-900 border border-slate-200 px-8 py-4 font-bold text-base rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 shadow-sm"
              >
                <Phone className="w-5 h-5 text-sky-600" />
                {isAr ? 'اطلب معاينة' : 'Request Inspection'}
              </a>
            </motion.div>
          </motion.div>
        </div>
      </div>
      
      {/* 3 Floating Glass Cards (Bottom) */}
      <div className="absolute bottom-4 sm:bottom-8 left-0 right-0 z-30 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl"
          >
            {/* Card 1 */}
            <div className="bg-white/70 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-2xl p-4 flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
              <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6 text-sky-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">{isAr ? 'تنفيذ احترافي' : 'Pro Execution'}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{isAr ? 'بأعلى معايير الجودة' : 'Highest standards'}</p>
              </div>
            </div>
            
            {/* Card 2 */}
            <div className="bg-white/70 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-2xl p-4 flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">{isAr ? 'معاينة داخل الرياض' : 'Riyadh Inspection'}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{isAr ? 'استجابة سريعة' : 'Fast response'}</p>
              </div>
            </div>
            
            {/* Card 3 */}
            <div className="bg-white/70 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-2xl p-4 flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300 hidden sm:flex">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">{isAr ? 'جودة وضمان' : 'Quality & Warranty'}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{isAr ? 'مواد معتمدة عالمياً' : 'Certified materials'}</p>
              </div>
            </div>
          </motion.div>
              </div>
      </div>

      {isAiVisionOpen && (
        <Suspense fallback={null}>
          <AIVisionAssistant onClose={() => setIsAiVisionOpen(false)} />
        </Suspense>
      )}
    </div>
  );
}
