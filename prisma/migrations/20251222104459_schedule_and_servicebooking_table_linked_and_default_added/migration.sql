/*
  Warnings:

  - Made the column `bookingId` on table `Schedules` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `Schedules` DROP FOREIGN KEY `Schedules_bookingId_fkey`;

-- DropIndex
DROP INDEX `Schedules_bookingId_fkey` ON `Schedules`;

-- AlterTable
ALTER TABLE `Schedules` MODIFY `bookingId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Schedules` ADD CONSTRAINT `Schedules_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `ServiceBooking`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
