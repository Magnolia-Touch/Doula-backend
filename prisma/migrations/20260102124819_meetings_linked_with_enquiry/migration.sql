-- AddForeignKey
ALTER TABLE `EnquiryForm` ADD CONSTRAINT `EnquiryForm_meetingsId_fkey` FOREIGN KEY (`meetingsId`) REFERENCES `Meetings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
