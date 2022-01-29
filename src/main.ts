import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core'; //iz cijelog ovog paketa mi importujemo klasu NestFactory
import { NestExpressApplication } from '@nestjs/platform-express';
import { StorageConfig } from 'config/storage.config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(StorageConfig.photo.destination, {
    prefix: StorageConfig.photo.urlPrefix,
    maxAge: StorageConfig.photo.maxAge,
    index: false,
  });

  // VALIDACIJA
  app.useGlobalPipes(new ValidationPipe());

  app.enableCors({});
  await app.listen(3003);
}
bootstrap();
