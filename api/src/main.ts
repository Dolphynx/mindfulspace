import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // === TEST DE FONCTIONNEMENT ===
  // Active CORS pour autoriser le front (utile en dev)
  app.enableCors({
    origin: true, // en dev: autorise tout; en prod: remplace par l’URL du front
    credentials: true,
  });

  const port = process.env.PORT ? Number(process.env.PORT) : 3001;
  await app.listen(port);
  // console.log(`API ready on http://localhost:${port}`);
}
bootstrap();
