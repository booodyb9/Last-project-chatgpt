import { useEffect, useState } from 'react';
import { useContent } from '../../contexts/ContentContext';
import { saveContent } from '../../lib/supabase';
import { LayoutTemplate, Eye, EyeOff, Save } from 'lucide-react';
import { safeParseJson } from '../../lib/safeJson';

const AVAILABLE_SECTIONS = [
  { id: 'hero', label: 'البانر الرئيسي (Hero)' },
  { id: 'gallery_slider', label: 'المعرض المنزلق (Gallery Slider)' },
  { id: 'services', label: 'الخدمات (Services)' },
  { id: 'portfolio', label: 'معرض الأعمال (Portfolio)' },
  { id: 'features', label: 'المميزات / لماذا نحن' },
  { id: 'process', label: 'خطوات العمل (Process)' },
  { id: 'stats', label: 'الإحصائيات (Stats)' },
  { id: 'partners', label: 'شركاء النجاح (Partners)' },
  { id: 'testimonials', label: 'آراء العملاء (Testimonials)' },
  { id: 'faq', label: 'الأسئلة الشائعة (FAQ)' },
  { id: 'blog', label: 'المدونة (Blog)' },
  { id: 'contact', label: 'تواصل معنا (Contact)' }
];

export default function HomepageBuilder() {
  const { getContent, updateContent, refreshContent } = useContent();
  const savedBody = getContent('homepage_sections')?.body;
  const [sections, setSections] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const parsed = safeParseJson<any[]>(savedBody, []);
    if (Array.isArray(parsed) && parsed.length) {
      const known = new Map(AVAILABLE_SECTIONS.map((s) => [s.id, s]));
      const normalized = parsed
        .filter((section) => known.has(section.id))
        .map((section) => ({ ...known.get(section.id), ...section, isVisible: section.isVisible !== false }));
      const present = new Set(normalized.map((section) => section.id));
      const missing = AVAILABLE_SECTIONS.filter((section) => !present.has(section.id)).map((section) => ({ ...section, isVisible: true }));
      setSections([...normalized, ...missing]);
    } else {
      setSections(AVAILABLE_SECTIONS.map((section) => ({ ...section, isVisible: true })));
    }
  }, [savedBody]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const body = JSON.stringify(sections);
      await saveContent('homepage_sections', 'ترتيب الصفحة الرئيسية', 'array', body);
      updateContent('homepage_sections', body);
      await refreshContent();
      alert('تم حفظ الترتيب وسيتم تطبيقه على الصفحة الرئيسية.');
    } catch (error) {
      console.error(error);
      alert('تعذر حفظ ترتيب الصفحة الرئيسية.');
    } finally {
      setSaving(false);
    }
  };

  const toggleVisibility = (idx: number) => setSections((current) => current.map((section, index) => index === idx ? { ...section, isVisible: !section.isVisible } : section));
  const move = (idx: number, direction: -1 | 1) => {
    const target = idx + direction;
    if (target < 0 || target >= sections.length) return;
    const next = [...sections];
    [next[idx], next[target]] = [next[target], next[idx]];
    setSections(next);
  };

  return <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><LayoutTemplate className="w-5 h-5 text-[#0284C7]" /> بناء الصفحة الرئيسية</h2>
      <button onClick={handleSave} disabled={saving} className="bg-[#0284C7] text-white px-6 py-2 rounded-md hover:bg-[#0369A1] flex items-center justify-center gap-2 font-bold disabled:opacity-50"><Save className="w-4 h-4" />{saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}</button>
    </div>
    <p className="text-gray-600 mb-6 text-sm">الترتيب والإظهار هنا مرتبطان مباشرة بأقسام الصفحة الرئيسية الحالية.</p>
    <div className="space-y-3">{sections.map((section, idx) => <div key={section.id} className={`border rounded-lg p-4 flex items-center gap-4 ${section.isVisible ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
      <div className="flex flex-col gap-1"><button onClick={() => move(idx, -1)} disabled={idx === 0} className="text-gray-400 hover:text-gray-700 disabled:opacity-20">↑</button><button onClick={() => move(idx, 1)} disabled={idx === sections.length - 1} className="text-gray-400 hover:text-gray-700 disabled:opacity-20">↓</button></div>
      <div className="flex-1"><h3 className="font-bold text-gray-800">{section.label}</h3><p className="text-xs text-gray-500 font-mono mt-1">{section.id}</p></div>
      <button onClick={() => toggleVisibility(idx)} className={`p-2 rounded-md ${section.isVisible ? 'text-[#0284C7] hover:bg-[#0284C7]/10' : 'text-gray-400 hover:bg-gray-100'}`} title={section.isVisible ? 'إخفاء القسم' : 'إظهار القسم'}>{section.isVisible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}</button>
    </div>)}</div>
  </div>;
}
