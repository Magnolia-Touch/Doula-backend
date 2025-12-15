/*
  Warnings:

  - Made the column `clientId` on table `EnquiryForm` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `EnquiryForm` DROP FOREIGN KEY `EnquiryForm_clientId_fkey`;

-- DropIndex
DROP INDEX `EnquiryForm_clientId_fkey` ON `EnquiryForm`;

-- AlterTable
ALTER TABLE `EnquiryForm` MODIFY `clientId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `EnquiryForm` ADD CONSTRAINT `EnquiryForm_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `ClientProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
