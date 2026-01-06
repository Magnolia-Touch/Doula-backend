import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { EmailProducer } from './email.producer';
import { EmailProcessor } from './email.processor';
import { MailService } from '../mail/mail.service';
import { MailModule } from 'src/mail/mail.module';
import { QueueController } from './queue.controller';

@Module({
    imports: [
        BullModule.registerQueue({
            name: 'email',
        }),
        MailModule
    ],
    providers: [EmailProducer, EmailProcessor],
    exports: [EmailProducer],
    controllers: [QueueController]
})
export class EmailQueueModule { }
