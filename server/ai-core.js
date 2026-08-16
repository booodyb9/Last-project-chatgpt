import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const DEFAULT_GEMINI_MODEL = 'gemini-3.6-flash';

export function getServerConfig() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!supabaseUrl || !supabaseAnonKey) throw new Error('Missing Supabase server environment variables');
  if (!geminiApiKey) throw new Error('Missing GEMINI_API_KEY');
  return { supabaseUrl, supabaseAnonKey, geminiApiKey };
}

export function createServerClients() {
  const { supabaseUrl, supabaseAnonKey, geminiApiKey } = getServerConfig();
  return {
    supabase: createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false, autoRefreshToken: false } }),
    ai: new GoogleGenAI({ apiKey: geminiApiKey })
  };
}

export async function buildBusinessContext(supabase) {
  const { data, error } = await supabase.from('contents').select('key,title,body,type').in('key', ['site_settings','company_info','services_items','faq_items']);
  if (error) throw error;
  return JSON.stringify((data || []).map((row) => ({ key: row.key, title: row.title, body: row.body }))).slice(0, 24000);
}

export async function requireAdmin(req) {
  const auth = req.headers.authorization || req.headers.Authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return null;
  const { supabaseUrl, supabaseAnonKey } = getServerConfig();
  const authedSupabase = createClient(supabaseUrl, supabaseAnonKey, { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false, autoRefreshToken: false } });
  const { data: userData, error: userError } = await authedSupabase.auth.getUser(token);
  if (userError || !userData?.user) return null;
  const { data: admin, error: adminError } = await authedSupabase.from('admins').select('user_id,email').eq('user_id', userData.user.id).maybeSingle();
  if (adminError || !admin) return null;
  return { user: userData.user, admin };
}

export function validateImagePayload(image) {
  if (!image || typeof image !== 'object') throw new Error('Image is required');
  const mimeType = String(image.mimeType || '');
  const data = String(image.data || '').replace(/^data:[^;]+;base64,/, '');
  if (!ALLOWED_IMAGE_TYPES.has(mimeType)) throw new Error('Unsupported image type');
  const approxBytes = Math.ceil((data.length * 3) / 4);
  if (!data || approxBytes > MAX_IMAGE_BYTES) throw new Error('Image is empty or too large');
  return { mimeType, data };
}

const modelName = () => process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;

export async function generateAssistantReply({ ai, supabase, messages }) {
  const businessContext = await buildBusinessContext(supabase);
  const conversation = (Array.isArray(messages) ? messages.slice(-12) : []).map((m) => `${m.role === 'assistant' ? 'المساعد' : 'العميل'}: ${String(m.content || '').slice(0,2000)}`).join('\n');
  const prompt = `أنت مساعد مبيعات وخدمة عملاء لشركة زجاج الرياض. أجب بالعربية باختصار ووضوح. استخدم فقط معلومات الشركة والخدمات الموجودة في السياق. لا تخترع أسعاراً أو مواعيد. إذا احتاج العميل سعراً نهائياً اطلب المقاسات والمعاينة أو وجّهه لطلب عرض سعر/واتساب.\n\nسياق الشركة:\n${businessContext}\n\nالمحادثة:\n${conversation}`;
  const response = await ai.models.generateContent({ model: modelName(), contents: prompt });
  return String(response.text || '').trim();
}

export async function analyzeLocationImage({ ai, image, note }) {
  const validated = validateImagePayload(image);
  const prompt = `حلل هذه الصورة كمستشار حلول زجاج معماري لشركة زجاج في الرياض. أعطِ بالعربية: وصفاً مختصراً، نوع تطبيق الزجاج المحتمل، اقتراح حل مبدئي، اعتبارات تنفيذ عامة، والمعلومات الإضافية المطلوبة. لا تستنتج قياسات دقيقة ولا تعط سعراً نهائياً. ملاحظة العميل: ${String(note || '').slice(0,1500)}`;
  const response = await ai.models.generateContent({ model: modelName(), contents: [{ text: prompt }, { inlineData: { mimeType: validated.mimeType, data: validated.data } }] });
  return String(response.text || '').trim();
}

