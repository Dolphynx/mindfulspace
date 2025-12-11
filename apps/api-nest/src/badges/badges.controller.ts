import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { BadgesService } from "./badges.service";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { HighlightedBadgeDto, UserBadgeDto } from "./dto/badges.dto";

@ApiTags("badges")
@Controller("badges")
export class BadgesController {
  constructor(private readonly badgesService: BadgesService) {}

  /**
   * Retourne l'ensemble des badges gagnés par l'utilisateur courant.
   *
   * @param userId Identifiant de l'utilisateur courant.
   */
  @Get("me")
  @ApiOkResponse({
    type: UserBadgeDto,
    isArray: true,
    description:
      "Liste complète des badges gagnés par l'utilisateur courant, " +
      "triés par date d'obtention décroissante.",
  })
  async getMyBadges(@CurrentUser("id") userId: string): Promise<UserBadgeDto[]> {
    return this.badgesService.getUserBadges(userId);
  }

  /**
   * Retourne les badges récents de l'utilisateur courant destinés
   * à être mis en avant (bandeau d'accueil, toasts, etc.).
   *
   * @param userId Identifiant de l'utilisateur courant.
   */
  @Get("me/highlighted")
  @ApiOkResponse({
    type: HighlightedBadgeDto,
    isArray: true,
    description:
      "Liste des badges mis en avant pour l'utilisateur courant. " +
      "Seuls les badges dont la durée de mise en avant n'est pas expirée sont retournés.",
  })
  async getMyHighlightedBadges(
    @CurrentUser("id") userId: string,
  ): Promise<HighlightedBadgeDto[]> {
    return this.badgesService.getHighlightedBadges(userId);
  }
}
