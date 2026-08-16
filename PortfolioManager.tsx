import React, { useState, useEffect, useMemo } from 'react';
import { Content } from './types';
import { Plus, Edit2, Trash2, Eye, EyeOff, Star, Copy, Image as ImageIcon, Save, X, GripVertical, Sparkles, Loader2 } from 'lucide-react';
import { PortfolioProject } from './types';
import { v4 as uuidv4 } from 'uuid';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { saveContent, supabase } from '../../lib/supabase';
import imageCompression from 'browser-image-compression';
import { useContent } from '../../contexts/ContentContext';

interface Props {
  contents: Content[];
  fetchContents: () => void;
  token: string | null;
}

const CATEGORIES = [
  'واجهات زجاجية (Glass Facades)',
  'أبواب زجاجية (Glass Doors)',
  'كبائن شاور (Shower Cabins)',
  'مرايا (Mirrors)',
  'زجاج مكاتب (Office Glass)',
  'درابزين (Railings)',
  'سكني (Residential)',
  'تجاري (Commercial)',
  'أخرى (Other)'
];

export default function PortfolioManager({ contents, fetchContents, token }: Props) {
  const { updateContent } = useContent();
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProject, setCurrentProject] = useState<Partial<PortfolioProject>>({});
  const [saving, setSaving] = useState(false);

  const [generatingSEO, setGeneratingSEO] = useState(false);

  const generateProjectSEO = async () => {
    const titleToAnalyze = currentProject.title || '';
    const contentToAnalyze = currentProject.description || '';
    
    if (!contentToAnalyze && !titleToAnalyze) {
      alert('لا يوجد محتوى كافي لتوليد بيانات السيو');
      return;
    }

    setGeneratingSEO(true);
    try {
      const response = await fetch('/api/generate-seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: titleToAnalyze,
          content: contentToAnalyze,
          type: 'مشروع'
        })
      });

      if (!response.ok) throw new Error('فشل توليد البيانات');
      
      let data: any = {};
      const textRes = await response.text();
      try { data = JSON.parse(textRes); } catch(e) {}
  
      
      setCurrentProject({
        ...currentProject,
        seoTitle: data.title || currentProject.seoTitle,
        seoDescription: data.description || currentProject.seoDescription
      });
    } catch (error) {
      console.error(error);
      alert('حدث خطأ أثناء محاولة توليد السيو بواسطة الذكاء الاصطناعي');
    } finally {
      setGeneratingSEO(false);
    }
  };

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  useEffect(() => {
    const portfolioContent = contents.find(c => c.key === 'premium_portfolio_projects');
    if (portfolioContent?.body) {
      try {
        const parsed = JSON.parse(portfolioContent.body);
        if (Array.isArray(parsed)) {
          setProjects(parsed.sort((a, b) => (a.order || 0) - (b.order || 0)));
        }
      } catch (e) {
        console.error("Failed to parse portfolio projects", e);
      }
    }
  }, [contents]);


  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof PortfolioProject) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: false };
      const compressedFile = await imageCompression(file, options);
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage.from('media').upload(fileName, compressedFile);
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage.from('media').getPublicUrl(fileName);
      
      const newImage = { name: file.name, url: data.publicUrl, storage_path: `media/${fileName}` };
      await supabase.from('media').insert([newImage]);
      
      setCurrentProject({ ...currentProject, [fieldName]: data.publicUrl });
    } catch (error) {
      console.error("Upload error:", error);
      alert('فشل رفع الصورة');
    }
  };

  const saveProjects = async (newProjects: PortfolioProject[]) => {

    setSaving(true);
    try {
      await saveContent('premium_portfolio_projects', 'Premium Portfolio Projects', 'json', JSON.stringify(newProjects));
      updateContent('premium_portfolio_projects', JSON.stringify(newProjects));
      
      // Dispatch storage event to trigger cross-tab sync and Context reload
      
      fetchContents();
      setSuccessMessage('تم الحفظ بنجاح');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (e) {
      console.error(e);
      alert('حدث خطأ أثناء الحفظ');
    }
    setSaving(false);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    const items = Array.from(projects);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    const updatedItems = items.map((item, index) => ({
      ...(item as any),
      order: index
    }));
    
    setProjects(updatedItems);
    saveProjects(updatedItems);
  };

  const handleAddNew = () => {
    setCurrentProject({
      id: uuidv4(),
      title: '',
      slug: '',
      category: CATEGORIES[0],
      description: '',
      location: '',
      serviceType: '',
      client: '',
      completionDate: '',
      materialsUsed: '',
      coverImage: '',
      galleryImages: [],
      isFeatured: false,
      isHidden: false,
      order: projects.length,
      seoTitle: '',
      seoDescription: ''
    });
    setIsEditing(true);
  };

  const handleEdit = (project: PortfolioProject) => {
    if (!project.slug) project.slug = project.id;
    setCurrentProject({ ...project });
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المشروع؟')) {
      const updated = projects.filter(p => p.id !== id);
      setProjects(updated);
      saveProjects(updated);
    }
  };

  const handleDuplicate = (project: PortfolioProject) => {
    const duplicated = {
      ...project,
      id: uuidv4(),
      title: project.title + ' (نسخة)',
      slug: project.slug + '-copy',
      order: projects.length
    };
    const updated = [...projects, duplicated];
    setProjects(updated);
    saveProjects(updated);
  };

  const handleToggleHide = (project: PortfolioProject) => {
    const updated = projects.map(p => 
      p.id === project.id ? { ...p, isHidden: !p.isHidden } : p
    );
    setProjects(updated);
    saveProjects(updated);
  };

  const handleToggleFeature = (project: PortfolioProject) => {
    const updated = projects.map(p => 
      p.id === project.id ? { ...p, isFeatured: !p.isFeatured } : p
    );
    setProjects(updated);
    saveProjects(updated);
  };

  const saveCurrentProject = () => {
    if (!currentProject.title || !currentProject.slug) {
      alert('الرجاء إدخال عنوان المشروع ورابطه (Slug)');
      return;
    }
    
    let updated = [...projects];
    const existingIdx = updated.findIndex(p => p.id === currentProject.id);
    
    if (existingIdx >= 0) {
      updated[existingIdx] = currentProject as PortfolioProject;
    } else {
      updated.push(currentProject as PortfolioProject);
    }
    
    setProjects(updated);
    saveProjects(updated);
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">إدارة معرض الأعمال والمشاريع</h2>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 bg-[#0284C7] text-white px-4 py-2 rounded hover:bg-[#0369A1] transition"
        >
          <Plus className="w-5 h-5" />
          إضافة مشروع جديد
        </button>
      </div>

      {isEditing ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">العنوان</label>
              <input
                type="text"
                value={currentProject.title || ''}
                onChange={e => setCurrentProject({ ...currentProject, title: e.target.value })}
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">رابط المشروع (Slug)</label>
              <input
                type="text"
                value={currentProject.slug || ''}
                onChange={e => setCurrentProject({ ...currentProject, slug: e.target.value })}
                className="w-full border p-2 rounded"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">التصنيف</label>
              <select
                value={currentProject.category || CATEGORIES[0]}
                onChange={e => setCurrentProject({ ...currentProject, category: e.target.value })}
                className="w-full border p-2 rounded"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">نوع الخدمة</label>
              <input
                type="text"
                value={currentProject.serviceType || ''}
                onChange={e => setCurrentProject({ ...currentProject, serviceType: e.target.value })}
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">الموقع (المدينة/الحي)</label>
              <input
                type="text"
                value={currentProject.location || ''}
                onChange={e => setCurrentProject({ ...currentProject, location: e.target.value })}
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">العميل</label>
              <input
                type="text"
                value={currentProject.client || ''}
                onChange={e => setCurrentProject({ ...currentProject, client: e.target.value })}
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">تاريخ الانتهاء</label>
              <input
                type="text"
                value={currentProject.completionDate || ''}
                onChange={e => setCurrentProject({ ...currentProject, completionDate: e.target.value })}
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">المواد المستخدمة</label>
              <input
                type="text"
                value={currentProject.materialsUsed || ''}
                onChange={e => setCurrentProject({ ...currentProject, materialsUsed: e.target.value })}
                className="w-full border p-2 rounded"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">صورة الغلاف (Cover Image URL)</label>
            <input
              type="text"
              value={currentProject.coverImage || ''}
              onChange={e => setCurrentProject({ ...currentProject, coverImage: e.target.value })}
              className="w-full border p-2 rounded"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">معرض الصور (رابط لكل سطر)</label>
            <textarea
              value={currentProject.galleryImages?.join('\n') || ''}
              onChange={e => setCurrentProject({ ...currentProject, galleryImages: e.target.value.split('\n').filter(Boolean) })}
              className="w-full border p-2 rounded h-32"
              dir="ltr"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
              <label className="block text-sm font-medium mb-1">صورة قبل (Before Image URL)</label>
              <input
                type="text"
                value={currentProject.beforeImage || ''}
                onChange={e => setCurrentProject({ ...currentProject, beforeImage: e.target.value })}
                className="w-full border p-2 rounded"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">صورة بعد (After Image URL)</label>
              <input
                type="text"
                value={currentProject.afterImage || ''}
                onChange={e => setCurrentProject({ ...currentProject, afterImage: e.target.value })}
                className="w-full border p-2 rounded"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">وصف المشروع</label>
            <textarea
              value={currentProject.description || ''}
              onChange={e => setCurrentProject({ ...currentProject, description: e.target.value })}
              className="w-full border p-2 rounded h-32"
            />
          </div>

          <div className="border-t pt-4">
            
            <h3 className="font-bold mb-2">تحسين محركات البحث (SEO)</h3>
            {(!currentProject.seoTitle || !currentProject.seoDescription) && (
              <div className="bg-yellow-50 text-yellow-800 p-3 rounded mb-4 text-sm font-bold flex gap-2 items-center">
                ⚠️ تنبيه: يرجى إكمال إعدادات SEO (العنوان والوصف) لضمان أرشفة أفضل.
              </div>
            )}

            <div className="mb-4 flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-100">
              <div className="text-sm text-blue-800 font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                مساعد الذكاء الاصطناعي
              </div>
              <button
                onClick={generateProjectSEO}
                disabled={generatingSEO}
                className="flex items-center gap-2 bg-[#0284C7] text-white px-3 py-1.5 rounded text-sm hover:bg-[#0369A1] transition-colors disabled:opacity-50"
              >
                {generatingSEO ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                توليد العنوان والوصف
              </button>
            </div>


            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">SEO Title</label>
                <input
                  type="text"
                  value={currentProject.seoTitle || ''}
                  onChange={e => setCurrentProject({ ...currentProject, seoTitle: e.target.value })}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">SEO Description</label>
                <textarea
                  value={currentProject.seoDescription || ''}
                  onChange={e => setCurrentProject({ ...currentProject, seoDescription: e.target.value })}
                  className="w-full border p-2 rounded h-20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">SEO Keywords</label>
                <input type="text" value={currentProject.seoKeywords || ''} onChange={e => setCurrentProject({ ...currentProject, seoKeywords: e.target.value })} className="w-full border p-2 rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">SEO Canonical URL</label>
                <input type="text" value={currentProject.seoCanonical || ''} onChange={e => setCurrentProject({ ...currentProject, seoCanonical: e.target.value })} className="w-full border p-2 rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">SEO OG Image</label>
                <input type="text" value={currentProject.seoImage || ''} onChange={e => setCurrentProject({ ...currentProject, seoImage: e.target.value })} className="w-full border p-2 rounded" />
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer mt-6">
                  <input type="checkbox" checked={!!currentProject.seoNoIndex} onChange={e => setCurrentProject({ ...currentProject, seoNoIndex: e.target.checked })} className="w-5 h-5 rounded border-gray-300 text-[#0284C7] focus:ring-[#0284C7]" />
                  <span className="text-gray-700 font-bold">منع الأرشفة (NoIndex)</span>
                </label>
              </div>

            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
            >
              إلغاء
            </button>
            <button
              onClick={saveCurrentProject}
              disabled={saving}
              className="px-4 py-2 bg-[#0284C7] text-white rounded hover:bg-[#0369A1] transition disabled:opacity-50"
            >
              {saving ? 'جاري الحفظ...' : 'حفظ المشروع'}
            </button>
          </div>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="projects">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                {projects.map((project, index) => (
                  <Draggable draggableId={project.id} index={index}>
                  {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps} key={project.id}
                        className={`flex items-center gap-4 p-4 border rounded-lg bg-white ${project.isHidden ? 'opacity-60' : ''}`}
                      >
                        <div {...provided.dragHandleProps} className="text-gray-400 hover:text-gray-600 cursor-grab">
                          <GripVertical className="w-5 h-5" />
                        </div>
                        
                        <div className="w-16 h-16 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                          {project.coverImage ? (
                            <img loading="lazy" decoding="async" src={project.coverImage} alt={project.title || 'صورة'} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-8 h-8 text-gray-400 m-auto mt-4" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 truncate flex items-center gap-2">
                            {project.title}
                            {project.isFeatured && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                            {project.isHidden && <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">مخفي</span>}
                          </h4>
                          <div className="text-sm text-gray-500 flex gap-4 truncate">
                            <span>{project.category}</span>
                            <span>{project.slug}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleFeature(project)}
                            className={`p-2 rounded hover:bg-gray-100 ${project.isFeatured ? 'text-yellow-500' : 'text-gray-400'}`}
                            title={project.isFeatured ? 'إزالة من المميزة' : 'تمييز المشروع'}
                          >
                            <Star className={`w-5 h-5 ${project.isFeatured ? 'fill-current' : ''}`} />
                          </button>
                          <button
                            onClick={() => handleToggleHide(project)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                            title={project.isHidden ? 'إظهار المشروع' : 'إخفاء المشروع'}
                          >
                            {project.isHidden ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                          <button
                            onClick={() => handleDuplicate(project)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                            title="تكرار المشروع"
                          >
                            <Copy className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleEdit(project)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded"
                            title="تعديل المشروع"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(project.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                            title="حذف المشروع"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
}
