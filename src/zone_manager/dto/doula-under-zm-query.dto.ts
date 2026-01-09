export class GetDoulasQueryDto {
    page?: number;
    limit?: number;

    search?: string; // name | email | phone
    serviceName?: string;

    isAvailable?: boolean;
    startDate?: string; // ISO date
    endDate?: string;

    minExperience?: number;
    isActive?: boolean;

    regionId?: string;
    serviceId?: string;
}
