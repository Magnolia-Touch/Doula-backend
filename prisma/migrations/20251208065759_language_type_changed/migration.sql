/*
  Warnings:

  - You are about to drop the `Language` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_DoulaLanguages` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_DoulaLanguages` DROP FOREIGN KEY `_DoulaLanguages_A_fkey`;

-- DropForeignKey
ALTER TABLE `_DoulaLanguages` DROP FOREIGN KEY `_DoulaLanguages_B_fkey`;

-- AlterTable
ALTER TABLE `DoulaProfile` ADD COLUMN `languages` JSON NULL;

-- DropTable
DROP TABLE `Language`;

-- DropTable
DROP TABLE `_DoulaLanguages`;
