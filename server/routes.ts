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

    for (const [source, url] of Object.entries(RSS_FEEDS)) {
      try {
        const feed = await parser.parseURL(url);
        
        for (const item of feed.items) {
          if (!item.title || !item.link) continue;

          allItems.push({
            title: item.title,
            link: item.link,
            description: item.contentSnippet || item.content || "",
            source: source,
            publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
            thumbnail: null // RSS often doesn't have standard thumbnails, would need scraping
          });
        }
      } catch (err) {
        console.error(`Failed to fetch RSS for ${source}:`, err);
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
    const sources = req.query.sources ? (req.query.sources as string).split(',') : undefined;
    const news = await storage.getNews(sources);
    res.json(news);
  });

  app.post(api.news.sync.path, async (req, res) => {
    await fetchRSS();
    res.json({ count: 1 }); // Just success signal
  });

  return httpServer;
}
