-- DropForeignKey
ALTER TABLE `EnquiryForm` DROP FOREIGN KEY `EnquiryForm_regionId_fkey`;

-- DropIndex
DROP INDEX `EnquiryForm_regionId_fkey` ON `EnquiryForm`;

-- AddForeignKey
ALTER TABLE `EnquiryForm` ADD CONSTRAINT `EnquiryForm_regionId_fkey` FOREIGN KEY (`regionId`) REFERENCES `Region`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AvailableSlotsForService` ADD CONSTRAINT `AvailableSlotsForService_doulaId_fkey` FOREIGN KEY (`doulaId`) REFERENCES `DoulaProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
