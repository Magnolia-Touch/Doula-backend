import { Role } from '@prisma/client';
export declare class FilterUserDto {
    role?: Role;
    page?: string;
    limit?: string;
}
