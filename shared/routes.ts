import { z } from 'zod';
import { newsItems, insertNewsItemSchema } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  news: {
    list: {
      method: 'GET' as const,
      path: '/api/news',
      input: z.object({
        sources: z.string().optional(), // comma separated
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof newsItems.$inferSelect>()),
      },
    },
    sync: {
      method: 'POST' as const,
      path: '/api/news/sync',
      responses: {
        200: z.object({ count: z.number() }),
      },
    }
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type NewsListResponse = z.infer<typeof api.news.list.responses[200]>;
