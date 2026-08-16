import { useEffect, useMemo, useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { computeLeadScore } from '../lib/leads';
import { useContent } from '../contexts/ContentContext';
import { getSiteSettings, normalizeWhatsAppNumber } from '../lib/settings';

function contextForPath(path: string) {
  if (path.startsWith('/services/')) return { text: 'هل تريد عرض سعر أو مساعدة بخصوص هذه الخدمة؟', source: 'service_page', service: decodeURIComponent(path.split('/').pop() || '') };
  if (path.startsWith('/portfolio/')) return { text: 'أعجبك هذا المشروع؟ يمكننا التواصل معك لتنفيذ حل مشابه.', source: 'project_page', service: 'مشروع مشابه' };
  if (path === '/request-quote') return { text: 'هل تريد أن يتواصل معك الفريق لإكمال عرض السعر؟', source: 'quote_form', service: 'طلب عرض سعر' };
  return { text: 'تحتاج مساعدة في اختيار الحل الزجاجي المناسب؟', source: 'other', service: '' };
}

export default function SmartLeadPrompt() {
  const location = useLocation();
  const { contents } = useContent();
  const settings = getSiteSettings(contents);
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const ctx = useMemo(() => contextForPath(location.pathname), [location.pathname]);

  useEffect(() => {
    setVisible(false); setExpanded(false); setDone(false); setError('');
    if (location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin')) return;
    const key = `lead_prompt_seen:${location.pathname}`;
    if (sessionStorage.getItem(key)) return;

    let triggered = false;
    const show = () => {
      if (triggered) return;
      triggered = true;
      sessionStorage.setItem(key, '1');
      setVisible(true);
    };
    const timer = window.setTimeout(show, location.pathname === '/' ? 45000 : 30000);
    const onScroll = () => {
      const doc = document.documentElement;
      const max = Math.max(1, doc.scrollHeight - window.innerHeight);
      if (window.scrollY / max > 0.55) show();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.clearTimeout(timer); window.removeEventListener('scroll', onScroll); };
  }, [location.pathname]);

  if (!visible) return null;

  const submit = async (openWhatsApp = false) => {
    if (!phone.trim()) { setError('أدخل رقم الجوال أولاً.'); return; }
    setBusy(true); setError('');
    const { score, temperature } = computeLeadScore({ hasContactDetails: true, requestedQuote: location.pathname === '/request-quote', openedWhatsApp: openWhatsApp, revisitedHighIntentPage: false });
    try {
      const source = openWhatsApp ? 'whatsapp_handoff' : ctx.source;
      const { error: insertError } = await supabase.from('leads').insert({
        name: name.trim() || 'عميل من الموقع',
        phone: phone.trim(),
        service: ctx.service || null,
        source,
        source_context: { path: location.pathname, prompt: ctx.text },
        status: 'new', score, temperature,
        message: `طلب تواصل من الصفحة: ${location.pathname}`
      });
      if (insertError) throw insertError;
      setDone(true);
      if (openWhatsApp) {
        const wa = normalizeWhatsAppNumber(settings.whatsappNumber || settings.phoneNumber);
        if (wa) window.open(`https://wa.me/${wa}?text=${encodeURIComponent(`مرحباً، أريد الاستفسار عن ${ctx.service || 'خدمات الزجاج'}. اسمي ${name || 'عميل من الموقع'}.`)}`, '_blank', 'noopener,noreferrer');
      }
    } catch (e) {
      console.error('Lead prompt submit failed:', e);
      setError('تعذر تسجيل الطلب حالياً. يمكنك استخدام زر واتساب المباشر.');
    } finally { setBusy(false); }
  };

  return <div className="fixed bottom-24 left-4 sm:left-20 z-[87] max-w-[calc(100vw-2rem)]" dir="rtl">
    <div className="w-[330px] max-w-full bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
      <div className="p-4 flex gap-3 items-start">
        <div className="w-10 h-10 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center shrink-0"><MessageCircle className="w-5 h-5" /></div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-slate-900 text-sm">{ctx.text}</div>
          {!expanded && !done && <button onClick={() => setExpanded(true)} className="text-sky-600 font-bold text-sm mt-2">نعم، تواصلوا معي</button>}
        </div>
        <button onClick={() => setVisible(false)} aria-label="إغلاق"><X className="w-4 h-4 text-slate-400" /></button>
      </div>
      {expanded && !done && <div className="border-t p-4 space-y-2 bg-slate-50">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="الاسم (اختياري)" className="w-full border rounded-lg px-3 py-2 text-sm bg-white" />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="رقم الجوال" dir="ltr" className="w-full border rounded-lg px-3 py-2 text-sm bg-white text-right" />
        {error && <div className="text-xs text-red-600">{error}</div>}
        <div className="grid grid-cols-2 gap-2"><button disabled={busy} onClick={() => submit(false)} className="bg-slate-900 text-white rounded-lg py-2 text-sm font-bold disabled:opacity-50">طلب تواصل</button><button disabled={busy} onClick={() => submit(true)} className="bg-[#25D366] text-white rounded-lg py-2 text-sm font-bold disabled:opacity-50">واتساب</button></div>
        <p className="text-[10px] text-slate-500">بالإرسال أنت تطلب من فريق الشركة التواصل معك بخصوص استفسارك.</p>
      </div>}
      {done && <div className="border-t p-4 bg-green-50 text-green-700 text-sm font-bold">تم تسجيل طلبك بنجاح.</div>}
    </div>
  </div>;
}
