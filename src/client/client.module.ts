import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ClientsService } from './client.service';

@Module({
    imports: [PrismaModule],
    providers: [ClientsService],
    exports: [ClientsService],
})
export class ClientModule { }
``