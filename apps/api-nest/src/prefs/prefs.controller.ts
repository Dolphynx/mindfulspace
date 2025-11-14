import { Controller, Get, Patch, Body } from "@nestjs/common";
import { PrefsService } from "./prefs.service";
import { ApiTags, ApiOkResponse } from "@nestjs/swagger";
import { UpdatePrefsDto } from "./dto/update-prefs.dto";

@ApiTags("prefs")
@Controller("prefs")
export class PrefsController {
  constructor(private readonly prefsService: PrefsService) {}

  @Get()
  @ApiOkResponse({
    description: "Renvoie les préférences utilisateur",
    schema: {
      example: {
        launchBreathingOnStart: true,
      },
    },
  })
  getPrefs() {
    return this.prefsService.getPrefs();
  }

  @Patch()
  @ApiOkResponse({
    description: "Met à jour les préférences utilisateur et renvoie l’état complet",
    schema: {
      example: {
        launchBreathingOnStart: false,
      },
    },
  })
  updatePrefs(@Body() body: UpdatePrefsDto) {
    return this.prefsService.toggleLaunchBreathing(
      body.launchBreathingOnStart,
    );
  }
}
