/*
  Warnings:

  - You are about to drop the `DoulaImages` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `DoulaImages` DROP FOREIGN KEY `DoulaImages_doulaProfileId_fkey`;

-- AlterTable
ALTER TABLE `DoulaProfile` ADD COLUMN `profile_image` VARCHAR(191) NULL,
    ADD COLUMN `specialities` JSON NULL;

-- DropTable
DROP TABLE `DoulaImages`;

-- CreateTable
CREATE TABLE `Certificates` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `issuedBy` VARCHAR(191) NOT NULL DEFAULT 'Unknown',
    `year` VARCHAR(191) NOT NULL DEFAULT '0000',
    `doulaProfileId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Certificates` ADD CONSTRAINT `Certificates_doulaProfileId_fkey` FOREIGN KEY (`doulaProfileId`) REFERENCES `DoulaProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
