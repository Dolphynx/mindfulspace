/**
 * HealthController
 * ----------------
 * Endpoint de santé (healthcheck) permettant de vérifier rapidement
 * que l’API fonctionne correctement.
 *
 * Rôle :
 * - Fournir un point d’entrée stable pour les systèmes de monitoring,
 *   load balancers, probes Kubernetes, etc.
 *
 * Endpoint :
 * - GET /health → { status: 'ok' }
 */

import { Controller, Get } from '@nestjs/common';

/**
 * Préfixe du contrôleur : "/health"
 */
@Controller('health')
export class HealthController {
  /**
   * GET /health
   * -----------
   * Retourne un objet simple indiquant que l’API est opérationnelle.
   *
   * Exemple de réponse :
   *   {
   *     "status": "ok"
   *   }
   *
   * Utilisé par :
   * - tests rapides
   * - monitoring
   * - readiness/liveness probes
   */
  @Get()
  getHealth() {
    return { status: 'ok' };
  }
}
