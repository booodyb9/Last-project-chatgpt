import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, Send, Loader2, Sparkles, MessageSquare, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import imageCompression from 'browser-image-compression';

interface Message {
  role: 'assistant' | 'user';
  content: string;
  options?: string[];
}

export default function AIVisionAssistant({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<'upload' | 'analyzing' | 'chat' | 'summary' | 'done'>('upload');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [analysisDesc, setAnalysisDesc] = useState('');
  
  const [contactInfo, setContactInfo] = useState({ name: '', phone: '', area: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      alert('الرجاء رفع صورة صالحة.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('حجم الصورة كبير جداً (الحد الأقصى 10 ميجابايت).');
      return;
    }
    
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        resolve(base64String.split(',')[1]); // Remove data URI prefix
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const startAnalysis = async () => {
    if (!imageFile) return;
    setStep('analyzing');
    
    try {
      const base64Data = await fileToBase64(imageFile);
      const payload = {
        task: 'analyze_initial',
        image: { mimeType: imageFile.type, data: base64Data }
      };

      const res = await fetch('/api/ai/vision-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed analysis');
      
      const parsed = JSON.parse(data.result);
      
      setAnalysisDesc(parsed.description);
      setMessages([
        { role: 'assistant', content: `${parsed.description}\n\nماذا تريد تنفيذه مقارنة بالصورة المرسلة؟`, options: parsed.options }
      ]);
      setStep('chat');
    } catch (error) {
      console.error(error);
      alert('تعذر تحليل الصورة حالياً. سننتقل لوضع الإدخال اليدوي.');
      setStep('summary'); // Fallback
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    const newMessages = [...messages, { role: 'user' as const, content: text }];
    setMessages(newMessages);
    setInputText('');
    setIsTyping(true);
    
    try {
      let payload: any = {
        task: 'chat',
        messages: newMessages.map(m => ({ role: m.role, content: m.content }))
      };
      
      if (imageFile && newMessages.length <= 2) {
         // Only send image again in the first chat to give context to chat model
         const base64Data = await fileToBase64(imageFile);
         payload.image = { mimeType: imageFile.type, data: base64Data };
      }

      const res = await fetch('/api/ai/vision-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Chat failed');
      
      const parsed = JSON.parse(data.result);
      
      if (parsed.is_complete) {
        setSummary(parsed.summary);
        setStep('summary');
      } else {
        setMessages([...newMessages, { role: 'assistant', content: parsed.reply, options: parsed.quick_replies }]);
      }
    } catch (error) {
      console.error(error);
      setMessages([...newMessages, { role: 'assistant', content: 'حدث خطأ في الاتصال، يرجى الاستمرار بكتابة تفاصيل طلبك.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const uploadToSupabase = async (file: File) => {
    try {
      const compressed = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1200, useWebWorker: false });
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `leads/${uuidv4()}.${ext}`; // Inside media bucket, but not in media table
      
      const { error: uploadError } = await supabase.storage.from('media').upload(fileName, compressed);
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage.from('media').getPublicUrl(fileName);
      return data.publicUrl;
    } catch (e) {
      console.error("Image upload failed", e);
      return null;
    }
  };

  const submitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let finalImageUrl = null;
      if (imageFile) {
        finalImageUrl = await uploadToSupabase(imageFile);
      }
      
      const leadData = {
        name: contactInfo.name,
        phone: contactInfo.phone,
        status: 'new',
        source: 'AI Vision Assistant',
        source_context: {
          area: contactInfo.area,
          image_url: finalImageUrl,
          ai_analysis: analysisDesc,
          ai_summary: summary,
          chat_history: messages
        }
      };
      
      const { error } = await supabase.from('leads').insert(leadData);
      if (error) throw error;
      
      setStep('done');
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6" dir="rtl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#0284C7]" />
            <h3 className="font-bold text-gray-900">مساعد الذكاء الاصطناعي</h3>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-200 rounded-full transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50/50">
          <AnimatePresence mode="wait">
            {step === 'upload' && (
              <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-8">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                  <ImageIcon className="w-10 h-10 text-[#0284C7]" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2 text-center">شاركنا فكرتك بصورة</h4>
                <p className="text-gray-500 text-center mb-8 max-w-sm text-sm">
                  ارفع صورة للتصميم الذي يعجبك، وسيقوم الذكاء الاصطناعي بفهمها وجمع المتطلبات لتجهيز عرض سعر دقيق.
                </p>
                
                {!imagePreview ? (
                  <div className="w-full flex gap-3">
                    <button onClick={() => fileInputRef.current?.click()} className="flex-1 bg-[#0F172A] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition">
                      <Upload className="w-5 h-5" />
                      رفع صورة
                    </button>
                    {/* Capture could use accept="image/*;capture=camera" */}
                  </div>
                ) : (
                  <div className="w-full">
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden border-2 border-gray-200 mb-4">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button onClick={() => { setImageFile(null); setImagePreview(null); }} className="absolute top-2 left-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <button onClick={startAnalysis} className="w-full bg-[#0284C7] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition">
                      <Sparkles className="w-5 h-5" />
                      تحليل الصورة الآن
                    </button>
                  </div>
                )}
                
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
              </motion.div>
            )}

            {step === 'analyzing' && (
              <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-12 h-12 text-[#0284C7] animate-spin mb-4" />
                <h4 className="font-bold text-gray-900 text-lg">جاري تحليل الصورة...</h4>
                <p className="text-gray-500 text-sm mt-2">يفهم النظام العناصر لتوفير الوقت عليك</p>
              </motion.div>
            )}

            {step === 'chat' && (
              <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-[60vh] sm:h-[50vh]">
                <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-4 scrollbar-hide">
                  {imagePreview && (
                    <div className="flex justify-end mb-4">
                      <div className="w-24 h-24 rounded-lg overflow-hidden border shadow-sm">
                         <img src={imagePreview} alt="Uploaded" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className={`px-4 py-3 max-w-[85%] rounded-2xl text-sm ${msg.role === 'user' ? 'bg-[#0284C7] text-white rounded-tl-sm' : 'bg-white border text-gray-800 rounded-tr-sm shadow-sm'}`}>
                        {msg.content}
                      </div>
                      {msg.options && msg.role === 'assistant' && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {msg.options.map((opt, j) => (
                            <button key={j} onClick={() => sendMessage(opt)} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold hover:bg-blue-100 transition border border-blue-100">
                              {opt}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex items-start">
                      <div className="px-4 py-3 bg-white border rounded-2xl rounded-tr-sm shadow-sm flex items-center gap-2">
                        <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                        <span className="text-xs text-gray-400">يكتب...</span>
                      </div>
                    </div>
                  )}
                  <div ref={chatBottomRef} />
                </div>
                <div className="mt-4 pt-4 border-t flex gap-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputText)}
                    placeholder="اكتب ردك هنا..."
                    className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#0284C7] text-sm"
                  />
                  <button onClick={() => sendMessage(inputText)} disabled={!inputText.trim()} className="bg-[#0F172A] text-white p-3 rounded-xl hover:bg-gray-800 disabled:opacity-50 transition flex items-center justify-center">
                    <Send className="w-5 h-5 rtl:rotate-180" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'summary' && (
              <motion.div key="summary" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="bg-white border rounded-xl p-4 sm:p-5 mb-6 shadow-sm">
                  <h4 className="font-bold text-[#0F172A] mb-3 border-b pb-2">ملخص الطلب</h4>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{summary || 'لم يتم استخراج ملخص كامل. يرجى تزويدنا بتفاصيل إضافية في الملاحظات.'}</p>
                </div>
                
                <form onSubmit={submitLead} className="space-y-4">
                  <h5 className="font-bold text-gray-800 text-sm">معلومات التواصل لتأكيد الطلب</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input required type="text" placeholder="الاسم الكريم" value={contactInfo.name} onChange={e => setContactInfo({...contactInfo, name: e.target.value})} className="w-full border rounded-lg px-3 py-2.5 text-sm" />
                    <input required type="tel" placeholder="رقم الجوال (05xxxxxxx)" value={contactInfo.phone} onChange={e => setContactInfo({...contactInfo, phone: e.target.value})} className="w-full border rounded-lg px-3 py-2.5 text-sm" dir="ltr" />
                  </div>
                  <input type="text" placeholder="الحي / المنطقة (اختياري)" value={contactInfo.area} onChange={e => setContactInfo({...contactInfo, area: e.target.value})} className="w-full border rounded-lg px-3 py-2.5 text-sm" />
                  
                  <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={isSubmitting} className="flex-1 bg-[#0284C7] text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2">
                      {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 rtl:rotate-180" />}
                      إرسال الطلب النهائي
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {step === 'done' && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-2">تم استلام طلبك!</h4>
                <p className="text-gray-600 mb-8 max-w-sm">سيتم مراجعة طلبك والصورة المرفقة من قبل فريقنا وسنتواصل معك بأسرع وقت لتقديم السعر النهائي.</p>
                <button onClick={onClose} className="bg-gray-100 text-gray-800 px-8 py-3 rounded-xl font-bold hover:bg-gray-200 transition">
                  إغلاق
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

function CheckCircle2(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
