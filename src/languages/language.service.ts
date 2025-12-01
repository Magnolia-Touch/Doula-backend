import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateLanguageDto } from "./dto/create-language.dto";
import { UpdateLanguageDto } from "./dto/update-language.dto";

@Injectable()
export class LanguageService {
    constructor(private prisma: PrismaService) { }

    // CREATE
    async create(dto: CreateLanguageDto) {
        const exists = await this.prisma.language.findUnique({
            where: { name: dto.name },
        });

        if (exists) throw new BadRequestException("Language already exists");

        return this.prisma.language.create({
            data: { name: dto.name },
        });
    }

    // GET ALL
    async findAll() {
        return this.prisma.language.findMany({
            orderBy: { name: "asc" },
        });
    }

    // GET ONE
    async findOne(id: string) {
        const lang = await this.prisma.language.findUnique({
            where: { id },
        });

        if (!lang) throw new NotFoundException("Language not found");

        return lang;
    }

    // UPDATE
    async update(id: string, dto: UpdateLanguageDto) {
        const lang = await this.prisma.language.findUnique({ where: { id } });
        if (!lang) throw new NotFoundException("Language not found");

        // Check if new name already exists
        if (dto.name) {
            const exists = await this.prisma.language.findUnique({
                where: { name: dto.name },
            });
            if (exists && exists.id !== id) {
                throw new BadRequestException("Language name already exists");
            }
        }

        return this.prisma.language.update({
            where: { id },
            data: { ...dto },
        });
    }

    // DELETE
    async remove(id: string) {
        const lang = await this.prisma.language.findUnique({
            where: { id },
            include: { doulas: true },
        });

        if (!lang) throw new NotFoundException("Language not found");

        // Prevent deleting languages currently assigned to doulas
        if (lang.doulas.length > 0) {
            throw new BadRequestException(
                "Cannot delete this language. It is assigned to doulas."
            );
        }

        return this.prisma.language.delete({
            where: { id },
        });
    }
}
