export type LeadTemperature = 'hot' | 'warm' | 'cold';

export interface LeadIntentSignals {
  hasContactDetails?: boolean;
  requestedQuote?: boolean;
  uploadedImage?: boolean;
  usedCalculator?: boolean;
  openedWhatsApp?: boolean;
  usedAiAssistant?: boolean;
  revisitedHighIntentPage?: boolean;
}

export function computeLeadScore(signals: LeadIntentSignals) {
  let score = 0;
  if (signals.hasContactDetails) score += 30;
  if (signals.requestedQuote) score += 25;
  if (signals.uploadedImage) score += 15;
  if (signals.usedCalculator) score += 10;
  if (signals.openedWhatsApp) score += 10;
  if (signals.usedAiAssistant) score += 5;
  if (signals.revisitedHighIntentPage) score += 5;

  score = Math.min(100, score);
  const temperature: LeadTemperature = score >= 60 ? 'hot' : score >= 30 ? 'warm' : 'cold';
  return { score, temperature };
}

export const LEAD_STATUSES = ['new', 'contacted', 'interested', 'quote_sent', 'won', 'lost', 'closed'] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_SOURCES = [
  'ai_assistant',
  'image_analysis',
  'calculator',
  'service_page',
  'project_page',
  'contact_form',
  'quote_form',
  'whatsapp_handoff',
  'other'
] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];
