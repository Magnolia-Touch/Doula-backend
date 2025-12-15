/*
  Warnings:

  - You are about to drop the column `slotId` on the `Meetings` table. All the data in the column will be lost.
  - Added the required column `date` to the `Meetings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endTime` to the `Meetings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serviceName` to the `Meetings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `Meetings` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Meetings` DROP FOREIGN KEY `Meetings_slotId_fkey`;

-- DropIndex
DROP INDEX `Meetings_slotId_key` ON `Meetings`;

-- AlterTable
ALTER TABLE `AvailableSlotsTimeForMeeting` ADD COLUMN `meetingsId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Meetings` DROP COLUMN `slotId`,
    ADD COLUMN `date` DATETIME(3) NOT NULL,
    ADD COLUMN `endTime` TIME(0) NOT NULL,
    ADD COLUMN `serviceName` VARCHAR(191) NOT NULL,
    ADD COLUMN `startTime` TIME(0) NOT NULL;

-- AddForeignKey
ALTER TABLE `AvailableSlotsTimeForMeeting` ADD CONSTRAINT `AvailableSlotsTimeForMeeting_meetingsId_fkey` FOREIGN KEY (`meetingsId`) REFERENCES `Meetings`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
