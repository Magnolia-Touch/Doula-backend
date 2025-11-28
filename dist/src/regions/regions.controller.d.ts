import { RegionService } from './regions.service';
import { CreateRegionDto, UpdateRegionDto } from './dto/regions.dto';
export declare class RegionController {
    private readonly regionService;
    constructor(regionService: RegionService);
    create(dto: CreateRegionDto): Promise<{
        regionName: string;
        pincode: string;
        district: string;
        state: string;
        country: string;
        latitude: string;
        longitude: string;
        is_active: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        zoneManagerId: string | null;
    }>;
    findAll(page?: number, limit?: number, search?: string): Promise<{
        data: {
            regionName: string;
            pincode: string;
            district: string;
            state: string;
            country: string;
            latitude: string;
            longitude: string;
            is_active: boolean;
            id: string;
            createdAt: Date;
            updatedAt: Date;
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
            userId: string | null;
            profile_image: string | null;
        } | null;
    } & {
        regionName: string;
        pincode: string;
        district: string;
        state: string;
        country: string;
        latitude: string;
        longitude: string;
        is_active: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        zoneManagerId: string | null;
    }>;
    update(id: string, dto: UpdateRegionDto): Promise<{
        regionName: string;
        pincode: string;
        district: string;
        state: string;
        country: string;
        latitude: string;
        longitude: string;
        is_active: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        zoneManagerId: string | null;
    }>;
    remove(id: string): Promise<{
        regionName: string;
        pincode: string;
        district: string;
        state: string;
        country: string;
        latitude: string;
        longitude: string;
        is_active: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        zoneManagerId: string | null;
    }>;
}
