import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ExpressAdapter } from '@nestjs/platform-express';
import type { Request, Response } from 'express';
import express from 'express';
import { AppModule } from './app.module';

// 1. Biến toàn cục để cache lại server trên Vercel, giúp giảm thời gian cold start
let cachedServer: express.Express | undefined;

async function bootstrapServer(): Promise<express.Express> {
  // Nếu đã có server cache thì tái sử dụng, không khởi tạo lại NestJS
  if (!cachedServer) {
    const expressApp = express();
    const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));

    // Bật CORS để App Expo có thể gọi API
    app.enableCors();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    // Cấu hình Swagger
    const config = new DocumentBuilder()
      .setTitle('Funfanti API')
      .setDescription('Official backend API documentation for Funfanti micro-learning app.')
      .setVersion('1.0.0')
      .addBearerAuth()
      .addServer('https://[YOUR-RAILWAY-APP-NAME].up.railway.app', 'Railway Production Server')
      .addServer('http://localhost:3000', 'Local development')
      .build();

    const document = SwaggerModule.createDocument(app, config);

    // Chỉ expose OpenAPI JSON từ Nest
    SwaggerModule.setup('api', app, document, {
      ui: false,
      raw: ['json'],
      jsonDocumentUrl: 'api-json', // Route này sẽ sinh ra /api-json
    });

    const swaggerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Funfanti API Docs</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css" />
  <style>
    html { box-sizing: border-box; overflow-y: scroll; }
    *, *:before, *:after { box-sizing: inherit; }
    body { margin: 0; background: #f8fafc; }
    .swagger-ui .topbar { background: linear-gradient(90deg, #0f172a 0%, #1d4ed8 100%); padding: 10px 0; }
    .swagger-ui .topbar .download-url-wrapper { display: none; }
    .swagger-ui .info { margin: 24px 0; }
    .swagger-ui .info .title { color: #0f172a; }
    .swagger-ui .scheme-container { box-shadow: none; border: 1px solid #e2e8f0; border-radius: 10px; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js" crossorigin></script>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-standalone-preset.js" crossorigin></script>
  <script>
    window.ui = SwaggerUIBundle({
      url: '/api-json',
      dom_id: '#swagger-ui',
      deepLinking: true,
      presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
      layout: 'BaseLayout',
      docExpansion: 'list',
      filter: true,
      displayRequestDuration: true,
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha'
    });
  </script>
</body>
</html>`;

    // Serve Swagger UI qua CDN scripts
    expressApp.get(['/api', '/api/'], (_req: Request, res: Response) => {
      res.type('text/html').send(swaggerHtml);
    });

    // Redirect /docs to /api
    expressApp.get('/docs', (_req: Request, res: Response) => {
      res.redirect(308, '/api/');
    });
    expressApp.get('/docs/', (_req: Request, res: Response) => {
      res.redirect(308, '/api/');
    });

    // Quan trọng nhất cho Vercel: Khởi tạo app mà không mở port listen
    await app.init();
    cachedServer = expressApp;
  }
  
  return cachedServer;
}

// 2. Phân luồng chạy: Môi trường Local (chạy bằng npm run start:dev)
if (!process.env.VERCEL) {
  // Fix warning Promise bằng cách bắt .then() và .catch() đàng hoàng
  bootstrapServer()
    .then((app) => {
      const port = process.env.PORT || 3000;
      app.listen(port, () => {
        console.log(`\n🚀 Application is running on: http://localhost:${port}`);
        console.log(`📝 Swagger UI available at: http://localhost:${port}/api\n`);
      });
    })
    .catch((err) => {
      console.error('❌ Failed to start server:', err);
    });
}

// 3. Phân luồng chạy: Môi trường Vercel (Serverless Function)
export default async function handler(req: Request, res: Response) {
  // Đảm bảo app được khởi tạo xong trước khi nhận request
  const app = await bootstrapServer();
  // Giao request cho Express xử lý
  return app(req, res);
}