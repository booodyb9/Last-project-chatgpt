export interface Message {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  service?: string;
  message: string;
  created_at: string;
  is_read: boolean;
  status?: 'new' | 'read' | 'replied' | 'archived';
  archived_at?: string | null;
}

export interface Lead {
  id: number | string;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  service?: string | null;
  source: string;
  source_context?: Record<string, unknown>;
  message?: string | null;
  notes?: string | null;
  status: 'new' | 'contacted' | 'interested' | 'quote_sent' | 'won' | 'lost' | 'closed';
  score: number;
  temperature: 'hot' | 'warm' | 'cold';
  calc_area?: number | null;
  calc_type?: string | null;
  calc_price?: number | null;
  assigned_admin?: string | null;
  follow_up_at?: string | null;
  last_activity_at: string;
  created_at: string;
  updated_at: string;
}

export interface LeadActivity {
  id: number | string;
  lead_id: number | string;
  activity_type: string;
  details?: Record<string, unknown>;
  created_by?: string | null;
  created_at: string;
}

export interface Content {
  id?: number | string;
  key: string;
  title: string;
  body: string;
  type: string;
}

export interface MediaFile {
  storage_path?: string;
  id: string | number;
  name: string;
  url: string;
  type?: string;
  size?: number;
  created_at?: string;
}

export interface PortfolioProject {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  location: string;
  serviceType: string;
  client: string;
  completionDate: string;
  materialsUsed: string;
  coverImage: string;
  galleryImages: string[];
  isFeatured: boolean;
  isHidden: boolean;
  order: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  seoCanonical?: string;
  seoImage?: string;
  seoNoIndex?: boolean;
  beforeImage?: string;
  afterImage?: string;
}
