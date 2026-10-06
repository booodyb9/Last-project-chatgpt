import { memo, useMemo, useState } from 'react';
import { Mail, Search, Archive, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { Message } from './types';
import { supabase } from '../../lib/supabase';

interface MessagesProps {
  messages: Message[];
  loading: boolean;
  onRefresh?: () => void | Promise<void>;
}

const Messages = memo(({ messages, loading, onRefresh }: MessagesProps) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all');
  const [busyId, setBusyId] = useState<number | null>(null);

  const filtered = useMemo(() => (messages || []).filter((msg) => {
    const haystack = `${msg.name || ''} ${msg.email || ''} ${msg.phone || ''} ${msg.service || ''} ${msg.message || ''}`.toLowerCase();
    const matchesSearch = haystack.includes(search.toLowerCase());
    const isArchived = msg.status === 'archived' || !!msg.archived_at;
    const matchesFilter = filter === 'all' || (filter === 'unread' && !msg.is_read && !isArchived) || (filter === 'archived' && isArchived);
    return matchesSearch && matchesFilter;
  }), [messages, search, filter]);

  const updateMessage = async (id: number, patch: Partial<Message>) => {
    setBusyId(id);
    try {
      const { error } = await supabase.from('messages').update(patch).eq('id', id);
      if (error) throw error;
      await onRefresh?.();
    } catch (error) {
      console.error('Message update failed:', error);
      alert('تعذر تحديث الرسالة.');
    } finally {
      setBusyId(null);
    }
  };

  const deleteMessage = async (id: number) => {
    if (!confirm('هل تريد حذف هذه الرسالة نهائياً؟')) return;
    setBusyId(id);
    try {
      const { error } = await supabase.from('messages').delete().eq('id', id);
      if (error) throw error;
      await onRefresh?.();
    } catch (error) {
      console.error('Message delete failed:', error);
      alert('تعذر حذف الرسالة.');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">جاري التحميل...</div>;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Mail className="w-5 h-5 text-[#0284C7]" /> الرسائل الواردة</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث..." className="border rounded-lg pr-9 pl-3 py-2 text-sm w-full" />
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value as any)} className="border rounded-lg px-3 py-2 text-sm">
            <option value="all">الكل</option>
            <option value="unread">غير مقروءة</option>
            <option value="archived">مؤرشفة</option>
          </select>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {filtered.length === 0 ? <div className="p-8 text-center text-gray-500">لا توجد رسائل مطابقة.</div> : filtered.map((msg) => {
          const archived = msg.status === 'archived' || !!msg.archived_at;
          return (
            <div key={msg.id} className={`p-5 ${!msg.is_read && !archived ? 'bg-blue-50/40' : 'bg-white'}`}>
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900">{msg.name}</h3>
                    {!msg.is_read && !archived && <span className="text-[11px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">جديدة</span>}
                    {archived && <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">مؤرشفة</span>}
                  </div>
                  <div className="text-sm text-gray-500 mt-1 flex flex-wrap gap-3" dir="auto">
                    {msg.phone && <a href={`tel:${msg.phone}`} className="hover:text-[#0284C7]">{msg.phone}</a>}
                    {msg.email && <a href={`mailto:${msg.email}`} className="hover:text-[#0284C7]">{msg.email}</a>}
                    {msg.service && <span>الخدمة: {msg.service}</span>}
                  </div>
                  <p className="text-gray-700 mt-3 whitespace-pre-wrap">{msg.message}</p>
                  <span className="text-xs text-gray-400 mt-3 block">{new Date(msg.created_at).toLocaleString('ar-SA')}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button disabled={busyId === msg.id} onClick={() => updateMessage(msg.id, { is_read: !msg.is_read, status: !msg.is_read ? 'read' : 'new' })} className="p-2 rounded-lg border hover:bg-gray-50" title={msg.is_read ? 'تحديد كغير مقروءة' : 'تحديد كمقروءة'}>
                    {msg.is_read ? <Circle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4 text-green-600" />}
                  </button>
                  <button disabled={busyId === msg.id} onClick={() => updateMessage(msg.id, archived ? { status: 'read', archived_at: null } : { status: 'archived', archived_at: new Date().toISOString(), is_read: true })} className="p-2 rounded-lg border hover:bg-gray-50" title={archived ? 'إلغاء الأرشفة' : 'أرشفة'}><Archive className="w-4 h-4" /></button>
                  <button disabled={busyId === msg.id} onClick={() => deleteMessage(msg.id)} className="p-2 rounded-lg border text-red-600 hover:bg-red-50" title="حذف"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

Messages.displayName = 'Messages';
export default Messages;
