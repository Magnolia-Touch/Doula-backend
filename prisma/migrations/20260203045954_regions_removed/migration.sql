/*
  Warnings:

  - You are about to drop the column `doulaJoinEnquiryId` on the `Region` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Region` DROP FOREIGN KEY `Region_doulaJoinEnquiryId_fkey`;

-- DropIndex
DROP INDEX `Region_doulaJoinEnquiryId_fkey` ON `Region`;

-- AlterTable
ALTER TABLE `Region` DROP COLUMN `doulaJoinEnquiryId`;
