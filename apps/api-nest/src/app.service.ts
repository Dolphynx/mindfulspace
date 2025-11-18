/**
 * AppService
 * ----------
 * Service minimal utilisé par AppController.
 *
 * Rôle :
 * - Fournir une méthode simple `getHello()` retournant un message statique.
 *
 * Ce fichier est généralement conservé pour les tests et comme exemple
 * dans un projet NestJS nouvellement généré.
 */

import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  /**
   * Retourne un message statique "Hello World!".
   * - Utilisé par AppController (GET "/")
   * - Sert de test minimal pour vérifier que l’application répond bien.
   */
  getHello(): string {
    return 'Hello World!';
  }
}
