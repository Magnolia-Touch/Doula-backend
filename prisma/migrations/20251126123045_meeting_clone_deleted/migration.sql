/*
  Warnings:

  - You are about to drop the `Meeting` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Meeting` DROP FOREIGN KEY `Meeting_adminId_fkey`;

-- DropForeignKey
ALTER TABLE `Meeting` DROP FOREIGN KEY `Meeting_clientId_fkey`;

-- DropForeignKey
ALTER TABLE `Meeting` DROP FOREIGN KEY `Meeting_doulaId_fkey`;

-- DropForeignKey
ALTER TABLE `Meeting` DROP FOREIGN KEY `Meeting_zoneManagerId_fkey`;

-- AlterTable
ALTER TABLE `Meetings` ADD COLUMN `adminProfileId` VARCHAR(191) NULL,
    ADD COLUMN `doulaProfileId` VARCHAR(191) NULL,
    ADD COLUMN `zoneManagerProfileId` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `Meeting`;

-- AddForeignKey
ALTER TABLE `Meetings` ADD CONSTRAINT `Meetings_zoneManagerProfileId_fkey` FOREIGN KEY (`zoneManagerProfileId`) REFERENCES `ZoneManagerProfile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Meetings` ADD CONSTRAINT `Meetings_doulaProfileId_fkey` FOREIGN KEY (`doulaProfileId`) REFERENCES `DoulaProfile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Meetings` ADD CONSTRAINT `Meetings_adminProfileId_fkey` FOREIGN KEY (`adminProfileId`) REFERENCES `AdminProfile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
