/*
  Warnings:

  - You are about to alter the column `startTime` on the `AvailableSlotsTimeForMeeting` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Time(0)`.
  - You are about to alter the column `endTime` on the `AvailableSlotsTimeForMeeting` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Time(0)`.
  - You are about to alter the column `startTime` on the `AvailableSlotsTimeForService` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Time(0)`.
  - You are about to alter the column `endTime` on the `AvailableSlotsTimeForService` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Time(0)`.

*/
-- AlterTable
ALTER TABLE `AvailableSlotsTimeForMeeting` MODIFY `startTime` TIME(0) NOT NULL,
    MODIFY `endTime` TIME(0) NOT NULL;

-- AlterTable
ALTER TABLE `AvailableSlotsTimeForService` MODIFY `startTime` TIME(0) NOT NULL,
    MODIFY `endTime` TIME(0) NOT NULL;
