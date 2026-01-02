/*
  Warnings:

  - You are about to drop the column `clientDoulaEnquiriesId` on the `DoulaProfile` table. All the data in the column will be lost.
  - Added the required column `doulaProfileId` to the `ClientDoulaEnquiries` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `DoulaProfile` DROP FOREIGN KEY `DoulaProfile_clientDoulaEnquiriesId_fkey`;

-- DropIndex
DROP INDEX `DoulaProfile_clientDoulaEnquiriesId_fkey` ON `DoulaProfile`;

-- AlterTable
ALTER TABLE `ClientDoulaEnquiries` ADD COLUMN `doulaProfileId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `DoulaProfile` DROP COLUMN `clientDoulaEnquiriesId`;

-- AddForeignKey
ALTER TABLE `ClientDoulaEnquiries` ADD CONSTRAINT `ClientDoulaEnquiries_doulaProfileId_fkey` FOREIGN KEY (`doulaProfileId`) REFERENCES `DoulaProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
