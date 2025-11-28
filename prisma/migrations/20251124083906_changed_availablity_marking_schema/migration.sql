/*
  Warnings:

  - You are about to drop the column `endTime` on the `AvailableSlotsForMeeting` table. All the data in the column will be lost.
  - You are about to drop the column `isBooked` on the `AvailableSlotsForMeeting` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `AvailableSlotsForMeeting` table. All the data in the column will be lost.
  - You are about to drop the column `isBooked` on the `AvailableSlotsForService` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[ownerRole,doulaId,adminId,zoneManagerId,date]` on the table `AvailableSlotsForMeeting` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `weekday` to the `AvailableSlotsForMeeting` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slotId` to the `ServiceBooking` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `EnquiryForm` DROP FOREIGN KEY `EnquiryForm_slotId_fkey`;

-- DropForeignKey
ALTER TABLE `IntakeForm` DROP FOREIGN KEY `IntakeForm_slotId_fkey`;

-- DropForeignKey
ALTER TABLE `Meetings` DROP FOREIGN KEY `Meetings_slotId_fkey`;

-- DropIndex
DROP INDEX `AvailableSlotsForMeeting_ownerRole_doulaId_adminId_zoneManag_key` ON `AvailableSlotsForMeeting`;

-- DropIndex
DROP INDEX `EnquiryForm_slotId_fkey` ON `EnquiryForm`;

-- DropIndex
DROP INDEX `IntakeForm_slotId_fkey` ON `IntakeForm`;

-- AlterTable
ALTER TABLE `AvailableSlotsForMeeting` DROP COLUMN `endTime`,
    DROP COLUMN `isBooked`,
    DROP COLUMN `startTime`,
    ADD COLUMN `weekday` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `AvailableSlotsForService` DROP COLUMN `isBooked`;

-- AlterTable
ALTER TABLE `EnquiryForm` ADD COLUMN `availableSlotsForMeetingId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `IntakeForm` ADD COLUMN `availableSlotsForServiceId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Meetings` ADD COLUMN `availableSlotsForMeetingId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `ServiceBooking` ADD COLUMN `slotId` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `AvailableSlotsTimeForMeeting` (
    `id` VARCHAR(191) NOT NULL,
    `startTime` DATETIME(3) NOT NULL,
    `endTime` DATETIME(3) NOT NULL,
    `availabe` BOOLEAN NOT NULL DEFAULT true,
    `isBooked` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `dateId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AvailableSlotsTimeForService` (
    `id` VARCHAR(191) NOT NULL,
    `startTime` DATETIME(3) NOT NULL,
    `endTime` DATETIME(3) NOT NULL,
    `availabe` BOOLEAN NOT NULL DEFAULT true,
    `isBooked` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `dateId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `AvailableSlotsForMeeting_ownerRole_doulaId_adminId_zoneManag_key` ON `AvailableSlotsForMeeting`(`ownerRole`, `doulaId`, `adminId`, `zoneManagerId`, `date`);

-- AddForeignKey
ALTER TABLE `EnquiryForm` ADD CONSTRAINT `EnquiryForm_slotId_fkey` FOREIGN KEY (`slotId`) REFERENCES `AvailableSlotsTimeForMeeting`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EnquiryForm` ADD CONSTRAINT `EnquiryForm_availableSlotsForMeetingId_fkey` FOREIGN KEY (`availableSlotsForMeetingId`) REFERENCES `AvailableSlotsForMeeting`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AvailableSlotsTimeForMeeting` ADD CONSTRAINT `AvailableSlotsTimeForMeeting_dateId_fkey` FOREIGN KEY (`dateId`) REFERENCES `AvailableSlotsForMeeting`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Meetings` ADD CONSTRAINT `Meetings_slotId_fkey` FOREIGN KEY (`slotId`) REFERENCES `AvailableSlotsTimeForMeeting`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Meetings` ADD CONSTRAINT `Meetings_availableSlotsForMeetingId_fkey` FOREIGN KEY (`availableSlotsForMeetingId`) REFERENCES `AvailableSlotsForMeeting`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AvailableSlotsTimeForService` ADD CONSTRAINT `AvailableSlotsTimeForService_dateId_fkey` FOREIGN KEY (`dateId`) REFERENCES `AvailableSlotsForService`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IntakeForm` ADD CONSTRAINT `IntakeForm_slotId_fkey` FOREIGN KEY (`slotId`) REFERENCES `AvailableSlotsTimeForService`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IntakeForm` ADD CONSTRAINT `IntakeForm_availableSlotsForServiceId_fkey` FOREIGN KEY (`availableSlotsForServiceId`) REFERENCES `AvailableSlotsForService`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ServiceBooking` ADD CONSTRAINT `ServiceBooking_slotId_fkey` FOREIGN KEY (`slotId`) REFERENCES `AvailableSlotsTimeForService`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
