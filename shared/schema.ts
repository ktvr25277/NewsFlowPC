import { pgTable, text, serial, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const newsItems = pgTable("news_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  link: text("link").notNull().unique(),
  description: text("description"),
  thumbnail: text("thumbnail"),
  source: text("source").notNull(), // 'nhk', 'jiji', 'livedoor', etc.
  publishedAt: timestamp("published_at"),
  fetchedAt: timestamp("fetched_at").defaultNow(),
});

export const insertNewsItemSchema = createInsertSchema(newsItems).omit({ 
  id: true, 
  fetchedAt: true 
});

export type NewsItem = typeof newsItems.$inferSelect;
export type InsertNewsItem = z.infer<typeof insertNewsItemSchema>;

// API Response types
export type NewsResponse = NewsItem;

// Settings type (handled client-side mostly, but good to have types)
export const newsSettingsSchema = z.object({
  sources: z.array(z.string()),
  scrollDirection: z.enum(["horizontal", "vertical"]),
  scrollSpeed: z.enum(["slow", "medium", "fast"]),
  refreshInterval: z.number().min(60).max(3600), // seconds
});

export type NewsSettings = z.infer<typeof newsSettingsSchema>;
