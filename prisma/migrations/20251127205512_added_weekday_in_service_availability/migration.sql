/*
  Warnings:

  - Added the required column `weekday` to the `AvailableSlotsForService` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `AvailableSlotsForService` ADD COLUMN `weekday` VARCHAR(191) NOT NULL;
