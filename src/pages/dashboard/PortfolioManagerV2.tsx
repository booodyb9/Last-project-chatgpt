import { useEffect, useMemo, useState } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, Star, Copy, Upload, X, Sparkles, Loader2, Save } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { v4 as uuidv4 } from 'uuid';
import { supabase, saveContent } from '../../lib/supabase';
import { useContent } from '../../contexts/ContentContext';
import { safeParseJson } from '../../lib/safeJson';
import type { Content, PortfolioProject } from './types';

interface Props { contents: Content[]; fetchContents: () => void | Promise<void>; token: string | null; }

const CATEGORIES = ['واجهات زجاجية', 'أبواب زجاجية', 'كبائن شاور', 'مرايا', 'زجاج مكاتب', 'درابزين', 'سكني', 'تجاري', 'أخرى'];
const emptyProject = (): PortfolioProject => ({ id: uuidv4(), slug: '', title: '', category: CATEGORIES[0], description: '', location: '', serviceType: '', client: '', completionDate: '', materialsUsed: '', coverImage: '', galleryImages: [], isFeatured: false, isHidden: false, order: 0, seoTitle: '', seoDescription: '', seoKeywords: '', beforeImage: '', afterImage: '' });

function normalizeSlug(value: string) { return value.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\p{L}\p{N}-]+/gu, '').replace(/-+/g, '-').replace(/^-|-$/g, ''); }

