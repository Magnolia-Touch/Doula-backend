import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDoulaJoinEnquiryDto } from './dto/create-doula-join-enquiry.dto';
import { UpdateDoulaJoinEnquiryDto } from './dto/update-doula-join-enquiry.dto';
import { paginate } from 'src/common/utility/pagination.util';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class DoulaJoinEnquiryService {
    constructor(private readonly prisma: PrismaService,
        private readonly mail: MailerService
    ) { }

    async create(dto: CreateDoulaJoinEnquiryDto) {
        // 1. Create enquiry
        const enquiry = await this.prisma.doulaJoinEnquiry.create({
            data: {
                name: dto.name,
                email: dto.email,
                phone: dto.phone,
                Region: {
                    connect: dto.regionIds.map((id) => ({ id })),
                },
            },
            include: {
                Region: {
                    include: {
                        zoneManager: {
                            include: {
                                user: true,
                            },
                        },
                    },
                },
            },
        });

        // 2. Collect unique zone manager emails
        const zoneManagerEmails = Array.from(
            new Set(
                enquiry.Region
                    .map((region) => region.zoneManager?.user?.email)
                    .filter(Boolean),
            ),
        );

        // 3. Send mail to zone managers (non-blocking)
        for (const email of zoneManagerEmails) {
            await this.mail.sendMail({
                to: email,
                subject: 'New Doula Join Enquiry',
                template: 'doula-join-enquiry-zonemanager',
                context: {
                    name: enquiry.name,
                    email: enquiry.email,
                    phone: enquiry.phone,
                    regions: enquiry.Region.map((r) => r.regionName).join(', '),
                },
            });
        }

        return enquiry;
    }


    async findAll(page = 1, limit = 10) {
        return paginate({
            prismaModel: this.prisma.doulaJoinEnquiry,
            page,
            limit,
            include: {
                Region: {
                    include: {
                        zoneManager: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }


    async findOne(id: string) {
        const enquiry = await this.prisma.doulaJoinEnquiry.findUnique({
            where: { id },
            include: { Region: true },
        });

        if (!enquiry) {
            throw new NotFoundException('Doula join enquiry not found');
        }

        return enquiry;
    }

    async update(id: string, dto: UpdateDoulaJoinEnquiryDto) {
        await this.findOne(id); // ensures existence

        return this.prisma.doulaJoinEnquiry.update({
            where: { id },
            data: {
                name: dto.name,
                email: dto.email,
                phone: dto.phone,
                ...(dto.regionIds && {
                    Region: {
                        set: dto.regionIds.map((regionId) => ({ id: regionId })),
                    },
                }),
            },
            include: {
                Region: true,
            },
        });
    }

    async remove(id: string) {
        await this.findOne(id);

        return this.prisma.doulaJoinEnquiry.delete({
            where: { id },
        });
    }
}
