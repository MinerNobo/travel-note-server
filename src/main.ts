import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { IoAdapter } from '@nestjs/platform-socket.io';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { DataValidationInterceptor } from './common/interceptors/data-validation.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:', 'http:', 'wxfile://'],
          mediaSrc: ["'self'", 'data:', 'https:', 'http:', 'wxfile://'],
          connectSrc: ["'self'", 'https:', 'http:'],
          fontSrc: ["'self'", 'https:', 'data:'],
          objectSrc: ["'none'"],
          frameSrc: ["'self'"],
        },
      },
      crossOriginOpenerPolicy: { policy: 'unsafe-none' },
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  app.useWebSocketAdapter(new IoAdapter(app));

  app.enableCors({
    origin: [
        'http://localhost:5173', 
        'https://moruka.top',
        'http://moruka.top',
        'http://124.71.204.101',
        'https://124.71.204.101',
      process.env.FRONTEND_URL ?? ''
    ].filter(Boolean) as string[],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'X-Requested-With',
      'Accept',
      'Origin'
    ],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
    exposedHeaders: ['Content-Type', 'Authorization']
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      exceptionFactory: (errors) => {
        const firstError = errors[0];
        const firstConstraint = Object.values(firstError.constraints || {})[0];

        return new BadRequestException({
          statusCode: 400,
          timestamp: new Date().toISOString(),
          path: '',
          message: firstConstraint || '参数验证失败',
          errorDetails: errors.map((error) => ({
            field: error.property,
            message: Object.values(error.constraints || {})[0],
          })),
        });
      },
    }),
  );


  app.useGlobalFilters(new GlobalExceptionFilter());

  app.useGlobalInterceptors(new DataValidationInterceptor());

  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 40000);
}

bootstrap();
