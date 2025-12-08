import { PrismaService } from '../prisma/prisma.service';
import { CreateServicePricingDto, UpdateServicePricingDto } from './dto/service-pricing.dto';
export declare class ServicePricingService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateServicePricingDto, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        price: import("@prisma/client/runtime/library").Decimal;
        serviceId: string;
        doulaProfileId: string;
    }>;
    findAll(userId: string): Promise<({
        DoulaProfile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            regionId: string | null;
            profileImage: string | null;
            description: string | null;
            achievements: string | null;
            qualification: string | null;
            yoe: number | null;
            userId: string;
        };
        service: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        price: import("@prisma/client/runtime/library").Decimal;
        serviceId: string;
        doulaProfileId: string;
    })[]>;
    findOne(id: string): Promise<{
        DoulaProfile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            regionId: string | null;
            profileImage: string | null;
            description: string | null;
            achievements: string | null;
            qualification: string | null;
            yoe: number | null;
            userId: string;
        };
        service: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        price: import("@prisma/client/runtime/library").Decimal;
        serviceId: string;
        doulaProfileId: string;
    }>;
    update(id: string, dto: UpdateServicePricingDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        price: import("@prisma/client/runtime/library").Decimal;
        serviceId: string;
        doulaProfileId: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        price: import("@prisma/client/runtime/library").Decimal;
        serviceId: string;
        doulaProfileId: string;
    }>;
    listServices(query: any): Promise<{
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            price: import("@prisma/client/runtime/library").Decimal;
            serviceId: string;
            doulaProfileId: string;
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
    createPricing(dto: CreateServicePricingDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        price: import("@prisma/client/runtime/library").Decimal;
        serviceId: string;
        doulaProfileId: string;
    }>;
}
