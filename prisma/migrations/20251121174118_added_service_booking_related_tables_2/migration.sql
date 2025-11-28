/*
  Warnings:

  - Added the required column `date` to the `IntakeForm` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slotId` to the `IntakeForm` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `IntakeForm` ADD COLUMN `date` DATETIME(3) NOT NULL,
    ADD COLUMN `slotId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `IntakeForm` ADD CONSTRAINT `IntakeForm_slotId_fkey` FOREIGN KEY (`slotId`) REFERENCES `AvailableSlotsForService`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
