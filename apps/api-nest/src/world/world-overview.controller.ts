import { Controller, Get } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { WorldOverviewService } from "./world-overview.service";
import { WorldOverviewDto } from "./dto/world-overview.dto";
import { Public } from "../auth/decorators/public.decorator";

/**
 * @file world-overview.controller.ts
 * @description
 * Endpoint agrégé destiné au dashboard SPA "world-v2".
 */
@Public()
@Controller()
export class WorldOverviewController {
  constructor(private readonly service: WorldOverviewService) {}

  /**
   * Retourne les KPIs agrégés (snapshot + domaines) pour l'utilisateur courant.
   *
   * @param userId Identifiant de l'utilisateur authentifié.
   * @returns Payload agrégé consommé par le frontend.
   */
  @Public()
  @Get("me/world/overview")
  getMyWorldOverview(@CurrentUser("id") userId: string): Promise<WorldOverviewDto> {
    return this.service.getOverviewForUser(userId);
  }
}
