import { Helmet } from 'react-helmet-async';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { useContent } from '../contexts/ContentContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function FAQ() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const defaultFaqs = [
  {
    question: isAr ? 'ما هي أنواع الزجاج المستخدمة في الواجهات؟' : 'What types of glass are used for facades?',
    answer: isAr ? 'نستخدم بشكل أساسي زجاج السيكوريت (المقسى) لمتانته العالية ومقاومته للكسر، والزجاج المزدوج (Double Glass) لعزله الممتاز للحرارة والصوت. يتم اختيار النوع بناءً على متطلبات المشروع والمواصفات الهندسية.' : 'We primarily use tempered glass for high durability and double glass for excellent thermal and sound insulation. The type is selected based on project requirements.'
  },
  {
    question: isAr ? 'كم تستغرق عملية التركيب؟' : 'How long does installation take?',
    answer: isAr ? 'تعتمد مدة التركيب على حجم المشروع وتفاصيله. المشاريع الصغيرة مثل كبائن الشاور قد تستغرق يوماً واحداً بعد التصنيع، بينما المشاريع التجارية والواجهات قد تستغرق من عدة أيام إلى أسابيع. نقوم بتحديد جدول زمني دقيق بعد المعاينة وأخذ المقاسات.' : 'Installation time depends on the project size. Small projects like shower cabins may take a day after manufacturing, while large facades may take weeks. We provide a precise timeline after inspection.'
  },
  {
    question: isAr ? 'كيف يمكنني الحفاظ على نظافة ولمعان الزجاج؟' : 'How can I keep the glass clean and shiny?',
    answer: isAr ? 'ينصح بتنظيف الزجاج بانتظام باستخدام منظفات الزجاج المخصصة وقطعة قماش ناعمة (مايكروفايبر). تجنب استخدام المواد الكاشطة أو الأدوات الحادة التي قد تخدش السطح لتجنب تلفه.' : 'Clean the glass regularly using dedicated glass cleaners and a soft microfiber cloth. Avoid using abrasive materials or sharp tools that could scratch the surface.'
  },
  {
    question: isAr ? 'هل تقدمون ضماناً على أعمالكم؟' : 'Do you offer a warranty on your work?',
    answer: isAr ? 'نعم، نقدم ضماناً شاملاً يصل إلى 10 سنوات على جودة الزجاج المستخدم، وضماناً على جودة التركيب والإكسسوارات المستخدمة لضمان راحة بال عملائنا واستدامة المشروع.' : 'Yes, we offer a comprehensive warranty up to 10 years on glass quality, and a warranty on installation and accessories.'
  },
  {
    question: isAr ? 'هل توفرون خدمة الصيانة الدورية؟' : 'Do you provide maintenance services?',
    answer: isAr ? 'نعم، لدينا فريق متخصص لخدمات الصيانة الدورية والإصلاحات الطارئة لجميع أنواع الواجهات والأبواب الزجاجية، سواء للمشاريع التي قمنا بتنفيذها أو للمشاريع الأخرى.' : 'Yes, we have a specialized team for periodic maintenance and emergency repairs for all types of glass facades and doors.'
  }
];
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { getContent } = useContent();
  const itemsContent = getContent('faq_items');

  const faqs = useMemo(() => {
    if (itemsContent?.body) {
      try {
        const parsed = JSON.parse(itemsContent.body);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error("Failed to parse FAQ items", e);
      }
    }
    return defaultFaqs;
  }, [itemsContent]);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 bg-gray-50 relative overflow-hidden">
      
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs.map(faq => ({
              "@type": "Question",
              "name": faq.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
              }
            }))
          })}
        </script>
      </Helmet>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-[#0ea5e9] text-sm font-bold tracking-widest uppercase mb-4">{isAr ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}</h2>
          <h3 className="text-4xl md:text-5xl font-extrabold text-[#0F172A] leading-tight tracking-tight">
            إجابات لاستفساراتكم
          </h3>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-white border border-gray-100 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-[#0ea5e9]/30 transition-all duration-300"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex justify-between items-center p-6 text-right focus:outline-none"
              >
                <span className="font-bold text-lg text-[#0F172A]">{faq.question}</span>
                <ChevronDown 
                  className={`h-6 w-6 text-[#0ea5e9] transition-transform duration-300 flex-shrink-0 ${openIndex === index ? 'rotate-180' : ''}`}
                />
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="p-6 pt-0 text-gray-600 leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
