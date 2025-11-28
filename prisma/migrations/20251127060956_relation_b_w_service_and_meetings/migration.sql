-- AlterTable
ALTER TABLE `Meetings` ADD COLUMN `serviceId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Meetings` ADD CONSTRAINT `Meetings_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
