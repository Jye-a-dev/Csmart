import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
/** Decorator gán danh sách role được phép truy cập route */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
