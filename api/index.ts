import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import express from 'express';

import { INestApplication } from '@nestjs/common';
import type { Request, Response } from 'express';

const expressApp = express();
let cachedApp: INestApplication;

async function bootstrapServer() {
  if (!cachedApp) {
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
    );

    // 1. Enable CORS
    app.enableCors();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    // 2. Swagger Configuration
    const config = new DocumentBuilder()
      .setTitle('Funfanti API')
      .setDescription(
        'Official backend API documentation for Funfanti micro-learning app.',
      )
      .setVersion('1.0.0')
      .addBearerAuth()
      .addServer('https://[YOUR-VERCEL-APP-NAME].vercel.app', 'Vercel Server')
      .addServer('https://[YOUR-RAILWAY-APP-NAME].up.railway.app', 'Railway Server')
      .addServer('http://localhost:3000', 'Local development')
      .build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup('api', app, document, {
      ui: false,
      raw: ['json'],
      jsonDocumentUrl: 'api-json',
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

    const adapter = app.getHttpAdapter().getInstance();
    adapter.get(['/api', '/api/'], (_req: Request, res: Response) => {
      res.type('text/html').send(swaggerHtml);
    });

    adapter.get('/docs', (_req: Request, res: Response) => {
      res.redirect(308, '/api/');
    });
    adapter.get('/docs/', (_req: Request, res: Response) => {
      res.redirect(308, '/api/');
    });

    await app.init();
    cachedApp = app;
  }
  return expressApp;
}

export default async function (req: Request, res: Response) {
  const server = await bootstrapServer();
  return server(req, res);
}
