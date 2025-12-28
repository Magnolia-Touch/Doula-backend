import { TimeShift } from '@prisma/client';
export declare class IntakeFormDto {
    name: string;
    email: string;
    phone: string;
    doulaProfileId: string;
    serviceId: string;
    address: string;
    buffer: number;
    seviceStartDate: string;
    serviceEndDate: string;
    visitFrequency: number;
    serviceTimeShift: TimeShift;
}
export declare class BookDoulaDto {
    name: string;
    email?: string;
    phone?: string;
    location: string;
    address: string;
    doulaProfileId: string;
    serviceId: string;
    serviceStartDate: string;
    servicEndDate: string;
    visitFrequency: number;
    serviceTimeShift: TimeShift;
    buffer: number;
}
