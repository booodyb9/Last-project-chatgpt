import { Link } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, ChevronRight, ChevronLeft, MapPin, Briefcase, ArrowUpRight, ZoomIn, ArrowLeft } from 'lucide-react';
import { useContent } from '../contexts/ContentContext';
import { useLanguage } from '../contexts/LanguageContext';
import { PortfolioProject } from '../pages/dashboard/types';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, Keyboard } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';


const defaultProjects: PortfolioProject[] = ([
  {
    id: '1',
    title: 'واجهات برج المكاتب',
    category: 'واجهات زجاجية',
    coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    description: 'تركيب واجهة كرتن وول للمبنى بالكامل مع زجاج مزدوج عازل للحرارة والصوت.',
    isFeatured: true,
    isHidden: false,
    order: 1
  },
  {
    id: '2',
    title: 'قواطع شركة التقنية',
    category: 'قواطع مكتبية',
    coverImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    description: 'تنفيذ قواطع زجاجية ذكية عازلة للصوت لمكاتب الإدارة وقاعات الاجتماعات.',
    isFeatured: true,
    isHidden: false,
    order: 2
  },
  {
    id: '3',
    title: 'فيلا حي النرجس',
    category: 'درابزين وسلالم',
    coverImage: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    description: 'تصميم وتركيب درابزين زجاجي سيكوريت 12 ملم للسلالم الداخلية والشرفات.',
    isFeatured: true,
    isHidden: false,
    order: 3
  },
  {
    id: '4',
    title: 'شاور كابين الفاخر',
    category: 'كبائن شاور',
    coverImage: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    description: 'كابينة شاور زجاجية بتصميم عصري وإكسسوارات مقاومة للصدأ.',
    isFeatured: true,
    isHidden: false,
    order: 4
  },
  {
    id: '5',
    title: 'مرايا النادي الرياضي',
    category: 'مرايا ديكورية',
    coverImage: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    description: 'تغطية جدران النادي بالكامل بمرايا كريستال عالية الجودة مع إضاءة ليد.',
    isFeatured: false,
    isHidden: false,
    order: 5
  },
  {
    id: '6',
    title: 'أبواب المعرض التجاري',
    category: 'أبواب سيكوريت',
    coverImage: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    description: 'أبواب زجاجية سحاب أوتوماتيكية لمعرض تجاري بآلية فتح وإغلاق سلسة.',
    isFeatured: true,
    isHidden: false,
    order: 6
  }
] as unknown as PortfolioProject[]);

