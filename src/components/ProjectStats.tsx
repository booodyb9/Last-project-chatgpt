import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { useContent } from '../contexts/ContentContext';

import { TrendingUp, Users, CheckCircle, Clock } from 'lucide-react';
import { useMemo } from 'react';

export default function ProjectStats() {
  const { language } = useLanguage();
  const { getContent } = useContent();
  const statsContent = getContent('project_stats');
  
  const statsCards = useMemo(() => {
    if (statsContent?.body) {
      try {
        const parsed = JSON.parse(statsContent.body);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [];
  }, [statsContent]);
  
  const getIcon = (name: string) => {
    switch(name?.toLowerCase()) {
      case 'users': return <Users className="w-8 h-8 text-[#0284C7]" />;
      case 'checkcircle': return <CheckCircle className="w-8 h-8 text-[#0284C7]" />;
      case 'clock': return <Clock className="w-8 h-8 text-[#0284C7]" />;
      default: return <TrendingUp className="w-8 h-8 text-[#0284C7]" />;
    }
  };

  const timelineDataAr = [
    { name: 'واجهات', days: 14 },
    { name: 'قواطع مكتبية', days: 7 },
    { name: 'كبائن شاور', days: 3 },
    { name: 'درابزين زجاجي', days: 5 },
    { name: 'مرايا', days: 2 },
  ];

  const timelineDataEn = [
    { name: 'Facades', days: 14 },
    { name: 'Partitions', days: 7 },
    { name: 'Shower Cabins', days: 3 },
    { name: 'Glass Handrails', days: 5 },
    { name: 'Mirrors', days: 2 },
  ];

  const efficiencyDataAr = [
    { year: '2020', efficiency: 85, savings: 10 },
    { year: '2021', efficiency: 88, savings: 15 },
    { year: '2022', efficiency: 92, savings: 20 },
    { year: '2023', efficiency: 96, savings: 25 },
    { year: '2024', efficiency: 99, savings: 30 },
  ];

  const efficiencyDataEn = [
    { year: '2020', efficiency: 85, savings: 10 },
    { year: '2021', efficiency: 88, savings: 15 },
    { year: '2022', efficiency: 92, savings: 20 },
    { year: '2023', efficiency: 96, savings: 25 },
    { year: '2024', efficiency: 99, savings: 30 },
  ];

  const timelineData = language === 'ar' ? timelineDataAr : timelineDataEn;
  const efficiencyData = language === 'ar' ? efficiencyDataAr : efficiencyDataEn;

  return (
    <section id="stats" className="py-24 bg-transparent relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-[#0284C7] text-sm font-bold tracking-widest uppercase mb-3">
            {language === 'ar' ? 'إحصائيات وكفاءة' : 'Stats & Efficiency'}
          </h2>
          <h3 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] leading-tight mb-4">
            {language === 'ar' ? 'أداء مثبت وتوفير مستدام' : 'Proven Performance & Sustainable Savings'}
          </h3>
          <p className="text-gray-600 leading-relaxed">
            {language === 'ar'
              ? 'نلتزم بتقديم أسرع أوقات للتنفيذ مع أعلى معايير الكفاءة في استخدام المواد وتقليل الهدر، مما يضمن لك توفيراً في الوقت والتكلفة.'
              : 'We commit to providing the fastest execution times with the highest standards of material efficiency and waste reduction, ensuring you save time and money.'}
          </p>
        </motion.div>

        {statsCards.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {statsCards.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="bg-white rounded-3xl p-8 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] border border-gray-100 transition-all duration-500 hover:-translate-y-1"
              >
                <div className="mx-auto w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                  {getIcon(stat.icon)}
                </div>
                <h4 className="text-3xl font-extrabold text-[#0F172A] mb-2" dir="ltr">{stat.value}</h4>
                <p className="text-gray-600 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Timeline Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100"
          >
            <h4 className="text-xl font-bold text-[#0F172A] mb-6 text-center">
              {language === 'ar' ? 'متوسط وقت تنفيذ المشاريع (بالأيام)' : 'Average Project Timeline (Days)'}
            </h4>
            <div className="h-80 w-full" dir="ltr">
              <div width="100%" height="100%">
                <div
                  data={timelineData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  
                  
                  
                  
                  
                </div>
              </div>
            </div>
          </motion.div>

          {/* Efficiency Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100"
          >
            <h4 className="text-xl font-bold text-[#0F172A] mb-6 text-center">
              {language === 'ar' ? 'تطور كفاءة استخدام المواد والتوفير (%)' : 'Material Efficiency & Savings Progress (%)'}
            </h4>
            <div className="h-80 w-full" dir="ltr">
              <div width="100%" height="100%">
                <div
                  data={efficiencyData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  
                  
                  
                  
                  
                  
                  
                  
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
