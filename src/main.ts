import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { PrismaService } from './shared/prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Pat Pat API')
    .setVersion('1.0')
    .addCookieAuth(
      'access_token',
      {
        in: 'cookie',
        type: 'apiKey',
      },
      'access_token',
    )
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  const prisma: PrismaService = app.get(PrismaService);

  prisma.enableShutdownHooks(app);

  await app.listen(3000);
}

bootstrap();
