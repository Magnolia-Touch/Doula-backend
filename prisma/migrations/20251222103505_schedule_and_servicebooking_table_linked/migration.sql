-- AlterTable
ALTER TABLE `Schedules` ADD COLUMN `bookingId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Schedules` ADD CONSTRAINT `Schedules_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `ServiceBooking`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
