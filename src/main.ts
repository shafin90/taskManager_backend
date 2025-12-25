import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { SecurityMiddleware } from './common/middleware/security.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS with security restrictions
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  // Apply security middleware
  const securityMiddleware = new SecurityMiddleware();
  app.use(securityMiddleware.use.bind(securityMiddleware));

  // Enable validation with auto-transformation and whitelisting
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      forbidNonWhitelisted: true, // Reject requests with non-whitelisted properties
    }),
  );

  // Consistent error shape
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Task Manager API')
    .setDescription('The Task Manager API description')
    .setVersion('1.0')
    .addTag('tasks')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Start the server
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap(); // Start server
