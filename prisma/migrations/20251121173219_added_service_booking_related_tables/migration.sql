/*
  Warnings:

  - You are about to drop the column `regionOfService` on the `IntakeForm` table. All the data in the column will be lost.
  - You are about to drop the column `serviceInterest` on the `IntakeForm` table. All the data in the column will be lost.
  - You are about to drop the column `dateTime` on the `ServiceBooking` table. All the data in the column will be lost.
  - You are about to drop the column `region` on the `ServiceBooking` table. All the data in the column will be lost.
  - Added the required column `doulaProfileId` to the `IntakeForm` table without a default value. This is not possible if the table is not empty.
  - Added the required column `regionId` to the `IntakeForm` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serviceId` to the `IntakeForm` table without a default value. This is not possible if the table is not empty.
  - Made the column `clientId` on table `IntakeForm` required. This step will fail if there are existing NULL values in that column.
  - Made the column `address` on table `IntakeForm` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `date` to the `ServiceBooking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `regionId` to the `ServiceBooking` table without a default value. This is not possible if the table is not empty.
  - Made the column `doulaProfileId` on table `ServiceBooking` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `IntakeForm` DROP FOREIGN KEY `IntakeForm_clientId_fkey`;

-- DropForeignKey
ALTER TABLE `ServiceBooking` DROP FOREIGN KEY `ServiceBooking_doulaProfileId_fkey`;

-- DropIndex
DROP INDEX `IntakeForm_clientId_fkey` ON `IntakeForm`;

-- DropIndex
DROP INDEX `ServiceBooking_doulaProfileId_fkey` ON `ServiceBooking`;

-- AlterTable
ALTER TABLE `ClientProfile` ADD COLUMN `address` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `IntakeForm` DROP COLUMN `regionOfService`,
    DROP COLUMN `serviceInterest`,
    ADD COLUMN `doulaProfileId` VARCHAR(191) NOT NULL,
    ADD COLUMN `regionId` VARCHAR(191) NOT NULL,
    ADD COLUMN `serviceId` VARCHAR(191) NOT NULL,
    MODIFY `clientId` VARCHAR(191) NOT NULL,
    MODIFY `name` VARCHAR(191) NULL,
    MODIFY `email` VARCHAR(191) NULL,
    MODIFY `phone` VARCHAR(191) NULL,
    MODIFY `address` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `ServiceBooking` DROP COLUMN `dateTime`,
    DROP COLUMN `region`,
    ADD COLUMN `date` DATETIME(3) NOT NULL,
    ADD COLUMN `paymentDetails` JSON NULL,
    ADD COLUMN `regionId` VARCHAR(191) NOT NULL,
    MODIFY `doulaProfileId` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `AvailableSlotsForService` (
    `id` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `availabe` BOOLEAN NOT NULL DEFAULT true,
    `isBooked` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `doulaId` VARCHAR(191) NULL,

    UNIQUE INDEX `AvailableSlotsForService_doulaId_date_key`(`doulaId`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AvailableSlotsForService` ADD CONSTRAINT `AvailableSlotsForService_doulaId_fkey` FOREIGN KEY (`doulaId`) REFERENCES `DoulaProfile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IntakeForm` ADD CONSTRAINT `IntakeForm_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IntakeForm` ADD CONSTRAINT `IntakeForm_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `ClientProfile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IntakeForm` ADD CONSTRAINT `IntakeForm_regionId_fkey` FOREIGN KEY (`regionId`) REFERENCES `Region`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IntakeForm` ADD CONSTRAINT `IntakeForm_doulaProfileId_fkey` FOREIGN KEY (`doulaProfileId`) REFERENCES `DoulaProfile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ServiceBooking` ADD CONSTRAINT `ServiceBooking_doulaProfileId_fkey` FOREIGN KEY (`doulaProfileId`) REFERENCES `DoulaProfile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ServiceBooking` ADD CONSTRAINT `ServiceBooking_regionId_fkey` FOREIGN KEY (`regionId`) REFERENCES `Region`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
