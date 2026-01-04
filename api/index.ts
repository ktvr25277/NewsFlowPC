import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "../server/routes";
import { createServer } from "http";
import path from "path";
import fs from "fs";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.path.startsWith("/api")) {
      console.log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
    }
  });
  next();
});

(async () => {
  const httpServer = createServer(app);
  // Important: registerRoutes is async but we don't await it here 
  // to avoid blocking the cold start of the serverless function
  registerRoutes(httpServer, app).catch(err => {
    console.error("Failed to register routes:", err);
  });

  // Serve static files in production
  if (process.env.NODE_ENV === "production") {
    // Vercel handles static files automatically via rewrites to index.html
    // but we can keep this as a fallback
    const publicPath = path.resolve(process.cwd(), "dist", "public");
    if (fs.existsSync(publicPath)) {
      app.use(express.static(publicPath));
    }
  }

  // Error handling
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error("API Error:", err);
    res.status(status).json({ message });
  });
})();

export default app;
