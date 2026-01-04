import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import Parser from "rss-parser";

const parser = new Parser();

const RSS_FEEDS = {
  'NHK News': 'https://www.nhk.or.jp/rss/news/cat0.xml',
  'Google News': 'https://news.google.com/rss?hl=ja&gl=JP&ceid=JP:ja',
  'Livedoor News': 'https://news.livedoor.com/topics/rss/top.xml'
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Fetch and cache news
  async function fetchRSS() {
    console.log("Fetching RSS feeds...");
    // Only perform the sync if we're not in a serverless function that might timeout
    // or if this is the first initialization.
    // In Vercel, background tasks with setInterval don't work well.
    const allItems = [];

    const feedMap: Record<string, string> = {
      'NHK News': 'nhk',
      'Google News': 'jiji',
      'Livedoor News': 'livedoor'
    };

    for (const [sourceLabel, url] of Object.entries(RSS_FEEDS)) {
      try {
        console.log(`Parsing feed: ${sourceLabel} from ${url}`);
        const feed = await parser.parseURL(url);
        const sourceKey = feedMap[sourceLabel];
        
        for (const item of feed.items) {
          if (!item.title || !item.link) continue;

          allItems.push({
            title: item.title,
            link: item.link,
            description: item.contentSnippet || item.content || "",
            source: sourceKey,
            publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
            thumbnail: null
          });
        }
      } catch (err) {
        console.error(`Failed to fetch RSS for ${sourceLabel}:`, err);
      }
    }

    if (allItems.length > 0) {
      await storage.syncNewsItems(allItems);
      console.log(`Synced ${allItems.length} news items`);
    } else {
      console.log("No news items found in any feed.");
    }
  }

  // Initial fetch - avoid blocking in serverless
  if (process.env.NODE_ENV !== "production") {
    fetchRSS();
    // Fetch every 5 minutes
    setInterval(fetchRSS, 5 * 60 * 1000);
  } else {
    // In production (Vercel), we might want to trigger this via a cron job or on-demand
    // but for now, we'll do one fetch on cold start if needed, but not block.
    fetchRSS().catch(err => console.error("Initial fetch failed:", err));
  }

  app.get(api.news.list.path, async (req, res) => {
    const sourcesQuery = req.query.sources as string | undefined;
    const sources = sourcesQuery && sourcesQuery !== "" ? sourcesQuery.split(',') : undefined;
    console.log("Fetching news for sources:", sources || "all");
    const news = await storage.getNews(sources);
    console.log(`Found ${news.length} items`);
    res.json(news);
  });

  app.post(api.news.sync.path, async (req, res) => {
    await fetchRSS();
    res.json({ count: 1 }); // Just success signal
  });

  return httpServer;
}
