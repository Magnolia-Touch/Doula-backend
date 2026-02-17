import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDoulaJoinEnquiryDto } from './dto/create-doula-join-enquiry.dto';
import { UpdateDoulaJoinEnquiryDto } from './dto/update-doula-join-enquiry.dto';
import { paginate } from 'src/common/utility/pagination.util';
import { MailerService } from '@nestjs-modules/mailer';
import { JoinEnquiryStatus, Role } from '@prisma/client';

@Injectable()
export class DoulaJoinEnquiryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailerService,
  ) {}

  async create(dto: CreateDoulaJoinEnquiryDto) {
    // 1. Create enquiry
    const enquiry = await this.prisma.doulaJoinEnquiry.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        // Region connect if applicable
      },
    });

    // 2. Fetch admins
    const admins = await this.prisma.user.findMany({
      where: { role: Role.ADMIN },
      select: { email: true },
    });

    // 3. Send mails in parallel (non-blocking)
    Promise.all(
      admins.map((admin) =>
        this.mail.sendMail({
          to: admin.email,
          subject: 'New Doula Join Enquiry',
          template: 'doula-join-enquiry-zonemanager',
          context: {
            name: enquiry.name,
            email: enquiry.email,
            phone: enquiry.phone,
          },
        }),
      ),
    ).catch((err) => {
      // log but don't fail API
      console.error('Failed to send admin emails', err);
    });

    return enquiry;
  }

  async findAll(page = 1, limit = 10, status?: JoinEnquiryStatus) {
    return paginate({
      prismaModel: this.prisma.doulaJoinEnquiry,
      page,
      limit,
      where: {
        ...(status && { status }),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const enquiry = await this.prisma.doulaJoinEnquiry.findUnique({
      where: { id },
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
        status: dto.status,
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
