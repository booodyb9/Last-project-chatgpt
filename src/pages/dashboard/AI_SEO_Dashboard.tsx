import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Loader2, AlertCircle, CheckCircle, Search, FileText, Compass, Sparkles, RefreshCw } from 'lucide-react';
import { safeParseJson } from '../../lib/safeJson';

interface AI_SEO_DashboardProps {
  contents: any[];
}

export default function AI_SEO_Dashboard({ contents }: AI_SEO_DashboardProps) {
  const { token } = useAuth();
  const [loadingTask, setLoadingTask] = useState<string | null>(null);
  
  const [seoAudit, setSeoAudit] = useState<any[] | null>(null);
  const [seoIntelligence, setSeoIntelligence] = useState<any[] | null>(null);
  const [contentGaps, setContentGaps] = useState<any[] | null>(null);

  const callAiAdmin = async (task: string, title: string, contentData: string) => {
    const bearer = token?.access_token;
    if (!bearer) throw new Error('Missing token');
    
    const response = await fetch('/api/ai/admin', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${bearer}` },
      body: JSON.stringify({ task, title, extraData: contentData })
    });
    
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'فشل طلب الذكاء الاصطناعي');
    }
    
    const textRes = await response.text();
    let data: any = {};
    try { data = JSON.parse(textRes); } catch(e) {}
    
    return safeParseJson<any>(data.result, {});
  };

  const getSiteContext = () => {
    // Simplify contents to not exceed context window
    const simplified = contents.map(c => ({
      key: c.key,
      title: c.title,
      type: c.type,
      itemsLength: Array.isArray(c.body) ? c.body.length : undefined
    }));
    return JSON.stringify(simplified);
  };

  const runSeoAudit = async () => {
    setLoadingTask('seo_audit');
    try {
      // Create a simplified map of important SEO fields from the site
      const auditData = contents.filter(c => c.type === 'array').map(c => {
        const items = c.body || [];
        return {
          section: c.key,
          items: items.map((item: any, idx: number) => ({
            id: idx,
            title: item.title || item.name,
            hasSeoTitle: !!item.seoTitle,
            hasSeoDescription: !!item.seoDescription,
            hasImage: !!(item.image || item.url || item.img),
            hasAlt: !!item.altText || !!item.alt
          }))
        };
      });
      
      const result = await callAiAdmin('seo_audit', 'مراجعة SEO للموقع بالكامل', JSON.stringify(auditData));
      setSeoAudit(result.issues || result || []);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoadingTask(null);
    }
  };

  const runSeoIntelligence = async () => {
    setLoadingTask('seo_intelligence');
    try {
      const result = await callAiAdmin('seo_intelligence', 'اكتشاف الموضوعات وكلمات البحث', getSiteContext());
      setSeoIntelligence(result.Topics || result.topics || result || []);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoadingTask(null);
    }
  };

  const runContentGaps = async () => {
    setLoadingTask('content_gaps');
    try {
      const result = await callAiAdmin('content_gaps', 'اكتشاف الفرص الناقصة', getSiteContext());
      setContentGaps(result.opportunities || result || []);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoadingTask(null);
    }
  };

  const PriorityBadge = ({ priority }: { priority: string }) => {
    const colors: any = {
      High: 'bg-red-100 text-red-800',
      Medium: 'bg-yellow-100 text-yellow-800',
      Low: 'bg-green-100 text-green-800'
    };
    const mapped = colors[priority] || colors.Low;
    return <span className={`px-2 py-1 text-xs font-bold rounded-full ${mapped}`}>{priority || 'Low'}</span>;
  };

  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <Sparkles className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900">AI Global Website SEO Intelligence</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* SEO Audit Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Search className="w-5 h-5 text-gray-500" />
              Global SEO Audit
            </h2>
            <button 
              onClick={runSeoAudit} 
              disabled={!!loadingTask}
              className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition"
            >
              <RefreshCw className={`w-4 h-4 ${loadingTask === 'seo_audit' ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-4">فحص شامل لجميع الصفحات لاكتشاف أخطاء Meta Descriptions, Alt Texts, والمحتوى الضعيف.</p>
          
          {seoAudit ? (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
              {seoAudit.length === 0 ? <p className="text-green-600 text-sm">لا توجد أخطاء!</p> : seoAudit.map((issue, idx) => (
                <div key={idx} className="p-3 bg-gray-50 border rounded-lg text-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-gray-800">{issue.type}</span>
                    <PriorityBadge priority={issue.priority} />
                  </div>
                  <p className="text-gray-600 text-xs mb-1">{issue.message}</p>
                  <p className="text-gray-500 text-xs font-mono">{issue.element}</p>
                </div>
              ))}
            </div>
          ) : (
            <button onClick={runSeoAudit} disabled={!!loadingTask} className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition text-sm">
              بدء فحص SEO للموقع
            </button>
          )}
        </div>

        {/* AI Keyword Intelligence Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Compass className="w-5 h-5 text-gray-500" />
              Keyword & Topic Intelligence
            </h2>
            <button 
              onClick={runSeoIntelligence} 
              disabled={!!loadingTask}
              className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition"
            >
              <RefreshCw className={`w-4 h-4 ${loadingTask === 'seo_intelligence' ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-4">تحليل المحتوى لاقتراح Topics و Search Intents مرتبطة بمجالك بدلاً من حشو الكلمات.</p>
          
          {seoIntelligence ? (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
              {seoIntelligence.map((topic, idx) => (
                <div key={idx} className="p-3 bg-gray-50 border rounded-lg text-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-gray-800">{topic.keyword}</span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-[10px] font-bold rounded-full">{topic.intent}</span>
                  </div>
                  <p className="text-gray-500 text-xs mt-1">الصفحة الأنسب: <span className="font-semibold">{topic.suggestedPage}</span></p>
                </div>
              ))}
            </div>
          ) : (
            <button onClick={runSeoIntelligence} disabled={!!loadingTask} className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition text-sm">
              بدء تحليل الموضوعات
            </button>
          )}
        </div>

        {/* Content Gap Detection Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-500" />
              Content Gap Detection
            </h2>
            <button 
              onClick={runContentGaps} 
              disabled={!!loadingTask}
              className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition"
            >
              <RefreshCw className={`w-4 h-4 ${loadingTask === 'content_gaps' ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-4">اكتشاف فرص المحتوى الناقصة لتعزيز تواجدك وبناء صفحات جديدة أو مقالات داعمة.</p>
          
          {contentGaps ? (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
              {contentGaps.map((gap, idx) => (
                <div key={idx} className="p-3 bg-gray-50 border rounded-lg text-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-gray-800">{gap.topic}</span>
                    <PriorityBadge priority={gap.expectedImpact || 'Medium'} />
                  </div>
                  <p className="text-gray-600 text-xs mb-1">{gap.missingContent}</p>
                  <p className="text-blue-600 text-[11px] font-bold">التوصية: {gap.recommendation}</p>
                </div>
              ))}
            </div>
          ) : (
            <button onClick={runContentGaps} disabled={!!loadingTask} className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition text-sm">
              اكتشاف الفجوات
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
