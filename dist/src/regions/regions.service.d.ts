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
        pincode: string;
        regionName: string;
        district: string;
        state: string;
        country: string;
        latitude: string;
        longitude: string;
        zoneManagerId: string | null;
    }>;
    findAll(page?: number, limit?: number, search?: string): Promise<{
        message: string;
        data: {
            regionId: string;
            regionName: string;
            pincode: string;
            district: string;
            state: string;
            country: string;
            latitude: string;
            longitude: string;
            is_active: boolean;
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
        regionId: string;
        regionName: string;
        pincode: string;
        district: string;
        state: string;
        country: string;
        latitude: string;
        longitude: string;
        zoneManagerId: string | null;
        zonemanagerName: string | null;
        zonemanagerPhone: string | null;
        zonemanagerEmail: string | null;
    }>;
    update(id: string, dto: UpdateRegionDto): Promise<{
        id: string;
        is_active: boolean;
        createdAt: Date;
        updatedAt: Date;
        pincode: string;
        regionName: string;
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
        pincode: string;
        regionName: string;
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
