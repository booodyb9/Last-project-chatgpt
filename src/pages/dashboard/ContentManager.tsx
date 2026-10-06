import { memo, useState, useCallback, useMemo } from 'react';
import { Edit3, Save } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Content } from './types';
import ArrayEditor from './ArrayEditor';
import { useContent } from '../../contexts/ContentContext';
import { saveContent } from '../../lib/supabase';

interface ContentManagerProps {
  contents: Content[];
  fetchContents: () => void;
  token: string | null;
  filterKeys?: string[];
}

type SectionType = 'rich_text' | 'array';

interface Section {
  key: string;
  title: string;
  type: SectionType;
  schema?: any[];
}

export const SECTIONS: Section[] = [
    { 
    key: 'brand_intro', 
    title: 'مقدمة العلامة التجارية (Intro)', 
    type: 'array',
    schema: [
      { key: 'enabled', label: 'تفعيل المقدمة', type: 'boolean' },
      { key: 'logoUrl', label: 'شعار المقدمة', type: 'image' },
      { key: 'audioUrl', label: 'ملف التعليق الصوتي (URL أو مسار ثابت)', type: 'text' },
      { key: 'title', label: 'عنوان المقدمة', type: 'text' },
      { key: 'duration', label: 'مدة المقدمة بالملي ثانية (مثال: 2500)', type: 'number' }
    ]
  },
  { key: 'hero_content', title: 'الرئيسية (نصوص البانر)', type: 'rich_text' },
  { 
    key: 'hero_images', 
    title: 'صور الهيرو', 
    type: 'array',
    schema: [
      { key: 'url', label: 'رابط الصورة', type: 'image' },
      { key: 'alt', label: 'وصف الصورة (Alt Text)', type: 'text' },
      { key: 'seoImageTitle', label: 'عنوان الصورة (SEO Image Title)', type: 'text' },
      { key: 'visible', label: 'إظهار الصورة (مرئية للزوار)', type: 'boolean' },
      { key: 'isDefault', label: 'تحديد كصورة رئيسية (Default)', type: 'boolean' },
      { key: 'title', label: 'عنوان الشريحة (اختياري)', type: 'text' },
      { key: 'description', label: 'وصف الشريحة (اختياري)', type: 'textarea' },
      { key: 'ctaText', label: 'نص الزر الأساسي (اختياري)', type: 'text' },
      { key: 'ctaLink', label: 'رابط الزر (اختياري)', type: 'text' }
    ]
  },
  { key: 'services_intro', title: 'مقدمة الخدمات', type: 'rich_text' },
  { 
    key: 'services_items', 
    title: 'قائمة الخدمات', 
    type: 'array',
    schema: [
      { key: 'title', label: 'عنوان الخدمة', type: 'text' },
      { key: 'slug', label: 'الرابط المختصر (Slug)', type: 'text' },
      { key: 'description', label: 'وصف الخدمة المختصر', type: 'textarea' },
      { key: 'full_description', label: 'محتوى الخدمة التفصيلي', type: 'textarea' },
      { key: 'image', label: 'الصورة الرئيسية', type: 'image' },
      { key: 'bgImage', label: 'صورة الخلفية', type: 'image' },
      { key: 'icon', label: 'اسم الأيقونة (مثال: Home)', type: 'text' },
      { key: 'isHidden', label: 'إخفاء الخدمة', type: 'boolean' },
      { key: 'seoTitle', label: 'SEO عنوان', type: 'text' },
      { key: 'seoDescription', label: 'SEO وصف', type: 'textarea' },
      { key: 'seoKeywords', label: 'SEO كلمات مفتاحية', type: 'text' },
      { key: 'seoCanonical', label: 'SEO Canonical URL', type: 'text' },
      { key: 'seoImage', label: 'SEO OG Image', type: 'image' },
      { key: 'seoNoIndex', label: 'منع الأرشفة (NoIndex)', type: 'boolean' },
    ]
  },
  { 
    key: 'features_intro', 
    title: 'مقدمة المميزات (لماذا تختارنا)', 
    type: 'rich_text' 
  },
  { 
    key: 'features_items', 
    title: 'قائمة المميزات', 
    type: 'array',
    schema: [
      { key: 'title', label: 'العنوان', type: 'text' },
      { key: 'description', label: 'الوصف', type: 'textarea' },
      { key: 'icon', label: 'اسم الأيقونة (مثال: Shield)', type: 'text' },
    ]
  },
  {
    key: 'features_image',
    title: 'صورة لماذا تختارنا',
    type: 'array',
    schema: [
      
      { key: 'image', label: 'رابط الصورة', type: 'image' },
      { key: 'seoTitle', label: 'SEO عنوان', type: 'text' },
      { key: 'seoDescription', label: 'SEO وصف', type: 'textarea' },
      { key: 'seoKeywords', label: 'SEO كلمات مفتاحية', type: 'text' },
      { key: 'seoCanonical', label: 'SEO Canonical URL', type: 'text' },
      { key: 'seoImage', label: 'SEO OG Image', type: 'image' },
      { key: 'seoNoIndex', label: 'منع الأرشفة (NoIndex)', type: 'boolean' },

    ]
  },
  { 
    key: 'process_items', 
    title: 'خطوات العمل', 
    type: 'array',
    schema: [
      { key: 'title', label: 'عنوان الخطوة', type: 'text' },
      { key: 'description', label: 'وصف الخطوة', type: 'textarea' },
    ]
  },
  {
    key: 'trusted_partners',
    title: 'شركاء النجاح',
    type: 'array',
    schema: [
      { key: 'name', label: 'اسم الشريك', type: 'text' },
      { key: 'logo', label: 'شعار الشريك (رابط الصورة)', type: 'image' },
    ]
  },
  { 
    key: 'gallery_items', 
    title: 'معرض الأعمال (الصور)', 
    type: 'array',
    schema: [
      { key: 'title', label: 'عنوان المشروع', type: 'text' },
      { key: 'category', label: 'القسم (مثل: واجهات, قواطع)', type: 'text' },
      { key: 'description', label: 'وصف المشروع', type: 'textarea' },
      
      { key: 'image', label: 'رابط الصورة', type: 'image' },
      { key: 'seoTitle', label: 'SEO عنوان', type: 'text' },
      { key: 'seoDescription', label: 'SEO وصف', type: 'textarea' },
      { key: 'seoKeywords', label: 'SEO كلمات مفتاحية', type: 'text' },
      { key: 'seoCanonical', label: 'SEO Canonical URL', type: 'text' },
      { key: 'seoImage', label: 'SEO OG Image', type: 'image' },
      { key: 'seoNoIndex', label: 'منع الأرشفة (NoIndex)', type: 'boolean' },

      { key: 'className', label: 'كلاس CSS (اختياري - للتحكم بالحجم)', type: 'text' },
    ]
  },
  { 
    key: 'testimonials_items', 
    title: 'آراء العملاء', 
    type: 'array',
    schema: [
      { key: 'name', label: 'اسم العميل', type: 'text' },
      { key: 'role', label: 'المنصب/الشركة', type: 'text' },
      { key: 'content', label: 'نص الرأي', type: 'textarea' },
      { key: 'rating', label: 'التقييم (1-5)', type: 'number' },
      { key: 'image', label: 'رابط صورة العميل', type: 'image' },
    ]
  },
  { 
    key: 'faq_items', 
    title: 'الأسئلة الشائعة', 
    type: 'array',
    schema: [
      { key: 'question', label: 'السؤال', type: 'text' },
      { key: 'answer', label: 'الإجابة', type: 'textarea' },
    ]
  },
  { key: 'blog_intro', title: 'مقدمة المدونة', type: 'rich_text' },
  { 
    key: 'blog_items', 
    title: 'مقالات المدونة', 
    type: 'array',
    schema: [
      { key: 'title', label: 'عنوان المقال', type: 'text' },
      { key: 'category', label: 'القسم', type: 'text' },
      { key: 'excerpt', label: 'مقتطف (وصف قصير)', type: 'textarea' },
      { key: 'content', label: 'محتوى المقال', type: 'rich_text' },
      { key: 'date', label: 'التاريخ', type: 'text' },
      
      { key: 'image', label: 'رابط الصورة', type: 'image' },
      { key: 'seoTitle', label: 'SEO عنوان', type: 'text' },
      { key: 'seoDescription', label: 'SEO وصف', type: 'textarea' },
      { key: 'seoKeywords', label: 'SEO كلمات مفتاحية', type: 'text' },
      { key: 'seoCanonical', label: 'SEO Canonical URL', type: 'text' },
      { key: 'seoImage', label: 'SEO OG Image', type: 'image' },
      { key: 'seoNoIndex', label: 'منع الأرشفة (NoIndex)', type: 'boolean' },

    ]
  },
  { 
    key: 'project_stats', 
    title: 'إحصائيات المشاريع (الأرقام)', 
    type: 'array',
    schema: [
      { key: 'value', label: 'الرقم (مثال: +150)', type: 'text' },
      { key: 'label', label: 'الوصف (مثال: مشروع منجز)', type: 'text' },
      { key: 'icon', label: 'اسم الأيقونة', type: 'text' },
    ]
  },
  { 
    key: 'visualizer_content', 
    title: 'محتوى متخيل الزجاج', 
    type: 'rich_text' 
  },
  { 
    key: 'maintenance_content', 
    title: 'نصائح الصيانة والعناية', 
    type: 'rich_text' 
  },
  { key: 'contact_content', title: 'تواصل معنا', type: 'rich_text' },
  { key: 'about_content', title: 'من نحن (About)', type: 'rich_text' },
  { 
    key: 'navigation_links', 
    title: 'الروابط العلوية (Navigation)', 
    type: 'array',
    schema: [
      { key: 'label', label: 'الاسم (مثل: الرئيسية)', type: 'text' },
      { key: 'href', label: 'الرابط (مثل: /)', type: 'text' },
    ]
  },
  { 
    key: 'seo_settings', 
    title: 'إعدادات SEO العامة', 
    type: 'array',
    schema: [
      { key: 'title', label: 'عنوان الموقع', type: 'text' },
      { key: 'description', label: 'وصف الموقع', type: 'textarea' },
      { key: 'keywords', label: 'الكلمات المفتاحية', type: 'text' },
      { key: 'ogImage', label: 'صورة المشاركة (OG Image)', type: 'image' },
    ]
  },
  { 
    key: 'social_links', 
    title: 'روابط التواصل الاجتماعي', 
    type: 'array',
    schema: [
      { key: 'platform', label: 'المنصة (مثل: facebook, twitter, instagram, linkedin)', type: 'text' },
      { key: 'url', label: 'الرابط', type: 'text' },
      { key: 'icon', label: 'اسم الأيقونة', type: 'text' },
    ]
  },
  { 
    key: 'company_info', 
    title: 'معلومات الشركة', 
    type: 'array',
    schema: [
      { key: 'key', label: 'المفتاح (مثل: phone, email, address, working_hours)', type: 'text' },
      { key: 'value', label: 'القيمة', type: 'text' },
      { key: 'label', label: 'الوصف (للعرض)', type: 'text' },
      { key: 'icon', label: 'أيقونة', type: 'text' },
    ]
  },
  { key: 'footer_content', title: 'نص التذييل (Footer)', type: 'rich_text' },
];

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['link', 'clean']
  ],
};

