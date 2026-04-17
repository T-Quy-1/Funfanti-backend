import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Funfanti API')
    .setDescription(
      'Official backend API documentation for Funfanti micro-learning app.',
    )
    .setVersion('1.0.0')
    .addTag('Questions', 'Manage quiz questions for learning sessions')
    .addServer('http://localhost:3000', 'Local development server')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory, {
    customSiteTitle: 'Funfanti API Docs',
    swaggerOptions: {
      docExpansion: 'list',
      filter: true,
      displayRequestDuration: true,
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customCss: `
      .swagger-ui .topbar {
        background: linear-gradient(90deg, #0f172a 0%, #1d4ed8 100%);
        padding: 10px 0;
      }
      .swagger-ui .topbar .download-url-wrapper {
        display: none;
      }
      .swagger-ui .info {
        margin: 24px 0;
      }
      .swagger-ui .info .title {
        color: #0f172a;
      }
      .swagger-ui .scheme-container {
        box-shadow: none;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
      }
    `,
  });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
