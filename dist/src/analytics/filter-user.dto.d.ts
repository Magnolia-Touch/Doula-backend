import { Role } from '@prisma/client';
export declare class FilterUserDto {
    is_active?: boolean;
    role?: Role;
    page?: string;
    limit?: string;
}
