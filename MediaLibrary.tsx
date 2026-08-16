import React, { useState } from 'react';
import { Upload, Trash2, Search, File, Image as ImageIcon, Video, Folder, Link as LinkIcon, CheckCircle2 } from 'lucide-react';
import { MediaFile } from './types';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../../lib/supabase';

interface Props {
  mediaFiles: MediaFile[];
  fetchMedia: () => void | Promise<void>;
  onSelect?: (url: string) => void;
  isModal?: boolean;
}

type MediaFilter = 'all' | 'image' | 'video' | 'document';

function inferType(file: File) {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  return 'document';
}

export default function MediaLibrary({ mediaFiles, fetchMedia, onSelect, isModal }: Props) {
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<MediaFilter>('all');
  const [copiedId, setCopiedId] = useState<string | number | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (!files.length) return;
    setUploading(true);
    const failures: string[] = [];
    try {
      for (const file of files) {
        const fileExt = file.name.split('.').pop()?.toLowerCase() || 'bin';
        const fileName = `${uuidv4()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('media').upload(fileName, file);
        if (uploadError) { failures.push(`${file.name}: ${uploadError.message}`); continue; }

        const { data } = supabase.storage.from('media').getPublicUrl(fileName);
        const record = { name: file.name, url: data.publicUrl, storage_path: `media/${fileName}`, type: inferType(file), size: file.size };
        const { error: insertError } = await supabase.from('media').insert(record);
        if (insertError) {
          await supabase.storage.from('media').remove([fileName]);
          failures.push(`${file.name}: ${insertError.message}`);
        }
      }
      await fetchMedia();
      if (failures.length) alert(`تم رفع بعض الملفات، وفشل ${failures.length} ملف. راجع وحدة التحكم للتفاصيل.`);
    } catch (err) {
      console.error(err);
      alert('فشل رفع الملفات.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm('هل تريد حذف هذا الملف؟')) return;
    const fileToDelete = (mediaFiles || []).find((m) => m.id === id);
    if (!fileToDelete) return;
    try {
      let storagePath = fileToDelete.storage_path?.replace(/^media\//, '');
      if (!storagePath && fileToDelete.url) storagePath = fileToDelete.url.split('/').pop();

      if (storagePath) {
        const { error: storageError } = await supabase.storage.from('media').remove([storagePath]);
        if (storageError) throw storageError;
      }
      const { error: dbError } = await supabase.from('media').delete().eq('id', id);
      if (dbError) throw dbError;
      await fetchMedia();
    } catch (err) {
      console.error(err);
      alert('تعذر حذف الملف بالكامل. لم يتم عرض نجاح زائف.');
    }
  };

  const copyToClipboard = async (url: string, id: string | number) => {
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredMedia = (mediaFiles || []).filter((m) => {
    const name = String(m.name || '');
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase());
    const extImage = /\.(jpeg|jpg|gif|png|webp|svg)(\?|$)/i.test(m.url || '');
    const extVideo = /\.(mp4|webm|ogg)(\?|$)/i.test(m.url || '');
    const isImage = m.type === 'image' || extImage;
    const isVideo = m.type === 'video' || extVideo;
    const isDocument = m.type === 'document' || m.type === 'pdf' || (!isImage && !isVideo);
    const matchesFilter = filter === 'all' || (filter === 'image' && isImage) || (filter === 'video' && isVideo) || (filter === 'document' && isDocument);
    return matchesSearch && matchesFilter;
  });

  return <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${isModal ? 'h-full flex flex-col' : ''}`}>
    <div className="p-6 border-b bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
      <h2 className="text-xl font-bold text-[#0F172A] flex items-center gap-2"><Folder className="w-6 h-6 text-[#0284C7]" /> مكتبة الوسائط</h2>
      <label className="bg-[#0284C7] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#0369A1] cursor-pointer flex items-center gap-2 w-fit"><Upload className="w-5 h-5" />{uploading ? 'جاري الرفع...' : 'رفع ملفات'}<input type="file" multiple accept="image/*,video/*,application/pdf" className="hidden" onChange={handleUpload} disabled={uploading} /></label>
    </div>
    <div className="p-6 border-b flex flex-col md:flex-row gap-4 shrink-0">
      <div className="relative flex-1"><input placeholder="بحث في الملفات..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" /><Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" /></div>
      <div className="flex gap-2 flex-wrap">{([['all','الكل'],['image','صور'],['video','فيديو'],['document','مستندات']] as const).map(([value,label]) => <button key={value} onClick={() => setFilter(value)} className={`px-4 py-2 rounded-lg font-medium ${filter === value ? 'bg-[#0284C7] text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>{label}</button>)}</div>
    </div>
    <div className={`p-6 ${isModal ? 'overflow-y-auto flex-1' : ''}`}>{filteredMedia.length === 0 ? <div className="text-center py-12 text-gray-500"><ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" /><p>لا توجد ملفات مطابقة.</p></div> : <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">{filteredMedia.map((file) => {
      const isImage = file.type === 'image' || /\.(jpeg|jpg|gif|png|webp|svg)(\?|$)/i.test(file.url || '');
      const isVideo = file.type === 'video' || /\.(mp4|webm|ogg)(\?|$)/i.test(file.url || '');
      return <div key={file.id} className="group relative border rounded-lg overflow-hidden hover:shadow-md bg-gray-50 cursor-pointer" onClick={() => onSelect?.(file.url)}>
        <div className="aspect-square bg-gray-100 flex items-center justify-center relative">{isImage ? <img loading="lazy" decoding="async" src={file.url} alt={file.name || 'صورة'} className="w-full h-full object-cover" /> : isVideo ? <Video className="w-12 h-12 text-gray-400" /> : <File className="w-12 h-12 text-gray-400" />}
          {!isModal && <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"><button onClick={(e) => { e.stopPropagation(); copyToClipboard(file.url, file.id); }} className="p-2 bg-white rounded-full" title="نسخ الرابط">{copiedId === file.id ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <LinkIcon className="w-5 h-5" />}</button><button onClick={(e) => { e.stopPropagation(); handleDelete(file.id); }} className="p-2 bg-white rounded-full text-red-500" title="حذف"><Trash2 className="w-5 h-5" /></button></div>}
        </div><div className="p-2 text-xs"><p className="truncate font-medium">{file.name}</p><p className="text-gray-500">{file.size ? `${Math.round(file.size / 1024)} KB` : file.type || 'ملف'}</p></div>
      </div>})}</div>}</div>
  </div>;
}
