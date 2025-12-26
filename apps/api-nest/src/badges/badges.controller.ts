import { Controller, Get, Query } from "@nestjs/common";
import { ApiOkResponse, ApiQuery, ApiTags } from "@nestjs/swagger";
import { BadgesService } from "./badges.service";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { HighlightedBadgeDto, UserBadgeDto } from "./dto/badges.dto";
import { BadgesLimitQueryDto } from "./dto/badges.query.dto";

@ApiTags("badges")
@Controller("badges")
export class BadgesController {
  constructor(private readonly badgesService: BadgesService) {}

  /**
   * Retourne l'ensemble des badges gagnés par l'utilisateur courant.
   *
   * @param userId - Identifiant de l'utilisateur courant.
   * @param query - Paramètres de query (limit optionnel).
   * @returns Liste complète des badges gagnés, triés par date d'obtention décroissante.
   */
  @Get("me")
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description:
      "Optionnel. Nombre maximum de badges à retourner. Si absent: retourne tout.",
    example: 7,
  })
  async getMyBadges(
    @CurrentUser("id") userId: string,
    @Query() query: BadgesLimitQueryDto,
  ): Promise<UserBadgeDto[]> {
    return this.badgesService.getUserBadges(userId, query.limit);
  }

  /**
   * Retourne les badges récents de l'utilisateur courant destinés
   * à être mis en avant (bandeau d'accueil, toasts, etc.).
   *
   * Compatibilité :
   * - Si `limit` n'est pas fourni : comportement historique => 3.
   * - Si `limit` est fourni (ex: `?limit=7`) : renvoie jusqu'à `limit` badges.
   *
   * @param userId - Identifiant de l'utilisateur courant.
   * @param query - Paramètres de query (limit optionnel).
   * @returns Liste des badges mis en avant pour l'utilisateur courant.
   */
  @Get("me/highlighted")
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description:
      "Nombre maximum de badges à retourner. " +
      "Optionnel : par défaut 3 pour compatibilité.",
    example: 7,
  })
  @ApiOkResponse({
    type: HighlightedBadgeDto,
    isArray: true,
    description:
      "Liste des badges mis en avant pour l'utilisateur courant. " +
      "Seuls les badges dont la durée de mise en avant n'est pas expirée sont retournés.",
  })
  async getMyHighlightedBadges(
    @CurrentUser("id") userId: string,
    @Query() query: BadgesLimitQueryDto,
  ): Promise<HighlightedBadgeDto[]> {
    return this.badgesService.getHighlightedBadges(userId, query.limit);
  }
}
