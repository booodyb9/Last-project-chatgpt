import { useMemo } from 'react';
import { motion } from 'motion/react';
import { PhoneCall, Ruler, Hammer, Wrench, CheckCircle } from 'lucide-react';
import { useContent } from '../contexts/ContentContext';
import { useLanguage } from '../contexts/LanguageContext';

const renderIcon = (iconName: string | undefined, index: number) => {
  const props = { className: "h-6 w-6" };
  const fallbackIcons = [
    <PhoneCall {...props} />,
    <Ruler {...props} />,
    <Hammer {...props} />,
    <Wrench {...props} />,
    <CheckCircle {...props} />,
  ];
  
  if (!iconName) return fallbackIcons[index % fallbackIcons.length];
  
  switch (iconName) {
    case 'PhoneCall': return <PhoneCall {...props} />;
    case 'Ruler': return <Ruler {...props} />;
    case 'Hammer': return <Hammer {...props} />;
    case 'Wrench': return <Wrench {...props} />;
    case 'CheckCircle': return <CheckCircle {...props} />;
    default: return fallbackIcons[index % fallbackIcons.length];
  }
};

export default function Process() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const defaultSteps = [
  {
    icon: 'PhoneCall',
    title: isAr ? 'الاستشارة والاتفاق' : 'Consultation & Agreement',
    description: isAr ? 'تواصل معنا لمناقشة متطلبات مشروعك، وسنقدم لك أفضل الحلول والخيارات المناسبة لميزانيتك وتفضيلاتك.' : 'Contact us to discuss your project requirements, and we will provide the best solutions and options fitting your budget and preferences.',
  },
  {
    icon: 'Ruler',
    title: isAr ? 'أخذ المقاسات' : 'Measurements',
    description: isAr ? 'يقوم فريقنا الفني بزيارة الموقع لأخذ المقاسات الدقيقة والرفع المساحي لضمان دقة التصنيع.' : 'Our technical team visits the site to take precise measurements and surveys to ensure manufacturing accuracy.',
  },
  {
    icon: 'Hammer',
    title: isAr ? 'التصنيع والقص' : 'Manufacturing & Cutting',
    description: isAr ? 'يتم قص وتجهيز الزجاج في مصانعنا بأحدث التقنيات لضمان أعلى معايير الجودة والصلابة.' : 'Glass is cut and prepared in our factories using the latest technologies to ensure the highest standards of quality and durability.',
  },
  {
    icon: 'Wrench',
    title: isAr ? 'التركيب' : 'Installation',
    description: isAr ? 'يقوم فريق التركيب المتخصص لدينا بتركيب الزجاج والإكسسوارات باحترافية عالية وفي الوقت المحدد.' : 'Our specialized installation team installs the glass and accessories with high professionalism and on time.',
  },
  {
    icon: 'CheckCircle',
    title: isAr ? 'التسليم والضمان' : 'Delivery & Warranty',
    description: isAr ? 'يتم تنظيف الموقع وتسليم العمل مع تقديم شهادة الضمان الشامل على جودة الزجاج والتركيب.' : 'The site is cleaned and the work is delivered along with a comprehensive warranty certificate on glass quality and installation.',
  }
];
  const { getContent } = useContent();
  const itemsContent = getContent('process_items');

  const steps = useMemo(() => {
    if (itemsContent?.body) {
      try {
        const parsed = JSON.parse(itemsContent.body);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error("Failed to parse process items", e);
      }
    }
    return defaultSteps;
  }, [itemsContent]);

  return (
    <section id="process" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <h2 className="text-[#0ea5e9] text-sm font-bold tracking-widest uppercase mb-4">{isAr ? 'آلية العمل' : 'How We Work'}</h2>
          <h3 className="text-4xl md:text-5xl font-extrabold text-[#0F172A] leading-tight tracking-tight">
            خطوات التنفيذ
          </h3>
          <p className="text-gray-600 mt-6 leading-relaxed">
            نتبع منهجية عمل واضحة لضمان تسليم مشاريعكم بأعلى جودة وفي الوقت المحدد.
          </p>
        </motion.div>

        <div className="relative mt-12">
          {/* Timeline Line (Desktop only) */}
          <div className="hidden lg:block absolute top-10 left-[10%] right-[10%] h-0.5 bg-gray-100 z-0"></div>
          
          <div className={`grid grid-cols-1 lg:grid-cols-${steps.length} gap-12 lg:gap-8 relative z-10`}>
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex flex-col items-center text-center group"
              >
                <div className="w-24 h-24 bg-white border border-gray-100 rounded-full flex items-center justify-center text-[#0ea5e9] shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-8 relative group-hover:scale-110 transition-transform duration-500">
                  {renderIcon(step.icon, index)}
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#0F172A] text-white text-sm font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                    {index + 1}
                  </div>
                </div>
                <h4 className="text-xl font-bold text-[#0F172A] mb-3">{step.title}</h4>
                <p className="text-sm text-gray-500 leading-relaxed max-w-[250px] mx-auto">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
