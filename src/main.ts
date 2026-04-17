import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
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

  // 3. Setup Swagger với đường dẫn 'api'
  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'Funfanti API Docs',
    // Thêm dòng này để fix lỗi load giao diện trên một số môi trường cloud
    useGlobalPrefix: true,
    swaggerOptions: {
      docExpansion: 'list',
      filter: true,
      displayRequestDuration: true,
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    // Giữ nguyên phần CSS xịn xò của bạn
    customCss: `
      .swagger-ui .topbar { background: linear-gradient(90deg, #0f172a 0%, #1d4ed8 100%); padding: 10px 0; }
      .swagger-ui .topbar .download-url-wrapper { display: none; }
      .swagger-ui .info { margin: 24px 0; }
      .swagger-ui .info .title { color: #0f172a; }
      .swagger-ui .scheme-container { box-shadow: none; border: 1px solid #e2e8f0; border-radius: 10px; }
    `,
  });

  // 4. Port cho Vercel
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
void bootstrap();
