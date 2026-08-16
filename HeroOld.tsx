import { useMemo } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, ChevronLeft, ArrowUpRight, ArrowLeft, Phone } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useContent } from '../contexts/ContentContext';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Navigation, Keyboard, Parallax } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';

const defaultHeroImages = [
  { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', alt: 'واجهات زجاجية حديثة' },
  { url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', alt: 'قواطع زجاجية' }
];

export default function Hero() {
  const { language } = useLanguage();
  const { getContent } = useContent();
  const heroContent = getContent('hero_content');
  const heroImagesContent = getContent('hero_images');
  
  const heroImages = useMemo(() => {
    if (heroImagesContent?.body) {
      try {
        const parsed = JSON.parse(heroImagesContent.body);
        const filtered = parsed.filter((img: any) => img.url && typeof img.url === 'string' && img.url.trim() !== '');
        if (filtered.length > 0) return filtered;
      } catch (e) {}
    }
    return defaultHeroImages;
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

  return (
    <div className="relative min-h-[90vh] md:min-h-screen flex items-center overflow-hidden bg-[#0a0a0a]">
      {/* Background Slider */}
      <div className="absolute inset-0 z-0">
        <Swiper
          modules={[Autoplay, EffectFade, Navigation, Keyboard, Parallax]}
          effect="fade"
          speed={1500}
          parallax={true}
          autoplay={{ delay: 6000, disableOnInteraction: false }}
          keyboard={{ enabled: true }}
          navigation={{ nextEl: '.swiper-button-next-custom', prevEl: '.swiper-button-prev-custom' }}
          className="w-full h-full group"
        >
          {heroImages.map((img: any, index: number) => (
            <SwiperSlide key={index} className="overflow-hidden bg-black">
              <div className="w-full h-full" data-swiper-parallax="20%" data-swiper-parallax-scale="1.05">
                <img
                  src={img.url}
                  alt={img.alt || 'صورة'}
                  loading={index === 0 ? "eager" : "lazy"}
                  fetchPriority={index === 0 ? "high" : "auto"}
                  className="w-full h-full object-cover opacity-50 transform transition-transform duration-[15000ms] ease-linear hover:scale-110"
                />
              </div>
            </SwiperSlide>
          ))}
          
          <div className="absolute inset-y-0 right-0 z-50 flex items-center pr-4 md:pr-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <button className="swiper-button-next-custom bg-black/20 hover:bg-black/40 border border-white/10 backdrop-blur-md p-4 rounded-full text-white transition-all transform hover:scale-105 active:scale-95" aria-label="Next Slide">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div className="absolute inset-y-0 left-0 z-50 flex items-center pl-4 md:pl-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <button className="swiper-button-prev-custom bg-black/20 hover:bg-black/40 border border-white/10 backdrop-blur-md p-4 rounded-full text-white transition-all transform hover:scale-105 active:scale-95" aria-label="Previous Slide">
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        </Swiper>
        
        {/* Architectural Gradients & Noise */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10 z-10 pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10 pointer-events-none rtl:bg-gradient-to-l"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full pt-20">
        <div className="max-w-3xl">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants} className="mb-8 inline-block">
              <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0284C7] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0284C7]"></span>
                </span>
                <span className="text-white/80 text-xs font-semibold tracking-widest uppercase">
                  {language === 'ar' ? 'الشركة الرائدة في الرياض' : 'Leading Company in Riyadh'}
                </span>
              </div>
            </motion.div>
            
            {heroContent?.body ? (
              <motion.div 
                variants={itemVariants}
                className="prose prose-invert prose-lg prose-h1:text-5xl prose-h1:md:text-7xl prose-h1:font-bold prose-h1:text-white prose-h1:leading-[1.1] prose-h1:mb-6 prose-p:text-lg prose-p:md:text-xl prose-p:text-gray-300 prose-p:mb-10 prose-p:leading-relaxed prose-p:max-w-2xl" 
                dangerouslySetInnerHTML={{ __html: heroContent.body }} 
              />
            ) : (
              <>
                <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl lg:text-[5rem] font-bold text-white leading-[1.05] tracking-tight mb-8">
                  {language === 'ar' ? (
                    <>أرقى أعمال <br/><span className="text-[#0284C7] italic pr-2">الزجاج الحديث</span></>
                  ) : (
                    <>Premium <br/><span className="text-[#0284C7] italic">Modern Glass</span></>
                  )}
                </motion.h1>
                
                <motion.p variants={itemVariants} className="text-lg md:text-xl text-gray-300 mb-10 leading-relaxed max-w-2xl font-light">
                  {language === 'ar' 
                    ? 'نقدم حلولاً مبتكرة وعصرية لتركيب الزجاج للمشاريع التجارية والسكنية في جميع أنحاء الرياض. جودة عالية، دقة في التنفيذ، وتصاميم هندسية متطورة.'
                    : 'We provide innovative and modern glass installation solutions for commercial and residential projects across Riyadh. High quality, precise execution, and advanced architectural designs.'
                  }
                </motion.p>
              </>
            )}

            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row flex-wrap gap-4 mt-8">
              <a
                href="#services"
                className="group relative flex items-center justify-center gap-3 bg-white text-black px-8 py-4 font-bold text-base overflow-hidden rounded-md hover:text-white transition-colors duration-300"
              >
                <div className="absolute inset-0 bg-black translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
                <span className="relative z-10">{language === 'ar' ? 'استكشف خدماتنا' : 'Explore Services'}</span>
                {language === 'ar' ? <ArrowLeft className="w-5 h-5 relative z-10 group-hover:-translate-x-1 transition-transform" /> : <ArrowUpRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />}
              </a>
              <a
                href={`https://wa.me/966510233706`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center gap-2 bg-[#25D366] text-white px-8 py-4 font-bold text-base rounded-md hover:bg-[#1DA851] transition-colors duration-300 shadow-lg shadow-[#25D366]/20"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                {language === 'ar' ? 'واتساب' : 'WhatsApp'}
              </a>
              <a
                href={`tel:+966510233706`}
                className="group flex items-center justify-center gap-2 bg-[#0284C7] text-white px-8 py-4 font-bold text-base rounded-md hover:bg-[#0369A1] transition-colors duration-300 shadow-lg shadow-[#0284C7]/20"
              >
                <Phone className="w-5 h-5" />
                {language === 'ar' ? 'اتصال' : 'Call'}
              </a>
            </motion.div>

          </motion.div>
        </div>
      </div>
      
      {/* Decorative Bottom Line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent z-20"></div>
    </div>
  );
}
