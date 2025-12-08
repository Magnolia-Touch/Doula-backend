import { ServicePricingService } from './service-pricing.service';
import { CreateServicePricingDto, UpdateServicePricingDto } from './dto/service-pricing.dto';
export declare class ServicePricingController {
    private readonly servicesService;
    constructor(servicesService: ServicePricingService);
    create(dto: CreateServicePricingDto, req: any): Promise<{
        id: string;
        price: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
        serviceId: string;
        doulaProfileId: string;
    }>;
    findAll(req: any): Promise<({
        service: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            name: string;
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
        price: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
        serviceId: string;
        doulaProfileId: string;
    })[]>;
    findOne(id: string): Promise<{
        service: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            name: string;
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
        price: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
        serviceId: string;
        doulaProfileId: string;
    }>;
    update(id: string, dto: UpdateServicePricingDto): Promise<{
        id: string;
        price: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
        serviceId: string;
        doulaProfileId: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        price: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
        serviceId: string;
        doulaProfileId: string;
    }>;
    getServiceWithPricing(query: any): Promise<{
        data: {
            id: string;
            price: import("@prisma/client/runtime/library").Decimal;
            createdAt: Date;
            updatedAt: Date;
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
        price: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
        serviceId: string;
        doulaProfileId: string;
    }>;
}
