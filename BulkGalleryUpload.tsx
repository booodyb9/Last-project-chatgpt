import { memo, useCallback, useMemo, useState } from 'react';
import { Upload, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { supabase, saveContent } from '../../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import type { Content, PortfolioProject } from './types';
import { useContent } from '../../contexts/ContentContext';
import { safeParseJson } from '../../lib/safeJson';

interface BulkGalleryUploadProps {
  token: string | null;
  contents: Content[];
  fetchContents: () => void | Promise<void>;
  fetchMedia: () => void | Promise<void>;
}

const BulkGalleryUpload = memo(({ contents, fetchContents, fetchMedia }: BulkGalleryUploadProps) => {
  const { refreshContent, updateContent } = useContent();
  const [projectId, setProjectId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<{ total: number; current: number; failed: number } | null>(null);

  const projects = useMemo(() => {
    const row = contents.find((item) => item.key === 'premium_portfolio_projects');
    return safeParseJson<PortfolioProject[]>(row?.body, []).filter((project) => !project.isHidden);
  }, [contents]);

  const handleBulkUpload = useCallback(async (e: import('react').ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (!files.length) return;
    const target = projects.find((project) => project.id === projectId);
    if (!target) {
      alert('اختر المشروع الذي تريد إضافة الصور إليه أولاً.');
      e.target.value = '';
      return;
    }
    if (!confirm(`سيتم إضافة ${files.length} صورة إلى معرض مشروع "${target.title}". هل تريد المتابعة؟`)) {
      e.target.value = '';
      return;
    }

    setUploading(true);
    setProgress({ total: files.length, current: 0, failed: 0 });
    const urls: string[] = [];
    let current = 0;
    let failed = 0;

    for (const file of files) {
      let fileName = '';
      try {
        const compressed = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: false });
        const ext = file.name.split('.').pop()?.toLowerCase() || 'webp';
        fileName = `${uuidv4()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from('media').upload(fileName, compressed);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('media').getPublicUrl(fileName);
        const record = { name: file.name, url: data.publicUrl, storage_path: `media/${fileName}`, type: 'image', size: compressed.size };
        const { error: insertError } = await supabase.from('media').insert(record);
        if (insertError) {
          await supabase.storage.from('media').remove([fileName]);
          throw insertError;
        }
        urls.push(data.publicUrl);
        current += 1;
      } catch (error) {
        console.error(`Bulk upload failed for ${file.name}:`, error);
        if (fileName) await supabase.storage.from('media').remove([fileName]);
        failed += 1;
      }
      setProgress({ total: files.length, current, failed });
    }

    if (urls.length) {
      try {
        const updatedProjects = projects.map((project) => project.id === target.id ? { ...project, galleryImages: [...(project.galleryImages || []), ...urls] } : project);
        const body = JSON.stringify(updatedProjects);
        await saveContent('premium_portfolio_projects', 'Premium Portfolio Projects', 'json', body);
        updateContent('premium_portfolio_projects', body);
        await Promise.all([fetchMedia(), fetchContents(), refreshContent()]);
      } catch (error) {
        console.error('Failed to attach images to project:', error);
        alert('تم رفع الصور إلى مكتبة الوسائط، لكن تعذر ربطها بالمشروع. راجع مكتبة الوسائط قبل المحاولة مرة أخرى.');
      }
    }

    setUploading(false);
    window.setTimeout(() => setProgress(null), 4000);
    e.target.value = '';
  }, [projectId, projects, fetchContents, fetchMedia, refreshContent, updateContent]);

  return <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div className="flex items-center gap-2 mb-6"><ImageIcon className="w-5 h-5 text-[#0284C7]" /><h2 className="text-lg font-bold text-gray-900">رفع صور متعددة لمعرض مشروع</h2></div>
    <div className="space-y-6">
      <div><label className="block text-sm font-bold text-gray-700 mb-2">اختر المشروع:</label><select value={projectId} onChange={(e) => setProjectId(e.target.value)} disabled={uploading} className="w-full md:w-2/3 px-4 py-2 border border-gray-300 rounded-md"><option value="">— اختر مشروعاً —</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.title}</option>)}</select><p className="text-xs text-gray-500 mt-2">لن يتم إنشاء مشروع جديد لكل صورة. الصور ستضاف إلى Gallery المشروع المختار.</p></div>
      <label className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md font-bold cursor-pointer ${uploading || !projectId ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#0284C7] text-white hover:bg-[#0369A1]'}`}><Upload className="w-5 h-5" />{uploading ? 'جاري الرفع...' : 'اختر الصور وقم بالرفع'}<input type="file" accept="image/*" multiple className="hidden" onChange={handleBulkUpload} disabled={uploading || !projectId} /></label>
      {progress && <div className="bg-gray-50 p-4 rounded-md border space-y-2"><div className="flex justify-between text-sm font-bold"><span>حالة الرفع:</span><span>{progress.current + progress.failed} / {progress.total}</span></div><div className="w-full bg-gray-200 rounded-full h-2.5"><div className="bg-[#0284C7] h-2.5 rounded-full transition-all" style={{ width: `${((progress.current + progress.failed) / progress.total) * 100}%` }} /></div><div className="flex gap-4 text-sm"><span className="flex items-center gap-1 text-green-600"><CheckCircle className="w-4 h-4" /> تم: {progress.current}</span>{progress.failed > 0 && <span className="flex items-center gap-1 text-red-600"><AlertCircle className="w-4 h-4" /> فشل: {progress.failed}</span>}</div></div>}
    </div>
  </div>;
});
BulkGalleryUpload.displayName = 'BulkGalleryUpload';
export default BulkGalleryUpload;
