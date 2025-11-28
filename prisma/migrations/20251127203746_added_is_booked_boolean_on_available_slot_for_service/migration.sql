/*
  Warnings:

  - You are about to drop the column `isBooked` on the `AvailableSlotsTimeForService` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `AvailableSlotsForService` ADD COLUMN `isBooked` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `AvailableSlotsTimeForService` DROP COLUMN `isBooked`;
