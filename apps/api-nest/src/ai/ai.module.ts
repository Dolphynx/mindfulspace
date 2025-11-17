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
 */
@Module({
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
