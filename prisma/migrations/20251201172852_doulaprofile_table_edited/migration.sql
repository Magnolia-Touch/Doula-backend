/*
  Warnings:

  - You are about to drop the column `profile_image` on the `DoulaProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `DoulaProfile` DROP COLUMN `profile_image`,
    ADD COLUMN `achievements` TEXT NULL,
    ADD COLUMN `description` TEXT NULL,
    ADD COLUMN `profileImage` VARCHAR(191) NULL,
    ADD COLUMN `yoe` INTEGER NULL;

-- CreateTable
CREATE TABLE `Language` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Language_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_DoulaLanguages` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_DoulaLanguages_AB_unique`(`A`, `B`),
    INDEX `_DoulaLanguages_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_DoulaLanguages` ADD CONSTRAINT `_DoulaLanguages_A_fkey` FOREIGN KEY (`A`) REFERENCES `DoulaProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_DoulaLanguages` ADD CONSTRAINT `_DoulaLanguages_B_fkey` FOREIGN KEY (`B`) REFERENCES `Language`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
