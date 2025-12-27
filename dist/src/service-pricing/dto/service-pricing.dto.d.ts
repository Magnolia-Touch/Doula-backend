export declare class PriceBreakdownDto {
    morning: number;
    night: number;
    fullday: number;
}
export declare class CreateServicePricingDto {
    serviceId: string;
    price: PriceBreakdownDto;
    doulaId?: string;
}
export declare class UpdateServicePricingDto {
    price?: PriceBreakdownDto;
}
