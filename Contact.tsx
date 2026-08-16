import { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { useContent } from '../contexts/ContentContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { getSiteSettings } from '../lib/settings';

export default function Contact() {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', service: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const { getContent, contents } = useContent();
  const contactContent = getContent('contact_content');
  const settings = getSiteSettings(contents);

  const handleSubmit = async (e: import('react').FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      const payload = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || null,
        service: formData.service || null,
        message: formData.message.trim(),
        is_read: false,
        status: 'new'
      };
      let { error } = await supabase.from('messages').insert(payload);
      if (error && /phone|service|status/i.test(error.message || '')) {
        // Backward-compatible fallback until the additive migration is applied.
        const legacy = await supabase.from('messages').insert({
          name: payload.name,
          email: payload.email || payload.phone,
          message: `[الهاتف: ${payload.phone}]${payload.service ? ` [الخدمة: ${payload.service}]` : ''} - ${payload.message}`,
          is_read: false
        });
        error = legacy.error;
      }
      if (error) throw error;
      setStatus('success');
      setFormData({ name: '', phone: '', email: '', service: '', message: '' });
      setTimeout(() => setStatus('idle'), 4000);
    } catch (err) {
      console.error('Contact submit failed:', err);
      setStatus('error');
    }
  };

  return <section id="contact" className="py-24 bg-[#0F172A] text-white relative overflow-hidden">
    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-[#0ea5e9] text-sm font-bold tracking-widest uppercase mb-4">{isAr ? 'تواصل معنا' : 'Contact Us'}</h2>
        {contactContent?.body ? <div className="prose prose-lg prose-invert mx-auto mb-6" dangerouslySetInnerHTML={{ __html: contactContent.body }} /> : <><h3 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">مستعدون لتنفيذ مشروعك القادم</h3><p className="text-lg text-gray-400">احصل على استشارة مجانية وعرض سعر مبدئي لمشروعك. فريقنا متواجد للرد على استفساراتك.</p></>}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:col-span-2 space-y-8">
          <Info icon={MapPin} title="موقعنا"><>{settings.address || 'الرياض، المملكة العربية السعودية'}{settings.addressDetails ? <><br />{settings.addressDetails}</> : null}</></Info>
          <Info icon={Phone} title="اتصل بنا"><span dir="ltr">{settings.phoneNumber || '+966 51 023 3706'}</span></Info>
          <Info icon={Mail} title="البريد الإلكتروني">{settings.email || 'info@glassvision-ksa.com'}</Info>
          <Info icon={Clock} title="ساعات العمل"><>{settings.workingHours || 'الأحد - الخميس: 8 صباحاً - 6 مساءً'}{settings.workingHoursFriday ? <><br />{settings.workingHoursFriday}</> : null}</></Info>
          <div className="mt-8 rounded-2xl overflow-hidden border border-white/10 shadow-lg"><iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d463877.31244093843!2d46.93246736569614!3d24.725455364177265!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e2f03890d489399%3A0xba974d1c98e79fd5!2sRiyadh%20Saudi%20Arabia!5e0!3m2!1sen!2s!4v1714152542566!5m2!1sen!2s" width="100%" height="250" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="موقع الرياض" /></div>
        </motion.div>

        <div className="lg:col-span-3"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white rounded-3xl p-8 sm:p-12 shadow-[0_20px_60px_rgb(0,0,0,0.3)] text-[#0F172A] border border-gray-100">
          <h4 className="text-3xl font-extrabold mb-8">أرسل لنا رسالة</h4>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {status === 'success' && <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-200">تم إرسال طلبك بنجاح! سنتواصل معك قريباً.</div>}
            {status === 'error' && <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200">حدث خطأ أثناء الإرسال. الرجاء المحاولة مرة أخرى.</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><Field label="الاسم الكريم"><input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="field" placeholder="أحمد محمد" /></Field><Field label={isAr ? 'رقم الجوال' : 'Phone Number'}><input type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} dir="ltr" className="field text-right" placeholder="+966 5X XXX XXXX" /></Field></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><Field label={isAr ? 'البريد الإلكتروني (اختياري)' : 'Email (Optional)'}><input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="field" /></Field><Field label="نوع الخدمة المطلوبة"><select value={formData.service} onChange={(e) => setFormData({ ...formData, service: e.target.value })} className="field"><option value="">اختر الخدمة...</option><option value="واجهات زجاجية">{isAr ? 'واجهات زجاجية' : 'Glass Facades'}</option><option value="قواطع مكتبية">{isAr ? 'قواطع مكتبية' : 'Office Partitions'}</option><option value="أبواب زجاجية">{isAr ? 'أبواب زجاجية' : 'Glass Doors'}</option><option value="كبائن شاور">{isAr ? 'كبائن شاور' : 'Shower Cabins'}</option><option value="مرايا">مرايا</option><option value="درابزين">درابزين</option><option value="أخرى">{isAr ? 'أخرى' : 'Other'}</option></select></Field></div>
            <Field label="تفاصيل الطلب"><textarea required value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} rows={4} className="field resize-none" placeholder={isAr ? 'اكتب تفاصيل مشروعك أو استفسارك هنا...' : 'Write your project details or inquiry here...'} /></Field>
            <button type="submit" disabled={status === 'submitting'} className="w-full bg-[#0284C7] text-white font-bold py-4 hover:bg-[#0369A1] transition-colors rounded-xl disabled:bg-gray-400">{status === 'submitting' ? 'جاري الإرسال...' : 'إرسال الطلب'}</button>
          </form>
        </motion.div></div>
      </div>
    </div>
  </section>;
}

function Info({ icon: Icon, title, children }: any) { return <div className="flex items-start gap-4"><div className="w-14 h-14 bg-white/5 text-[#0ea5e9] rounded-2xl border border-white/10 flex items-center justify-center shrink-0"><Icon className="h-6 w-6" /></div><div><h4 className="text-xl font-bold mb-2">{title}</h4><div className="text-gray-400 leading-relaxed">{children}</div></div></div>; }
function Field({ label, children }: any) { return <label className="block"><span className="block text-sm font-bold text-gray-700 mb-2">{label}</span>{children}</label>; }
