import { CreateCertificateDto } from './certificate.dto';
export declare class CreateDoulaDto {
    name: string;
    email: string;
    phone: string;
    regionIds: string[];
    description: string;
    achievements: string;
    qualification: string;
    yoe: number;
    languages: string[];
    specialities: string;
    certificates?: string;
    get parsedCertificates(): CreateCertificateDto[];
}
