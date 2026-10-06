import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../contexts/LanguageContext';
import { useContent } from '../contexts/ContentContext';
import { getSiteSettings } from '../lib/settings';

interface SEOProps {
  noindex?: boolean;
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  image?: string;
  structuredData?: any;
}

export default function SEO({ noindex, title, description, keywords, canonical, image, structuredData }: SEOProps) {
  const { language } = useLanguage();
  const { contents } = useContent();
  const location = useLocation();
  const settings = getSiteSettings(contents);
  const baseUrl = String(settings.siteUrl || 'https://riyadh-glass.ai.studio').replace(/\/$/, '');
  const url = `${baseUrl}${location.pathname}`;

  const defaults = language === 'ar' ? {
    title: String(settings.defaultMetaTitle || 'شركة زجاج الرياض | تركيب زجاج الرياض | واجهات، كبائن شاور، ومرايا'),
    description: String(settings.defaultMetaDescription || 'شركة زجاج الرياض لتركيب وتفصيل الزجاج في الرياض. واجهات زجاجية، قواطع مكتبية، كبائن شاور، مرايا وزجاج سيكوريت.'),
    keywords: String(settings.defaultKeywords || 'زجاج الرياض, تركيب زجاج بالرياض, زجاج سيكوريت الرياض, كبائن شاور الرياض, واجهات زجاجية الرياض')
  } : {
    title: 'Riyadh Glass Company | Glass Installation Riyadh',
    description: 'Riyadh Glass Company for glass installation and fabrication in Riyadh.',
    keywords: 'Riyadh glass, glass installation Riyadh, tempered glass Riyadh'
  };

  const pageTitle = title || defaults.title;
  const pageDescription = description || defaults.description;
  const pageKeywords = keywords || defaults.keywords;
  const ogImage = image || String(settings.ogImage || `${baseUrl}/og-image.jpg`);
  const pathParts = location.pathname.split('/').filter(Boolean);
  const sameAs = Object.values((settings.socialLinks || {}) as Record<string, string>).filter(Boolean);

  const graph: any[] = [
    {
      '@type': 'HomeAndConstructionBusiness',
      '@id': `${baseUrl}/#organization`,
      name: settings.companyName || 'شركة زجاج الرياض',
      url: baseUrl,
      logo: settings.logoUrl || ogImage,
      image: settings.logoUrl || ogImage,
      description: pageDescription,
      telephone: settings.phoneNumber || undefined,
      email: settings.email || undefined,
      priceRange: settings.priceRange || undefined,
      address: settings.address ? { '@type': 'PostalAddress', streetAddress: settings.address, addressLocality: settings.addressLocality || 'الرياض', addressRegion: settings.addressRegion || 'منطقة الرياض', postalCode: settings.postalCode || undefined, addressCountry: 'SA' } : undefined,
      areaServed: settings.areaServed || 'الرياض',
      sameAs: sameAs.length ? sameAs : undefined,
      contactPoint: settings.phoneNumber ? { '@type': 'ContactPoint', telephone: settings.phoneNumber, contactType: 'customer service', availableLanguage: ['Arabic', 'English'] } : undefined
    },
    { '@type': 'WebSite', '@id': `${baseUrl}/#website`, url: baseUrl, name: settings.companyName || 'شركة زجاج الرياض', publisher: { '@id': `${baseUrl}/#organization` }, inLanguage: language === 'ar' ? 'ar-SA' : 'en' },
    { '@type': 'WebPage', '@id': `${url}#webpage`, url, name: pageTitle, isPartOf: { '@id': `${baseUrl}/#website` }, description: pageDescription, inLanguage: language === 'ar' ? 'ar-SA' : 'en' },
    {
      '@type': 'BreadcrumbList', '@id': `${url}#breadcrumb`, itemListElement: [
        { '@type': 'ListItem', position: 1, name: language === 'ar' ? 'الرئيسية' : 'Home', item: baseUrl },
        ...pathParts.map((part, index) => ({ '@type': 'ListItem', position: index + 2, name: decodeURIComponent(part), item: `${baseUrl}/${pathParts.slice(0, index + 1).join('/')}` }))
      ]
    }
  ];
  if (structuredData) graph.push(...(Array.isArray(structuredData) ? structuredData : [structuredData]));

  return <Helmet>
    <title>{pageTitle}</title>
    <meta name="description" content={pageDescription} />
    <meta name="keywords" content={pageKeywords} />
    <meta name="author" content={String(settings.companyName || 'شركة زجاج الرياض')} />
    <meta name="google-site-verification" content="fDAXcSUws--VipnkqaDbj574LpBOVvs-jTNC4wZQW7w" />
    <meta property="og:type" content="website" /><meta property="og:url" content={url} /><meta property="og:title" content={pageTitle} /><meta property="og:description" content={pageDescription} /><meta property="og:image" content={ogImage} /><meta property="og:site_name" content={String(settings.companyName || 'شركة زجاج الرياض')} /><meta property="og:locale" content={language === 'ar' ? 'ar_SA' : 'en_US'} />
    <meta name="twitter:card" content="summary_large_image" /><meta name="twitter:url" content={url} /><meta name="twitter:title" content={pageTitle} /><meta name="twitter:description" content={pageDescription} /><meta name="twitter:image" content={ogImage} />
    <link rel="canonical" href={canonical || url} />
    <link rel="alternate" href={url} hrefLang="ar" /><link rel="alternate" href={url} hrefLang="en" /><link rel="alternate" href={url} hrefLang="x-default" />
    {noindex && <meta name="robots" content="noindex, follow" />}
    <script type="application/ld+json">{JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })}</script>
  </Helmet>;
}
