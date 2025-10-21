// === TEST DE FONCTIONNEMENT ===
// Endpoint simple: GET /health -> { status: 'ok' }

import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  getHealth() {
    return { status: 'ok' };
  }
}
