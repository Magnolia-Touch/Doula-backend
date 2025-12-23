import { Module } from '@nestjs/common';
import { DoulaService } from './doula.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { DoulaController } from './doula.controller';

@Module({
  exports: [DoulaService],
  imports: [PrismaModule],
  providers: [DoulaService],
  controllers: [DoulaController],
})
export class DoulaModule {}
