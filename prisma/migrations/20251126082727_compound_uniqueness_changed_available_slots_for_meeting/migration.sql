/*
  Warnings:

  - A unique constraint covering the columns `[doulaId,date]` on the table `AvailableSlotsForMeeting` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[adminId,date]` on the table `AvailableSlotsForMeeting` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[zoneManagerId,date]` on the table `AvailableSlotsForMeeting` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `AvailableSlotsForMeeting_ownerRole_doulaId_adminId_zoneManag_key` ON `AvailableSlotsForMeeting`;

-- AlterTable
ALTER TABLE `AvailableSlotsForMeeting` MODIFY `date` DATE NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `AvailableSlotsForMeeting_doulaId_date_key` ON `AvailableSlotsForMeeting`(`doulaId`, `date`);

-- CreateIndex
CREATE UNIQUE INDEX `AvailableSlotsForMeeting_adminId_date_key` ON `AvailableSlotsForMeeting`(`adminId`, `date`);

-- CreateIndex
CREATE UNIQUE INDEX `AvailableSlotsForMeeting_zoneManagerId_date_key` ON `AvailableSlotsForMeeting`(`zoneManagerId`, `date`);
