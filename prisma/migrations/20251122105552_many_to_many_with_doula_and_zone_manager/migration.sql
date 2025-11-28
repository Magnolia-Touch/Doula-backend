/*
  Warnings:

  - You are about to drop the column `zoneManagerId` on the `DoulaProfile` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `DoulaProfile` DROP FOREIGN KEY `DoulaProfile_zoneManagerId_fkey`;

-- DropIndex
DROP INDEX `DoulaProfile_zoneManagerId_fkey` ON `DoulaProfile`;

-- AlterTable
ALTER TABLE `DoulaProfile` DROP COLUMN `zoneManagerId`;

-- CreateTable
CREATE TABLE `_DoulaProfileToZoneManagerProfile` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_DoulaProfileToZoneManagerProfile_AB_unique`(`A`, `B`),
    INDEX `_DoulaProfileToZoneManagerProfile_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_DoulaProfileToZoneManagerProfile` ADD CONSTRAINT `_DoulaProfileToZoneManagerProfile_A_fkey` FOREIGN KEY (`A`) REFERENCES `DoulaProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_DoulaProfileToZoneManagerProfile` ADD CONSTRAINT `_DoulaProfileToZoneManagerProfile_B_fkey` FOREIGN KEY (`B`) REFERENCES `ZoneManagerProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
