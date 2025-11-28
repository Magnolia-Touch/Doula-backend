/*
  Warnings:

  - Made the column `doulaId` on table `AvailableSlotsForService` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `AvailableSlotsForService` DROP FOREIGN KEY `AvailableSlotsForService_doulaId_fkey`;

-- AlterTable
ALTER TABLE `AvailableSlotsForService` MODIFY `doulaId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `AvailableSlotsForService` ADD CONSTRAINT `AvailableSlotsForService_doulaId_fkey` FOREIGN KEY (`doulaId`) REFERENCES `DoulaProfile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
