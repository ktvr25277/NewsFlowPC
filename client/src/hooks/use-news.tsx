import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { z } from "zod";

// ============================================
// NEWS HOOKS
// ============================================

export function useNews(sources?: string[]) {
  const sourcesParam = sources?.length ? sources.join(',') : undefined;
  
  return useQuery({
    queryKey: [api.news.list.path, { sources: sourcesParam }],
    queryFn: async () => {
      // Build URL with query params
      const url = new URL(api.news.list.path, window.location.origin);
      if (sourcesParam) {
        url.searchParams.append("sources", sourcesParam);
      }
      
      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error('Failed to fetch news');
      return api.news.list.responses[200].parse(await res.json());
    },
    // Auto-refresh every 5 minutes by default, but this will be overridden by the UI setting
    refetchInterval: 5 * 60 * 1000, 
  });
}

export function useSyncNews() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.news.sync.path, {
        method: api.news.sync.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error('Failed to sync news');
      return api.news.sync.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.news.list.path] });
    },
  });
}

// ============================================
// LOCAL STORAGE HOOK FOR SETTINGS
// ============================================

import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { type NewsSettings, newsSettingsSchema } from "@shared/schema";

const DEFAULT_SETTINGS: NewsSettings = {
  sources: ["nhk", "jiji", "livedoor"],
  scrollDirection: "horizontal",
  scrollSpeed: "medium",
  refreshInterval: 300,
  fontSize: "medium",
};

type SettingsContextType = {
  settings: NewsSettings;
  updateSettings: (newSettings: NewsSettings) => void;
  isLoaded: boolean;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<NewsSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("news-settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const validated = newsSettingsSchema.safeParse(parsed);
        if (validated.success) {
          setSettings(validated.data);
        }
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
    setIsLoaded(true);
  }, []);

  const updateSettings = (newSettings: NewsSettings) => {
    const validSources = newSettings.sources.filter(s => ["nhk", "jiji", "livedoor"].includes(s));
    const cleanedSettings = { ...newSettings, sources: validSources };
    setSettings(cleanedSettings);
    localStorage.setItem("news-settings", JSON.stringify(cleanedSettings));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, isLoaded }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useNewsSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useNewsSettings must be used within a SettingsProvider");
  }
  return context;
}

// ============================================
// LOCAL STORAGE HOOK FOR READ LATER
// ============================================

export type SavedArticle = {
  id: number;
  title: string;
  link: string;
  source: string;
  savedAt: string;
};

export function useReadLater() {
  const [savedArticles, setSavedArticles] = useState<SavedArticle[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("read-later");
    if (saved) {
      try {
        setSavedArticles(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse read later list", e);
      }
    }
  }, []);

  const saveArticle = (article: Omit<SavedArticle, "savedAt">) => {
    setSavedArticles((prev) => {
      if (prev.some((a) => a.id === article.id)) return prev;
      const updated = [...prev, { ...article, savedAt: new Date().toISOString() }];
      localStorage.setItem("read-later", JSON.stringify(updated));
      return updated;
    });
  };

  const removeArticle = (id: number) => {
    setSavedArticles((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      localStorage.setItem("read-later", JSON.stringify(updated));
      return updated;
    });
  };

  const isSaved = (id: number) => savedArticles.some((a) => a.id === id);

  return { savedArticles, saveArticle, removeArticle, isSaved };
}
