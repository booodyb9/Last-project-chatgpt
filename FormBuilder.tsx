import React, { useEffect, useState } from 'react';
import { useContent } from '../../contexts/ContentContext';
import { saveContent } from '../../lib/supabase';
import { Plus, Trash2, Edit2, FileText, Settings, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { safeParseJson } from '../../lib/safeJson';

const DraggableAny = Draggable as any;

export default function FormBuilder() {
  const { getContent, updateContent, refreshContent } = useContent();
  const formsContent = getContent('custom_forms');
  const [forms, setForms] = useState<any[]>([]);
  const [editingForm, setEditingForm] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const parsed = safeParseJson<any[]>(formsContent?.body, []);
    if (Array.isArray(parsed) && parsed.length) setForms(parsed);
    else setForms([
      { id: '1', title: 'نموذج اتصل بنا الأساسي', isHidden: false, fields: [
        { id: 'f1', label: 'الاسم', type: 'text', required: true },
        { id: 'f2', label: 'البريد الإلكتروني', type: 'email', required: true },
        { id: 'f3', label: 'الرسالة', type: 'textarea', required: true }
      ]},
      { id: '2', title: 'طلب عرض سعر', isHidden: false, fields: [
        { id: 'f1', label: 'الاسم', type: 'text', required: true },
        { id: 'f2', label: 'رقم الهاتف', type: 'tel', required: true },
        { id: 'f3', label: 'نوع الخدمة', type: 'select', options: ['تركيب زجاج', 'صيانة', 'استشارة'], required: true }
      ]}
    ]);
  }, [formsContent?.body]);

  const saveFormsToDb = async (newForms: any[]) => {
    setSaving(true);
    const bodyStr = JSON.stringify(newForms);
    try {
      await saveContent('custom_forms', 'Custom Forms', 'json', bodyStr);
      setForms(newForms);
      updateContent('custom_forms', bodyStr);
      await refreshContent();
      return true;
    } catch (e) {
      console.error('Failed to save forms', e);
      alert('حدث خطأ أثناء الحفظ');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !editingForm) return;
    const items = Array.from(editingForm.fields || []);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setEditingForm({ ...editingForm, fields: items });
  };

  const updateField = (index: number, patch: Record<string, unknown>) => {
    const fields = [...(editingForm.fields || [])];
    fields[index] = { ...fields[index], ...patch };
    setEditingForm({ ...editingForm, fields });
  };

  if (editingForm) return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2"><Settings className="w-5 h-5 text-[#0284C7]" /> تعديل النموذج: {editingForm.title}</h2>
        <div className="flex gap-2">
          <button onClick={() => setEditingForm(null)} className="px-4 py-2 border rounded">إلغاء</button>
          <button disabled={saving} onClick={async () => { const exists = forms.some((f) => f.id === editingForm.id); const next = exists ? forms.map((f) => f.id === editingForm.id ? editingForm : f) : [...forms, editingForm]; if (await saveFormsToDb(next)) setEditingForm(null); }} className="px-4 py-2 bg-[#0284C7] text-white rounded font-bold disabled:opacity-50">{saving ? 'جاري الحفظ...' : 'حفظ النموذج'}</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div><label className="block text-sm font-bold mb-2">اسم النموذج</label><input value={editingForm.title || ''} onChange={(e) => setEditingForm({ ...editingForm, title: e.target.value })} className="w-full border p-2 rounded" /></div>
        <label className="flex items-center gap-2 sm:items-end pb-2"><input type="checkbox" checked={!editingForm.isHidden} onChange={(e) => setEditingForm({ ...editingForm, isHidden: !e.target.checked })} /> النموذج ظاهر ومتاح</label>
      </div>

      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-4"><h3 className="font-bold">حقول النموذج</h3><button onClick={() => setEditingForm({ ...editingForm, fields: [...(editingForm.fields || []), { id: `f${Date.now()}`, label: 'حقل جديد', type: 'text', required: false }] })} className="text-sm bg-gray-100 px-3 py-1.5 rounded hover:bg-gray-200">+ إضافة حقل</button></div>
        <DragDropContext onDragEnd={handleDragEnd}><Droppable droppableId="fields">{(provided) => <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
          {(editingForm.fields || []).map((field: any, index: number) => <DraggableAny key={field.id} draggableId={field.id} index={index}>{(provided) => <div ref={provided.innerRef} {...provided.draggableProps} className="p-4 border rounded bg-gray-50">
            <div className="flex gap-3 items-start">
              <div {...provided.dragHandleProps} className="text-gray-400 cursor-grab pt-7"><GripVertical className="w-5 h-5" /></div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><label className="block text-xs mb-1">اسم الحقل</label><input value={field.label || ''} onChange={(e) => updateField(index, { label: e.target.value })} className="w-full border p-1.5 rounded text-sm" /></div>
                <div><label className="block text-xs mb-1">نوع الحقل</label><select value={field.type || 'text'} onChange={(e) => updateField(index, { type: e.target.value, options: e.target.value === 'select' ? (field.options || ['خيار جديد']) : field.options })} className="w-full border p-1.5 rounded text-sm"><option value="text">نص قصير</option><option value="textarea">نص طويل</option><option value="email">بريد إلكتروني</option><option value="tel">رقم هاتف</option><option value="select">قائمة منسدلة</option><option value="file">رفع ملف</option></select></div>
                <label className="flex items-end gap-2 pb-2 text-sm"><input type="checkbox" checked={!!field.required} onChange={(e) => updateField(index, { required: e.target.checked })} /> حقل إلزامي</label>
              </div>
              <button onClick={() => { const fields = [...editingForm.fields]; fields.splice(index, 1); setEditingForm({ ...editingForm, fields }); }} className="text-red-500 hover:bg-red-50 p-2 rounded mt-5"><Trash2 className="w-5 h-5" /></button>
            </div>
            {field.type === 'select' && <div className="mr-8 mt-4 bg-white rounded-lg border p-3"><label className="block text-xs font-bold mb-2">خيارات القائمة — خيار في كل سطر</label><textarea value={(field.options || []).join('\n')} onChange={(e) => updateField(index, { options: e.target.value.split('\n').map((v) => v.trim()).filter(Boolean) })} className="w-full border rounded p-2 text-sm min-h-24" /></div>}
          </div>}</DraggableAny>)}
          {provided.placeholder}
        </div>}</Droppable></DragDropContext>
      </div>
    </div>
  );

  return <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-6"><h2 className="text-xl font-bold flex items-center gap-2"><FileText className="w-6 h-6 text-[#0284C7]" /> منشئ النماذج</h2><button onClick={() => setEditingForm({ id: `form_${Date.now()}`, title: 'نموذج جديد', isHidden: false, fields: [] })} className="flex items-center gap-2 bg-[#0284C7] text-white px-4 py-2 rounded font-bold"><Plus className="w-5 h-5" /> إنشاء نموذج</button></div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{forms.map((form) => <div key={form.id} className="border rounded-lg p-4 flex justify-between items-center bg-gray-50"><div><h3 className="font-bold">{form.title}</h3><p className="text-sm text-gray-500">{(form.fields || []).length} حقول · {form.isHidden ? 'مخفي' : 'ظاهر'}</p></div><div className="flex gap-2"><button onClick={() => setEditingForm({ ...form, fields: (form.fields || []).map((f: any) => ({ ...f })) })} className="p-2 text-[#0284C7] hover:bg-blue-50 rounded"><Edit2 className="w-5 h-5" /></button><button disabled={saving} onClick={async () => { if (!confirm('هل تريد حذف النموذج؟')) return; await saveFormsToDb(forms.filter((f) => f.id !== form.id)); }} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-5 h-5" /></button></div></div>)}</div>
  </div>;
}
