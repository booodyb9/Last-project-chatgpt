import React, { useEffect, useMemo, useState } from 'react';
import { FileText, Image, MessageSquare, Eye, Target, Flame } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Lead } from './types';

export default function DashboardHome({ messages = [], contents = [], mediaFiles = [] }: any) {
  const unreadMessages = (messages || []).filter((m: any) => !m?.is_read && m?.status !== 'archived').length;
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false }).limit(20);
      if (!error) setLeads((data || []) as Lead[]);
    };
    load();
  }, []);

  const hot = leads.filter((l) => l.temperature === 'hot').length;
  const recent = useMemo(() => leads.slice(0, 6), [leads]);

  const cards = [
    { title: 'رسائل جديدة', value: unreadMessages.toString(), icon: MessageSquare },
    { title: 'العملاء المحتملون', value: leads.length.toString(), icon: Target },
    { title: 'Hot Leads', value: hot.toString(), icon: Flame },
    { title: 'الصفحات والمحتوى', value: (contents || []).length.toString(), icon: FileText },
    { title: 'الوسائط المرفوعة', value: (mediaFiles || []).length.toString(), icon: Image },
  ];

  return <div className="space-y-6" dir="rtl">
    <div><h2 className="text-2xl font-bold text-gray-900">نظرة عامة على الموقع</h2><p className="text-sm text-gray-500 mt-1">إحصائيات حقيقية من بيانات الموقع. لا يتم عرض أرقام زيارات وهمية.</p></div>
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">{cards.map(({ title, value, icon: Icon }) => <div key={title} className="bg-white p-5 rounded-xl border"><div className="w-10 h-10 rounded-lg bg-blue-50 text-[#0284C7] flex items-center justify-center mb-4"><Icon className="w-5 h-5" /></div><div className="text-2xl font-bold">{value}</div><div className="text-sm text-gray-500 mt-1">{title}</div></div>)}</div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white p-6 rounded-xl border"><h3 className="text-lg font-bold mb-4">أحدث العملاء المحتملين</h3>{recent.length ? <div className="divide-y">{recent.map((lead) => <div key={lead.id} className="py-3 flex items-center justify-between gap-3"><div><div className="font-bold">{lead.name || 'بدون اسم'}</div><div className="text-xs text-gray-500">{lead.service || lead.source}</div></div><div className="text-left"><div className="font-bold text-sm">{lead.score}/100</div><div className="text-xs text-gray-500">{lead.temperature}</div></div></div>)}</div> : <div className="py-10 text-center text-gray-500">لا توجد Leads مسجلة حتى الآن.</div>}</div>
      <div className="bg-white p-6 rounded-xl border"><h3 className="text-lg font-bold mb-4">إحصائيات الزوار</h3><div className="min-h-40 flex flex-col items-center justify-center text-center text-gray-500"><Eye className="w-10 h-10 opacity-30 mb-3" /><p>لا توجد خدمة Analytics حقيقية مرتبطة حالياً.</p><p className="text-xs mt-2">لن يتم اختراع أرقام زيارات.</p></div></div>
    </div>
  </div>;
}
