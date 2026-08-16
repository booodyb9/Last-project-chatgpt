import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react';
import { Content } from '../pages/dashboard/types';
import { supabase } from '../lib/supabase';

interface ContentContextType {
  mediaFiles: MediaFile[];
  fetchMedia: () => Promise<void>;
  forceRefresh: () => Promise<void>;
  contents: Content[];
  loading: boolean;
  getContent: (key: string) => Content | undefined;
  refreshContent: () => Promise<void>;
  updateContent: (key: string, body: string) => void;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export interface MediaFile { id: string; url: string; name: string; created_at: string; storage_path: string; }

export function ContentProvider({ children }: { children: ReactNode }) {
  const [contents, setContents] = useState<Content[]>([]);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);

    const fetchMedia = async () => {
    try {
      const { data, error } = await supabase.from('media').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        setMediaFiles(data as MediaFile[]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const forceRefresh = async () => {
    await fetchContents();
    await fetchMedia();
  };

  const fetchContents = async () => {
    try {
      const { data, error } = await supabase.from('contents').select('*');
      // Adding a dummy query to bypass potential aggressive caching in proxies
      // is not natively supported by supabase js without rpc, 
      // but realtime + updateContent handles immediate updates now.
      if (error) {
        console.error("Error fetching contents from Supabase:", error);
      } else if (data) {
        setContents(data as Content[]);
      }
    } catch (err) {
      console.error("Error fetching contents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContents();
    fetchMedia();
    const channel = supabase
      .channel('contents_changes_ctx')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'contents' },
        (payload) => {
          fetchContents();
        }
      )
      .subscribe();

    const mediaChannel = supabase
      .channel('media_changes_ctx')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'media' },
        (payload) => {
          fetchMedia();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(mediaChannel);
    };
  }, []);

  const getContent = (key: string) => contents.find(c => c.key === key);

  const updateContent = (key: string, body: string) => {
    setContents(prev => prev.map(c => c.key === key ? { ...c, body } : c));
  };

    const value = useMemo(() => ({ contents, loading, getContent, refreshContent: fetchContents, updateContent, mediaFiles, fetchMedia, forceRefresh }), [contents, loading, mediaFiles]);
  return (
    <ContentContext.Provider value={value}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
}