export async function generateAdminContent({ ai, task, title, content, image, extraData }) {
  const taskMap = {
    generate:'أنشئ نصاً تسويقياً احترافياً ومقنعاً بالعربية مع الحفاظ على الدقة وعدم اختراع معلومات.',
    improve:'حسّن النص العربي ليكون أوضح وأكثر احترافية وطبيعية بدون تغيير الحقائق.',
    seo:'أنشئ JSON فقط بالمفاتيح metaTitle وmetaDescription وkeywords مع تركيز محلي على الرياض عند صلته بالمحتوى.',
    alt:'أنشئ Alt Text عربي قصيراً ووصفياً وطبيعياً للصورة.',
    analyze_image:'حلل الصورة وأعد JSON يحتوي categories وsuggestions وconfidence.',
    generate_service:'أنشئ JSON للخدمة: title, shortDescription, content, seoTitle, metaDescription, slug, keywords, altText.',
    generate_article:'أنشئ مسودة مقال JSON: title, content, seoTitle, metaDescription, slug, keywords, altText.',
    hero_optimize:'حلل Hero وأعد JSON: title, description, ctaText, ctaLink, altText.',
    seo_intelligence:'استخرج الكلمات والموضوعات وأعد JSON Topics: keyword,intent,suggestedPage,priority.',
    content_gaps:'اكتشف فرص المحتوى وأعد JSON opportunities: topic,missingContent,recommendation,expectedImpact.',
    seo_audit:'راجع SEO وأعد JSON issues: type,message,element,priority.',
    smart_search:'أنت محرك بحث دلالي لشركة زجاج. أعد JSON يحتوي matchedIds.'
  };
  const instruction = taskMap[task];
  if (!instruction) throw new Error('Unsupported AI task: ' + task);
  const contents = [{ text: `${instruction}\nالمعطيات/العنوان: ${String(title || '').slice(0,500)}\nالتفاصيل/المحتوى: ${String(content || extraData || '').slice(0,24000)}` }];
  if (image) { const v=validateImagePayload(image); contents.push({ inlineData:{mimeType:v.mimeType,data:v.data} }); }
  const isJson=['seo','analyze_image','generate_service','generate_article','hero_optimize','seo_intelligence','content_gaps','seo_audit','smart_search'].includes(task);
  const response=await ai.models.generateContent({model:modelName(),contents,config:isJson?{responseMimeType:'application/json'}:undefined});
  return String(response.text || '').trim();
}

export async function customerVisionAssistant({ ai, task, image, messages, supabase }) {
  const businessContext=await buildBusinessContext(supabase);
  if(task==='analyze_initial'){
    const v=validateImagePayload(image);
    const prompt=`أنت مساعد مبيعات متخصص في الزجاج لشركة زجاج الرياض. حلل الصورة وأرجع فقط JSON: {"description":"وصف مبسط","guessed_service":"الخدمة المحتملة","options":["أريد تنفيذ نفس التصميم تقريبًا","أريد تصميمًا مشابهًا مع تعديلات","لدي فكرة مختلفة"]}. تجنب الجزم القاطع. سياق الشركة: ${businessContext}`;
    const response=await ai.models.generateContent({model:modelName(),contents:[{text:prompt},{inlineData:{mimeType:v.mimeType,data:v.data}}],config:{responseMimeType:'application/json'}});
    return String(response.text || '').trim();
  }
  if(task==='chat'){
    const conversation=(Array.isArray(messages)?messages.slice(-10):[]).map(m=>`${m.role==='assistant'?'المساعد':'العميل'}: ${String(m.content||'').slice(0,1000)}`).join('\n');
    const prompt=`أنت مساعد مبيعات لشركة زجاج الرياض. اجمع المتطلبات بسؤال واحد في كل رد ولا تعط سعراً. إذا اكتملت المعلومات أرجع JSON {"is_complete":true,"summary":"ملخص","reply":""} وإلا {"is_complete":false,"reply":"السؤال التالي","quick_replies":[]}. سياق الشركة: ${businessContext}\nالمحادثة:${conversation}`;
    const contents=[{text:prompt}]; if(image){const v=validateImagePayload(image);contents.push({inlineData:{mimeType:v.mimeType,data:v.data}})}
    const response=await ai.models.generateContent({model:modelName(),contents,config:{responseMimeType:'application/json'}});
    return String(response.text || '').trim();
  }
  throw new Error('Unsupported task for vision assistant');
}
