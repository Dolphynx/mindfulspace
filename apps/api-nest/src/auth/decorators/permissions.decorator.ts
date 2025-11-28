import { SetMetadata } from '@nestjs/common';

/**
 * Specify required permissions for a route
 * @example @Permissions('sessions:create', 'sessions:update')
 */
export const Permissions = (...permissions: string[]) => SetMetadata('permissions', permissions);
