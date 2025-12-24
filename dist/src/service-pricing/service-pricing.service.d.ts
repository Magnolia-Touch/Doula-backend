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
    findAll(userId: string): Promise<{
        message: string;
        data: {
            servicePricingId: string;
            price: import("@prisma/client/runtime/library").Decimal;
            doulaProfileId: string;
            doulaName: string;
            doulaEmail: string;
            doulaPhone: string | null;
            serviceId: string;
            serviceName: string;
            serviceDescription: string | null;
        }[];
    }>;
    findOne(id: string): Promise<{
        servicePricingId: string;
        price: import("@prisma/client/runtime/library").Decimal;
        doulaProfileId: string;
        doulaName: string;
        doulaEmail: string;
        doulaPhone: string | null;
        serviceId: string;
        serviceName: string;
        serviceDescription: string | null;
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
    createPricing(dto: CreateServicePricingDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        serviceId: string;
        doulaProfileId: string;
        price: import("@prisma/client/runtime/library").Decimal;
    }>;
}
