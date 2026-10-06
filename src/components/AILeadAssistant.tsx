import React, { useMemo, useRef, useState } from 'react';
import { Bot, Camera, Send, X, Loader2, RotateCcw, Sparkles, Image as ImageIcon } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { computeLeadScore } from '../lib/leads';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || '').split(',')[1] || '');
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function AILeadAssistant() {
  const location = useLocation();
  const fileRefCamera = useRef<HTMLInputElement>(null);
  const fileRefGallery = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'أهلاً بك 👋 أنا مساعد زجاج الرياض. صف مشروعك أو أرسل صورة للمكان وسأساعدك في اختيار الحل المناسب.' }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [leadOpen, setLeadOpen] = useState(false);
  const [lead, setLead] = useState({ name: '', phone: '', service: '' });
  const [leadSaved, setLeadSaved] = useState(false);

  const isAdminPath = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin');
  const canSend = useMemo(() => (input.trim().length > 0 || selectedImage !== null) && !loading, [input, selectedImage, loading]);
  if (isAdminPath) return null;


  const clearSelectedImage = () => {
    setSelectedImage(null);
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(null);
    }
    if (fileRefCamera.current) fileRefCamera.current.value = '';
    if (fileRefGallery.current) fileRefGallery.current.value = '';
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setError('');
    
    if (!file.type.match(/image\/(jpeg|png|webp|heic|heif)/i)) {
      setError('عذراً، الصيغة غير مدعومة. يرجى اختيار صورة صالحة.');
      e.target.value = '';
      return;
    }

    try {
      setLoading(true);
      const options = {
        maxSizeMB: 4.5,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: 'image/jpeg'
      };
      const compressedFile = await imageCompression(file, options);
      const previewUrl = URL.createObjectURL(compressedFile);
      setImagePreviewUrl(previewUrl);
      setSelectedImage(compressedFile);
    } catch (error) {
      setError('تعذر معالجة الصورة.');
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  const send = async () => {
    if (!canSend) return;
    
    const text = input.trim();
    const hasImage = selectedImage !== null;
    const currentImage = selectedImage;
    
    const next = [...messages, { role: 'user' as const, content: hasImage ? `📷 أرسلت صورة للمكان${text ? ` — ${text}` : ''}` : text }];
    setMessages(next);
    
    setInput('');
    clearSelectedImage();
    setError('');
    setLoading(true);
    
    try {
      if (hasImage && currentImage) {
        const data = await fileToBase64(currentImage);
        const response = await fetch('/api/ai/image', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ image: { mimeType: currentImage.type, data }, note: text })
        });
        
        let payload: any = {};
        const textRes = await response.text();
        try { payload = JSON.parse(textRes); } catch(e) {}
        
        if (!response.ok) throw new Error(payload.error || 'تعذر تحليل الصورة');
        if (!payload.analysis) throw new Error('استجابة فارغة من الخادم');
        
        setMessages((prev) => [...prev, { role: 'assistant', content: payload.analysis }]);
        setLeadOpen(true);
      } else {
        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ messages: next })
        });
        
        let data: any = {};
        const textRes = await response.text();
        try { data = JSON.parse(textRes); } catch(e) {}
        
        if (!response.ok) throw new Error(data.error || 'تعذر الرد الآن');
        if (!data.reply) throw new Error('استجابة فارغة من الخادم');
        
        setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'تعذر الاتصال بالمساعد حالياً');
    } finally {
      setLoading(false);
    }
  };

  const saveLead = async () => {
    if (!lead.phone.trim()) {
      setError('أدخل رقم الجوال للتواصل.');
      return;
    }
    const { score, temperature } = computeLeadScore({ hasContactDetails: true, usedAiAssistant: true, uploadedImage: messages.some((m) => m.content.includes('📷')) });
    const { error: insertError } = await supabase.from('leads').insert({
      name: lead.name.trim() || 'عميل من الموقع',
      phone: lead.phone.trim(),
      service: lead.service.trim() || null,
      source: messages.some((m) => m.content.includes('📷')) ? 'image_analysis' : 'ai_assistant',
      source_context: { path: location.pathname },
      message: messages.slice(-4).map((m) => `${m.role}: ${m.content}`).join('\n'),
      status: 'new',
      score,
      temperature
    });
    if (insertError) {
      setError('تعذر حفظ طلب التواصل. يمكنك التواصل معنا مباشرة عبر واتساب.');
      return;
    }
    setLeadSaved(true);
    setLeadOpen(false);
  };

  return (
    <div className="fixed bottom-24 right-4 sm:right-6 z-[90]" dir="rtl">
      {open && (
        <div className="mb-3 w-[calc(100vw-2rem)] max-w-[390px] h-[min(70vh,600px)] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-4 bg-slate-950 text-white flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold"><Sparkles className="w-5 h-5 text-sky-400" /> مساعد زجاج الرياض</div>
            <button onClick={() => setOpen(false)} aria-label="إغلاق المساعد"><X className="w-5 h-5" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
            {messages.map((m, i) => (
              <div key={i} className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 whitespace-pre-wrap ${m.role === 'user' ? 'mr-auto bg-sky-600 text-white rounded-bl-sm' : 'ml-auto bg-white border text-slate-800 rounded-br-sm'}`}>
                {m.content}
              </div>
            ))}
            {loading && <div className="flex items-center gap-2 text-sm text-slate-500"><Loader2 className="w-4 h-4 animate-spin" /> جاري التفكير...</div>}
            {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 p-3 rounded-xl">{error}</div>}
            {leadSaved && <div className="text-sm text-green-700 bg-green-50 border border-green-100 p-3 rounded-xl">تم تسجيل طلبك بنجاح وسيتواصل معك الفريق.</div>}
            {leadOpen && !leadSaved && (
              <div className="bg-white border rounded-2xl p-3 space-y-2">
                <div className="font-bold text-sm">هل تريد معاينة أو تواصل من الفريق؟</div>
                <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="الاسم (اختياري)" value={lead.name} onChange={(e) => setLead({ ...lead, name: e.target.value })} />
                <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="رقم الجوال" dir="ltr" value={lead.phone} onChange={(e) => setLead({ ...lead, phone: e.target.value })} />
                <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="الخدمة المطلوبة (اختياري)" value={lead.service} onChange={(e) => setLead({ ...lead, service: e.target.value })} />
                <button onClick={saveLead} className="w-full bg-sky-600 text-white rounded-lg py-2 font-bold text-sm">إرسال طلب التواصل</button>
              </div>
            )}
          </div>
          <div className="p-3 border-t bg-white flex flex-col gap-2">
            {imagePreviewUrl && (
              <div className="relative w-20 h-20 rounded-lg border border-slate-200 shadow-sm overflow-hidden mb-1">
                <img src={imagePreviewUrl} alt="Preview" className="w-full h-full object-cover" />
                <button onClick={clearSelectedImage} className="absolute top-1 right-1 bg-slate-900/60 text-white rounded-full p-1 hover:bg-red-500 transition-colors" title="إزالة الصورة">
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            
            <div className="flex gap-2 items-center">
              <button onClick={() => fileRefCamera.current?.click()} className="shrink-0 w-10 h-10 rounded-xl border border-slate-200 text-slate-500 hover:text-sky-600 hover:bg-sky-50 flex items-center justify-center transition-colors" title="التقاط صورة بالكميرا"><Camera className="w-5 h-5" /></button>
              <button onClick={() => fileRefGallery.current?.click()} className="shrink-0 w-10 h-10 rounded-xl border border-slate-200 text-slate-500 hover:text-sky-600 hover:bg-sky-50 flex items-center justify-center transition-colors" title="اختيار صورة من الجهاز"><ImageIcon className="w-5 h-5" /></button>
              
              <input ref={fileRefCamera} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" capture="environment" className="hidden" onChange={handleImageSelect} />
              <input ref={fileRefGallery} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" className="hidden" onChange={handleImageSelect} />
              
              <input className="flex-1 min-w-0 border rounded-xl px-3 h-10 text-sm focus:outline-none focus:border-sky-500" placeholder={selectedImage ? "أضف ملاحظة للصورة..." : "اكتب سؤالك..."} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') send(); }} />
              
              <button disabled={!canSend} onClick={send} className="shrink-0 w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center disabled:opacity-40 transition-opacity"><Send className="w-5 h-5" /></button>
            </div>
            
            <div className="mt-1 flex justify-between items-center text-[11px] text-slate-500">
              <span>تحليل الصور مبدئي ويحتاج لمعاينة.</span>
              <button onClick={() => { setMessages(messages.slice(0, 1)); setLeadSaved(false); setError(''); clearSelectedImage(); }} className="flex items-center gap-1 hover:text-slate-800 transition-colors"><RotateCcw className="w-3 h-3" /> مسح</button>
            </div>
          </div>
        </div>
      )}
      <button onClick={() => setOpen((v) => !v)} className="ml-auto w-14 h-14 rounded-full bg-slate-950 text-white shadow-2xl flex items-center justify-center border-2 border-white" aria-label="مساعد زجاج الرياض">
        {open ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
      </button>
    </div>
  );
}
