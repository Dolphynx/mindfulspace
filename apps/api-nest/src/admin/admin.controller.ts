import { Controller, Get } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Roles } from '../auth/decorators/roles.decorator';

/**
 * Admin Controller
 * Admin-only endpoints for dashboard and management
 */
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * Get dashboard statistics
   * Returns real-time stats: users, resources, sessions
   * @returns Dashboard statistics object
   */
  @Get('statistics')
  @Roles('admin')
  async getDashboardStatistics() {
    return this.adminService.getDashboardStatistics();
  }
}
