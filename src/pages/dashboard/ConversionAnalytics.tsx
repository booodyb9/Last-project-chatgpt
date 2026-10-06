import { useEffect, useMemo, useState } from 'react';
import { BarChart3, Flame, MessageSquare, Calculator, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Lead } from './types';

export default function ConversionAnalytics() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('leads').select('*');
      if (error) console.error(error); else setLeads((data || []) as Lead[]);
      setLoading(false);
    };
    load();
  }, []);

  const stats = useMemo(() => {
    const bySource = leads.reduce<Record<string, number>>((acc, lead) => { acc[lead.source] = (acc[lead.source] || 0) + 1; return acc; }, {});
    const byStatus = leads.reduce<Record<string, number>>((acc, lead) => { acc[lead.status] = (acc[lead.status] || 0) + 1; return acc; }, {});
    return {
      total: leads.length,
      hot: leads.filter((l) => l.temperature === 'hot').length,
      ai: (bySource.ai_assistant || 0) + (bySource.image_analysis || 0),
      calculator: bySource.calculator || 0,
      image: bySource.image_analysis || 0,
      whatsapp: bySource.whatsapp_handoff || 0,
      won: byStatus.won || 0,
      bySource,
      byStatus
    };
  }, [leads]);

  if (loading) return <div className="p-8 text-center text-gray-500">جاري تحميل بيانات التحويل...</div>;
  const cards = [
    ['إجمالي العملاء المحتملين', stats.total, BarChart3], ['Hot Leads', stats.hot, Flame], ['تحويلات AI', stats.ai, MessageSquare], ['تحويلات الحاسبة', stats.calculator, Calculator], ['تحليل الصور', stats.image, ImageIcon]
  ] as const;
  const sourceEntries = Object.entries(stats.bySource) as [string, number][];
  const statusEntries = Object.entries(stats.byStatus) as [string, number][];

  return <div className="space-y-6" dir="rtl">
    <div><h2 className="text-2xl font-bold">تحليلات التحويل</h2><p className="text-gray-500 mt-1">البيانات هنا مبنية على العملاء المسجلين فعلياً فقط.</p></div>
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">{cards.map(([label, value, Icon]) => <div key={label} className="bg-white border rounded-xl p-5"><Icon className="w-5 h-5 text-[#0284C7] mb-3"/><div className="text-2xl font-bold">{value}</div><div className="text-sm text-gray-500 mt-1">{label}</div></div>)}</div>
    {stats.total === 0 ? <div className="bg-white border rounded-xl p-10 text-center text-gray-500">لا توجد بيانات Leads حتى الآن. لن نعرض أرقاماً وهمية.</div> : <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div className="bg-white border rounded-xl p-5"><h3 className="font-bold mb-4">حسب المصدر</h3><div className="space-y-3">{sourceEntries.sort((a,b)=>b[1]-a[1]).map(([source,count]) => <div key={source}><div className="flex justify-between text-sm mb-1"><span>{source}</span><b>{count}</b></div><div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-[#0284C7]" style={{ width: `${Math.max(5, (count / stats.total) * 100)}%` }} /></div></div>)}</div></div>
      <div className="bg-white border rounded-xl p-5"><h3 className="font-bold mb-4">مسار الحالات</h3><div className="space-y-3">{statusEntries.map(([status,count]) => <div key={status} className="flex justify-between border-b pb-2"><span>{status}</span><b>{count}</b></div>)}</div><div className="mt-4 text-sm text-gray-500">تم الاتفاق: <b>{stats.won}</b> · نقرات واتساب المسجلة: <b>{stats.whatsapp}</b></div></div>
    </div>}
  </div>;
}
