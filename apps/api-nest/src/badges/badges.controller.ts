import { Controller, Get } from "@nestjs/common";
import { BadgesService } from "./badges.service";
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller("badges")
export class BadgesController {
  constructor(private readonly badgesService: BadgesService) {}

  // GET /badges/me
  @Get("me")
  async getMyBadges(@CurrentUser('id') userId: string) {
    //const userId = "TODO_REPLACE_WITH_CURRENT_USER_ID";
    return this.badgesService.getUserBadges(userId);
  }

  // GET /badges/me/highlighted
  @Get("me/highlighted")
  async getMyHighlightedBadges(@CurrentUser('id') userId: string) {
    //const userId = "TODO_REPLACE_WITH_CURRENT_USER_ID";
    return this.badgesService.getHighlightedBadges(userId);
  }
}
