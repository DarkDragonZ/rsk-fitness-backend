import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthService } from './security/auth.service';
import { AuthModule } from './security/auth.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';

async function bootstrap() {
  process.env.TZ = 'Asia/Colombo';

  dotenv.config();
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');


  const allowedOrigins = [
    'http://localhost:3000',
    `http://192.168.1.3:3000`,
    'https://rskfitness.technook.lk',
    'https://www.rskfitness.technook.lk',
    'https://rsk-fitness.vercel.app'
  ];

  app.enableCors({
    origin: (origin, callback) => {
      if(!origin)  return callback(null,true);
      if(allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error('Not Allowed by CORS'));
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type,Authorization, X-Requested-with, Accept, Origin',
    optionsSuccessStatus: 204,
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3500);

  const authService = app.select(AuthModule).get(AuthService);
  await authService.seedUser();
  logger.log('Predefined user seeded');

  await app.listen(port, '0.0.0.0');
  logger.log(`Application is running on port ${port}`);

  app.use((req, res, next) => {
    logger.log(`Incoming request: ${req.method} ${req.url}, Origin: ${req.headers.origin}`);
    next();
  });
}
bootstrap();