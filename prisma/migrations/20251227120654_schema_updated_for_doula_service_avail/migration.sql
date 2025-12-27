/*
  Warnings:

  - You are about to drop the column `availabe` on the `AvailableSlotsForService` table. All the data in the column will be lost.
  - You are about to drop the column `isBooked` on the `AvailableSlotsForService` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `Schedules` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `Schedules` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `ServicePricing` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Json`.
  - You are about to drop the `AvailableSlotsTimeForService` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `availability` to the `AvailableSlotsForService` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `AvailableSlotsTimeForService` DROP FOREIGN KEY `AvailableSlotsTimeForService_bookingId_fkey`;

-- DropForeignKey
ALTER TABLE `AvailableSlotsTimeForService` DROP FOREIGN KEY `AvailableSlotsTimeForService_dateId_fkey`;

-- DropForeignKey
ALTER TABLE `AvailableSlotsTimeForService` DROP FOREIGN KEY `AvailableSlotsTimeForService_formId_fkey`;

-- DropForeignKey
ALTER TABLE `OffDays` DROP FOREIGN KEY `OffDays_doulaProfileId_fkey`;

-- DropIndex
DROP INDEX `OffDays_doulaProfileId_fkey` ON `OffDays`;

-- AlterTable
ALTER TABLE `AvailableSlotsForService` DROP COLUMN `availabe`,
    DROP COLUMN `isBooked`,
    ADD COLUMN `availability` JSON NOT NULL;

-- AlterTable
ALTER TABLE `Schedules` DROP COLUMN `endTime`,
    DROP COLUMN `startTime`,
    ADD COLUMN `timeshift` ENUM('MORNING', 'NIGHT', 'FULLDAY') NOT NULL DEFAULT 'FULLDAY';

-- AlterTable
ALTER TABLE `ServiceBooking` ADD COLUMN `timeshift` ENUM('MORNING', 'NIGHT', 'FULLDAY') NOT NULL DEFAULT 'FULLDAY';

-- AlterTable
ALTER TABLE `ServicePricing` MODIFY `price` JSON NOT NULL;

-- DropTable
DROP TABLE `AvailableSlotsTimeForService`;

-- CreateTable
CREATE TABLE `DoulaOffDays` (
    `id` VARCHAR(191) NOT NULL,
    `date` DATE NOT NULL,
    `offtime` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `doulaProfileId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OffDays` ADD CONSTRAINT `OffDays_doulaProfileId_fkey` FOREIGN KEY (`doulaProfileId`) REFERENCES `DoulaProfile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DoulaOffDays` ADD CONSTRAINT `DoulaOffDays_doulaProfileId_fkey` FOREIGN KEY (`doulaProfileId`) REFERENCES `DoulaProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