export default function PortfolioManagerV2({ contents, fetchContents, token }: Props) {
  const { updateContent, refreshContent } = useContent();
  const row = contents.find((item) => item.key === 'premium_portfolio_projects');
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [editing, setEditing] = useState<PortfolioProject | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState('');
  const [aiBusy, setAiBusy] = useState('');

  useEffect(() => { setProjects(safeParseJson<PortfolioProject[]>(row?.body, []).sort((a,b) => (a.order || 0) - (b.order || 0))); }, [row?.body]);
  const slugConflict = useMemo(() => editing ? projects.some((project) => project.id !== editing.id && project.slug === editing.slug) : false, [editing, projects]);

  const persist = async (next: PortfolioProject[]) => {
    setSaving(true);
    try {
      const normalized = next.map((project, index) => ({ ...project, order: index }));
      const body = JSON.stringify(normalized);
      await saveContent('premium_portfolio_projects', 'Premium Portfolio Projects', 'json', body);
      setProjects(normalized); updateContent('premium_portfolio_projects', body);
      await Promise.all([fetchContents(), refreshContent()]);
      return true;
    } catch (error) { console.error(error); alert('تعذر حفظ المشاريع.'); return false; }
    finally { setSaving(false); }
  };

  const uploadOne = async (file: File) => {
    const compressed = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: false });
    const ext = file.name.split('.').pop()?.toLowerCase() || 'webp';
    const fileName = `${uuidv4()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from('media').upload(fileName, compressed);
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from('media').getPublicUrl(fileName);
    const record = { name: file.name, url: data.publicUrl, storage_path: `media/${fileName}`, type: 'image', size: compressed.size };
    const { error: dbError } = await supabase.from('media').insert(record);
    if (dbError) { await supabase.storage.from('media').remove([fileName]); throw dbError; }
    return data.publicUrl;
  };

  const uploadField = async (files: FileList | null, field: 'coverImage'|'beforeImage'|'afterImage'|'galleryImages') => {
    if (!editing || !files?.length) return;
    setUploading(field);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files) as File[]) urls.push(await uploadOne(file));
      setEditing(field === 'galleryImages' ? { ...editing, galleryImages: [...(editing.galleryImages || []), ...urls] } : { ...editing, [field]: urls[0] });
    } catch (error) { console.error(error); alert('فشل رفع الصورة ولم يتم تسجيل نجاح زائف.'); }
    finally { setUploading(''); }
  };

  const runAi = async (task: 'improve'|'seo') => {
    if (!editing) return;
    setAiBusy(task);
    try {
      const bearer = token || (await supabase.auth.getSession()).data.session?.access_token || '';
      const response = await fetch('/api/ai/admin', { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${bearer}` }, body: JSON.stringify({ task, title: editing.title, content: editing.description }) });
      
      let data: any = {};
      const textRes = await response.text();
      try { data = JSON.parse(textRes); } catch(e) {}
 if (!response.ok) throw new Error(data.error || 'AI failed');
      if (task === 'seo') {
        const parsed = safeParseJson<any>(data.result, {});
        setEditing({ ...editing, seoTitle: parsed.metaTitle || parsed.title || editing.seoTitle, seoDescription: parsed.metaDescription || parsed.description || editing.seoDescription, seoKeywords: parsed.keywords || editing.seoKeywords });
      } else setEditing({ ...editing, description: data.result });
    } catch (error) { console.error(error); alert(error instanceof Error ? error.message : 'تعذر تشغيل AI'); }
    finally { setAiBusy(''); }
  };

  const saveEditing = async () => {
    if (!editing) return;
    const title = editing.title.trim(); const slug = normalizeSlug(editing.slug || title);
    if (!title || !slug) return alert('أدخل عنوان المشروع وSlug صالحاً.');
    if (projects.some((project) => project.id !== editing.id && project.slug === slug)) return alert('هذا الـSlug مستخدم في مشروع آخر.');
    const clean = { ...editing, title, slug };
    const exists = projects.some((project) => project.id === clean.id);
    const next = exists ? projects.map((project) => project.id === clean.id ? clean : project) : [...projects, { ...clean, order: projects.length }];
    if (await persist(next)) setEditing(null);
  };

  const toggle = (project: PortfolioProject, key: 'isHidden'|'isFeatured') => persist(projects.map((p) => p.id === project.id ? { ...p, [key]: !p[key] } : p));
  const duplicate = (project: PortfolioProject) => { const copy = { ...project, id: uuidv4(), title: `${project.title} (نسخة)`, slug: `${project.slug}-copy-${Date.now().toString().slice(-4)}`, order: projects.length }; persist([...projects, copy]); };
  const remove = (project: PortfolioProject) => { if (confirm(`حذف مشروع "${project.title}"؟ لن نحذف صور Storage تلقائياً لأنها قد تكون مستخدمة بمكان آخر.`)) persist(projects.filter((p) => p.id !== project.id)); };

  if (editing) return <div className="bg-white border rounded-xl p-6 space-y-6" dir="rtl">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><h2 className="text-xl font-bold">{projects.some((p)=>p.id===editing.id) ? 'تعديل المشروع' : 'إضافة مشروع'}</h2><p className="text-sm text-gray-500">كل الصور يمكن رفعها مباشرة من الجهاز.</p></div><div className="flex gap-2"><button onClick={()=>setEditing(null)} className="px-4 py-2 border rounded-lg">إلغاء</button><button disabled={saving || slugConflict} onClick={saveEditing} className="px-4 py-2 bg-[#0284C7] text-white rounded-lg font-bold flex items-center gap-2 disabled:opacity-50"><Save className="w-4 h-4" />{saving?'جاري الحفظ...':'حفظ'}</button></div></div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Text label="العنوان" value={editing.title} onChange={(v)=>setEditing({...editing,title:v,slug: editing.slug || normalizeSlug(v)})}/>
      <div><Text label="Slug" value={editing.slug} dir="ltr" onChange={(v)=>setEditing({...editing,slug:normalizeSlug(v)})}/>{slugConflict&&<p className="text-xs text-red-600 mt-1">Slug مكرر.</p>}</div>
      <div><label className="label">التصنيف</label><select className="input" value={editing.category} onChange={(e)=>setEditing({...editing,category:e.target.value})}>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></div>
      <Text label="نوع الخدمة" value={editing.serviceType} onChange={(v)=>setEditing({...editing,serviceType:v})}/><Text label="الموقع" value={editing.location} onChange={(v)=>setEditing({...editing,location:v})}/><Text label="العميل" value={editing.client} onChange={(v)=>setEditing({...editing,client:v})}/><Text label="تاريخ الانتهاء" value={editing.completionDate} onChange={(v)=>setEditing({...editing,completionDate:v})}/><Text label="المواد المستخدمة" value={editing.materialsUsed} onChange={(v)=>setEditing({...editing,materialsUsed:v})}/>
    </div>
    <div><label className="label">وصف المشروع</label><textarea className="input min-h-32" value={editing.description} onChange={(e)=>setEditing({...editing,description:e.target.value})}/><button disabled={!!aiBusy} onClick={()=>runAi('improve')} className="mt-2 px-3 py-2 border rounded-lg text-sm flex gap-2 items-center"><Sparkles className="w-4 h-4" />{aiBusy==='improve'?<Loader2 className="w-4 h-4 animate-spin"/>:'تحسين النص بالذكاء الاصطناعي'}</button></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><ImageUpload label="صورة الغلاف" value={editing.coverImage} multiple={false} busy={uploading==='coverImage'} onFiles={(f)=>uploadField(f,'coverImage')} onClear={()=>setEditing({...editing,coverImage:''})}/><ImageUpload label="قبل التنفيذ" value={editing.beforeImage||''} multiple={false} busy={uploading==='beforeImage'} onFiles={(f)=>uploadField(f,'beforeImage')} onClear={()=>setEditing({...editing,beforeImage:''})}/><ImageUpload label="بعد التنفيذ" value={editing.afterImage||''} multiple={false} busy={uploading==='afterImage'} onFiles={(f)=>uploadField(f,'afterImage')} onClear={()=>setEditing({...editing,afterImage:''})}/></div>
    <div><label className="label">معرض الصور</label><label className="inline-flex cursor-pointer px-4 py-2 bg-gray-100 rounded-lg gap-2 items-center"><Upload className="w-4 h-4"/>{uploading==='galleryImages'?'جاري الرفع...':'رفع عدة صور'}<input type="file" accept="image/*" multiple className="hidden" onChange={(e)=>uploadField(e.target.files,'galleryImages')}/></label><div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-3">{(editing.galleryImages||[]).map((url,index)=><div key={`${url}-${index}`} className="relative aspect-square"><img src={url} className="w-full h-full object-cover rounded-lg"/><button onClick={()=>setEditing({...editing,galleryImages:editing.galleryImages.filter((_,i)=>i!==index)})} className="absolute top-1 left-1 bg-black/70 text-white rounded-full p-1"><X className="w-3 h-3"/></button></div>)}</div></div>
    <div className="border-t pt-5"><div className="flex justify-between items-center mb-3"><h3 className="font-bold">SEO</h3><button disabled={!!aiBusy} onClick={()=>runAi('seo')} className="px-3 py-2 border rounded-lg text-sm flex gap-2 items-center"><Sparkles className="w-4 h-4"/>{aiBusy==='seo'?<Loader2 className="w-4 h-4 animate-spin"/>:'إنشاء SEO'}</button></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><Text label="Meta Title" value={editing.seoTitle||''} onChange={(v)=>setEditing({...editing,seoTitle:v})}/><Text label="Keywords" value={editing.seoKeywords||''} onChange={(v)=>setEditing({...editing,seoKeywords:v})}/><div className="md:col-span-2"><label className="label">Meta Description</label><textarea className="input" value={editing.seoDescription||''} onChange={(e)=>setEditing({...editing,seoDescription:e.target.value})}/></div></div></div>
    <div className="flex gap-6"><label className="flex gap-2 items-center"><input type="checkbox" checked={editing.isFeatured} onChange={(e)=>setEditing({...editing,isFeatured:e.target.checked})}/> مشروع مميز</label><label className="flex gap-2 items-center"><input type="checkbox" checked={editing.isHidden} onChange={(e)=>setEditing({...editing,isHidden:e.target.checked})}/> مخفي</label></div>
  </div>;

  return <div className="bg-white border rounded-xl p-6" dir="rtl"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"><div><h2 className="text-2xl font-bold">إدارة معرض الأعمال والمشاريع</h2><p className="text-sm text-gray-500 mt-1">إدارة كاملة للمشاريع والصور والظهور.</p></div><button onClick={()=>setEditing({...emptyProject(),order:projects.length})} className="bg-[#0284C7] text-white px-4 py-2 rounded-lg font-bold flex gap-2 items-center w-fit"><Plus className="w-5 h-5"/>إضافة مشروع</button></div><div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{projects.map(project=><div key={project.id} className="border rounded-xl overflow-hidden"><div className="aspect-video bg-gray-100">{project.coverImage?<img src={project.coverImage} className="w-full h-full object-cover"/>:<div className="h-full flex items-center justify-center text-gray-400">بدون صورة</div>}</div><div className="p-4"><div className="flex justify-between gap-3"><div><h3 className="font-bold">{project.title}</h3><p className="text-xs text-gray-500 mt-1">/{project.slug}</p></div><div className="flex">{project.isFeatured&&<Star className="w-4 h-4 text-amber-500 fill-current"/>}{project.isHidden&&<EyeOff className="w-4 h-4 text-gray-500"/>}</div></div><p className="text-sm text-gray-500 mt-2 line-clamp-2">{project.description}</p><div className="flex gap-1 mt-4 flex-wrap"><IconButton title="تعديل" onClick={()=>setEditing({...project,galleryImages:[...(project.galleryImages||[])]})}><Edit2/></IconButton><IconButton title={project.isHidden?'إظهار':'إخفاء'} onClick={()=>toggle(project,'isHidden')}>{project.isHidden?<Eye/>:<EyeOff/>}</IconButton><IconButton title="مميز" onClick={()=>toggle(project,'isFeatured')}><Star/></IconButton><IconButton title="نسخ" onClick={()=>duplicate(project)}><Copy/></IconButton><IconButton title="حذف" danger onClick={()=>remove(project)}><Trash2/></IconButton></div></div></div>)}{projects.length===0&&<div className="md:col-span-2 xl:col-span-3 text-center py-12 text-gray-500">لا توجد مشاريع.</div>}</div></div>;
}

