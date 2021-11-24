import { NestFactory } from '@nestjs/core'; //iz cijelog ovog paketa mi importujemo klasu NestFactory
import { AppModule } from './app.module'; 

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3003);
}
bootstrap();
