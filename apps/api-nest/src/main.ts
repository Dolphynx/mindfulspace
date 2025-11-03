import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from '../prisma/prisma.service';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // === Prisma : fermeture propre ===
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  // === Swagger / OpenAPI ===
  const config = new DocumentBuilder()
    .setTitle('MindfulSpace API')
    .setDescription('Documentation Swagger de l’API MindfulSpace')
    .setVersion('1.0.0')
    .addBearerAuth() // optionnel, si tu gères un auth token
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // === CORS ===
  app.enableCors({
    origin:
      process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL // ex: https://mindfulspace.app
        : true, // en dev: autorise tout
    credentials: true,
  });

  // === Lancement serveur ===
  const port = process.env.PORT ? Number(process.env.PORT) : 3001;
  await app.listen(port);

  // === Log clair au démarrage ===
  console.log(`✅ API Nest démarrée sur http://localhost:${port}`);
  console.log(`📘 Swagger disponible sur http://localhost:${port}/api/docs`);
}

// Important : "void" pour éviter le warning ESLint
void bootstrap();
