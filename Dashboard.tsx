import { useState, useEffect, useCallback } from 'react';
import ErrorBoundary from '../components/ErrorBoundary';
import DashboardLayout from './dashboard/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { useContent } from '../contexts/ContentContext';
import Messages from './dashboard/Messages';
import MediaLibrary from './dashboard/MediaLibrary';
import DriveBackup from './dashboard/DriveBackup';
import PerformanceTool from './dashboard/PerformanceTool';
import ContentManager from './dashboard/ContentManager';
import PagesManager from './dashboard/PagesManager';
import DashboardHome from './dashboard/DashboardHome';
import FormBuilder from './dashboard/FormBuilder';
import HomepageBuilder from './dashboard/HomepageBuilder';
import BulkGalleryUpload from './dashboard/BulkGalleryUpload';
import PortfolioManagerV2 from './dashboard/PortfolioManagerV2';
import SiteSettings from './dashboard/SiteSettings';
import LeadsManager from './dashboard/LeadsManager';
import ConversionAnalytics from './dashboard/ConversionAnalytics';
import AI_SEO_Dashboard from './dashboard/AI_SEO_Dashboard';
import { AdminUsersView, RolesView, ActivityView } from './dashboard/SystemAdmin';
import { Message } from './dashboard/types';
import { supabase } from '../lib/supabase';

type DashboardTab = 'ai_seo' | 'home' | 'messages' | 'leads' | 'conversion_analytics' | 'content' | 'pages' | 'drive' | 'media' | 'bulk_upload' | 'forms' | 'settings' | 'services' | 'portfolio' | 'blog' | 'testimonials' | 'faq' | 'partners' | 'homepage_builder' | 'navigation' | 'seo' | 'social' | 'users' | 'roles' | 'activity' | 'backup' | 'performance';

