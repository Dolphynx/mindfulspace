import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';

/**
 * AiModule
 *
 * → Regroupe tous les éléments liés aux fonctionnalités IA :
 *   - service (logique métier + appels à Groq)
 *   - controller (routes HTTP exposées à l'extérieur)
 *
 * Ce module est ensuite importé dans AppModule pour être pris en compte
 * dans l'application Nest globale.
 *
 * AiService est exporté pour permettre son utilisation dans d'autres modules
 * (par exemple, ResourcesModule pour la traduction automatique).
 */
@Module({
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
