import { SetMetadata } from '@nestjs/common';

/**
 * Mark a route as public (no authentication required)
 */
export const Public = () => SetMetadata('isPublic', true);
