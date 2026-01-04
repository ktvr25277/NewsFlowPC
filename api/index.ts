// api/index.ts

import express, { type Request, Response, NextFunction } from "express";

import { registerRoutes } from "../server/routes";

import { createServer } from "http";

 

const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: false }));

 

// ログ用ミドルウェア（必要であれば残す）

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

 

// 【重要】Vercel用に、リクエストが来るたびにルート登録を確認して実行するラッパー関数にする

let routesRegistered = false;

 

const setupApp = async () => {

  if (!routesRegistered) {

    const httpServer = createServer(app);

    // サーバーとアプリを渡してルートを登録（WebSocketsはVercelでは動きませんが、エラー回避のためhttpServerも渡す）

    await registerRoutes(httpServer, app);

    routesRegistered = true;

  }

};

 

// エラーハンドリング

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {

  const status = err.status || err.statusCode || 500;

  const message = err.message || "Internal Server Error";

  res.status(status).json({ message });

});

 

// Vercel Serverless Handlerとしてエクスポート

export default async (req: Request, res: Response) => {

  await setupApp(); // ルート登録完了を待つ

  app(req, res);    // Expressアプリを実行

};
