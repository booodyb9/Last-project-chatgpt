import type { Content } from '../pages/dashboard/types';
import { safeParseJson } from './safeJson';

export interface SiteSettings {
  companyName?: string;
  phoneNumber?: string;
  whatsappNumber?: string;
  email?: string;
  address?: string;
  addressDetails?: string;
  workingHours?: string;
  workingHoursFriday?: string;
  logoUrl?: string;
  faviconUrl?: string;
  defaultMetaTitle?: string;
  defaultMetaDescription?: string;
  twitterUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  socialLinks?: Record<string, string>;
  [key: string]: unknown;
}

function arrayKeyValueToObject(value: unknown): Record<string, unknown> {
  if (!Array.isArray(value)) return {};
  return value.reduce<Record<string, unknown>>((acc, item) => {
    if (item && typeof item === 'object' && 'key' in item) {
      const row = item as { key: string; value?: unknown };
      acc[row.key] = row.value;
    }
    return acc;
  }, {});
}

export function getSiteSettings(contents: Content[]): SiteSettings {
  const getBody = (key: string) => contents.find((c) => c.key === key)?.body;

  const site = safeParseJson<Record<string, unknown>>(getBody('site_settings'), {});
  const companyRaw = safeParseJson<unknown>(getBody('company_info'), {});
  const company = Array.isArray(companyRaw) ? arrayKeyValueToObject(companyRaw) : (companyRaw as Record<string, unknown> || {});
  const seo = safeParseJson<Record<string, unknown>>(getBody('seo_settings'), {});
  const socials = safeParseJson<Record<string, unknown>>(getBody('social_links'), {});

  const socialLinks: Record<string, string> = {
    ...(typeof site.socialLinks === 'object' && site.socialLinks ? site.socialLinks as Record<string, string> : {}),
    ...Object.fromEntries(Object.entries(socials).filter(([, value]) => typeof value === 'string')) as Record<string, string>
  };

  return {
    ...company,
    ...seo,
    ...site,
    companyName: String(site.companyName ?? company.companyName ?? company.name ?? 'شركة زجاج الرياض'),
    phoneNumber: String(site.phoneNumber ?? company.phoneNumber ?? company.phone ?? ''),
    whatsappNumber: String(site.whatsappNumber ?? company.whatsappNumber ?? company.whatsapp ?? site.phoneNumber ?? company.phone ?? ''),
    email: String(site.email ?? company.email ?? ''),
    address: String(site.address ?? company.address ?? ''),
    addressDetails: String(site.addressDetails ?? company.address_details ?? ''),
    workingHours: String(site.workingHours ?? company.working_hours ?? ''),
    workingHoursFriday: String(site.workingHoursFriday ?? company.working_hours_friday ?? ''),
    socialLinks
  };
}

export function normalizePhoneForHref(value?: string) {
  if (!value) return '';
  return value.replace(/[^0-9+]/g, '');
}

export function normalizeWhatsAppNumber(value?: string) {
  if (!value) return '';
  return value.replace(/\D/g, '');
}
