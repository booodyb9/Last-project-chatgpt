import { useMemo } from 'react';
import { Shield, Clock, Wrench, ThumbsUp, Medal, Gem } from 'lucide-react';
import { motion } from 'motion/react';
import { useContent } from '../contexts/ContentContext';
import { useLanguage } from '../contexts/LanguageContext';

const renderIcon = (iconName: string | undefined, index: number) => {
  const props = { className: "h-6 w-6" };
  const fallbackIcons = [
    <Shield {...props} />,
    <Clock {...props} />,
    <Wrench {...props} />,
    <ThumbsUp {...props} />,
  ];
  
  if (!iconName) return fallbackIcons[index % fallbackIcons.length];
  
  switch (iconName) {
    case 'Shield': return <Shield {...props} />;
    case 'Clock': return <Clock {...props} />;
    case 'Wrench': return <Wrench {...props} />;
    case 'ThumbsUp': return <ThumbsUp {...props} />;
    case 'Medal': return <Medal {...props} />;
    case 'Gem': return <Gem {...props} />;
    default: return fallbackIcons[index % fallbackIcons.length];
  }
};

export default function Features() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const defaultFeatures = [
  {
    icon: 'Shield',
    title: isAr ? 'جودة لا تضاهى' : 'Unmatched Quality',
    description: isAr ? 'نستخدم أفضل أنواع الزجاج المطابق للمواصفات السعودية والعالمية.' : 'We use the finest glass types matching local and international standards.'
  },
  {
    icon: 'Clock',
    title: isAr ? 'التزام بالمواعيد' : 'On-Time Delivery',
    description: isAr ? 'نقدر وقت عملائنا، لذا نحرص على تسليم المشاريع في الوقت المتفق عليه.' : 'We value your time, delivering projects strictly on schedule.'
  },
  {
    icon: 'Wrench',
    title: isAr ? 'فريق محترف' : 'Professional Team',
    description: isAr ? 'لدينا طاقم من المهندسين والفنيين ذوي الخبرة الطويلة في التركيب.' : 'Our team consists of highly experienced engineers and technicians.'
  },
  {
    icon: 'ThumbsUp',
    title: isAr ? 'أسعار تنافسية' : 'Competitive Prices',
    description: isAr ? 'نقدم أفضل الأسعار في سوق الرياض مع الحفاظ على أعلى معايير الجودة.' : 'We offer the best prices in the Riyadh market while maintaining highest quality standards.'
  }
];
  const { getContent } = useContent();
  const introContent = getContent('features_intro');
  const itemsContent = getContent('features_items');
  const imageContent = getContent('features_image');

  const features = useMemo(() => {
    if (itemsContent?.body) {
      try {
        const parsed = JSON.parse(itemsContent.body);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error("Failed to parse features items", e);
      }
    }
    return defaultFeatures;
  }, [itemsContent]);

  const featureImage = useMemo(() => {
    if (imageContent?.body) {
      try {
        const parsed = JSON.parse(imageContent.body);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].image && typeof parsed[0].image === 'string' && parsed[0].image.trim() !== '') {
          return parsed[0].image;
        }
      } catch (e) {}
    }
    return "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=2069&auto=format&fit=crop";
  }, [imageContent]);

  return (
    <section id="why" className="py-24 bg-white relative overflow-hidden">
      {/* Decorative abstract elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gray-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* Text Content */}
          <div className="lg:w-1/2 w-full">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-[#0ea5e9] text-sm font-bold tracking-widest uppercase mb-4">
                لماذا تختارنا
              </h2>
              <h3 className="text-4xl md:text-5xl font-extrabold text-[#0F172A] leading-[1.2] mb-6">
                شريكك الموثوق <br /> في أعمال الزجاج
              </h3>
              
              {introContent?.body ? (
                <div className="prose prose-lg text-gray-500 mb-10 font-light" dangerouslySetInnerHTML={{ __html: introContent.body }} />
              ) : (
                <p className="text-lg text-gray-500 mb-10 leading-relaxed font-light">
                  في شركة زجاج الرياض، لا نكتفي بتركيب الزجاج فحسب، بل نصنع واجهات تعكس هوية مشروعك. نجمع بين الحرفية العالية والتكنولوجيا الحديثة لنقدم لك نتائج تفوق التوقعات.
                </p>
              )}

              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-12"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
                }}
              >
                {features.map((feature, index) => (
                  <motion.div 
                    key={index} 
                    className="flex gap-4 group"
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
                    }}
                  >
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 bg-gray-50 text-[#0F172A] rounded-2xl flex items-center justify-center group-hover:bg-[#0ea5e9] group-hover:text-white transition-colors duration-300 shadow-sm border border-gray-100">
                        {renderIcon(feature.icon, index)}
                      </div>
                    </div>
                    <div className="pt-2">
                      <h4 className="text-lg font-bold text-[#0F172A] mb-2 group-hover:text-[#0ea5e9] transition-colors">{feature.title}</h4>
                      <p className="text-sm text-gray-500 leading-relaxed font-light">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
          
          {/* Image & Stats */}
          <div className="lg:w-1/2 w-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
              whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative"
            >
              {/* Premium Image Container */}
              <div className="aspect-[4/5] md:aspect-square overflow-hidden rounded-[2.5rem] shadow-2xl relative">
                <img loading="lazy" decoding="async"
                  src={featureImage}
                  alt="Modern office interior with glass partitions"
                  className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-[10000ms] ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/80 via-transparent to-transparent"></div>
                
                {/* Floating Stats */}
                <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-10">
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 flex justify-between items-center shadow-lg">
                    <div className="text-center">
                      <p className="text-3xl font-extrabold text-white mb-1">+500</p>
                      <p className="text-[10px] sm:text-xs text-white/70 uppercase tracking-widest font-bold">مشروع منجز</p>
                    </div>
                    <div className="w-px h-12 bg-white/20"></div>
                    <div className="text-center">
                      <p className="text-3xl font-extrabold text-[#0ea5e9] mb-1">15</p>
                      <p className="text-[10px] sm:text-xs text-white/70 uppercase tracking-widest font-bold">سنة خبرة</p>
                    </div>
                    <div className="w-px h-12 bg-white/20"></div>
                    <div className="text-center">
                      <p className="text-3xl font-extrabold text-white mb-1">%100</p>
                      <p className="text-[10px] sm:text-xs text-white/70 uppercase tracking-widest font-bold">رضا العملاء</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative Element */}
              <div className="absolute -z-10 -bottom-8 -right-8 w-64 h-64 bg-dots-pattern opacity-10"></div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
