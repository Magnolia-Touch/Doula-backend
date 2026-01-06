import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MailService } from '../mail/mail.service';
import { EmailJob } from './email.job';

@Processor('email')
export class EmailProcessor extends WorkerHost {
    constructor(private readonly mailService: MailService) {
        super();
    }

    async process(job: Job<EmailJob>) {
        await this.mailService.sendMail(job.data);
    }
}
