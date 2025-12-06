/*
  Warnings:

  - You are about to drop the column `slotId` on the `ServiceBooking` table. All the data in the column will be lost.
  - You are about to drop the column `slotTimeId` on the `ServiceBooking` table. All the data in the column will be lost.
  - You are about to drop the `_AvailableSlotsTimeForServiceToIntakeForm` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `ServiceBooking` DROP FOREIGN KEY `ServiceBooking_slotId_fkey`;

-- DropForeignKey
ALTER TABLE `ServiceBooking` DROP FOREIGN KEY `ServiceBooking_slotTimeId_fkey`;

-- DropForeignKey
ALTER TABLE `_AvailableSlotsTimeForServiceToIntakeForm` DROP FOREIGN KEY `_AvailableSlotsTimeForServiceToIntakeForm_A_fkey`;

-- DropForeignKey
ALTER TABLE `_AvailableSlotsTimeForServiceToIntakeForm` DROP FOREIGN KEY `_AvailableSlotsTimeForServiceToIntakeForm_B_fkey`;

-- DropIndex
DROP INDEX `ServiceBooking_slotId_fkey` ON `ServiceBooking`;

-- DropIndex
DROP INDEX `ServiceBooking_slotTimeId_fkey` ON `ServiceBooking`;

-- AlterTable
ALTER TABLE `AvailableSlotsTimeForService` ADD COLUMN `bookingId` VARCHAR(191) NULL,
    ADD COLUMN `formId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `ServiceBooking` DROP COLUMN `slotId`,
    DROP COLUMN `slotTimeId`;

-- DropTable
DROP TABLE `_AvailableSlotsTimeForServiceToIntakeForm`;

-- CreateTable
CREATE TABLE `_AvailableSlotsForServiceToServiceBooking` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_AvailableSlotsForServiceToServiceBooking_AB_unique`(`A`, `B`),
    INDEX `_AvailableSlotsForServiceToServiceBooking_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AvailableSlotsTimeForService` ADD CONSTRAINT `AvailableSlotsTimeForService_formId_fkey` FOREIGN KEY (`formId`) REFERENCES `IntakeForm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AvailableSlotsTimeForService` ADD CONSTRAINT `AvailableSlotsTimeForService_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `ServiceBooking`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AvailableSlotsForServiceToServiceBooking` ADD CONSTRAINT `_AvailableSlotsForServiceToServiceBooking_A_fkey` FOREIGN KEY (`A`) REFERENCES `AvailableSlotsForService`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AvailableSlotsForServiceToServiceBooking` ADD CONSTRAINT `_AvailableSlotsForServiceToServiceBooking_B_fkey` FOREIGN KEY (`B`) REFERENCES `ServiceBooking`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
