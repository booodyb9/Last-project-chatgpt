import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { motion } from 'motion/react';
import { Home, Building, Maximize, Droplets, LayoutGrid, Store, ArrowLeft } from 'lucide-react';
import LazyImage from './LazyImage';
import { useContent } from '../contexts/ContentContext';
import { useLanguage } from '../contexts/LanguageContext';

const renderIcon = (iconName: string) => {
  switch(iconName) {
    case 'Building2': return <Building className="w-5 h-5" />;
    case 'Briefcase': return <Store className="w-5 h-5" />;
    case 'Droplets': return <Droplets className="w-5 h-5" />;
    case 'LayoutGrid': return <LayoutGrid className="w-5 h-5" />;
    case 'DoorOpen': return <Home className="w-5 h-5" />;
    case 'Maximize': return <Maximize className="w-5 h-5" />;
    default: return <Building className="w-5 h-5" />;
  }
};

export default function Services() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const defaultServices = [
    {
      title: isAr ? 'واجهات زجاجية' : 'Glass Facades',
      description: isAr ? 'تركيب واجهات كرتن وول وستركشر للمباني التجارية والسكنية.' : 'Curtain wall and structural glass installations for commercial and residential buildings.',
      icon: 'Building2',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800'
    },
    {
      title: isAr ? 'قواطع مكتبية' : 'Office Partitions',
      description: isAr ? 'قواطع زجاجية ذكية وعادية لتقسيم المساحات المكتبية بأناقة.' : 'Smart and regular glass partitions for elegant office space division.',
      icon: 'Briefcase',
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800'
    },
    {
      title: isAr ? 'كبائن شاور' : 'Shower Cabins',
      description: isAr ? 'تفصيل وتركيب كبائن شاور للحمامات بتصاميم عصرية.' : 'Custom shower cabin design and installation with modern styles.',
      icon: 'Droplets',
      image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800'
    },
    {
      title: isAr ? 'درابزين زجاجي' : 'Glass Handrails',
      description: isAr ? 'درابزين زجاجي للسلالم والشرفات يضفي اتساعاً وجمالاً.' : 'Glass handrails for stairs and balconies adding space and beauty.',
      icon: 'LayoutGrid',
      image: 'https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&q=80&w=800'
    },
    {
      title: isAr ? 'أبواب زجاجية' : 'Glass Doors',
      description: isAr ? 'أبواب سيكوريت مفصلية وسحابة وأنظمة أوتوماتيكية.' : 'Hinged, sliding, and automatic secure glass doors.',
      icon: 'DoorOpen',
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800'
    },
    {
      title: isAr ? 'مرايا ديكورية' : 'Decorative Mirrors',
      description: isAr ? 'قص وتركيب المرايا الديكورية المضيئة والعادية بمقاسات مختلفة.' : 'Cutting and installation of decorative, LED, and regular mirrors in various sizes.',
      icon: 'Maximize',
      image: 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&q=80&w=800'
    }
  ];

  const phoneNumber = "966510233706";
  const { getContent } = useContent();
  const introContent = getContent('services_intro');
  const itemsContent = getContent('services_items');
  
  const services = useMemo(() => {
    if (itemsContent?.body) {
      try {
        const parsed = JSON.parse(itemsContent.body);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error("Failed to parse services items", e);
      }
    }
    return defaultServices;
  }, [itemsContent]);

  return (
    <section id="services" className="py-24 bg-gray-50 relative overflow-hidden">
      {/* Premium Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-blue-100/50 to-transparent blur-3xl rounded-full pointer-events-none opacity-60"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <h2 className="text-[#0284C7] text-sm font-bold uppercase tracking-widest mb-4">
            {isAr ? 'خدماتنا' : 'Our Services'}
          </h2>
          <h3 className="text-4xl md:text-5xl font-extrabold text-[#0F172A] leading-[1.15] mb-6 tracking-tight">
            حلول هندسية متكاملة <br /> للواجهات والقواطع
          </h3>
          
          {introContent?.body ? (
            <div className="prose prose-lg mx-auto text-gray-500 mb-8" dangerouslySetInnerHTML={{ __html: introContent.body }} />
          ) : (
            <p className="text-lg text-gray-500 mb-8 font-light">
              نقدم مجموعة واسعة من خدمات تركيب الزجاج باستخدام أفضل الخامات العالمية وبأيدي فنيين محترفين، لتلبية كافة متطلبات المشاريع السكنية والتجارية.
            </p>
          )}
        </motion.div>

        

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-16">
          {services.filter((s: any) => !s.isHidden).map((service: any, index: number) => {
            const isFeatured = index === 0;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: (index % 6) * 0.1 }}
                className={`group relative bg-slate-50 rounded-3xl overflow-hidden shadow-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 flex flex-col hover:-translate-y-1 ${isFeatured ? 'md:col-span-2 md:row-span-2 min-h-[450px] md:min-h-[600px]' : 'col-span-1 min-h-[400px]'}`}
              >
                <div className="absolute inset-0 w-full h-full">
                  {service.image && typeof service.image === 'string' && service.image.trim() !== '' && (
                    <LazyImage 
                      src={service.image}
                      alt={service.title || 'صورة الخدمة'}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-80" />
                </div>

                <div className="absolute top-4 left-4 z-20">
                  <a
                    href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(`مرحباً، أود الاستفسار عن خدمة ${service.title}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative flex items-center justify-center w-11 h-11 bg-white/70 hover:bg-white/95 backdrop-blur-md rounded-full shadow-lg border border-white/50 transition-all duration-300 group/wa hover:scale-105 active:scale-95"
                    aria-label="تواصل عبر واتساب"
                  >
                    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-[#25D366]" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                    </svg>
                    <span className="absolute right-full mr-3 px-3 py-1.5 bg-slate-900/90 backdrop-blur-sm text-white text-xs font-medium rounded-lg opacity-0 group-hover/wa:opacity-100 transition-opacity whitespace-nowrap pointer-events-none hidden md:block">
                      اطلب عبر واتساب
                    </span>
                  </a>
                </div>

                <div className="relative mt-auto p-3 md:p-5 z-10 w-full">
                  <div className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.06)] transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center shrink-0">
                        <div className="text-sky-600">
                          {renderIcon(service.icon)}
                        </div>
                      </div>
                      <h4 className={`font-bold text-slate-900 group-hover:text-sky-600 transition-colors ${isFeatured ? 'text-xl md:text-2xl' : 'text-lg'}`}>
                        {service.title}
                      </h4>
                    </div>
                    
                    <p className="text-slate-600 text-sm leading-relaxed mb-4 font-medium line-clamp-2">
                      {service.description}
                    </p>
                    
                    <div className="pt-3 border-t border-slate-100/80">
                      <Link 
                        to={`/services/${service.slug || service.title.replace(/\s+/g, '-').toLowerCase()}`}
                        className="inline-flex items-center gap-2 text-slate-900 font-bold hover:text-sky-600 transition-colors group/link text-sm"
                      >
                        عرض الخدمة
                        <ArrowLeft className="w-4 h-4 transform group-hover/link:-translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-16"
        >
          <p className="text-slate-600 font-medium text-lg">لم تجد الخدمة المناسبة؟</p>
          <a
            href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent('مرحباً، لدي استفسار عن خدمات الزجاج.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 font-bold rounded-xl transition-colors shadow-lg"
          >
            تحدث مع مختص
            <ArrowLeft className="w-5 h-5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
