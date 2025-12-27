import { UpdateCertificateDto } from './certificate.dto';
declare class UpdateCertificateItemDto {
    certificateId: string;
    data: UpdateCertificateDto;
}
export declare class UpdateDoulaProfileDto {
    name?: string;
    is_active?: boolean;
    description?: string;
    achievements?: string;
    qualification?: string;
    yoe?: number;
    languages?: any;
    specialities?: any;
    certificates?: UpdateCertificateItemDto[];
}
export {};
