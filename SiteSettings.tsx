import React, { useState, useEffect } from 'react';
import { Content } from './types';
import { Save, Image as ImageIcon } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { saveContent } from '../../lib/supabase';
import { useContent } from '../../contexts/ContentContext';

interface Props {
  contents: Content[];
  fetchContents: () => void;
}

export default function SiteSettings({ contents, fetchContents }: Props) {
  const { updateContent } = useContent();
  const [settings, setSettings] = useState<any>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const siteSettings = contents.find(c => c.key === 'site_settings');
    if (siteSettings?.body) {
      try {
        setSettings(JSON.parse(siteSettings.body));
      } catch (e) {}
    }
  }, [contents]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveContent('site_settings', 'Site Settings', 'json', JSON.stringify(settings));
      updateContent('site_settings', JSON.stringify(settings));
      
      fetchContents();
      alert('تم حفظ الإعدادات بنجاح');
    } catch (e) {
      alert('حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h2 className="text-xl font-bold text-[#0F172A]">إعدادات الموقع (SEO & Info)</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#0284C7] text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-[#0369A1] transition-colors disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </button>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-gray-800 border-b pb-2">معلومات الشركة</h3>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">اسم الشركة</label>
            <input
              type="text"
              value={settings.companyName || ''}
              onChange={e => handleChange('companyName', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#0284C7]"
              placeholder="مثال: شركة زجاج الرياض"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">رقم الجوال (للواتساب)</label>
            <input
              type="text"
              value={settings.whatsappNumber || ''}
              onChange={e => handleChange('whatsappNumber', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#0284C7]"
              placeholder="مثال: 966510233706"
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">رقم الهاتف الأساسي</label>
            <input
              type="text"
              value={settings.phoneNumber || ''}
              onChange={e => handleChange('phoneNumber', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#0284C7]"
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">البريد الإلكتروني</label>
            <input
              type="email"
              value={settings.email || ''}
              onChange={e => handleChange('email', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#0284C7]"
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">العنوان</label>
            <input
              type="text"
              value={settings.address || ''}
              onChange={e => handleChange('address', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#0284C7]"
            />
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-bold text-gray-800 border-b pb-2">تحسين محركات البحث (SEO) والشعارات</h3>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">الشعار الرئيسي (رابط الصورة)</label>
            <input
              type="text"
              value={settings.logoUrl || ''}
              onChange={e => handleChange('logoUrl', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#0284C7]"
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">أيقونة الموقع Favicon (رابط)</label>
            <input
              type="text"
              value={settings.faviconUrl || ''}
              onChange={e => handleChange('faviconUrl', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#0284C7]"
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">عنوان الموقع الافتراضي (Meta Title)</label>
            <input
              type="text"
              value={settings.defaultMetaTitle || ''}
              onChange={e => handleChange('defaultMetaTitle', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#0284C7]"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">وصف الموقع الافتراضي (Meta Description)</label>
            <textarea
              value={settings.defaultMetaDescription || ''}
              onChange={e => handleChange('defaultMetaDescription', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#0284C7] h-24"
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">رابط تويتر/X</label>
            <input
              type="text"
              value={settings.twitterUrl || ''}
              onChange={e => handleChange('twitterUrl', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#0284C7]"
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">رابط انستقرام</label>
            <input
              type="text"
              value={settings.instagramUrl || ''}
              onChange={e => handleChange('instagramUrl', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#0284C7]"
              dir="ltr"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
