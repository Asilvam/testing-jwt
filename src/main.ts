import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  app.useLogger(new Logger());
  app.enableCors({
    origin: '*', // Allow requests from this origin
    preflightContinue: false,
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow only specified headers
    credentials: true,
  });
  await app.listen(process.env.PORT);
}
bootstrap();