export default function Dashboard() {
  const { user, loading, signInWithEmail, logout, token, isAdmin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const { contents, loading: contentsLoading, refreshContent: fetchContents, mediaFiles, fetchMedia } = useContent();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [activeTab, setActiveTab] = useState<DashboardTab>('home');
  const [isBackingUp, setIsBackingUp] = useState(false);

  const handleAuth = async (e: import('react').FormEvent) => {
    e.preventDefault(); setAuthError('');
    const result = await signInWithEmail(email, password);
    if (result.error) setAuthError(result.error.message || 'حدث خطأ في المصادقة');
  };

  const fetchMessages = useCallback(async () => {
    setLoadingMessages(true);
    try {
      const { data, error } = await supabase.from('messages').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setMessages((data || []) as Message[]);
    } catch (error) { console.error('Failed to fetch messages:', error); }
    finally { setLoadingMessages(false); }
  }, []);

  useEffect(() => {
    if (!user || !isAdmin) return;
    fetchMessages();
    const channel = supabase.channel('messages_changes_admin').on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, fetchMessages).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, isAdmin, fetchMessages]);

  const backupToDrive = useCallback(async () => {
    setIsBackingUp(true);
    try {
      const backupData = { timestamp: new Date().toISOString(), messages, contents, mediaFiles };
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `riyadh-glass-local-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
      alert('تم تنزيل النسخة الاحتياطية المحلية بنجاح.');
    } catch (error) { console.error('Error backing up:', error); alert('حدث خطأ أثناء إنشاء النسخة الاحتياطية.'); }
    finally { setIsBackingUp(false); }
  }, [messages, contents, mediaFiles]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>;
  if (!user || !isAdmin) return <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4"><div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full text-center"><h2 className="text-2xl font-bold text-gray-900 mb-6">لوحة التحكم</h2>{!user ? <form onSubmit={handleAuth} className="space-y-4"><p className="text-gray-600 mb-6">سجل الدخول بحساب الإدارة المصرح به.</p>{authError && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{authError}</div>}<input type="email" placeholder="البريد الإلكتروني" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 border rounded-md text-right" required/><input type="password" placeholder="كلمة المرور" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 border rounded-md text-right" required/><button className="w-full bg-[#0284C7] text-white py-3 px-4 rounded-md font-bold">تسجيل الدخول</button></form> : <><p className="text-red-600 mb-8 font-bold">هذا الحساب ليس ضمن مسؤولي الموقع.</p><button onClick={logout} className="w-full bg-gray-200 py-3 px-4 rounded-md font-bold">تسجيل الخروج</button></>}</div></div>;
  if (contentsLoading) return <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab as any}><div className="flex items-center justify-center min-h-[50vh]"><div className="w-12 h-12 border-4 border-[#0284C7] border-t-transparent rounded-full animate-spin" /></div></DashboardLayout>;

  return <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab as any}>
    {activeTab === 'ai_seo' && <ErrorBoundary><AI_SEO_Dashboard contents={contents} /></ErrorBoundary>}
    {activeTab === 'home' && <ErrorBoundary><DashboardHome messages={messages} contents={contents} mediaFiles={mediaFiles} /></ErrorBoundary>}
    {activeTab === 'messages' && <ErrorBoundary><Messages messages={messages} loading={loadingMessages} onRefresh={fetchMessages} /></ErrorBoundary>}
    {activeTab === 'leads' && <ErrorBoundary><LeadsManager /></ErrorBoundary>}
    {activeTab === 'conversion_analytics' && <ErrorBoundary><ConversionAnalytics /></ErrorBoundary>}
    {activeTab === 'media' && <ErrorBoundary><MediaLibrary mediaFiles={mediaFiles} fetchMedia={fetchMedia} /></ErrorBoundary>}
    {activeTab === 'bulk_upload' && <ErrorBoundary><BulkGalleryUpload token={token as any} contents={contents} fetchContents={fetchContents} fetchMedia={fetchMedia as any} /></ErrorBoundary>}
    {activeTab === 'backup' && <ErrorBoundary><DriveBackup isBackingUp={isBackingUp} accessToken={token as any} backupToDrive={backupToDrive} /></ErrorBoundary>}
    {activeTab === 'pages' && <ErrorBoundary><PagesManager pages={contents.filter((c) => c.type === 'page')} fetchContents={fetchContents} /></ErrorBoundary>}
    {activeTab === 'services' && <ErrorBoundary><ContentManager contents={contents} fetchContents={fetchContents} token={token as any} filterKeys={['services_intro', 'services_items']} /></ErrorBoundary>}
    {activeTab === 'portfolio' && <ErrorBoundary><PortfolioManagerV2 contents={contents} fetchContents={fetchContents} token={token as any} /></ErrorBoundary>}
    {activeTab === 'blog' && <ErrorBoundary><ContentManager contents={contents} fetchContents={fetchContents} token={token as any} filterKeys={['blog_intro', 'blog_items']} /></ErrorBoundary>}
    {activeTab === 'testimonials' && <ErrorBoundary><ContentManager contents={contents} fetchContents={fetchContents} token={token as any} filterKeys={['testimonials_items']} /></ErrorBoundary>}
    {activeTab === 'faq' && <ErrorBoundary><ContentManager contents={contents} fetchContents={fetchContents} token={token as any} filterKeys={['faq_items']} /></ErrorBoundary>}
    {activeTab === 'partners' && <ErrorBoundary><ContentManager contents={contents} fetchContents={fetchContents} token={token as any} filterKeys={['trusted_partners']} /></ErrorBoundary>}
    {activeTab === 'homepage_builder' && <ErrorBoundary><HomepageBuilder /></ErrorBoundary>}
    {activeTab === 'navigation' && <ErrorBoundary><ContentManager contents={contents} fetchContents={fetchContents} token={token as any} filterKeys={['navigation_links']} /></ErrorBoundary>}
    {activeTab === 'forms' && <ErrorBoundary><FormBuilder /></ErrorBoundary>}
    {activeTab === 'seo' && <ErrorBoundary><ContentManager contents={contents} fetchContents={fetchContents} token={token as any} filterKeys={['seo_settings']} /></ErrorBoundary>}
    {activeTab === 'social' && <ErrorBoundary><ContentManager contents={contents} fetchContents={fetchContents} token={token as any} filterKeys={['social_links']} /></ErrorBoundary>}
    {activeTab === 'settings' && <ErrorBoundary><SiteSettings contents={contents} fetchContents={fetchContents} /></ErrorBoundary>}
    {activeTab === 'performance' && <ErrorBoundary><PerformanceTool /></ErrorBoundary>}
    {activeTab === 'users' && <ErrorBoundary><AdminUsersView /></ErrorBoundary>}
    {activeTab === 'roles' && <ErrorBoundary><RolesView /></ErrorBoundary>}
    {activeTab === 'activity' && <ErrorBoundary><ActivityView /></ErrorBoundary>}
    {activeTab === 'content' && <ErrorBoundary><ContentManager contents={contents} fetchContents={fetchContents} token={token as any} /></ErrorBoundary>}
  </DashboardLayout>;
}
