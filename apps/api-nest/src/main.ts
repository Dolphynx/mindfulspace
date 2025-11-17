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
   * Autorise le frontend Next.js à appeler l’API.
   *
   * En production :
   *   - FRONTEND_URL doit être défini dans les variables d'environnement.
   * En développement :
   *   - CORS = true → tout est autorisé pour faciliter les tests.
   */
  app.enableCors({
    origin:
      process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL // ex: https://mindfulspace.app
        : true, // en dev: autorise tout
    credentials: true,
  });

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
