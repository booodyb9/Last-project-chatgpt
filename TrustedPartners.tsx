import { useMemo } from 'react';
import { motion } from 'motion/react';
import { useContent } from '../contexts/ContentContext';
import { useLanguage } from '../contexts/LanguageContext';

const defaultPartners = [
  { name: 'شركة أرامكو', logo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=100&fit=crop' },
  { name: 'سابك', logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&h=100&fit=crop' },
  { name: 'بنك الراجحي', logo: 'https://images.unsplash.com/photo-1598449426314-8b01bb326e6d?w=200&h=100&fit=crop' },
  { name: 'الاتصالات السعودية', logo: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=200&h=100&fit=crop' },
  { name: 'نيوم', logo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=100&fit=crop' },
  { name: 'موبايلي', logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&h=100&fit=crop' },
];

export default function TrustedPartners() {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const { getContent } = useContent();
  const partnersContent = getContent('trusted_partners');

  const partners = useMemo(() => {
    if (partnersContent?.body) {
      try {
        const parsed = JSON.parse(partnersContent.body);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter((p: any) => p.logo && typeof p.logo === 'string' && p.logo.trim() !== '');
        }
      } catch (e) {
        console.error("Failed to parse trusted partners", e);
      }
    }
    return defaultPartners;
  }, [partnersContent]);

  return (
    <section id="partners" className="py-20 bg-gray-50 border-y border-gray-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-center">
        <h2 className="text-[#0ea5e9] text-sm font-bold tracking-widest uppercase mb-4">{isAr ? 'شركاء' : 'Trusted'} {isAr ? 'النجاح' : 'Partners'}</h2>
        <h3 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] tracking-tight">نفتخر بالتعاون مع كبرى الشركات</h3>
      </div>
      
      <div className="relative flex overflow-x-hidden">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-12 py-4">
          {[...partners, ...partners, ...partners].map((partner, index) => (
            <div key={index} className="w-48 h-24 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] flex items-center justify-center p-4 filter grayscale hover:grayscale-0 transition-all duration-500 border border-gray-100 hover:-translate-y-1">
              <img loading="lazy" decoding="async" src={partner.logo} alt={partner.name || 'صورة'} className="max-w-full max-h-full object-contain opacity-70 hover:opacity-100" />
            </div>
          ))}
        </div>
        <div className="absolute top-0 animate-marquee2 whitespace-nowrap flex items-center gap-12 py-4">
          {[...partners, ...partners, ...partners].map((partner, index) => (
            <div key={index} className="w-48 h-24 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] flex items-center justify-center p-4 filter grayscale hover:grayscale-0 transition-all duration-500 border border-gray-100 hover:-translate-y-1">
              <img loading="lazy" decoding="async" src={partner.logo} alt={partner.name || 'صورة'} className="max-w-full max-h-full object-contain opacity-70 hover:opacity-100" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
