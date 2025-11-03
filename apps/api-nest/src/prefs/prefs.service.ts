import { Injectable } from "@nestjs/common";
import prefsData from "../data/user-prefs.json"; // import statique

type PrefsFile = {
  launchBreathingOnStart: boolean;
};

@Injectable()
export class PrefsService {
  private prefs: PrefsFile;

  constructor() {
    const data = (prefsData as Partial<PrefsFile>) ?? {};
    this.prefs = {
      launchBreathingOnStart:
        typeof data.launchBreathingOnStart === "boolean"
          ? data.launchBreathingOnStart
          : true,
    };
  }

  getPrefs(): PrefsFile {
    return this.prefs;
  }

  toggleLaunchBreathing(value: boolean): PrefsFile {
    this.prefs = { ...this.prefs, launchBreathingOnStart: !!value };
    return this.prefs;
  }
}
