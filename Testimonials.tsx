import { Helmet } from 'react-helmet-async';
import { useMemo } from 'react';
import { motion } from 'motion/react';
import { Star, Quote, ChevronRight, ChevronLeft } from 'lucide-react';
import { useContent } from '../contexts/ContentContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectCards } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-cards';

// Helper to generate a soft background color based on name
const getAvatarColor = (name: string) => {
  const colors = [
    'bg-blue-100 text-blue-600',
    'bg-emerald-100 text-emerald-600',
    'bg-violet-100 text-violet-600',
    'bg-rose-100 text-rose-600',
    'bg-amber-100 text-amber-600',
    'bg-cyan-100 text-cyan-600',
  ];
  const index = name.length % colors.length;
  return colors[index];
};

export default function Testimonials() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const defaultTestimonials = [
  {
    name: isAr ? 'مؤسسة أبعاد التطوير' : 'Abaad Dev Corp',
    role: isAr ? 'مشروع واجهات تجارية' : 'Commercial Facades Project',
    content: isAr ? 'تعاملنا مع شركة زجاج الرياض في تنفيذ واجهات مشروعنا التجاري. احترافية عالية في العمل، التزام دقيق بالمواعيد، وجودة تنفيذ تفوق التوقعات.' : 'We worked with Riyadh Glass on our commercial project facades. High professionalism, strict adherence to deadlines, and execution quality that exceeded expectations.',
    rating: 5,
  },
  {
    name: isAr ? 'عبدالله السالم' : 'Abdullah Al-Salem',
    role: isAr ? 'فيلا سكنية - الملقا' : 'Residential Villa - Al Malqa',
    content: isAr ? 'قمت بتركيب نوافذ وكبائن شاور للفيلا. الشغل جداً نظيف ومرتب، والفريق متعاون جداً في تقديم الاستشارات والتعديلات المطلوبة. أنصح بالتعامل معهم.' : 'I installed windows and shower cabins for the villa. The work is very clean and neat, and the team is very cooperative. Highly recommended.',
    rating: 5,
  },
  {
    name: isAr ? 'شركة رؤية المستقبل' : 'Future Vision Co',
    role: isAr ? 'قواطع مكتبية' : 'Office Partitions',
    content: isAr ? 'احترافية في التعامل وسرعة في الإنجاز. تم تركيب القواطع الزجاجية لمكاتبنا في وقت قياسي وبجودة عالية جداً تعكس صورة احترافية للشركة.' : 'Professionalism and speed. Glass partitions for our offices were installed in record time with very high quality.',
    rating: 5,
  }
];
  const { getContent } = useContent();
  const itemsContent = getContent('testimonials_items');
  
  const testimonials = useMemo(() => {
    if (itemsContent?.body) {
      try {
        const parsed = JSON.parse(itemsContent.body);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error("Failed to parse testimonials items", e);
      }
    }
    return defaultTestimonials;
  }, [itemsContent]);

  return (
    <section id="testimonials" className="py-24 bg-white relative overflow-hidden">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#0284C7]/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#0284C7]/5 rounded-full blur-3xl pointer-events-none"></div>

      
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "itemListElement": testimonials.map((testimonial, idx) => ({
              "@type": "Review",
              "position": idx + 1,
              "author": {
                "@type": "Person",
                "name": testimonial.name
              },
              "reviewRating": {
                "@type": "Rating",
                "ratingValue": testimonial.rating || 5,
                "bestRating": 5
              },
              "reviewBody": testimonial.content,
              "itemReviewed": {
                "@type": "HomeAndConstructionBusiness",
                "name": "شركة زجاج الرياض"
              }
            }))
          })}
        </script>
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-[#0284C7] text-sm font-bold tracking-widest uppercase mb-4">آراء العملاء</h2>
          <h3 className="text-4xl md:text-5xl font-extrabold text-[#0F172A] leading-tight mb-6 tracking-tight">
            ماذا يقول شركاء النجاح
          </h3>
        </motion.div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-12 pb-12">
          <Swiper
            modules={[Autoplay, Pagination, Navigation]}
            spaceBetween={30}
            slidesPerView={1}
            breakpoints={{
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            pagination={{ clickable: true, dynamicBullets: true }}
            navigation={{
              nextEl: '.swiper-button-next-test',
              prevEl: '.swiper-button-prev-test',
            }}
            className="!pb-16"
          >
            {testimonials.map((testimonial, index) => (
              <SwiperSlide key={index} className="h-auto pb-4">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: (index % 3) * 0.1 }}
                  className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 h-full flex flex-col group relative"
                >
                  <Quote className="absolute top-8 right-8 h-10 w-10 text-[#0284C7]/10 group-hover:text-[#0284C7]/20 transition-colors duration-500 transform group-hover:scale-110" />
                  
                  <div className="flex gap-1 mb-6">
                    {[...Array(Number(testimonial.rating) || 5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-[#0284C7] text-[#0284C7]" />
                    ))}
                  </div>
                  
                  <p className="text-gray-600 leading-relaxed mb-8 flex-grow font-light z-10 relative">
                    "{testimonial.content}"
                  </p>
                  
                  <div className="mt-auto flex items-center gap-4 z-10">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-sm ${getAvatarColor(testimonial.name)}`}>
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-[#0F172A]">{testimonial.name}</h4>
                      <span className="text-sm text-gray-500 block">{testimonial.role}</span>
                    </div>
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
          
          <button className="swiper-button-prev-test absolute top-1/2 -left-2 md:-left-6 -translate-y-1/2 z-10 bg-white border border-gray-100 shadow-xl p-3 rounded-full text-[#0284C7] hover:bg-[#0284C7] hover:text-white transition-all hidden sm:flex" aria-label="Previous Slide">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button className="swiper-button-next-test absolute top-1/2 -right-2 md:-right-6 -translate-y-1/2 z-10 bg-white border border-gray-100 shadow-xl p-3 rounded-full text-[#0284C7] hover:bg-[#0284C7] hover:text-white transition-all hidden sm:flex" aria-label="Next Slide">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </section>
  );
}
