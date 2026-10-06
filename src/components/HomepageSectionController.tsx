import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useContent } from '../contexts/ContentContext';
import { safeParseJson } from '../lib/safeJson';

type SectionConfig = { id: string; label?: string; isVisible?: boolean };

function detectSections(wrapper: HTMLElement) {
  const direct = Array.from(wrapper.children) as HTMLElement[];
  const map = new Map<string, HTMLElement>();
  const directById = (id: string) => direct.find((el) => el.id === id);

  const hero = direct.find((el) => el.matches('div[class*="min-h-[90vh]"]') || el.matches('div[class*="md:min-h-screen"]'));
  const gallerySlider = direct.find((el) => el.tagName === 'SECTION' && el.querySelector('.swiper') && el.textContent?.includes('جولة في أعمالنا'));
  const blog = directById('blog') || direct.find((el) => el.querySelector?.('#blog'));

  if (hero) map.set('hero', hero);
  if (gallerySlider) map.set('gallery_slider', gallerySlider);
  const ids: Record<string, string> = {
    stats: 'stats', services: 'services', features: 'why', portfolio: 'gallery', gallery: 'gallery',
    partners: 'partners', process: 'process', testimonials: 'testimonials', faq: 'faq', contact: 'contact'
  };
  for (const [configId, domId] of Object.entries(ids)) {
    const element = directById(domId) || wrapper.querySelector<HTMLElement>(`#${domId}`) || undefined;
    if (element) map.set(configId, element);
  }
  if (blog instanceof HTMLElement) map.set('blog', blog);
  return { direct, map };
}

export default function HomepageSectionController() {
  const location = useLocation();
  const { getContent } = useContent();
  const body = getContent('homepage_sections')?.body;

  useEffect(() => {
    if (location.pathname !== '/') return;
    const config = safeParseJson<SectionConfig[]>(body, []);
    if (!Array.isArray(config) || !config.length) return;

    const apply = () => {
      const wrapper = document.querySelector<HTMLElement>('[data-route-wrapper="true"]');
      if (!wrapper) return;
      const { direct, map } = detectSections(wrapper);
      if (!map.size) return;

      // Reset previous dynamic values first.
      direct.forEach((el) => { el.style.order = ''; });
      for (const element of map.values()) element.style.display = '';

      const orderIndex = new Map(config.map((section, index) => [section.id, index]));
      const reverseMap = new Map<HTMLElement, string>();
      for (const [id, element] of map.entries()) if (!reverseMap.has(element)) reverseMap.set(element, id);

      // Visibility applies only to the real section and its immediate CTA divider, never to Navbar/Footer.
      for (const section of config) {
        const element = map.get(section.id);
        if (!element) continue;
        element.style.display = section.isVisible === false ? 'none' : '';
        const next = element.nextElementSibling as HTMLElement | null;
        if (next && next.className.includes('py-8') && next.querySelector('a,button')) {
          next.style.display = section.isVisible === false ? 'none' : '';
        }
      }

      // CSS order changes visual order without moving React-managed DOM nodes.
      wrapper.style.display = 'flex';
      wrapper.style.flexDirection = 'column';
      let activeSection: string | null = null;
      let childOffset = 0;
      direct.forEach((child, originalIndex) => {
        const sectionId = reverseMap.get(child);
        if (sectionId) { activeSection = sectionId; childOffset = 0; }
        if (!activeSection) {
          child.style.order = String(-10000 + originalIndex); // Navbar / pre-home chrome stays first.
          return;
        }
        const configured = orderIndex.get(activeSection);
        const base = configured == null ? 50000 + originalIndex * 100 : configured * 100;
        child.style.order = String(base + childOffset++);
      });
    };

    const timer = window.setTimeout(apply, 0);
    const observer = new MutationObserver(() => window.requestAnimationFrame(apply));
    const root = document.getElementById('root');
    if (root) observer.observe(root, { childList: true, subtree: true });
    return () => { window.clearTimeout(timer); observer.disconnect(); };
  }, [location.pathname, body]);

  return null;
}
