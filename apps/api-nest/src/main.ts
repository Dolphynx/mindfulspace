/**
 * Fichier d’entrée principal de l’API NestJS.
 * -------------------------------------------
 * Ce fichier :
 * - Initialise l'application NestJS via AppModule.
 * - Gère l’intégration propre avec Prisma (shutdown hooks).
 * - Configure Swagger (OpenAPI) pour la documentation API.
 * - Active CORS (important pour Next.js en front).
 * - Lance le serveur et affiche des logs lisibles au démarrage.
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from '../prisma/prisma.service';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

/**
 * Fonction bootstrap :
 * --------------------
 * Point d’entrée qui instancie et configure toute l’application Nest.
 *
 * Étapes :
 * 1. Création de l'app Nest.
 * 2. Injection et configuration de Prisma pour une fermeture propre.
 * 3. Configuration Swagger (OpenAPI).
 * 4. Activation CORS pour autoriser le frontend.
 * 5. Lancement du serveur.
 */
async function bootstrap(): Promise<void> {
  // === Création de l’application Nest ===
  const app = await NestFactory.create(AppModule);

  // === Prisma : fermeture propre ===
  /**
   * Prisma peut maintenir des connexions ouvertes.
   * enableShutdownHooks permet à NestJS d’appeler prisma.$disconnect()
   * quand l’app se termine, évitant des comportements imprévus.
   */
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  // === Swagger / OpenAPI ===
  /**
   * Génération automatique de la documentation API.
   * Accessible ensuite via : /api/docs
   */
  const config = new DocumentBuilder()
    .setTitle('MindfulSpace API')
    .setDescription('Documentation Swagger de l’API MindfulSpace')
    .setVersion('1.0.0')
    .addBearerAuth() // Facultatif : utile si une auth par token est prévue
    .build();

  // Création du document Swagger et exposition sur /api/docs
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // === CORS ===
  /**
   * Configuration CORS
   * -------------------
   * Autorise uniquement les domaines officiels à accéder à l’API.
   *
   * En production :
   *   - Seuls les domaines suivants sont autorisés :
   *       • https://mindfulspace.be
   *       • https://www.mindfulspace.be
   *       • https://staging.mindfulspace.be
   *       • (optionnel) FRONTEND_URL si défini dans les variables d’environnement.
   *
   * En développement :
   *   - Seul http://localhost:3000 est autorisé (frontend Next.js en mode dev).
   *
   * Note :
   *   Cette configuration évite les accès non autorisés depuis des domaines externes
   *   et renforce la sécurité tout en gardant la flexibilité pour le staging.
   */

  const allowedOrigins =
    process.env.NODE_ENV === 'production'
      ? [
        process.env.FRONTEND_URL, // si défini dans l’environnement
        'https://mindfulspace.be',
        'https://www.mindfulspace.be',
        'https://staging.mindfulspace.be',
      ].filter(Boolean) // évite les undefined
      : ['http://localhost:3000'];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
  });

  /*app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://staging.mindfulspace.be',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
  });/*

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // === Lancement serveur ===
  /**
   * Par défaut, le port est 3001 si non précisé.
   */
  const port = process.env.PORT ? Number(process.env.PORT) : 3001;
  await app.listen(port);

  // === Log clair au démarrage ===
  console.log(`✅ API Nest démarrée sur http://localhost:${port}`);
  console.log(`📘 Swagger disponible sur http://localhost:${port}/api/docs`);
}

// Important : "void" pour éviter le warning ESLint
void bootstrap();
