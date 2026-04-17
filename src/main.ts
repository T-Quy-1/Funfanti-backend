import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Bật CORS để App Expo có thể gọi API
  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 2. Cấu hình Swagger
  const config = new DocumentBuilder()
    .setTitle('Funfanti API')
    .setDescription(
      'Official backend API documentation for Funfanti micro-learning app.',
    )
    .setVersion('1.0.0')
    .addTag('Questions', 'Manage quiz questions for learning sessions')
    // Thêm link server Vercel của bạn vào đây
    .addServer('https://funfanti-backend.vercel.app', 'Production server')
    .addServer('http://localhost:3000', 'Local development')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // 3. Chỉ expose OpenAPI JSON từ Nest, UI sẽ dùng CDN để tránh thiếu asset trên Vercel
  SwaggerModule.setup('docs', app, document, {
    ui: false,
    raw: ['json'],
    jsonDocumentUrl: 'docs-json',
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
      url: '/docs-json',
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

  // Serve Swagger UI qua CDN scripts để tránh lỗi trắng trang trên Vercel.
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.get(['/docs', '/docs/'], (_req: Request, res: Response) => {
    res.type('text/html').send(swaggerHtml);
  });

  // Redirect /api để không bị trang trắng khi truy cập endpoint Swagger cũ.
  expressApp.get('/api', (_req: Request, res: Response) => {
    res.redirect(308, '/docs/');
  });
  expressApp.get('/api/', (_req: Request, res: Response) => {
    res.redirect(308, '/docs/');
  });

  // 4. Port cho Vercel
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
void bootstrap();
