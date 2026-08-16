
import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

export default function Footer() {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  return (
    <footer id="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-brand-name flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 shrink-0">
              <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-lg">
                <defs>
                  <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F5D76E" />
                    <stop offset="50%" stopColor="#C59B27" />
                    <stop offset="100%" stopColor="#8A6B1C" />
                  </linearGradient>
                  <linearGradient id="silver" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="50%" stopColor="#A0B2C6" />
                    <stop offset="100%" stopColor="#5A728A" />
                  </linearGradient>
                </defs>
                <path d="M25 35 L75 35 L40 85 L95 85" fill="none" stroke="url(#silver)" strokeWidth="16" strokeLinejoin="miter" />
                <path d="M50 25 L85 25 C100 25 105 35 105 45 C105 55 95 62 85 62 L50 62 Z M50 25 L50 95 M75 62 L100 95" fill="none" stroke="url(#gold)" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-xl font-bold leading-tight text-white" style={{ fontFamily: 'var(--font-heading)' }}>{isAr ? 'زجاج الرياض' : 'Riyadh Glass'}</span>
              <span className="text-[0.65rem] font-bold tracking-[0.2em] text-gray-400 uppercase leading-none mt-1">Zujaj Alriyad</span>
            </div>
          </div>
          <p className="footer-brand-desc">{isAr ? 'شركتك الموثوقة لجميع أعمال وتوريدات الزجاج في مدينة الرياض. جودة عالمية، أسعار تنافسية، وخدمة احترافية منذ 2009.' : 'Your trusted company for all glass works and supplies in Riyadh. Global quality, competitive prices, and professional service since 2009.'}</p>
        </div>
        <div>
          <div className="footer-col-title">{isAr ? 'خدماتنا' : 'Our Services'}</div>
          <ul className="footer-links">
            <li><Link to="/services/الواجهات-الزجاجية">{isAr ? 'الواجهات الزجاجية' : 'Glass Facades'}</Link></li>
            <li><Link to="/services/القواطع-الزجاجية">{isAr ? 'القواطع المكتبية' : 'Office Partitions'}</Link></li>
            <li><Link to="/services/كبائن-شاور">كبائن الشاور</Link></li>
            <li><Link to="/services/أبواب-زجاجية">{isAr ? 'الأبواب الزجاجية' : 'Glass Doors'}</Link></li>
            <li><Link to="/services/مرايا-ذكية">المرايا الديكورية</Link></li>
            <li><Link to="/services/درابزين-زجاج">{isAr ? 'الدرابزين الزجاجي' : 'Glass Handrails'}</Link></li>
          </ul>
        </div>
        <div>
          <div className="footer-col-title">الشركة</div>
          <ul className="footer-links">
            <li><Link to="/about">من نحن</Link></li>
            <li><Link to="/portfolio">معرض الأعمال</Link></li>
            <li><Link to="/testimonials">آراء العملاء</Link></li>
            <li><Link to="/blog">{isAr ? 'المدونة' : 'Blog'}</Link></li>
            <li><Link to="/faq">{isAr ? 'الأسئلة الشائعة' : 'FAQ'}</Link></li>
            <li><Link to="/contact">{isAr ? 'تواصل معنا' : 'Contact Us'}</Link></li>
          </ul>
        </div>
        <div>
          <div className="footer-col-title">تواصل</div>
          <ul className="footer-links">
            <li><a href="tel:+966510233706" dir="ltr">+966 51 023 3706</a></li>
            <li><a href="mailto:info@riyadhglass.sa">info@riyadhglass.sa</a></li>
            <li><a href="#">طريق الملك فهد، العليا</a></li>
            <li><a href="#">{isAr ? 'الرياض، المملكة العربية السعودية' : 'Riyadh, Saudi Arabia'}</a></li>
            <li style={{marginTop:16}}><Link to="/privacy-policy">{isAr ? 'سياسة الخصوصية' : 'Privacy Policy'}</Link></li>
            <li><Link to="/terms">{isAr ? 'الشروط والأحكام' : 'Terms & Conditions'}</Link></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>{isAr ? '© 2026 شركة زجاج الرياض. جميع الحقوق محفوظة.' : '© 2026 Riyadh Glass. All rights reserved.'}</span>
        <span style={{display:'flex',alignItems:'center',gap:16}}>
          <Link to="/privacy-policy">سياسة الخصوصية</Link>
          <Link to="/terms">الشروط والأحكام</Link>
          <span style={{color:'rgba(255,255,255,0.25)'}}>•</span>
          <span style={{fontFamily:'var(--font-en)',letterSpacing:1,fontSize:12,color:'rgba(255,255,255,0.3)'}}>RIYADH · KSA</span>
        </span>
      </div>
    </footer>
  );
}
