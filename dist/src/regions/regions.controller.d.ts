import { RegionService } from './regions.service';
import { CreateRegionDto, UpdateRegionDto } from './dto/regions.dto';
export declare class RegionController {
    private readonly regionService;
    constructor(regionService: RegionService);
    create(dto: CreateRegionDto): Promise<{
        id: string;
        is_active: boolean;
        createdAt: Date;
        updatedAt: Date;
        zoneManagerId: string | null;
        pincode: string;
        regionName: string;
        district: string;
        state: string;
        country: string;
        latitude: string;
        longitude: string;
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
        zoneManagerId: string | null;
        pincode: string;
        regionName: string;
        district: string;
        state: string;
        country: string;
        latitude: string;
        longitude: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        is_active: boolean;
        createdAt: Date;
        updatedAt: Date;
        zoneManagerId: string | null;
        pincode: string;
        regionName: string;
        district: string;
        state: string;
        country: string;
        latitude: string;
        longitude: string;
    }>;
}
