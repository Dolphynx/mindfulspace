/**
 * app.controller.spec.ts
 * ----------------------
 * Fichier de tests unitaires pour AppController.
 *
 * Rôle :
 * - Vérifier que le controller racine retourne bien "Hello World!".
 * - Exemple minimal de test Jest utilisé par NestJS lors de la génération initiale du projet.
 *
 * Ce fichier illustre :
 * - la création d’un TestingModule isolé
 * - l’injection automatique de AppService dans AppController
 * - le test d’un endpoint simple
 */

import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  /**
   * Avant chaque test :
   * - Création d’un module NestJS isolé utilisant uniquement les éléments nécessaires
   * - Compilation du module de test
   * - Récupération d’une instance d’AppController depuis l’injector Nest
   */
  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  /**
   * Groupe de tests ciblant la route racine (GET "/")
   */
  describe('root', () => {
    /**
     * Test unitaire :
     * Vérifie que la méthode getHello() retourne exactement "Hello World!".
     *
     * Ce test permet de s’assurer que le controller et le service fonctionnent correctement.
     */
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
