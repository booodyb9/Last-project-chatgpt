import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calculator, ArrowLeft, Ruler, ChevronDown, Info } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const glassTypes = [
  { id: 'clear-10', name: 'زجاج شفاف سيكوريت 10 ملم', minPrice: 150, maxPrice: 250, description: 'زجاج معالج حرارياً مقاوم للصدمات، مثالي للواجهات والأبواب الداخلية.' },
  { id: 'clear-12', name: 'زجاج شفاف سيكوريت 12 ملم', minPrice: 200, maxPrice: 300, description: 'أكثر سماكة وأماناً، يستخدم للواجهات الخارجية والأبواب الكبيرة.' },
  { id: 'frosted-10', name: 'زجاج مثلج سيكوريت 10 ملم', minPrice: 180, maxPrice: 280, description: 'يوفر الخصوصية مع السماح بمرور الضوء، مناسب لقواطع المكاتب ودورات المياه.' },
  { id: 'double', name: 'زجاج مزدوج (عازل حراري وصوتي)', minPrice: 300, maxPrice: 450, description: 'لوحين من الزجاج بينهما غاز عازل لتقليل انتقال الحرارة والصوت بشكل كبير.' },
  { id: 'tinted', name: 'زجاج سيكوريت ملون', minPrice: 250, maxPrice: 350, description: 'زجاج مصبوغ يقلل من وهج الشمس ويضفي لمسة جمالية، متوفر بعدة ألوان.' },
  { id: 'mirror', name: 'مرايا جدارية ديكورية', minPrice: 120, maxPrice: 200, description: 'مرايا نقية وعالية الجودة تعكس الإضاءة وتعطي اتساعاً للمكان.' },
];

export default function CostCalculator() {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const [selectedGlass, setSelectedGlass] = useState(glassTypes[0].id);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedType = glassTypes.find(g => g.id === selectedGlass) || glassTypes[0];
  
  const widthNum = parseFloat(width) || 0;
  const heightNum = parseFloat(height) || 0;
  const area = widthNum * heightNum;
  const estimatedMin = Math.round(area * selectedType.minPrice);
  const estimatedMax = Math.round(area * selectedType.maxPrice);
  const isCalculated = area > 0;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="bg-white border border-gray-100 rounded-3xl shadow-[0_20px_60px_rgb(0,0,0,0.08)] overflow-hidden max-w-4xl mx-auto"
    >
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="p-8 md:p-10 bg-[#0F172A] text-white flex flex-col justify-center">
          <div className="w-14 h-14 bg-white/10 text-[#0ea5e9] flex items-center justify-center mb-6 rounded-2xl shadow-inner border border-white/5">
            <Calculator className="h-6 w-6" />
          </div>
          <h3 className="text-2xl font-bold mb-4">{isAr ? 'حاسبة التكلفة التقديرية' : 'Estimated Cost Calculator'}</h3>
          <p className="text-gray-400 mb-8 leading-relaxed text-sm">
            {isAr ? 'احصل على تقدير مبدئي لتكلفة مشروعك. أدخل الأبعاد ونوع الزجاج المطلوب للحصول على النتيجة فوراً. السعر النهائي يعتمد على المعاينة الميدانية والإكسسوارات المستخدمة.' : 'Get an initial estimate for your project. Enter dimensions and glass type for instant results. Final price depends on site inspection and accessories used.'}
          </p>

          <AnimatePresence mode="wait">
            {isCalculated ? (
              <motion.div 
                key="result"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white/5 border border-white/10 p-6 rounded-sm"
              >
                <div className="text-sm text-gray-400 mb-2">التكلفة التقديرية (ريال سعودي)</div>
                <div className="text-4xl font-extrabold text-[#0ea5e9] mb-2 flex items-baseline gap-2">
                  <span>{estimatedMin.toLocaleString()}</span>
                  <span className="text-lg text-gray-400 font-normal">-</span>
                  <span>{estimatedMax.toLocaleString()}</span>
                </div>
                <div className="text-sm text-gray-400 flex justify-between">
                  <span>المساحة الإجمالية:</span>
                  <span className="font-bold text-white">{area.toFixed(2)} متر مربع</span>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white/5 border border-white/10 border-dashed p-6 rounded-sm text-center text-gray-500"
              >
                أدخل الأبعاد لرؤية التكلفة التقديرية
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-8 md:p-10">
          <div className="space-y-6">
            <div ref={dropdownRef} className="relative z-20">
              <label htmlFor="glass-type" className="block text-sm font-bold text-gray-700 mb-2">نوع الزجاج</label>
              <button 
                id="glass-type"
                type="button"
                aria-haspopup="listbox"
                aria-expanded={isDropdownOpen}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center justify-between bg-gray-50 rounded-xl border border-gray-200 text-gray-900 p-3 focus:outline-none focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 transition-all"
              >
                <span>{selectedType.name}</span>
                <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-100 shadow-xl max-h-60 overflow-y-auto z-30"
                  >
                    {glassTypes.map(type => (
                      <div 
                        key={type.id}
                        className={`p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 border-b border-gray-50 last:border-0 ${selectedGlass === type.id ? 'bg-[#0284C7]/5 text-[#0ea5e9] font-bold' : 'text-gray-700'}`}
                        onClick={() => {
                          setSelectedGlass(type.id);
                          setIsDropdownOpen(false);
                        }}
                      >
                        <span>{type.name}</span>
                        <div className="relative group p-1" onClick={(e) => e.stopPropagation()}>
                          <Info className="h-4 w-4 text-gray-400 group-hover:text-[#0ea5e9] transition-colors" />
                          <div className="absolute top-full end-0 mt-2 hidden group-hover:block w-48 bg-[#0F172A] text-white text-xs p-3 rounded-sm shadow-xl z-50 pointer-events-none">
                            <div className="absolute -top-1 end-2 w-2 h-2 bg-[#0F172A] transform rotate-45"></div>
                            {type.description}
                          </div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="grid grid-cols-2 gap-4 relative z-10">
              <div>
                <label htmlFor="calc-width" className="block text-sm font-bold text-gray-700 mb-2">العرض (متر)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 start-0 pl-3 flex items-center pointer-events-none text-gray-400 ms-3">
                    <Ruler className="h-4 w-4" />
                  </div>
                  <input 
                    id="calc-width"
                    type="number" 
                    min="0"
                    step="0.1"
                    placeholder="مثال: 3.5"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    className="w-full bg-gray-50 rounded-xl border border-gray-200 text-gray-900 p-3 pl-10 focus:outline-none focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 transition-all"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="calc-height" className="block text-sm font-bold text-gray-700 mb-2">الارتفاع (متر)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 start-0 pl-3 flex items-center pointer-events-none text-gray-400 ms-3">
                    <Ruler className="h-4 w-4" />
                  </div>
                  <input 
                    id="calc-height"
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="مثال: 2.8"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full bg-gray-50 rounded-xl border border-gray-200 text-gray-900 p-3 pl-10 focus:outline-none focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 mt-6 border-t border-gray-100 relative z-10">
              <a 
                href="#contact"
                className="w-full flex items-center justify-center gap-2 bg-[#0F172A] text-white p-4 font-bold rounded-xl hover:bg-[#0ea5e9] transition-all duration-300 group shadow-lg hover:shadow-[#0ea5e9]/20"
              >
                <span>طلب تسعيرة دقيقة</span>
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              </a>
              <p className="text-xs text-gray-500 text-center mt-3">
                * هذه الحاسبة تعطي سعراً تقريبياً ولا تعتبر عرض سعر نهائي.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
