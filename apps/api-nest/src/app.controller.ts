/**
 * AppController
 * -------------
 * Controller de base de l'application NestJS.
 *
 * Rôle :
 * - Exposer une route GET "/" (racine de l'API).
 * - Retourner une simple chaîne, généralement utilisée pour tester que l'API fonctionne.
 *
 * Notes :
 * - Ce controller n’a pas de préfixe de route (grâce à `@Controller()` sans argument).
 * - Il délègue la logique métier minimale à AppService.
 */

import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * Controller principal de l'application : `/`
 *
 * Il expose une seule route GET ("/") renvoyant un message simple.
 * Ce point d'entrée est souvent utilisé à titre de test ou de health check.
 */
@Controller()
export class AppController {
  /**
   * Injection du service AppService
   * - permet de garder la logique séparée du controller
   * - suit le modèle de dépendances propre à NestJS
   */
  constructor(private readonly appService: AppService) {}

  /**
   * Route GET "/"
   * --------------
   * Retourne un simple message texte.
   *
   * Typiquement utilisé pour vérifier rapidement que l'API répond.
   *
   * @returns string – message défini dans AppService.getHello()
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
