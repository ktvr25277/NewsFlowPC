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
  try {
    const httpServer = createServer(app);
    await registerRoutes(httpServer, app);

    // Serve static files in production
    if (process.env.NODE_ENV === "production") {
      const publicPath = path.resolve(process.cwd(), "dist", "public");
      if (fs.existsSync(publicPath)) {
        app.use(express.static(publicPath));
        app.get("*", (req, res) => {
          if (!req.path.startsWith("/api")) {
            res.sendFile(path.join(publicPath, "index.html"));
          }
        });
      }
    }

    // Error handling
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      console.error("API Error:", err);
      res.status(status).json({ message });
    });
  } catch (error) {
    console.error("Failed to initialize app:", error);
  }
})();

export default app;
