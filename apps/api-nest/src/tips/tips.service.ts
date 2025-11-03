import { Injectable } from '@nestjs/common';
import tipsData from '../data/tips.json'; // import statique

type TipsFile = {
  tips: string[];
};

@Injectable()
export class TipsService {
  private tips: string[];

  constructor() {
    const data = (tipsData as TipsFile) ?? { tips: [] };
    this.tips = Array.isArray(data.tips) ? data.tips : [];
    if (!this.tips.length) {
      console.warn("Aucun tip valide trouvé dans tips.json (import statique)");
    }
  }

  getRandomTip(): string {
    if (!this.tips.length) {
      return "Prenez une grande respiration et souriez 🌿";
    }
    const index = Math.floor(Math.random() * this.tips.length);

    return this.tips[index];
  }
}
