import express from 'express';
import http from 'http';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServerClients, generateAssistantReply, analyzeLocationImage, generateAdminContent, requireAdmin } from './server/ai-core.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = 3000;
app.disable('x-powered-by');
app.use(compression());
app.use(express.json({ limit: '8mb' }));

const rateBuckets = new Map();
function rateLimit({ windowMs, max }) {
  return (req, res, next) => {
    const key = req.headers['x-forwarded-for']?.toString().split(',')[0].trim() || req.ip || 'unknown';
    const now = Date.now();
    const current = rateBuckets.get(key);
    if (!current || current.resetAt <= now) {
      rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }
    if (current.count >= max) return res.status(429).json({ error: 'تم تجاوز حد الطلبات مؤقتاً. حاول بعد قليل.' });
    current.count += 1;
    next();
  };
}

function safeError(res, error) {
  console.error('Server request failed:', error instanceof Error ? error.message : 'Unknown error');
  const message = error instanceof Error ? error.message : '';
  if (/required|unsupported|too large|invalid/i.test(message)) return res.status(400).json({ error: message });
  if (/Missing GEMINI_API_KEY/i.test(message)) return res.status(503).json({ error: 'خدمة الذكاء الاصطناعي غير مهيأة بعد.' });
  return res.status(500).json({ error: 'تعذر إكمال الطلب حالياً.' });
}

app.post('/api/ai/chat', rateLimit({ windowMs: 60_000, max: 12 }), async (req, res) => {
  try {
    const { supabase, ai } = createServerClients();
    const reply = await generateAssistantReply({ ai, supabase, messages: req.body?.messages });
    res.json({ reply });
  } catch (error) {
    safeError(res, error);
  }
});


// Customer AI Vision Assistant
app.post('/api/ai/vision-assistant', rateLimit({ windowMs: 60_000, max: 10 }), async (req, res) => {
  try {
    const { ai, supabase } = createServerClients();
    const result = await customerVisionAssistant({ 
      ai, 
      supabase,
      task: req.body.task, 
      image: req.body.image, 
      messages: req.body.messages 
    });
    res.json({ result });
  } catch (error) {
    safeError(res, error);
  }
});

app.post('/api/ai/image', rateLimit({ windowMs: 60_000, max: 5 }), async (req, res) => {
  try {
    const { ai } = createServerClients();
    const analysis = await analyzeLocationImage({ ai, image: req.body?.image, note: req.body?.note });
    res.json({ analysis });
  } catch (error) {
    safeError(res, error);
  }
});


// Smart Semantic Search
app.post('/api/smart-search', rateLimit({ windowMs: 60_000, max: 20 }), async (req, res) => {
  try {
    const { query, siteData } = req.body;
    if (!query) return res.json({ result: '{"matchedIds":[]}' });
    const { ai } = createServerClients();
    
    // We import validateImagePayload but here we just need to call ai.models.generateContent directly or create a helper.
    // Instead of duplicating, we can just call it inline.
    const prompt = `أنت محرك بحث دلالي ذكي لموقع زجاج الرياض.
المستخدم يبحث عن: "${query}"

افهم نية المستخدم (مثلاً: "باب سيكوريت" = "واجهات وأبواب زجاجية"، "شاور" = "كبائن شاور").
إليك بيانات الموقع بصيغة JSON. كل عنصر له id:
${siteData}

قم بإرجاع JSON فقط يحتوي على مصفوفة matchedIds للمعرفات الأنسب (بحد أقصى 10). لا تخترع أي معرفات غير موجودة.`;

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-3.6-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    
    res.json({ result: String(response.text || '').trim() });
  } catch (error) {
    safeError(res, error);
  }
});

app.post('/api/ai/admin', rateLimit({ windowMs: 60_000, max: 20 }), async (req, res) => {
  try {
    const { supabase, ai } = createServerClients();
    const admin = await requireAdmin(req, supabase);
    if (!admin) return res.status(403).json({ error: 'غير مصرح.' });
    const result = await generateAdminContent({ ai, ...req.body });
    res.json({ result });
  } catch (error) {
    safeError(res, error);
  }
});

// Backward-compatible SEO endpoint used by existing admin forms.
app.post('/api/generate-seo', rateLimit({ windowMs: 60_000, max: 20 }), async (req, res) => {
  try {
    const { supabase, ai } = createServerClients();
    const admin = await requireAdmin(req, supabase);
    if (!admin) return res.status(403).json({ error: 'غير مصرح.' });
    const raw = await generateAdminContent({ ai, task: 'seo', title: req.body?.title, content: req.body?.content });
    let parsed;
    try { parsed = JSON.parse(raw); } catch { parsed = { metaTitle: '', metaDescription: raw, keywords: '' }; }
    res.json({
      title: parsed.metaTitle || parsed.title || '',
      description: parsed.metaDescription || parsed.description || '',
      keywords: parsed.keywords || ''
    });
  } catch (error) {
    safeError(res, error);
  }
});

app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send('User-agent: *\nAllow: /\n\nSitemap: https://riyadh-glass.ai.studio/sitemap.xml');
});

app.get('/sitemap.xml', async (req, res) => {
  try {
    const { supabase } = createServerClients();
    const { data } = await supabase.from('contents').select('*');
    const baseUrl = process.env.PUBLIC_SITE_URL || 'https://riyadh-glass.ai.studio';
    const urls = [
      '/', '/about', '/services', '/portfolio', '/blog', '/faq', '/testimonials', '/contact', '/request-quote', '/sitemap'
    ].map((pathName, index) => `<url><loc>${baseUrl}${pathName}</loc><changefreq>${index === 0 ? 'daily' : 'weekly'}</changefreq><priority>${index === 0 ? '1.0' : '0.8'}</priority></url>`);

    for (const item of data || []) {
      if (!item.body) continue;
      try {
        if (item.key === 'services_items') {
          for (const service of JSON.parse(item.body)) {
            if (service.seoNoIndex || service.isHidden) continue;
            const slug = service.slug || service.title?.replace(/\s+/g, '-').toLowerCase();
            if (slug) urls.push(`<url><loc>${baseUrl}/services/${encodeURIComponent(slug)}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`);
          }
        }
        if (item.key === 'blog_items') {
          for (const post of JSON.parse(item.body)) {
            if (post.seoNoIndex || post.isHidden) continue;
            const slug = post.slug || post.title?.replace(/\s+/g, '-').toLowerCase();
            if (slug) urls.push(`<url><loc>${baseUrl}/blog/${encodeURIComponent(slug)}</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>`);
          }
        }
        if (item.key === 'premium_portfolio_projects') {
          for (const project of JSON.parse(item.body)) {
            if (project.seoNoIndex || project.isHidden) continue;
            const slug = project.slug || project.id;
            if (slug) urls.push(`<url><loc>${baseUrl}/portfolio/${encodeURIComponent(slug)}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`);
          }
        }
        if (item.key.startsWith('page_') && item.type === 'page') {
          const pageData = JSON.parse(item.body);
          if (pageData.status === 'published' && pageData.slug && !pageData.seo?.noindex) {
            urls.push(`<url><loc>${baseUrl}/${encodeURIComponent(pageData.slug)}</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>`);
          }
        }
      } catch (error) {
        console.warn(`Skipping invalid sitemap content: ${item.key}`);
      }
    }

    res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`);
  } catch (error) {
    safeError(res, error);
  }
});



async function startServer() {
  const server = http.createServer(app);
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: { server }
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist'), { maxAge: '1y' }));
    app.use((req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));
  }
  server.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
}
startServer();