export default function ContentManager({ contents, fetchContents, token, filterKeys }: ContentManagerProps) {
  const { updateContent } = useContent();

  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [savingContent, setSavingContent] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSaveContent = useCallback(async () => {
    if (!editingContent) return;
    setSavingContent(true);
    try {
      
      
      await saveContent(editingContent.key, editingContent.title, editingContent.type, editingContent.body);
      
      // Also update context directly for instant feedback
      updateContent(editingContent.key, editingContent.body);
      
      fetchContents();
      setEditingKey(null);
      setEditingContent(null);
      setSuccessMessage('تم الحفظ بنجاح!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Failed to save content", error);
      alert('حدث خطأ أثناء الحفظ');
    } finally {
      setSavingContent(false);
    }
  }, [editingContent, fetchContents, updateContent]);

  const handleEdit = useCallback((key: string, title: string, type: SectionType) => {
    const existing = contents.find(c => c.key === key);
    setEditingKey(key);
    setEditingContent(existing || {
      id: Date.now().toString(),
      key,
      title,
      body: type === 'array' ? '[]' : '',
      type,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }, [contents]);

  const EditorComponent = memo(({ section }: { section: Section }) => {
    if (editingKey !== section.key || !editingContent) return null;

    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h4 className="font-bold text-gray-800 mb-4 flex justify-between items-center">
          تحرير: {section.title}
          <button 
            onClick={() => setEditingKey(null)}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            إلغاء
          </button>
        </h4>
        
        {section.type === 'rich_text' ? (
          <div className="bg-white" dir="ltr">
            <ReactQuill 
              theme="snow" 
              value={editingContent.body || ''} 
              onChange={(val) => setEditingContent({ ...editingContent, body: val })}
              modules={modules}
              className="h-64 mb-12"
            />
          </div>
        ) : section.type === 'array' && section.schema ? (
          <ArrayEditor 
            value={editingContent.body || ''}
            onChange={(val) => setEditingContent({ ...editingContent, body: val })}
            schema={section.schema}
          />
        ) : null}

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSaveContent}
            disabled={savingContent}
            className="bg-[#0284C7] text-white px-6 py-2 rounded-md hover:bg-[#0369A1] transition-colors flex items-center gap-2 font-bold"
          >
            <Save className="w-4 h-4" />
            {savingContent ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </button>
        </div>
      </div>
    );
  });

  const sectionsToRender = filterKeys ? SECTIONS.filter(s => filterKeys.includes(s.key)) : SECTIONS;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
        <Edit3 className="w-5 h-5 text-[#0284C7]" />
        إدارة محتوى الموقع
      </h2>
      {successMessage && (
        <div className="bg-green-50 text-green-700 p-4 rounded-md mb-6 font-bold border border-green-200">
          {successMessage}
        </div>
      )}

      <div className="space-y-4">
        {sectionsToRender.map(section => (
          <div key={section.key} className="border border-gray-100 rounded-lg p-4 hover:border-[#0284C7]/30 transition-colors">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-800">{section.title}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  المعرف: <code className="bg-gray-100 px-1 rounded text-[#0284C7]">{section.key}</code>
                </p>
              </div>
              
              {editingKey !== section.key && (
                <button
                  onClick={() => handleEdit(section.key, section.title, section.type)}
                  className="text-[#0284C7] hover:bg-[#0284C7]/10 px-3 py-1.5 rounded-md transition-colors flex items-center gap-2 text-sm font-bold"
                >
                  <Edit3 className="w-4 h-4" />
                  تحرير
                </button>
              )}
            </div>
            
            <EditorComponent section={section} />
          </div>
        ))}
      </div>
    </div>
  );
}
