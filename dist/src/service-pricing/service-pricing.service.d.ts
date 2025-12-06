import { PrismaService } from '../prisma/prisma.service';
import { CreateServicePricingDto, UpdateServicePricingDto } from './dto/service-pricing.dto';
export declare class ServicePricingService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateServicePricingDto, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        serviceId: string;
        doulaProfileId: string;
        price: import("@prisma/client/runtime/library").Decimal;
    }>;
    findAll(userId: string): Promise<({
        service: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
        };
        DoulaProfile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            regionId: string | null;
            profileImage: string | null;
            description: string | null;
            achievements: string | null;
            qualification: string | null;
            yoe: number | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        serviceId: string;
        doulaProfileId: string;
        price: import("@prisma/client/runtime/library").Decimal;
    })[]>;
    findOne(id: string): Promise<{
        service: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
        };
        DoulaProfile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            regionId: string | null;
            profileImage: string | null;
            description: string | null;
            achievements: string | null;
            qualification: string | null;
            yoe: number | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        serviceId: string;
        doulaProfileId: string;
        price: import("@prisma/client/runtime/library").Decimal;
    }>;
    update(id: string, dto: UpdateServicePricingDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        serviceId: string;
        doulaProfileId: string;
        price: import("@prisma/client/runtime/library").Decimal;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        serviceId: string;
        doulaProfileId: string;
        price: import("@prisma/client/runtime/library").Decimal;
    }>;
    listServices(query: any): Promise<{
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            serviceId: string;
            doulaProfileId: string;
            price: import("@prisma/client/runtime/library").Decimal;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
        };
    }>;
}
