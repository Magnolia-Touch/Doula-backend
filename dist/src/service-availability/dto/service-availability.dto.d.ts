export declare class ServiceAvailabilityDto {
    MORNING: boolean;
    NIGHT: boolean;
    FULLDAY: boolean;
}
export declare class CreateDoulaServiceAvailabilityDto {
    date1: string;
    date2?: string;
    availability: ServiceAvailabilityDto;
}
export declare class UpdateDoulaServiceAvailabilityDto {
    availability?: Partial<ServiceAvailabilityDto>;
}
export declare class AvailableDoulasFilterDto {
    startDate?: string;
    endDate?: string;
    regionId?: string;
    serviceId?: string;
    shift?: string;
}
