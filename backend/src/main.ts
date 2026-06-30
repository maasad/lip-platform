import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe - rejects any request that fails DTO validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strips unknown properties from request body
      forbidNonWhitelisted: true, // throws error if unknown properties are sent
      transform: true, // auto-transforms payloads to DTO class instances
    }),
  );

  // CORS - allows the React frontend to talk to this API
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  // Swagger - auto-generated API documentation at /api/docs
  const config = new DocumentBuilder()
    .setTitle('LIP Platform API')
    .setDescription('LiveOps Intelligence Platform for financial systems')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`Application running on: http://localhost:${port}`);
  console.log(`API Docs available at: http://localhost:${port}/api/docs`);
}

bootstrap();
