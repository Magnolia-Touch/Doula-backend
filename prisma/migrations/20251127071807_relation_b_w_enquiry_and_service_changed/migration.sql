/*
  Warnings:

  - You are about to drop the column `servicePricingId` on the `EnquiryForm` table. All the data in the column will be lost.
  - Added the required column `serviceId` to the `EnquiryForm` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `EnquiryForm` DROP FOREIGN KEY `EnquiryForm_servicePricingId_fkey`;

-- DropIndex
DROP INDEX `EnquiryForm_servicePricingId_fkey` ON `EnquiryForm`;

-- AlterTable
ALTER TABLE `EnquiryForm` DROP COLUMN `servicePricingId`,
    ADD COLUMN `serviceId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `EnquiryForm` ADD CONSTRAINT `EnquiryForm_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
