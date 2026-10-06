import { useMemo, useState } from 'react';
import { Plus, Edit3, Trash2, Save, Upload, ChevronUp, ChevronDown, X, Sparkles } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { v4 as uuidv4 } from 'uuid';
import { supabase, saveContent } from '../../lib/supabase';
import { useContent } from '../../contexts/ContentContext';
import { safeParseJson } from '../../lib/safeJson';

interface Props { pages: any[]; fetchContents: () => void | Promise<void>; }
const AVAILABLE_SECTIONS = ['Hero','About','Services','Process','GlassVisualizer','ProjectStats','Features','Gallery','Testimonials','TrustedPartners','FAQ','Maintenance','Blog','Contact','CustomHTML'];
const slugify = (v:string)=>v.trim().toLowerCase().replace(/\s+/g,'-').replace(/[^\p{L}\p{N}-]+/gu,'').replace(/-+/g,'-').replace(/^-|-$/g,'');

export default function PagesManagerV2({ pages, fetchContents }: Props) {
  const { updateContent, refreshContent } = useContent();
  const parsedPages = useMemo(() => (pages||[]).map((page) => ({ ...page, parsed: safeParseJson<any>(page.body, { title: page.title || 'صفحة', slug: '', content: '', sections: [], seo: {}, status: 'draft', featuredImage: '' }) })), [pages]);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);

  const save = async () => {
    if (!editing?.parsed?.title?.trim()) return alert('أدخل عنوان الصفحة.');
    const slug = slugify(editing.parsed.slug || editing.parsed.title);
    if (!slug) return alert('أدخل رابط صفحة صالحاً.');
    if (parsedPages.some((page)=>page.key!==editing.key && page.parsed?.slug===slug)) return alert('هذا الـSlug مستخدم في صفحة أخرى.');
    setSaving(true);
    try {
      const parsed = { ...editing.parsed, title: editing.parsed.title.trim(), slug };
      const body = JSON.stringify(parsed);
      await saveContent(editing.key, parsed.title, 'page', body);
      updateContent(editing.key, body);
      await Promise.all([fetchContents(), refreshContent()]);
      setEditing(null);
    } catch (error) { console.error(error); alert('تعذر حفظ الصفحة.'); }
    finally { setSaving(false); }
  };

  const remove = async (key:string) => {
    if (!confirm('هل تريد حذف هذه الصفحة؟')) return;
    const { error } = await supabase.from('contents').delete().eq('key', key);
    if (error) return alert(`تعذر الحذف: ${error.message}`);
    await Promise.all([fetchContents(), refreshContent()]);
  };

  const uploadImage = async (files: FileList|null) => {
    const file = files?.[0]; if (!file || !editing) return;
    setUploading(true);
    let fileName='';
    try {
      const compressed = await imageCompression(file,{maxSizeMB:1,maxWidthOrHeight:1920,useWebWorker:false});
      fileName=`${uuidv4()}.${file.name.split('.').pop()?.toLowerCase()||'webp'}`;
      const {error:up}=await supabase.storage.from('media').upload(fileName,compressed); if(up)throw up;
      const {data}=supabase.storage.from('media').getPublicUrl(fileName);
      const {error:db}=await supabase.from('media').insert({name:file.name,url:data.publicUrl,storage_path:`media/${fileName}`,type:'image',size:compressed.size});
      if(db){await supabase.storage.from('media').remove([fileName]);throw db;}
      setEditing({...editing,parsed:{...editing.parsed,featuredImage:data.publicUrl}});
    } catch(error){console.error(error);alert('فشل رفع الصورة.');}
    finally{setUploading(false);}
  };

  const generateSeo = async()=>{
    if(!editing)return;setAiBusy(true);
    try{
      const {data:s}=await supabase.auth.getSession();
      const response=await fetch('/api/ai/admin',{method:'POST',headers:{'content-type':'application/json',authorization:`Bearer ${s.session?.access_token||''}`},body:JSON.stringify({task:'seo',title:editing.parsed.title,content:editing.parsed.content})});
      
      let data: any = {};
      const textRes = await response.text();
      try { data = JSON.parse(textRes); } catch(e) {}
if(!response.ok)throw new Error(data.error||'AI failed');
      const seo=safeParseJson<any>(data.result,{});
      setEditing({...editing,parsed:{...editing.parsed,seo:{...(editing.parsed.seo||{}),title:seo.metaTitle||seo.title||'',description:seo.metaDescription||seo.description||'',keywords:seo.keywords||''}}});
    }catch(error){console.error(error);alert(error instanceof Error?error.message:'تعذر إنشاء SEO');}finally{setAiBusy(false);}
  };

  if(editing){const sections=Array.isArray(editing.parsed.sections)?editing.parsed.sections:[];return <div className="bg-white border rounded-xl p-6 space-y-6" dir="rtl">
    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3"><h2 className="text-xl font-bold">تعديل الصفحة: {editing.parsed.title}</h2><div className="flex gap-2"><button onClick={()=>setEditing(null)} className="px-4 py-2 border rounded-lg">إلغاء</button><button disabled={saving} onClick={save} className="px-4 py-2 bg-[#0284C7] text-white rounded-lg font-bold flex gap-2 items-center"><Save className="w-4 h-4"/>{saving?'جاري الحفظ...':'حفظ الصفحة'}</button></div></div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><Field label="عنوان الصفحة" value={editing.parsed.title||''} onChange={(v)=>setEditing({...editing,parsed:{...editing.parsed,title:v,slug:editing.parsed.slug||slugify(v)}})}/><Field label="Slug" value={editing.parsed.slug||''} dir="ltr" onChange={(v)=>setEditing({...editing,parsed:{...editing.parsed,slug:slugify(v)}})}/></div>
    <div><label className="label">محتوى الصفحة</label><textarea className="input min-h-64" value={editing.parsed.content||''} onChange={(e)=>setEditing({...editing,parsed:{...editing.parsed,content:e.target.value}})} /></div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="label">الحالة</label><select className="input" value={editing.parsed.status||'draft'} onChange={(e)=>setEditing({...editing,parsed:{...editing.parsed,status:e.target.value}})}><option value="published">منشورة</option><option value="draft">مسودة</option></select></div><div><label className="label">الصورة البارزة</label>{editing.parsed.featuredImage?<div className="relative h-40"><img src={editing.parsed.featuredImage} className="w-full h-full object-cover rounded-lg"/><button onClick={()=>setEditing({...editing,parsed:{...editing.parsed,featuredImage:''}})} className="absolute top-2 left-2 bg-black/70 text-white rounded-full p-1"><X className="w-4 h-4"/></button></div>:<label className="h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer"><Upload className="w-6 h-6 mb-2"/>{uploading?'جاري الرفع...':'رفع من الجهاز'}<input type="file" accept="image/*" className="hidden" onChange={(e)=>uploadImage(e.target.files)}/></label>}</div></div>
    <div className="border-t pt-5"><div className="flex justify-between items-center mb-3"><h3 className="font-bold">أقسام الصفحة</h3><select className="border rounded-lg px-3 py-2" defaultValue="" onChange={(e)=>{if(e.target.value){setEditing({...editing,parsed:{...editing.parsed,sections:[...sections,e.target.value]}});e.target.value='';}}}><option value="">+ إضافة قسم</option>{AVAILABLE_SECTIONS.map(s=><option key={s}>{s}</option>)}</select></div><div className="space-y-2">{sections.map((section:string,index:number)=><div key={`${section}-${index}`} className="border rounded-lg p-3 flex items-center gap-2"><div className="flex gap-1"><button disabled={index===0} onClick={()=>{const a=[...sections];[a[index-1],a[index]]=[a[index],a[index-1]];setEditing({...editing,parsed:{...editing.parsed,sections:a}})}}><ChevronUp className="w-4 h-4"/></button><button disabled={index===sections.length-1} onClick={()=>{const a=[...sections];[a[index+1],a[index]]=[a[index],a[index+1]];setEditing({...editing,parsed:{...editing.parsed,sections:a}})}}><ChevronDown className="w-4 h-4"/></button></div><span className="flex-1 font-bold">{section}</span><button onClick={()=>setEditing({...editing,parsed:{...editing.parsed,sections:sections.filter((_:any,i:number)=>i!==index)}})} className="text-red-600"><Trash2 className="w-4 h-4"/></button></div>)}</div></div>
    <div className="border-t pt-5"><div className="flex justify-between items-center mb-3"><h3 className="font-bold">SEO</h3><button disabled={aiBusy} onClick={generateSeo} className="border rounded-lg px-3 py-2 text-sm flex gap-2"><Sparkles className="w-4 h-4"/>{aiBusy?'جاري التوليد...':'إنشاء SEO'}</button></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><Field label="Meta Title" value={editing.parsed.seo?.title||''} onChange={(v)=>setEditing({...editing,parsed:{...editing.parsed,seo:{...(editing.parsed.seo||{}),title:v}}})}/><Field label="Keywords" value={editing.parsed.seo?.keywords||''} onChange={(v)=>setEditing({...editing,parsed:{...editing.parsed,seo:{...(editing.parsed.seo||{}),keywords:v}}})}/><div className="md:col-span-2"><label className="label">Meta Description</label><textarea className="input" value={editing.parsed.seo?.description||''} onChange={(e)=>setEditing({...editing,parsed:{...editing.parsed,seo:{...(editing.parsed.seo||{}),description:e.target.value}}})}/></div></div></div>
  </div>}

  return <div className="bg-white border rounded-xl p-6" dir="rtl"><div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6"><div><h2 className="text-2xl font-bold">الصفحات الديناميكية</h2><p className="text-sm text-gray-500 mt-1">JSON التالف لن يعطل بقية الصفحات.</p></div><button onClick={()=>setEditing({key:`page_${uuidv4()}`,type:'page',parsed:{title:'صفحة جديدة',slug:'',content:'',sections:[],seo:{title:'',description:'',keywords:''},status:'draft',featuredImage:''}})} className="bg-[#0284C7] text-white rounded-lg px-4 py-2 font-bold flex gap-2"><Plus className="w-5 h-5"/>صفحة جديدة</button></div><div className="space-y-3">{parsedPages.map((page)=><div key={page.key} className="border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><div className="font-bold">{page.parsed.title||page.title}</div><div className="text-xs text-gray-500 mt-1">/{page.parsed.slug||'بدون رابط'} · {page.parsed.status==='published'?'منشورة':'مسودة'}</div></div><div className="flex gap-2"><button onClick={()=>setEditing({...page,parsed:{...page.parsed,sections:[...(page.parsed.sections||[])],seo:{...(page.parsed.seo||{})}}})} className="p-2 border rounded-lg text-[#0284C7]"><Edit3 className="w-4 h-4"/></button><button onClick={()=>remove(page.key)} className="p-2 border rounded-lg text-red-600"><Trash2 className="w-4 h-4"/></button></div></div>)}{parsedPages.length===0&&<div className="text-center py-10 text-gray-500">لا توجد صفحات ديناميكية.</div>}</div></div>
}
function Field({label,value,onChange,dir}:{label:string;value:string;onChange:(v:string)=>void;dir?:string}){return <div><label className="label">{label}</label><input className="input" value={value||''} dir={dir} onChange={(e)=>onChange(e.target.value)}/></div>}
