import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
declare const JwtStrategy_base: new (...args: any) => any;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly configService;
    private readonly prisma;
    constructor(configService: ConfigService, prisma: PrismaService);
    validate(payload: any): Promise<{
        id: string;
        email: string;
        phone: string | null;
        name: string;
        otp: string | null;
        otpExpiresAt: Date | null;
        role: import("@prisma/client").$Enums.Role;
        is_active: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
export {};
