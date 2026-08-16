import { BrowserRouter } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { ContentProvider } from './contexts/ContentContext';
import AmbientBackground from './components/AmbientBackground';
import AnimatedRoutes from './components/AnimatedRoutes';
import ScrollToTop from './components/ScrollToTop';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import DynamicContactLinks from './components/DynamicContactLinks';
import HomepageSectionController from './components/HomepageSectionController';
import DeferredPublicEnhancements from './components/DeferredPublicEnhancements';
import PageProgressBar from './components/PageProgressBar';

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ContentProvider>
          <div className="min-h-screen bg-transparent font-sans text-right ltr:text-left relative z-0">
            <AmbientBackground />
            <BrowserRouter>
              <PageProgressBar />
              <ScrollToTop />
              <DynamicContactLinks />
              <HomepageSectionController />
              <AnimatedRoutes />
              <FloatingWhatsApp />
              <DeferredPublicEnhancements />
            </BrowserRouter>
          </div>
        </ContentProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
