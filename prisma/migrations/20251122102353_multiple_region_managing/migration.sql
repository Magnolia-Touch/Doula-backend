/*
  Warnings:

  - You are about to drop the column `serviceId` on the `EnquiryForm` table. All the data in the column will be lost.
  - You are about to drop the column `serviceId` on the `IntakeForm` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `serviceId` on the `ServiceBooking` table. All the data in the column will be lost.
  - You are about to drop the column `managingRegionId` on the `ZoneManagerProfile` table. All the data in the column will be lost.
  - Added the required column `servicePricingId` to the `EnquiryForm` table without a default value. This is not possible if the table is not empty.
  - Added the required column `servicePricingId` to the `IntakeForm` table without a default value. This is not possible if the table is not empty.
  - Added the required column `servicePricingId` to the `ServiceBooking` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `DoulaProfile` DROP FOREIGN KEY `DoulaProfile_regionId_fkey`;

-- DropForeignKey
ALTER TABLE `EnquiryForm` DROP FOREIGN KEY `EnquiryForm_serviceId_fkey`;

-- DropForeignKey
ALTER TABLE `IntakeForm` DROP FOREIGN KEY `IntakeForm_serviceId_fkey`;

-- DropForeignKey
ALTER TABLE `ServiceBooking` DROP FOREIGN KEY `ServiceBooking_serviceId_fkey`;

-- DropForeignKey
ALTER TABLE `ZoneManagerProfile` DROP FOREIGN KEY `ZoneManagerProfile_managingRegionId_fkey`;

-- DropIndex
DROP INDEX `DoulaProfile_regionId_fkey` ON `DoulaProfile`;

-- DropIndex
DROP INDEX `EnquiryForm_serviceId_fkey` ON `EnquiryForm`;

-- DropIndex
DROP INDEX `IntakeForm_serviceId_fkey` ON `IntakeForm`;

-- DropIndex
DROP INDEX `ServiceBooking_serviceId_fkey` ON `ServiceBooking`;

-- DropIndex
DROP INDEX `ZoneManagerProfile_managingRegionId_key` ON `ZoneManagerProfile`;

-- AlterTable
ALTER TABLE `EnquiryForm` DROP COLUMN `serviceId`,
    ADD COLUMN `servicePricingId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `IntakeForm` DROP COLUMN `serviceId`,
    ADD COLUMN `servicePricingId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Region` ADD COLUMN `zoneManagerId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Service` DROP COLUMN `duration`,
    DROP COLUMN `price`;

-- AlterTable
ALTER TABLE `ServiceBooking` DROP COLUMN `serviceId`,
    ADD COLUMN `servicePricingId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `ZoneManagerProfile` DROP COLUMN `managingRegionId`;

-- CreateTable
CREATE TABLE `ServicePricing` (
    `id` VARCHAR(191) NOT NULL,
    `serviceId` VARCHAR(191) NOT NULL,
    `doulaProfileId` VARCHAR(191) NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_regions` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_regions_AB_unique`(`A`, `B`),
    INDEX `_regions_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `EnquiryForm` ADD CONSTRAINT `EnquiryForm_servicePricingId_fkey` FOREIGN KEY (`servicePricingId`) REFERENCES `ServicePricing`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Region` ADD CONSTRAINT `Region_zoneManagerId_fkey` FOREIGN KEY (`zoneManagerId`) REFERENCES `ZoneManagerProfile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IntakeForm` ADD CONSTRAINT `IntakeForm_servicePricingId_fkey` FOREIGN KEY (`servicePricingId`) REFERENCES `ServicePricing`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ServiceBooking` ADD CONSTRAINT `ServiceBooking_servicePricingId_fkey` FOREIGN KEY (`servicePricingId`) REFERENCES `ServicePricing`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ServicePricing` ADD CONSTRAINT `ServicePricing_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ServicePricing` ADD CONSTRAINT `ServicePricing_doulaProfileId_fkey` FOREIGN KEY (`doulaProfileId`) REFERENCES `DoulaProfile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_regions` ADD CONSTRAINT `_regions_A_fkey` FOREIGN KEY (`A`) REFERENCES `DoulaProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_regions` ADD CONSTRAINT `_regions_B_fkey` FOREIGN KEY (`B`) REFERENCES `Region`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
