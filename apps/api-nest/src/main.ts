import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // === TEST DE FONCTIONNEMENT ===
  // Active CORS pour autoriser le front (utile en dev)
  app.enableCors({
    origin:
      process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL // ex: https://mindfulspace.app
        : true, // en dev: autorise tout
    credentials: true,
  });

  const port = process.env.PORT ? Number(process.env.PORT) : 3001;
  await app.listen(port);

  // Log clair au démarrage
  console.log(`API Nest démarrée sur http://localhost:${port}`);
}

// Important : "void" pour éviter le warning ESLint
void bootstrap();
