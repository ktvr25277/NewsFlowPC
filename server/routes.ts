import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import Parser from "rss-parser";

const parser = new Parser();

const RSS_FEEDS = {
  'NHK News': 'https://www.nhk.or.jp/rss/news/cat0.xml',
  'Jiji Press': 'https://www.jiji.com/rss/jn.rdf',
  'Livedoor News': 'https://news.livedoor.com/topics/rss/top.xml'
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Fetch and cache news
  async function fetchRSS() {
    console.log("Fetching RSS feeds...");
    const allItems = [];

    const feedMap = {
      'NHK News': 'nhk',
      'Jiji Press': 'jiji',
      'Livedoor News': 'livedoor'
    };

    for (const [sourceLabel, url] of Object.entries(RSS_FEEDS)) {
      try {
        const feed = await parser.parseURL(url);
        const sourceKey = feedMap[sourceLabel as keyof typeof feedMap];
        
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
    }
  }

  // Initial fetch
  fetchRSS();
  // Fetch every 5 minutes
  setInterval(fetchRSS, 5 * 60 * 1000);

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
