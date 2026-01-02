/*
  Warnings:

  - You are about to drop the column `meetingsId` on the `EnquiryForm` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[enquiryId]` on the table `Meetings` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `EnquiryForm` DROP FOREIGN KEY `EnquiryForm_meetingsId_fkey`;

-- DropIndex
DROP INDEX `EnquiryForm_meetingsId_key` ON `EnquiryForm`;

-- AlterTable
ALTER TABLE `EnquiryForm` DROP COLUMN `meetingsId`;

-- AlterTable
ALTER TABLE `Meetings` ADD COLUMN `enquiryId` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Meetings_enquiryId_key` ON `Meetings`(`enquiryId`);

-- AddForeignKey
ALTER TABLE `Meetings` ADD CONSTRAINT `Meetings_enquiryId_fkey` FOREIGN KEY (`enquiryId`) REFERENCES `EnquiryForm`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
