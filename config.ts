import {
  LayoutDashboard, FileText, Image, Briefcase,
  Settings, Users, Shield, Activity, HardDrive,
  MessageSquare, Star, HelpCircle, Navigation, LayoutTemplate,
  Search, Share2, FolderOpen, Target, BarChart3
} from 'lucide-react';

export const dashboardMenu = [
  {
    group: 'الرئيسية',
    items: [
      { id: 'home', label: 'الرئيسية والإحصائيات', icon: LayoutDashboard },
      { id: 'messages', label: 'صندوق الرسائل', icon: MessageSquare },
      { id: 'leads', label: 'العملاء المحتملون CRM', icon: Target },
      { id: 'conversion_analytics', label: 'تحليلات التحويل', icon: BarChart3 },
    ]
  },
  {
    group: 'إدارة المحتوى',
    items: [
      { id: 'homepage_builder', label: 'بناء الصفحة الرئيسية', icon: LayoutTemplate },
      { id: 'pages', label: 'الصفحات الديناميكية', icon: FileText },
      { id: 'services', label: 'الخدمات', icon: Briefcase },
      { id: 'portfolio', label: 'معرض الأعمال والمشاريع', icon: Image },
      { id: 'blog', label: 'المدونة والمقالات', icon: FileText },
      { id: 'testimonials', label: 'آراء العملاء', icon: Star },
      { id: 'faq', label: 'الأسئلة الشائعة', icon: HelpCircle },
      { id: 'partners', label: 'شركاء النجاح', icon: Users },
    ]
  },
  {
    group: 'الوسائط',
    items: [
      { id: 'media', label: 'مكتبة الوسائط', icon: FolderOpen },
      { id: 'bulk_upload', label: 'رفع متعدد', icon: Image },
      { id: 'forms', label: 'النماذج (Forms)', icon: FileText },
    ]
  },
  {
    group: 'إعدادات الموقع',
    items: [
      { id: 'ai_seo', label: 'الذكاء الاصطناعي (AI SEO)', icon: Search },
      { id: 'navigation', label: 'القوائم والروابط', icon: Navigation },
      { id: 'seo', label: 'إعدادات SEO', icon: Search },
      { id: 'performance', label: 'فحص الأداء والسرعة', icon: Activity },
      { id: 'social', label: 'روابط التواصل', icon: Share2 },
      { id: 'settings', label: 'الإعدادات العامة', icon: Settings },
    ]
  },
  {
    group: 'النظام',
    items: [
      { id: 'users', label: 'المستخدمين', icon: Users },
      { id: 'roles', label: 'الصلاحيات', icon: Shield },
      { id: 'activity', label: 'سجل النشاطات', icon: Activity },
      { id: 'backup', label: 'النسخ الاحتياطي', icon: HardDrive },
    ]
  }
];
