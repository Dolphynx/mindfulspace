import { Controller, Get } from "@nestjs/common";
import { TipsService } from "./tips.service";
import { ApiTags, ApiOkResponse } from "@nestjs/swagger";

@ApiTags("tips")
@Controller("tips")
export class TipsController {
  constructor(private readonly tipsService: TipsService) {}

  @Get("random")
  @ApiOkResponse({ description: "Retourne une astuce aléatoire" })
  getRandomTip() {
    const tip = this.tipsService.getRandomTip();
    return { tip };
  }
}
