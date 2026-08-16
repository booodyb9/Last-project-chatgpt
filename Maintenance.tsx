import { motion } from 'motion/react';
import { Droplets, Sparkles, ShieldCheck, Download, FileText } from 'lucide-react';

const tips = [
  {
    icon: <ShieldCheck className="h-6 w-6" />,
    title: 'الزجاج المقسى (السيكوريت)',
    content: 'استخدم منظفات غير كاشطة وقطعة قماش ناعمة. تجنب استخدام الشفرات أو الأدوات الحادة لإزالة البقع الصعبة لتفادي خدش السطح.'
  },
  {
    icon: <Sparkles className="h-6 w-6" />,
    title: 'المرايا الديكورية',
    content: 'تجنب رش المنظف مباشرة على المرآة حتى لا يتسرب للأطراف ويفسد طبقة الفضة. رش المنظف المخصص على القماش ثم امسح المرآة بلطف.'
  },
  {
    icon: <Droplets className="h-6 w-6" />,
    title: 'كبائن الشاور',
    content: 'امسح الزجاج بعد كل استحمام بممسحة مطاطية لمنع تراكم بقع الماء والصابون وتكون التكلسات. يمكن استخدام الخل الأبيض المخفف للبقع الصعبة.'
  }
];

export default function Maintenance() {
  return (
    <section id="maintenance" className="py-24 bg-[#0F172A] text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/3">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-[#0284C7] text-sm font-bold tracking-widest uppercase mb-3">دليل العناية</h2>
              <h3 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight">
                كيف تحافظ على لمعان الزجاج؟
              </h3>
              <p className="text-gray-400 mb-8 leading-relaxed">
                الزجاج النظيف والمشرق يضفي جمالاً على المساحة. اتبع هذه النصائح البسيطة للحفاظ على واجهات ونوافذ منزلك ومكتبك بأفضل حالة لأطول فترة ممكنة.
              </p>
              
              <button className="flex items-center gap-3 bg-transparent border-2 border-white px-8 py-4 font-bold hover:bg-white hover:text-[#0F172A] transition-colors w-full sm:w-auto justify-center group">
                <Download className="h-5 w-5" />
                <span>تحميل دليل العناية الشامل (PDF)</span>
              </button>
            </motion.div>
          </div>

          <div className="lg:w-2/3 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tips.map((tip, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`bg-white/5 border border-white/10 p-8 hover:bg-white/10 transition-colors ${index === 2 ? 'md:col-span-2' : ''}`}
                >
                  <div className="w-12 h-12 bg-[#0284C7]/20 text-[#0284C7] flex items-center justify-center mb-6 rounded-sm">
                    {tip.icon}
                  </div>
                  <h4 className="text-xl font-bold mb-3">{tip.title}</h4>
                  <p className="text-gray-400 leading-relaxed text-sm">
                    {tip.content}
                  </p>
                </motion.div>
              ))}
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-[#0284C7] p-8 flex flex-col justify-center items-center text-center border border-[#0284C7] md:col-span-2 lg:col-span-1 hidden md:flex lg:hidden"
              >
                 <FileText className="h-10 w-10 mb-4 opacity-80" />
                 <h4 className="text-xl font-bold mb-2">استشارات مجانية</h4>
                 <p className="text-sm opacity-90">فريقنا جاهز للإجابة على جميع استفساراتك حول الصيانة والعناية بالزجاج.</p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
