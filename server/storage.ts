import { db } from "./db";
import { newsItems, type InsertNewsItem, type NewsItem } from "@shared/schema";
import { eq, desc, inArray, sql } from "drizzle-orm";

export interface IStorage {
  getNews(sources?: string[]): Promise<NewsItem[]>;
  syncNewsItems(items: InsertNewsItem[]): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getNews(sources?: string[]): Promise<NewsItem[]> {
    console.log(`Storage: getNews for ${sources?.join(',') || 'all'}`);
    let query = db.select().from(newsItems).orderBy(desc(newsItems.publishedAt));
    
    if (sources && sources.length > 0) {
      query.where(inArray(newsItems.source, sources));
    }
    
    const results = await query.limit(100);
    console.log(`Storage: returning ${results.length} items`);
    return results;
  }

  async syncNewsItems(items: InsertNewsItem[]): Promise<void> {
    if (items.length === 0) return;

    // Upsert items based on link to avoid duplicates
    for (const item of items) {
      await db
        .insert(newsItems)
        .values(item)
        .onConflictDoUpdate({
          target: newsItems.link,
          set: {
            title: item.title,
            description: item.description,
            publishedAt: item.publishedAt,
            fetchedAt: new Date(),
          },
        });
    }
  }
}

export const storage = new DatabaseStorage();
