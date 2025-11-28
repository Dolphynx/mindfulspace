import { SetMetadata } from '@nestjs/common';

/**
 * Specify required roles for a route
 * @example @Roles('admin', 'coach')
 */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