function Text({label,value,onChange,dir}:{label:string;value:string;onChange:(v:string)=>void;dir?:string}){return <div><label className="label">{label}</label><input className="input" dir={dir} value={value||''} onChange={(e)=>onChange(e.target.value)}/></div>}
function ImageUpload({label,value,onFiles,onClear,busy}:{label:string;value:string;multiple:boolean;onFiles:(f:FileList|null)=>void;onClear:()=>void;busy:boolean}){return <div><label className="label">{label}</label>{value?<div className="relative aspect-video"><img src={value} className="w-full h-full object-cover rounded-lg"/><button onClick={onClear} className="absolute top-2 left-2 bg-black/70 text-white rounded-full p-1"><X className="w-4 h-4"/></button></div>:<label className="aspect-video border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer"><Upload className="w-6 h-6 text-[#0284C7] mb-2"/><span className="text-sm">{busy?'جاري الرفع...':'رفع من الجهاز'}</span><input type="file" accept="image/*" className="hidden" onChange={(e)=>onFiles(e.target.files)}/></label>}</div>}
function IconButton({title,onClick,children,danger}:{title:string;onClick:()=>void;children:any;danger?:boolean}){return <button title={title} onClick={onClick} className={`p-2 rounded-lg border ${danger?'text-red-600 hover:bg-red-50':'text-gray-600 hover:bg-gray-50'} [&>svg]:w-4 [&>svg]:h-4`}>{children}</button>}
