// import { Injectable, NotFoundException } from '@nestjs/common';
// import { PrismaService } from 'src/prisma/prisma.service';
// import { CreateNoteDto } from './dto/create-notes.dto';
// import { UpdateNoteDto } from './dto/update-notes.dto';

// @Injectable()
// export class NotesService {
//     constructor(private prisma: PrismaService) { }

//     // ✅ Create Note
//     async create(dto: CreateNoteDto) {
//         return this.prisma.notes.create({
//             data: {
//                 content: dto.content,
//                 bookingId: dto.bookingId,
//                 userId: dto.userId,
//             },
//             include: {
//                 booking: true,
//                 user: true,
//             },
//         });
//     }

//     // ✅ Get All Notes
//     async findAll(page = 1, limit = 10) {
//         const skip = (page - 1) * limit;
//         const [data, total] = await Promise.all([
//             this.prisma.notes.findMany({
//                 skip,
//                 take: limit,
//                 include: {
//                     booking: true,
//                     user: true,
//                 },
//                 orderBy: { createdAt: 'desc' },
//             }),
//             this.prisma.notes.count(),
//         ]);

//         return { total, page, limit, data };
//     }

//     // ✅ Get Note by ID
//     async findById(id: string) {
//         const note = await this.prisma.notes.findUnique({
//             where: { id },
//             include: {
//                 booking: true,
//                 user: true,
//             },
//         });

//         if (!note) throw new NotFoundException('Note not found');
//         return note;
//     }

//     // ✅ Update Note
//     async update(id: string, dto: UpdateNoteDto) {
//         const note = await this.prisma.notes.findUnique({ where: { id } });
//         if (!note) throw new NotFoundException('Note not found');

//         return this.prisma.notes.update({
//             where: { id },
//             data: {
//                 content: dto.content,
//                 bookingId: dto.bookingId,
//                 userId: dto.userId,
//             },
//             include: {
//                 booking: true,
//                 user: true,
//             },
//         });
//     }

//     // ✅ Delete Note
//     async remove(id: string) {
//         const note = await this.prisma.notes.findUnique({ where: { id } });
//         if (!note) throw new NotFoundException('Note not found');

//         await this.prisma.notes.delete({ where: { id } });
//         return { message: 'Note deleted successfully' };
//     }
// }
