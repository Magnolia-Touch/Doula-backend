import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRegionDto, UpdateRegionDto } from './dto/regions.dto';
export declare class RegionService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateRegionDto): Promise<{
        id: string;
        is_active: boolean;
        createdAt: Date;
        updatedAt: Date;
        regionName: string;
        pincode: string;
        district: string;
        state: string;
        country: string;
        latitude: string;
        longitude: string;
        zoneManagerId: string | null;
    }>;
    findAll(page?: number, limit?: number, search?: string): Promise<{
        data: {
            id: string;
            is_active: boolean;
            createdAt: Date;
            updatedAt: Date;
            regionName: string;
            pincode: string;
            district: string;
            state: string;
            country: string;
            latitude: string;
            longitude: string;
            zoneManagerId: string | null;
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
    findOne(id: string): Promise<{
        zoneManager: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            profile_image: string | null;
            userId: string | null;
        } | null;
    } & {
        id: string;
        is_active: boolean;
        createdAt: Date;
        updatedAt: Date;
        regionName: string;
        pincode: string;
        district: string;
        state: string;
        country: string;
        latitude: string;
        longitude: string;
        zoneManagerId: string | null;
    }>;
    update(id: string, dto: UpdateRegionDto): Promise<{
        id: string;
        is_active: boolean;
        createdAt: Date;
        updatedAt: Date;
        regionName: string;
        pincode: string;
        district: string;
        state: string;
        country: string;
        latitude: string;
        longitude: string;
        zoneManagerId: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        is_active: boolean;
        createdAt: Date;
        updatedAt: Date;
        regionName: string;
        pincode: string;
        district: string;
        state: string;
        country: string;
        latitude: string;
        longitude: string;
        zoneManagerId: string | null;
    }>;
    asignRegionToZoneManager(): Promise<void>;
    updateRegionOfZoneManager(): Promise<void>;
    removeRegionFromZoneManager(): Promise<void>;
}
