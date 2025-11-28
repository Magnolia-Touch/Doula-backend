/*
  Warnings:

  - You are about to drop the column `adminId` on the `DoulaProfile` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `DoulaProfile` DROP FOREIGN KEY `DoulaProfile_adminId_fkey`;

-- DropIndex
DROP INDEX `DoulaProfile_adminId_fkey` ON `DoulaProfile`;

-- AlterTable
ALTER TABLE `DoulaProfile` DROP COLUMN `adminId`;
