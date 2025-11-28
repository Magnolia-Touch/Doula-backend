-- DropForeignKey
ALTER TABLE `ServiceBooking` DROP FOREIGN KEY `ServiceBooking_slotId_fkey`;

-- DropIndex
DROP INDEX `ServiceBooking_slotId_fkey` ON `ServiceBooking`;

-- AlterTable
ALTER TABLE `ServiceBooking` ADD COLUMN `slotTimeId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `ServiceBooking` ADD CONSTRAINT `ServiceBooking_slotTimeId_fkey` FOREIGN KEY (`slotTimeId`) REFERENCES `AvailableSlotsTimeForService`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ServiceBooking` ADD CONSTRAINT `ServiceBooking_slotId_fkey` FOREIGN KEY (`slotId`) REFERENCES `AvailableSlotsForService`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
