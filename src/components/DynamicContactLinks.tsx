import { useEffect } from 'react';
import { useContent } from '../contexts/ContentContext';
import { getSiteSettings, normalizePhoneForHref, normalizeWhatsAppNumber } from '../lib/settings';

export default function DynamicContactLinks() {
  const { contents } = useContent();
  const settings = getSiteSettings(contents);

  useEffect(() => {
    const phone = normalizePhoneForHref(settings.phoneNumber || '0510233706');
    const whatsapp = normalizeWhatsAppNumber(settings.whatsappNumber || settings.phoneNumber || '966510233706');
    if (!phone && !whatsapp) return;

    const apply = () => {
      document.querySelectorAll<HTMLAnchorElement>('a[href^="tel:"]').forEach((link) => {
        if (phone) link.href = `tel:${phone}`;
      });
      document.querySelectorAll<HTMLAnchorElement>('a[href*="wa.me/"]').forEach((link) => {
        if (!whatsapp) return;
        try {
          const current = new URL(link.href);
          const text = current.searchParams.get('text');
          current.pathname = `/${whatsapp}`;
          if (text) current.searchParams.set('text', text);
          link.href = current.toString();
        } catch {
          link.href = `https://wa.me/${whatsapp}`;
        }
      });
    };

    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [settings.phoneNumber, settings.whatsappNumber]);

  return null;
}
