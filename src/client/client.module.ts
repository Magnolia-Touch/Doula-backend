import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ClientsService } from './client.service';
import { ClientController } from './client.controller';

@Module({
    imports: [PrismaModule],
    providers: [ClientsService],
    exports: [ClientsService],
    controllers: [ClientController]
})
export class ClientModule { }
``