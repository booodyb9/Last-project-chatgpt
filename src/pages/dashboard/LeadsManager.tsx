import { useEffect, useMemo, useState } from 'react';
import { Search, Flame, ThermometerSun, Snowflake, CalendarClock, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Lead } from './types';

const statusLabels: Record<Lead['status'], string> = {
  new: 'جديد', contacted: 'تم التواصل', interested: 'مهتم', quote_sent: 'تم إرسال عرض', won: 'تم الاتفاق', lost: 'غير مهتم', closed: 'مغلق'
};

export default function LeadsManager() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | Lead['status']>('all');
  const [selected, setSelected] = useState<Lead | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchLeads = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    if (error) console.error('Failed to load leads:', error);
    else setLeads((data || []) as Lead[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchLeads();
    const channel = supabase.channel('admin_leads_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, fetchLeads).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const filtered = useMemo(() => leads.filter((lead) => {
    const q = search.toLowerCase();
    const haystack = `${lead.name || ''} ${lead.phone || ''} ${lead.email || ''} ${lead.service || ''} ${lead.source || ''}`.toLowerCase();
    return haystack.includes(q) && (status === 'all' || lead.status === status);
  }), [leads, search, status]);

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('leads').update({
        status: selected.status,
        notes: selected.notes,
        follow_up_at: selected.follow_up_at || null,
        assigned_admin: selected.assigned_admin || null,
        last_activity_at: new Date().toISOString()
      }).eq('id', selected.id);
      if (error) throw error;
      await supabase.from('lead_activities').insert({ lead_id: selected.id, activity_type: 'admin_update', details: { status: selected.status, notes: selected.notes || '' } });
      await fetchLeads();
      setSelected(null);
    } catch (error) {
      console.error(error);
      alert('تعذر حفظ بيانات العميل المحتمل.');
    } finally {
      setSaving(false);
    }
  };

  const tempIcon = (lead: Lead) => lead.temperature === 'hot' ? <Flame className="w-4 h-4 text-red-500" /> : lead.temperature === 'warm' ? <ThermometerSun className="w-4 h-4 text-orange-500" /> : <Snowflake className="w-4 h-4 text-sky-500" />;

  if (loading) return <div className="p-8 text-center text-gray-500">جاري تحميل العملاء المحتملين...</div>;

  return (
    <div className="space-y-4" dir="rtl">
      <div className="bg-white rounded-xl border p-5 flex flex-col lg:flex-row gap-3 lg:items-center justify-between">
        <div><h2 className="text-xl font-bold">العملاء المحتملون CRM</h2><p className="text-sm text-gray-500 mt-1">متابعة العملاء من أول تفاعل حتى الاتفاق.</p></div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative"><Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} className="border rounded-lg pr-9 pl-3 py-2" placeholder="بحث بالاسم أو الجوال..." /></div>
          <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="border rounded-lg px-3 py-2">
            <option value="all">كل الحالات</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="w-full min-w-[850px] text-sm">
          <thead className="bg-gray-50"><tr><th className="p-3 text-right">العميل</th><th className="p-3 text-right">الخدمة</th><th className="p-3 text-right">المصدر</th><th className="p-3 text-right">الاهتمام</th><th className="p-3 text-right">الحالة</th><th className="p-3 text-right">المتابعة</th><th className="p-3"></th></tr></thead>
          <tbody className="divide-y">
            {filtered.map((lead) => <tr key={lead.id} className="hover:bg-gray-50">
              <td className="p-3"><div className="font-bold">{lead.name || 'بدون اسم'}</div><div dir="ltr" className="text-gray-500 text-xs text-right">{lead.phone || lead.email || '—'}</div></td>
              <td className="p-3">{lead.service || '—'}</td><td className="p-3">{lead.source}</td>
              <td className="p-3"><div className="flex items-center gap-2">{tempIcon(lead)} <span>{lead.score}/100</span></div></td>
              <td className="p-3">{statusLabels[lead.status]}</td>
              <td className="p-3">{lead.follow_up_at ? new Date(lead.follow_up_at).toLocaleDateString('ar-SA') : '—'}</td>
              <td className="p-3"><button onClick={() => setSelected({ ...lead })} className="text-[#0284C7] font-bold">فتح</button></td>
            </tr>)}
            {filtered.length === 0 && <tr><td colSpan={7} className="p-10 text-center text-gray-500">لا توجد نتائج.</td></tr>}
          </tbody>
        </table>
      </div>

      {selected && <div className="fixed inset-0 z-[100] bg-black/50 flex items-end sm:items-center justify-center p-4" onClick={() => setSelected(null)}>
        <div className="bg-white rounded-2xl w-full max-w-2xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
          <div><h3 className="text-xl font-bold">{selected.name || 'عميل محتمل'}</h3><p className="text-sm text-gray-500" dir="ltr">{selected.phone || selected.email}</p></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className="block text-sm font-bold mb-1">الحالة</label><select value={selected.status} onChange={(e) => setSelected({ ...selected, status: e.target.value as Lead['status'] })} className="w-full border rounded-lg px-3 py-2">{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
            <div><label className="block text-sm font-bold mb-1">موعد المتابعة</label><div className="relative"><CalendarClock className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" /><input type="datetime-local" value={selected.follow_up_at ? new Date(selected.follow_up_at).toISOString().slice(0,16) : ''} onChange={(e) => setSelected({ ...selected, follow_up_at: e.target.value ? new Date(e.target.value).toISOString() : null })} className="w-full border rounded-lg pr-9 pl-3 py-2" /></div></div>
          </div>
          <div><label className="block text-sm font-bold mb-1">ملاحظات</label><textarea value={selected.notes || ''} onChange={(e) => setSelected({ ...selected, notes: e.target.value })} className="w-full border rounded-lg p-3 min-h-28" /></div>
          
          <div className="bg-gray-50 rounded-xl p-3 text-sm max-h-[40vh] overflow-y-auto space-y-3">
            <div><b>المصدر:</b> {selected.source}</div>
            {selected.source_context?.area && <div><b>المنطقة:</b> {selected.source_context.area}</div>}
            <div><b>درجة الاهتمام:</b> {selected.score} ({selected.temperature})</div>
            {selected.message && <div><b>الرسالة:</b> {selected.message}</div>}
            
            {/* AI Vision Content */}
            {selected.source_context?.ai_summary && (
              <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg space-y-2">
                <h4 className="font-bold text-blue-900 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-blue-600" /> ملخص الذكاء الاصطناعي
                </h4>
                <p className="whitespace-pre-wrap text-blue-800">{selected.source_context.ai_summary}</p>
              </div>
            )}
            
            {selected.source_context?.image_url && (
              <div className="space-y-1">
                <b>الصورة المرفقة:</b>
                <a href={selected.source_context.image_url} target="_blank" rel="noopener noreferrer" className="block">
                  <img src={selected.source_context.image_url} alt="Lead upload" className="w-full max-h-48 object-contain bg-white rounded-lg border shadow-sm" />
                </a>
              </div>
            )}
            
            {selected.source_context?.ai_analysis && (
              <div className="bg-white border p-3 rounded-lg space-y-1">
                <h4 className="font-bold text-gray-700">تحليل الصورة المبدئي:</h4>
                <p className="text-gray-600">{selected.source_context.ai_analysis}</p>
              </div>
            )}

            {selected.source_context?.chat_history && Array.isArray(selected.source_context.chat_history) && (
              <div className="space-y-2 mt-4 pt-4 border-t">
                <h4 className="font-bold text-gray-800">محادثة العميل مع المساعد:</h4>
                <div className="space-y-2">
                  {selected.source_context.chat_history.map((msg: any, i: number) => (
                    <div key={i} className={`p-2 rounded-lg text-xs ${msg.role === 'user' ? 'bg-sky-100 text-sky-900 ml-8' : 'bg-white border mr-8'}`}>
                      <b>{msg.role === 'user' ? 'العميل' : 'المساعد'}:</b> {msg.content}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 justify-end"><button onClick={() => setSelected(null)} className="px-4 py-2 border rounded-lg">إلغاء</button><button disabled={saving} onClick={save} className="px-4 py-2 bg-[#0284C7] text-white rounded-lg font-bold flex items-center gap-2"><Save className="w-4 h-4" />{saving ? 'جاري الحفظ...' : 'حفظ'}</button></div>
        </div>
      </div>}
    </div>
  );
}
