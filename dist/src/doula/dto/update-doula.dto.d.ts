import { UpdateCertificateDto } from './certificate.dto';
import { PriceBreakdownDto } from 'src/service-pricing/dto/service-pricing.dto';
declare class UpdateCertificateItemDto {
    certificateId: string;
    data: UpdateCertificateDto;
}
export declare class UpdateDoulaServicePricingDto {
    servicePricingId: string;
    price: PriceBreakdownDto;
}
export declare class UpdateDoulaProfileDto {
    name?: string;
    is_active?: boolean;
    about?: string;
    achievements?: string;
    qualification?: string;
    experience?: number;
    languages?: any;
    specialities?: any;
    certificates?: UpdateCertificateItemDto[];
    servicePricings?: UpdateDoulaServicePricingDto[];
}
export {};
