import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateClientDoulaEnquiryDto } from './dto/create-client-doula-enquiry.dto';
import { UpdateClientDoulaEnquiryDto } from './dto/update-client-doula-enquiry.dto';
import { MeetingStatus } from '@prisma/client';
import { paginate } from 'src/common/utility/pagination.util';

@Injectable()
export class ClientDoulaEnquiryService {
    constructor(private readonly prisma: PrismaService) { }

    /* -------------------------------- CREATE -------------------------------- */
    async create(dto: CreateClientDoulaEnquiryDto) {
        const { clientId, doulaIds, date, time, notes } = dto;

        if (!doulaIds || doulaIds.length === 0) {
            throw new BadRequestException('At least one doulaId is required');
        }

        const enquiries = await this.prisma.$transaction(
            doulaIds.map((doulaId) =>
                this.prisma.clientDoulaEnquiries.create({
                    data: {
                        clientId,
                        doulaProfileId: doulaId,
                        date: new Date(date),
                        time: new Date(`1970-01-01T${time}Z`),
                        notes,
                        status: MeetingStatus.SCHEDULED,
                    },
                    include: this.includeRelations(),
                }),
            ),
        );

        return enquiries.map((enquiry) => this.formatResponse(enquiry));
    }


    /* -------------------------------- FIND ALL -------------------------------- */
    async findAll(page = 1, limit = 10) {
        const result = await paginate({
            prismaModel: this.prisma.clientDoulaEnquiries,
            page,
            limit,
            include: this.includeRelations(),
            orderBy: { createdAt: 'desc' },
        });

        return {
            data: result.data.map((enquiry) => this.formatResponse(enquiry)),
            meta: result.meta,
        };
    }


    /* -------------------------------- FIND ONE -------------------------------- */
    async findOne(id: string) {
        const enquiry = await this.prisma.clientDoulaEnquiries.findUnique({
            where: { id },
            include: this.includeRelations(),
        });

        if (!enquiry) {
            throw new NotFoundException('Client–Doula enquiry not found');
        }

        return this.formatResponse(enquiry);
    }

    /* -------------------------------- UPDATE -------------------------------- */
    async update(id: string, dto: UpdateClientDoulaEnquiryDto) {
        const existing = await this.prisma.clientDoulaEnquiries.findUnique({
            where: { id },
        });

        if (!existing) {
            throw new NotFoundException('Enquiry not found');
        }

        const { date, time, notes, doulaId } = dto;

        const enquiry = await this.prisma.clientDoulaEnquiries.update({
            where: { id },
            data: {
                date: dto.date ? new Date(dto.date) : undefined,
                time: dto.time
                    ? new Date(`1970-01-01T${dto.time}Z`)
                    : undefined,
                notes: dto.notes,
                doulaProfileId: dto.doulaId,
            },
            include: this.includeRelations(),
        });


        return this.formatResponse(enquiry);
    }

    /* -------------------------------- DELETE -------------------------------- */
    async remove(id: string) {
        await this.findOne(id);

        await this.prisma.clientDoulaEnquiries.delete({
            where: { id },
        });

        return { message: 'Enquiry deleted successfully' };
    }

    /* ---------------------------- COMMON HELPERS ----------------------------- */
    private includeRelations() {
        return {
            ClientProfile: {
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                            phone: true,
                        },
                    },
                },
            },
            DoulaProfile: {
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                        },
                    },
                },
            },
        };
    }

    private formatResponse(enquiry: any) {
        return {
            id: enquiry.id,
            clientId: enquiry.clientId,
            clientName: enquiry.ClientProfile.user.name,
            clientEmail: enquiry.ClientProfile.user.email,
            clientPhone: enquiry.ClientProfile.user.phone,
            clientAddress: enquiry.ClientProfile.address,

            doulaId: enquiry.DoulaProfile.id,
            doulaName: enquiry.DoulaProfile.user.name,
            doulaEmail: enquiry.DoulaProfile.user.email,

            date: enquiry.date,
            time: enquiry.time,
            notes: enquiry.notes,
            status: enquiry.status,
        };
    }


    /* -------------------------------- DOULAS SIDE -------------------------------- */
    // async get

}
