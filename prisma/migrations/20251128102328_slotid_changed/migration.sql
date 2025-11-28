/*
  Warnings:

  - You are about to drop the column `availableSlotsForServiceId` on the `IntakeForm` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `IntakeForm` DROP FOREIGN KEY `IntakeForm_availableSlotsForServiceId_fkey`;

-- DropForeignKey
ALTER TABLE `IntakeForm` DROP FOREIGN KEY `IntakeForm_slotId_fkey`;

-- DropIndex
DROP INDEX `IntakeForm_availableSlotsForServiceId_fkey` ON `IntakeForm`;

-- DropIndex
DROP INDEX `IntakeForm_slotId_fkey` ON `IntakeForm`;

-- AlterTable
ALTER TABLE `IntakeForm` DROP COLUMN `availableSlotsForServiceId`,
    ADD COLUMN `slotTimeId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `IntakeForm` ADD CONSTRAINT `IntakeForm_slotTimeId_fkey` FOREIGN KEY (`slotTimeId`) REFERENCES `AvailableSlotsTimeForService`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IntakeForm` ADD CONSTRAINT `IntakeForm_slotId_fkey` FOREIGN KEY (`slotId`) REFERENCES `AvailableSlotsForService`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
