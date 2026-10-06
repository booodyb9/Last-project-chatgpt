import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, Menu, X } from 'lucide-react';
import { dashboardMenu } from './config';

interface DashboardLayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
}

export default function DashboardLayout({ activeTab, setActiveTab, children }: DashboardLayoutProps) {
  const { logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [mobileMenuOpen]);

  return (
    <>
      <Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>
      <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans overflow-x-hidden" dir="rtl">
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center sticky top-0 z-40 min-h-16">
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate pl-3">لوحة تحكم الموقع</h1>
          <button type="button" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="shrink-0 w-11 h-11 rounded-xl border border-gray-200 flex items-center justify-center" aria-label="فتح قائمة لوحة التحكم">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && <button type="button" aria-label="إغلاق القائمة" onClick={() => setMobileMenuOpen(false)} className="md:hidden fixed inset-0 top-16 bg-black/35 z-30" />}

        <aside className={`${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'} w-[min(88vw,20rem)] md:w-72 bg-white border-l border-gray-200 flex flex-col h-[calc(100dvh-4rem)] md:h-screen fixed md:sticky top-16 md:top-0 right-0 z-40 transition-transform duration-300 overflow-y-auto overscroll-contain shadow-xl md:shadow-none`}>
          <div className="p-6 border-b border-gray-200 hidden md:block">
            <h1 className="text-xl font-bold text-gray-900">لوحة تحكم الموقع</h1>
          </div>
          <div className="flex-1 py-4">
            {dashboardMenu.map((group, idx) => (
              <div key={idx} className="mb-6 px-3 sm:px-4">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-2">{group.group}</h2>
                <div className="space-y-1">
                  {group.items.map(item => (
                    <button key={item.id} type="button" onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-bold transition-all text-right ${activeTab === item.id ? 'bg-[#0284C7]/10 text-[#0284C7]' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                      <item.icon className={`w-5 h-5 shrink-0 ${activeTab === item.id ? 'text-[#0284C7]' : 'text-gray-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-gray-200 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg font-bold transition-colors">
              <LogOut className="w-5 h-5" /> تسجيل الخروج
            </button>
          </div>
        </aside>

        <main className="flex-1 w-full md:min-w-0 p-3 sm:p-4 md:p-6 lg:p-8 overflow-x-hidden overflow-y-auto">
          <div className="max-w-7xl mx-auto min-w-0 [&_table]:min-w-[680px] [&_.overflow-x-auto]:max-w-full [&_input]:max-w-full [&_textarea]:max-w-full [&_select]:max-w-full">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