export default function Gallery({ limit, featuredOnly }: { limit?: number, featuredOnly?: boolean }) {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const [activeCategory, setActiveCategory] = useState(isAr ? 'الكل' : 'All');
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [totalProjects, setTotalProjects] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const { getContent } = useContent();
  const portfolioContent = getContent('premium_portfolio_projects');

  useEffect(() => {
    let baseProjects = defaultProjects;
    
    if (portfolioContent?.body) {
      try {
        const parsed = JSON.parse(portfolioContent.body);
        if (Array.isArray(parsed) && parsed.length > 0) {
          baseProjects = parsed;
        }
      } catch (e) {
        console.error("Failed to parse portfolio projects", e);
      }
    }
    
    let validProjects = baseProjects.filter(p => !p.isHidden);
    validProjects.sort((a, b) => (a.order || 0) - (b.order || 0));
    
    if (featuredOnly) {
      validProjects = validProjects.filter(p => p.isFeatured !== false); // Ensure featured shows if not explicitly false
    }
    setTotalProjects(validProjects.length);
    
    if (limit) {
      validProjects = validProjects.slice(0, limit);
    }
    setProjects(validProjects);
  }, [portfolioContent, limit, featuredOnly]);

  const categories = useMemo(() => {
    const cats = new Set(projects.map(p => p.category));
    return [isAr ? 'الكل' : 'All', ...Array.from(cats)];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    let result = activeCategory === (isAr ? 'الكل' : 'All') 
      ? projects 
      : projects.filter(p => p.category === activeCategory);
      
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.title?.toLowerCase().includes(query) || 
        p.description?.toLowerCase().includes(query) ||
        p.location?.toLowerCase().includes(query) ||
        p.serviceType?.toLowerCase().includes(query)
      );
    }
    return result;
  }, [projects, activeCategory, searchQuery]);

  // Prevent scrolling when lightbox is open
  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [lightboxIndex]);

  const handleNext = () => {
    if (lightboxIndex !== null && lightboxIndex < filteredProjects.length - 1) {
      setLightboxIndex(lightboxIndex + 1);
    }
  };

  const handlePrev = () => {
    if (lightboxIndex !== null && lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1);
    }
  };

  const currentLightboxProject = lightboxIndex !== null ? filteredProjects[lightboxIndex] : null;

  return (
    <section className="py-24 bg-gray-50 relative overflow-hidden" id="gallery">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {limit ? (
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-[#0284C7] text-sm font-bold tracking-widest uppercase mb-3">
                المشاريع المميزة
              </h2>
              <h3 className="text-3xl md:text-5xl font-extrabold text-[#0F172A] leading-tight mb-6">
                استكشف أعمالنا
              </h3>
            </motion.div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl"
            >
              <h2 className="text-[#0284C7] text-sm font-bold tracking-widest uppercase mb-3">
                {isAr ? 'معرض الأعمال' : 'Portfolio'}
              </h2>
              <h3 className="text-3xl md:text-5xl font-extrabold text-[#0F172A] leading-tight mb-6">
                مشاريع نفخر بها
              </h3>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-full md:w-auto"
            >
              <div className="relative">
                <input
                  type="text"
                  placeholder="ابحث في المشاريع..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full md:w-72 pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0284C7] focus:border-transparent transition-all bg-white shadow-sm"
                  dir="rtl"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
            </motion.div>
          </div>
        )}

        {!limit && categories.length > 1 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-wrap items-center gap-2 mb-12"
          >
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                  activeCategory === category
                    ? 'bg-[#0F172A] text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </motion.div>
        )}

        {/* Horizontal Slider (If Limit is provided) */}
        {limit ? (
          <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0 pb-12">
            <Swiper
              modules={[Autoplay, Pagination, Navigation]}
              spaceBetween={32}
              slidesPerView={1}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              pagination={{ clickable: true, dynamicBullets: true }}
              navigation={{
                nextEl: '.swiper-button-next-portfolio',
                prevEl: '.swiper-button-prev-portfolio',
              }}
              className="!pb-16"
              loop={filteredProjects.length >= 4}
            >
              {filteredProjects.map((project, index) => (
                <SwiperSlide key={project.id} className="h-auto pb-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 h-[450px] flex flex-col cursor-pointer"
                    onClick={() => setLightboxIndex(filteredProjects.indexOf(project))}
                  >
                    <div className="absolute inset-0 z-0">
                      <img loading="lazy" decoding="async" 
                        src={project.coverImage || project.image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c'}
                        alt={project.title || 'صورة'}
                        
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/90 via-[#0F172A]/40 to-transparent transition-opacity duration-300" />
                    </div>
                    
                    <div className="absolute top-4 right-4 z-20">
                      <span className="bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-sm">
                        {project.category}
                      </span>
                    </div>

                    <div className="relative z-10 flex flex-col justify-end h-full p-6 text-white translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <h4 className="text-2xl font-bold mb-2">{project.title}</h4>
                      <p className="text-gray-300 text-sm mb-4 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                        {project.description}
                      </p>
                      
                      <div className="flex items-center gap-2 text-[#0284C7] font-bold mt-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200">
                        عرض التفاصيل
                        <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </motion.div>
                </SwiperSlide>
              ))}
            </Swiper>
            
            <button className="swiper-button-prev-portfolio absolute top-1/2 -left-4 md:-left-12 -translate-y-1/2 z-10 bg-white shadow-lg p-4 rounded-full text-[#0284C7] hover:bg-[#0F172A] hover:text-white transition-all hidden sm:flex items-center justify-center" aria-label="Previous Slide">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button className="swiper-button-next-portfolio absolute top-1/2 -right-4 md:-right-12 -translate-y-1/2 z-10 bg-white shadow-lg p-4 rounded-full text-[#0284C7] hover:bg-[#0F172A] hover:text-white transition-all hidden sm:flex items-center justify-center" aria-label="Next Slide">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        ) : (
          /* Premium Masonry Grid */
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            <AnimatePresence>
              {filteredProjects.map((project, index) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  transition={{ duration: 0.4, delay: (index % 10) * 0.05 }}
                  key={project.id}
                  className="break-inside-avoid relative group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer"
                  onClick={() => setLightboxIndex(filteredProjects.indexOf(project))}
                >
                  <div className="relative overflow-hidden w-full" style={{ paddingBottom: index % 3 === 0 ? '120%' : index % 2 === 0 ? '80%' : '100%' }}>
                    <div className="absolute inset-0 z-0">
                      <img loading="lazy" decoding="async" 
                        src={project.coverImage || project.image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c'}
                        alt={project.title || 'صورة'}
                        
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-6">
                        <div className="flex justify-end">
                          <span className="bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                            {project.category}
                          </span>
                        </div>
                        <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                          <h4 className="text-xl font-bold text-white mb-2">{project.title}</h4>
                          <p className="text-gray-200 text-sm line-clamp-2 mb-4">{project.description}</p>
                          <div className="inline-flex items-center gap-2 text-white bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                            <ZoomIn className="w-4 h-4" />
                            عرض المشروع
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {(!limit && filteredProjects.length === 0) && (
          <div className="text-center py-24 text-gray-500">
            لا توجد مشاريع في هذا التصنيف حالياً.
          </div>
        )}
        
        {limit && totalProjects > limit && (
          <div className="text-center mt-12">
            <Link 
              to="/portfolio"
              className="inline-flex items-center gap-3 bg-[#0F172A] text-white px-8 py-4 rounded-full font-bold hover:bg-[#0284C7] hover:shadow-lg hover:shadow-[#0284C7]/20 transition-all duration-300 group"
            >
              عرض كل المشاريع
              <ArrowLeft className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" />
            </Link>
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && currentLightboxProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl"
            onKeyDown={(e) => {
              if (e.key === 'Escape') setLightboxIndex(null);
              if (e.key === 'ArrowRight') handlePrev();
              if (e.key === 'ArrowLeft') handleNext();
            }}
            tabIndex={0}
          >
            <button
              aria-label="Close Lightbox" onClick={() => setLightboxIndex(null)}
              className="absolute top-6 right-6 z-[110] text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            {lightboxIndex > 0 && (
              <button
                onClick={handlePrev}
                className="absolute left-6 top-1/2 -translate-y-1/2 z-[110] text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-4 rounded-full transition-colors"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
            )}

            {lightboxIndex < filteredProjects.length - 1 && (
              <button
                onClick={handleNext}
                className="absolute right-6 top-1/2 -translate-y-1/2 z-[110] text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-4 rounded-full transition-colors"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            )}

            <div className="max-w-6xl w-full mx-4 flex flex-col md:flex-row gap-8 items-center justify-center h-full py-20 outline-none">
              <motion.div
                key={currentLightboxProject.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="relative w-full md:w-2/3 h-[50vh] md:h-[80vh] flex items-center justify-center"
              >
                <img loading="lazy" decoding="async" 
                  src={currentLightboxProject.coverImage || currentLightboxProject.image}
                  alt={currentLightboxProject.title || 'صورة'}
                  className="max-w-full max-h-full object-contain shadow-2xl rounded-lg"
                />
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="w-full md:w-1/3 text-white space-y-6"
              >
                <div>
                  <span className="text-[#0284C7] text-sm font-bold tracking-widest uppercase mb-2 block">
                    {currentLightboxProject.category}
                  </span>
                  <h3 className="text-3xl md:text-5xl font-bold mb-4">{currentLightboxProject.title}</h3>
                  <p className="text-gray-300 text-lg leading-relaxed">{currentLightboxProject.description}</p>
                </div>
                
                <div className="space-y-3 pt-6 border-t border-white/10">
                  {currentLightboxProject.location && (
                    <div className="flex items-center gap-3 text-gray-300">
                      <MapPin className="w-5 h-5 text-[#0284C7]" />
                      <span>{currentLightboxProject.location}</span>
                    </div>
                  )}
                  {currentLightboxProject.serviceType && (
                    <div className="flex items-center gap-3 text-gray-300">
                      <Briefcase className="w-5 h-5 text-[#0284C7]" />
                      <span>{currentLightboxProject.serviceType}</span>
                    </div>
                  )}
                </div>

                <Link
                  to={`/portfolio/${currentLightboxProject.slug || currentLightboxProject.id}`}
                  className="mt-8 inline-flex items-center gap-2 bg-[#0284C7] hover:bg-[#0284C7] text-white px-8 py-4 rounded-full font-bold transition-colors w-full justify-center group"
                >
                  التفاصيل الكاملة للمشروع
                  <ArrowLeft className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
