import { useEffect, useState } from 'react';
import { Activity, Shield, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function AdminUsersView() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { supabase.from('admins').select('user_id,email,created_at').order('created_at', { ascending: false }).then(({ data, error }) => { if (error) console.error(error); else setRows(data || []); setLoading(false); }); }, []);
  return <div className="bg-white border rounded-xl p-6"><h2 className="text-xl font-bold flex gap-2 items-center"><Users className="w-5 h-5 text-[#0284C7]"/>المستخدمون الإداريون</h2><p className="text-sm text-gray-500 mt-2 mb-5">تعرض هذه الصفحة حسابات الإدارة المصرح بها فقط، ولا تكشف auth.users للواجهة.</p>{loading ? <div>جاري التحميل...</div> : <div className="divide-y">{rows.map((r) => <div key={r.user_id} className="py-3 flex justify-between gap-3"><span>{r.email || 'بدون بريد'}</span><code className="text-xs text-gray-400">{String(r.user_id).slice(0,8)}…</code></div>)}{rows.length === 0 && <div className="text-gray-500 py-6">لا توجد بيانات متاحة.</div>}</div>}</div>;
}

export function RolesView() {
  return <div className="bg-white border rounded-xl p-6"><h2 className="text-xl font-bold flex gap-2 items-center"><Shield className="w-5 h-5 text-[#0284C7]"/>الصلاحيات</h2><p className="text-gray-600 mt-3 leading-7">النظام الحالي يعتمد صلاحية Admin المسجلة في جدول <code>admins</code>. لم يتم اختراع RBAC وهمي أو منح صلاحيات من الواجهة. يمكن توسيع الأدوار لاحقاً إذا أضيف نموذج صلاحيات حقيقي في قاعدة البيانات.</p><div className="mt-4 bg-green-50 text-green-700 border border-green-100 rounded-lg p-3 text-sm">الحماية الحالية: المستخدم المسجل لا يدخل لوحة الإدارة إلا إذا كان موجوداً في admins.</div></div>;
}

export function ActivityView() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { supabase.from('admin_activity').select('*').order('created_at', { ascending: false }).limit(100).then(({ data, error }) => { if (error) console.error(error); else setRows(data || []); setLoading(false); }); }, []);
  return <div className="bg-white border rounded-xl p-6"><h2 className="text-xl font-bold flex gap-2 items-center"><Activity className="w-5 h-5 text-[#0284C7]"/>سجل النشاطات</h2>{loading ? <div className="py-8 text-gray-500">جاري التحميل...</div> : <div className="divide-y mt-5">{rows.map((r) => <div key={r.id} className="py-3"><div className="font-bold text-sm">{r.action}</div><div className="text-xs text-gray-500 mt-1">{r.entity_type || 'system'} · {new Date(r.created_at).toLocaleString('ar-SA')}</div></div>)}{rows.length === 0 && <div className="py-8 text-gray-500">لا توجد نشاطات مسجلة بعد.</div>}</div>}</div>;
}
