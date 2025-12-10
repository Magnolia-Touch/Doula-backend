// import { BadRequestException, Injectable } from '@nestjs/common';
// import { PrismaService } from 'src/prisma/prisma.service';
// import { CreateNotificationDto, UpdateNotificationDto } from './dto/notifications.dto';
// import { FirebaseSender } from 'src/firebase/firebase.sender';


// @Injectable()
// export class NotificationService {
//     constructor(private prisma: PrismaService,
//         private firebaseSender: FirebaseSender
//     ) { }

//     async create(data: CreateNotificationDto) {
//         if (data.userId) {
//             const userExists = await this.prisma.user.findUnique({
//                 where: { id: data.userId }
//             });
//             if (!userExists) throw new BadRequestException('Invalid userId');
//         }

//         return this.prisma.notification.create({
//             data: {
//                 ...data,
//                 channels: data.channels ?? [],
//             }
//         });
//     }

//     async findAll(userId?: string) {
//         return this.prisma.notification.findMany({
//             where: {
//                 userId: userId,
//                 deletedAt: null
//             },
//             orderBy: { createdAt: 'desc' }
//         });
//     }

//     async findOne(id: string) {
//         return this.prisma.notification.findUnique({
//             where: { id }
//         });
//     }

//     async update(id: string, data: UpdateNotificationDto) {
//         return this.prisma.notification.update({
//             where: { id },
//             data
//         });
//     }

//     async markAsRead(id: string) {
//         return this.prisma.notification.update({
//             where: { id },
//             data: {
//                 isRead: true,
//                 readAt: new Date()
//             }
//         });
//     }

//     async softDelete(id: string) {
//         return this.prisma.notification.update({
//             where: { id },
//             data: { deletedAt: new Date() }
//         });
//     }


//     async sendNow(userId: string) {
//         const tokens = await this.prisma.deviceToken.findMany({ where: { userId } });

//         return this.firebaseSender.sendPushMultiple(
//             tokens.map(t => t.token),
//             "Testing",
//             "Hello from backend"
//         );
//     }

// }
