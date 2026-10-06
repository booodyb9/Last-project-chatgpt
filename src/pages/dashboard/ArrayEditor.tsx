import { useEffect, useState } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown, Upload, Sparkles, Loader2, Wand2, Image as ImageIcon } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { supabase } from '../../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { safeParseJson } from '../../lib/safeJson';
import SafeQuill from '../../components/SafeQuill';

interface ArrayEditorProps {
  value: string;
  onChange: (val: string) => void;
  schema: { key: string; label: string; type: 'text' | 'textarea' | 'image' | 'number' | 'boolean' | 'rich_text'; }[];
  token?: string | null;
}

async function getBearerToken(fallback?: string | null) {
  if (fallback) return fallback;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || '';
}

async function imageUrlToPayload(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('تعذر قراءة الصورة');
  const blob = await response.blob();
  if (!['image/jpeg','image/png','image/webp'].includes(blob.type)) throw new Error('صيغة الصورة غير مدعومة للتحليل');
  const data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || '').split(',')[1] || '');
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
  return { mimeType: blob.type, data };
}

export default function ArrayEditor({ value, onChange, schema, token }: ArrayEditorProps) {
  const [items, setItems] = useState<any[]>([]);
  const [uploadingIndex, setUploadingIndex] = useState<{index: number, key: string} | null>(null);
  const [aiBusy, setAiBusy] = useState<{index: number, task: string} | null>(null);

  useEffect(() => {
    const parsed = safeParseJson<any[]>(value, []);
    setItems(Array.isArray(parsed) ? parsed : []);
  }, [value]);

  const notifyChange = (newItems: any[]) => { setItems(newItems); onChange(JSON.stringify(newItems)); };
  const updateItem = (index: number, key: string, val: any) => { const next = items.map((item, i) => i === index ? { ...item, [key]: val } : item); notifyChange(next); };
  const addItem = () => { const newItem: any = {}; schema.forEach((field) => { newItem[field.key] = field.type === 'number' ? 0 : field.type === 'boolean' ? false : ''; }); notifyChange([...items, newItem]); };
  const removeItem = (index: number) => { if (!confirm('هل أنت متأكد من حذف هذا العنصر؟')) return; notifyChange(items.filter((_, i) => i !== index)); };
  const moveItem = (index: number, direction: 1 | -1) => { const target = index + direction; if (target < 0 || target >= items.length) return; const next = [...items]; [next[index], next[target]] = [next[target], next[index]]; notifyChange(next); };

  const handleImageUpload = async (e: import('react').ChangeEvent<HTMLInputElement>, index: number, key: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingIndex({ index, key });
    try {
      const compressedFile = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: false });
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'webp';
      const fileName = `${uuidv4()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('media').upload(fileName, compressedFile);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('media').getPublicUrl(fileName);
      const newImage = { name: file.name, url: data.publicUrl, storage_path: `media/${fileName}`, type: 'image', size: compressedFile.size };
      const { error: insertError } = await supabase.from('media').insert(newImage);
      if (insertError) {
        await supabase.storage.from('media').remove([fileName]);
        throw insertError;
      }
      updateItem(index, key, newImage.url);
    } catch (error) {
      console.error('Upload error:', error);
      alert('فشل رفع الصورة ولم يتم تسجيل نجاح زائف.');
    } finally {
      setUploadingIndex(null);
      e.target.value = '';
    }
  };

  const runAi = async (index: number, task: 'generate' | 'improve' | 'seo' | 'alt' | 'analyze_image' | 'generate_service' | 'generate_article' | 'hero_optimize') => {
    const item = items[index];
    setAiBusy({ index, task });
    try {
      const bearer = await getBearerToken(token);
      const title = item.title || item.name || item.question || '';
      const content = item.description || item.content || item.answer || item.details || item.body || title;
      const body: any = { task, title, content };
      if (['alt', 'analyze_image', 'generate_service', 'generate_article', 'hero_optimize'].includes(task)) {
        const imageUrl = item.image || item.img || item.coverImage || item.imageUrl;
        if (!imageUrl) throw new Error('لا توجد صورة لهذا العنصر');
        body.image = await imageUrlToPayload(imageUrl);
      }
      const response = await fetch('/api/ai/admin', { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${bearer}` }, body: JSON.stringify(body) });
      
      let data: any = {};
      const textRes = await response.text();
      try { data = JSON.parse(textRes); } catch(e) {}

      if (!response.ok) throw new Error(data.error || 'فشل طلب الذكاء الاصطناعي');
      const next = [...items];
      const updated = { ...next[index] };
      if (task === 'seo') {
        const parsed = safeParseJson<any>(data.result, {});
        updated.seoTitle = parsed.metaTitle || parsed.title || updated.seoTitle || '';
        updated.seoDescription = parsed.metaDescription || parsed.description || updated.seoDescription || '';
        updated.seoKeywords = parsed.keywords || updated.seoKeywords || '';
      } else if (task === 'alt') {
        updated.altText = data.result;
      } else if (task === 'analyze_image') {
        const parsed = safeParseJson<any>(data.result, {});
        alert(`نتائج تحليل الصورة:\n\nالأقسام المقترحة:\n${(parsed.categories || []).join(', ')}\n\nالعناوين المقترحة:\n${(parsed.suggestions || []).join('\n')}\n\nنسبة الثقة: ${parsed.confidence}%`);
      } else if (task === 'generate_article') {
        const parsed = safeParseJson<any>(data.result, {});
        if (parsed.title) updated.title = parsed.title;
        if (parsed.content) updated.content = parsed.content;
        if (parsed.seoTitle) updated.seoTitle = parsed.seoTitle;
        if (parsed.metaDescription) updated.seoDescription = parsed.metaDescription;
        if (parsed.slug) updated.slug = parsed.slug;
        if (parsed.keywords) updated.seoKeywords = parsed.keywords;
        if (parsed.altText) updated.altText = parsed.altText;
      } else if (task === 'hero_optimize') {
        const parsed = safeParseJson<any>(data.result, {});
        const msg = `توصيات الذكاء الاصطناعي للبطل (Hero):\n\nالعنوان: ${parsed.title || ''}\nالوصف: ${parsed.description || ''}\nنص الزر: ${parsed.ctaText || ''}\nنص بديل: ${parsed.altText || ''}\n\nهل تريد تطبيق هذه التغييرات؟`;
        if (confirm(msg)) {
          if (parsed.title) updated.title = parsed.title;
          if (parsed.description) updated.description = parsed.description;
          if (parsed.ctaText) updated.ctaText = parsed.ctaText;
          if (parsed.ctaLink && schema.some(f => f.key === 'ctaLink')) updated.ctaLink = parsed.ctaLink;
          if (parsed.altText) updated.alt = parsed.altText;
        }
      } else if (task === 'generate_service') {
        const parsed = safeParseJson<any>(data.result, {});
        if (parsed.title) updated.title = parsed.title;
        if (parsed.shortDescription) updated.description = parsed.shortDescription;
        if (parsed.content) updated.full_description = parsed.content;
        if (parsed.seoTitle) updated.seoTitle = parsed.seoTitle;
        if (parsed.metaDescription) updated.seoDescription = parsed.metaDescription;
        if (parsed.slug) updated.slug = parsed.slug;
        if (parsed.keywords) updated.seoKeywords = parsed.keywords;
        if (parsed.altText) updated.altText = parsed.altText;
        if (parsed.imageTitle) updated.seoImageTitle = parsed.imageTitle;
      } else if (task === 'improve' || task === 'generate') {
        if ('description' in updated) updated.description = data.result;
        else if ('content' in updated) updated.content = data.result;
        else if ('answer' in updated) updated.answer = data.result;
        else updated.description = data.result;
      }
      next[index] = updated;
      notifyChange(next);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : 'تعذر تشغيل أداة AI');
    } finally {
      setAiBusy(null);
    }
  };

  return <div className="space-y-4">
    {items.map((item, index) => <div key={item.id || index} className="border border-gray-200 p-4 rounded-lg bg-gray-50 relative">
      <div className="absolute top-4 left-4 flex gap-2"><button onClick={() => moveItem(index, -1)} disabled={index === 0} className="p-1 text-gray-500 disabled:opacity-30"><ChevronUp className="w-5 h-5" /></button><button onClick={() => moveItem(index, 1)} disabled={index === items.length - 1} className="p-1 text-gray-500 disabled:opacity-30"><ChevronDown className="w-5 h-5" /></button><button onClick={() => removeItem(index)} className="p-1 text-red-500"><Trash2 className="w-5 h-5" /></button></div>
      <h4 className="font-bold text-gray-700 mb-4">عنصر #{index + 1}</h4>
      <div className="mb-4 flex flex-wrap gap-2 bg-blue-50 p-3 rounded-lg border border-blue-100 items-center">
        {schema.some((f) => f.type === 'image') && <button disabled={!!aiBusy} onClick={() => runAi(index, 'analyze_image')} className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm font-bold shadow-sm"><Sparkles className="w-4 h-4" /> تحليل الصورة (AI)</button>}
        {schema.some((f) => f.key === 'full_description') && <button disabled={!!aiBusy} onClick={() => runAi(index, 'generate_service')} className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm font-bold shadow-sm"><Sparkles className="w-4 h-4" /> توليد الخدمة بالذكاء الاصطناعي</button>}
        {schema.some((f) => f.key === 'ctaText') && !schema.some((f) => f.key === 'full_description') && <button disabled={!!aiBusy} onClick={() => runAi(index, 'hero_optimize')} className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded text-sm font-bold shadow-sm"><Sparkles className="w-4 h-4" /> تحسين البانر (Hero SEO)</button>}
        {schema.some((f) => f.key === 'content' && f.type === 'rich_text') && <button disabled={!!aiBusy} onClick={() => runAi(index, 'generate_article')} className="flex items-center gap-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded text-sm font-bold shadow-sm"><Sparkles className="w-4 h-4" /> توليد مسودة مقال</button>}
        <button disabled={!!aiBusy} onClick={() => runAi(index, 'generate')} className="flex items-center gap-1 bg-white border px-3 py-1.5 rounded text-sm"><Sparkles className="w-4 h-4 text-blue-600" /> توليد</button>
        <button disabled={!!aiBusy} onClick={() => runAi(index, 'improve')} className="flex items-center gap-1 bg-white border px-3 py-1.5 rounded text-sm"><Wand2 className="w-4 h-4 text-blue-600" /> تحسين النص</button>
        {schema.some((f) => f.key === 'seoTitle' || f.key === 'seoDescription') && <button disabled={!!aiBusy} onClick={() => runAi(index, 'seo')} className="flex items-center gap-1 bg-white border px-3 py-1.5 rounded text-sm"><Sparkles className="w-4 h-4 text-blue-600" /> إنشاء SEO</button>}
        {schema.some((f) => f.type === 'image') && <button disabled={!!aiBusy} onClick={() => runAi(index, 'alt')} className="flex items-center gap-1 bg-white border px-3 py-1.5 rounded text-sm"><ImageIcon className="w-4 h-4 text-blue-600" /> Alt Text</button>}
        {aiBusy?.index === index && <span className="flex items-center gap-1 text-sm text-blue-700"><Loader2 className="w-4 h-4 animate-spin" /> جاري التنفيذ...</span>}
      </div>
      <div className="grid grid-cols-1 gap-4">{schema.map((field) => <div key={field.key}><label className="block text-sm font-bold text-gray-700 mb-1">{field.label}</label>{field.type === 'textarea' ? <textarea value={item[field.key] || ''} onChange={(e) => updateItem(index, field.key, e.target.value)} className="w-full px-3 py-2 border rounded-md h-24" /> : field.type === 'rich_text' ? <div className="bg-white" dir="ltr"><SafeQuill value={item[field.key] || ''} onChange={(val) => updateItem(index, field.key, val)} /></div> : field.type === 'image' ? <div className="space-y-3"><label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-white border-[#0284C7]"><Upload className="w-8 h-8 mb-2 text-[#0284C7]" /><p className="text-sm font-bold">{uploadingIndex?.index === index && uploadingIndex?.key === field.key ? 'جاري الرفع...' : 'انقر لرفع صورة من الجهاز'}</p><input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, index, field.key)} disabled={!!uploadingIndex} /></label>{item[field.key] && <div className="w-full h-40 rounded-lg border overflow-hidden"><img loading="lazy" decoding="async" src={item[field.key]} alt={item.altText || 'Preview'} className="w-full h-full object-cover" /></div>}</div> : field.type === 'boolean' ? <label className="flex items-center gap-2"><input type="checkbox" checked={!!item[field.key]} onChange={(e) => updateItem(index, field.key, e.target.checked)} />{field.label}</label> : <input type={field.type === 'number' ? 'number' : 'text'} value={item[field.key] ?? ''} onChange={(e) => updateItem(index, field.key, field.type === 'number' ? Number(e.target.value) : e.target.value)} className="w-full px-3 py-2 border rounded-md" dir="auto" />}</div>)}</div>
    </div>)}
    <button onClick={addItem} className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 font-bold w-full justify-center"><Plus className="w-4 h-4" /> إضافة عنصر جديد</button>
  </div>;
}
