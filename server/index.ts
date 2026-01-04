// server/index.ts
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

// ミドルウェア設定
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ログ関数
export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

// ログ用ミドルウェア
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      log(logLine);
    }
  });

  next();
});

// エラーハンドリング
const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
  // console.error(err); // 必要ならコメントアウト解除
};

// 【重要】サーバー起動ロジックを関数化し、即時実行しないようにする
const startServer = async () => {
  await registerRoutes(httpServer, app);

  app.use(errorHandler);

  // ローカル開発時のみ Vite や静的ファイルの設定を行う
  if (process.env.NODE_ENV !== "production") {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  } else {
    // Vercel環境ではない、通常のサーバーとして動かす場合（Dockerなど）のみここを通る
    // Vercelの場合は vercel.json が静的ファイルを処理するのでここは不要だが、
    // 安全のため残しても良いが、基本的にはVercel上では serveStatic は不要
    // serveStatic(app);
  }

  // ポートリッスンは「ローカル実行」または「明示的に呼ばれた時」のみ行う
  if (process.env.NODE_ENV !== "production") {
    const port = parseInt(process.env.PORT || "5000", 10);
    httpServer.listen({ port, host: "0.0.0.0", reusePort: true }, () => {
      log(`serving on port ${port}`);
    });
  }
};

// Vercel (Production) 環境では、startServer を即時実行せず、
// api/index.ts からアプリを使えるように export するだけにする
if (process.env.NODE_ENV !== "production") {
  startServer();
}

export default app;
