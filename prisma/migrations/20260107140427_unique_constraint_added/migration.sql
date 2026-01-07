/*
  Warnings:

  - A unique constraint covering the columns `[doulaId,date]` on the table `AvailableSlotsForService` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `AvailableSlotsForService_doulaId_date_key` ON `AvailableSlotsForService`(`doulaId`, `date`);
