import { Controller, Get, Patch, Body } from "@nestjs/common";
import { PrefsService } from "./prefs.service";
import { ApiTags, ApiOkResponse } from "@nestjs/swagger";

@ApiTags("prefs")
@Controller("prefs")
export class PrefsController {
  constructor(private readonly prefsService: PrefsService) {}

  @Get()
  @ApiOkResponse({ description: "Renvoie les préférences utilisateur" })
  getPrefs() {
    return this.prefsService.getPrefs();
  }

  @Patch()
  @ApiOkResponse({ description: "Met à jour les préférences utilisateur" })
  updatePrefs(@Body() body: { launchBreathingOnStart: boolean }) {
    return this.prefsService.toggleLaunchBreathing(body.launchBreathingOnStart);
  }
}
