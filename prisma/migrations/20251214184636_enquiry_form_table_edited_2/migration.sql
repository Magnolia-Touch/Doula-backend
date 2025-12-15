/*
  Warnings:

  - You are about to drop the column `availableSlotsForMeetingId` on the `EnquiryForm` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `EnquiryForm` DROP FOREIGN KEY `EnquiryForm_availableSlotsForMeetingId_fkey`;

-- DropForeignKey
ALTER TABLE `EnquiryForm` DROP FOREIGN KEY `EnquiryForm_slotId_fkey`;

-- DropIndex
DROP INDEX `EnquiryForm_availableSlotsForMeetingId_fkey` ON `EnquiryForm`;

-- DropIndex
DROP INDEX `EnquiryForm_slotId_fkey` ON `EnquiryForm`;

-- AlterTable
ALTER TABLE `EnquiryForm` DROP COLUMN `availableSlotsForMeetingId`;

-- AddForeignKey
ALTER TABLE `EnquiryForm` ADD CONSTRAINT `EnquiryForm_slotId_fkey` FOREIGN KEY (`slotId`) REFERENCES `AvailableSlotsForMeeting`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
