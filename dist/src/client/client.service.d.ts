import { PrismaService } from 'src/prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
export declare class ClientsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateClientDto): Promise<{
        message: string;
        data: {
            clientProfile: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                profile_image: string | null;
                userId: string;
                is_verified: boolean;
                address: string | null;
            } | null;
        } & {
            id: string;
            name: string;
            email: string;
            phone: string | null;
            otp: string | null;
            otpExpiresAt: Date | null;
            role: import("@prisma/client").$Enums.Role;
            is_active: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    get(): Promise<{
        message: string;
        data: ({
            clientProfile: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                profile_image: string | null;
                userId: string;
                is_verified: boolean;
                address: string | null;
            } | null;
        } & {
            id: string;
            name: string;
            email: string;
            phone: string | null;
            otp: string | null;
            otpExpiresAt: Date | null;
            role: import("@prisma/client").$Enums.Role;
            is_active: boolean;
            createdAt: Date;
            updatedAt: Date;
        })[];
    }>;
    getById(id: string): Promise<{
        message: string;
        data: {
            clientProfile: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                profile_image: string | null;
                userId: string;
                is_verified: boolean;
                address: string | null;
            } | null;
        } & {
            id: string;
            name: string;
            email: string;
            phone: string | null;
            otp: string | null;
            otpExpiresAt: Date | null;
            role: import("@prisma/client").$Enums.Role;
            is_active: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    delete(id: string): Promise<{
        message: string;
        data: null;
    }>;
}
