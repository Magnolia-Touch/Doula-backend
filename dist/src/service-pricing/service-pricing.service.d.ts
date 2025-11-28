import { PrismaService } from '../prisma/prisma.service';
import { CreateServicePricingDto, UpdateServicePricingDto } from './dto/service-pricing.dto';
export declare class ServicePricingService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateServicePricingDto, userId: string): Promise<{
        serviceId: string;
        price: import("@prisma/client/runtime/library").Decimal;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        doulaProfileId: string;
    }>;
    findAll(userId: string): Promise<({
        DoulaProfile: {
            id: string;
            userId: string;
            regionId: string | null;
            profile_image: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        service: {
            description: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
        };
    } & {
        serviceId: string;
        price: import("@prisma/client/runtime/library").Decimal;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        doulaProfileId: string;
    })[]>;
    findOne(id: string): Promise<{
        DoulaProfile: {
            id: string;
            userId: string;
            regionId: string | null;
            profile_image: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        service: {
            description: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
        };
    } & {
        serviceId: string;
        price: import("@prisma/client/runtime/library").Decimal;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        doulaProfileId: string;
    }>;
    update(id: string, dto: UpdateServicePricingDto): Promise<{
        serviceId: string;
        price: import("@prisma/client/runtime/library").Decimal;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        doulaProfileId: string;
    }>;
    remove(id: string): Promise<{
        serviceId: string;
        price: import("@prisma/client/runtime/library").Decimal;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        doulaProfileId: string;
    }>;
    listServices(query: any): Promise<{
        data: {
            serviceId: string;
            price: import("@prisma/client/runtime/library").Decimal;
            id: string;
            createdAt: Date;
            updatedAt: Date;
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
}
