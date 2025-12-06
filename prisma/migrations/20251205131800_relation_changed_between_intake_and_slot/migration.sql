/*
  Warnings:

  - You are about to drop the column `slotId` on the `IntakeForm` table. All the data in the column will be lost.
  - You are about to drop the column `slotTimeId` on the `IntakeForm` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `IntakeForm` DROP FOREIGN KEY `IntakeForm_slotId_fkey`;

-- DropForeignKey
ALTER TABLE `IntakeForm` DROP FOREIGN KEY `IntakeForm_slotTimeId_fkey`;

-- DropIndex
DROP INDEX `IntakeForm_slotId_fkey` ON `IntakeForm`;

-- DropIndex
DROP INDEX `IntakeForm_slotTimeId_fkey` ON `IntakeForm`;

-- AlterTable
ALTER TABLE `IntakeForm` DROP COLUMN `slotId`,
    DROP COLUMN `slotTimeId`;

-- CreateTable
CREATE TABLE `_AvailableSlotsForServiceToIntakeForm` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_AvailableSlotsForServiceToIntakeForm_AB_unique`(`A`, `B`),
    INDEX `_AvailableSlotsForServiceToIntakeForm_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_AvailableSlotsTimeForServiceToIntakeForm` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_AvailableSlotsTimeForServiceToIntakeForm_AB_unique`(`A`, `B`),
    INDEX `_AvailableSlotsTimeForServiceToIntakeForm_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_AvailableSlotsForServiceToIntakeForm` ADD CONSTRAINT `_AvailableSlotsForServiceToIntakeForm_A_fkey` FOREIGN KEY (`A`) REFERENCES `AvailableSlotsForService`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AvailableSlotsForServiceToIntakeForm` ADD CONSTRAINT `_AvailableSlotsForServiceToIntakeForm_B_fkey` FOREIGN KEY (`B`) REFERENCES `IntakeForm`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AvailableSlotsTimeForServiceToIntakeForm` ADD CONSTRAINT `_AvailableSlotsTimeForServiceToIntakeForm_A_fkey` FOREIGN KEY (`A`) REFERENCES `AvailableSlotsTimeForService`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AvailableSlotsTimeForServiceToIntakeForm` ADD CONSTRAINT `_AvailableSlotsTimeForServiceToIntakeForm_B_fkey` FOREIGN KEY (`B`) REFERENCES `IntakeForm`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
