/*
  Warnings:

  - Made the column `TimeSlots` on table `EnquiryForm` required. This step will fail if there are existing NULL values in that column.
  - Made the column `VisitFrequency` on table `EnquiryForm` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `EnquiryForm` MODIFY `TimeSlots` VARCHAR(191) NOT NULL,
    MODIFY `VisitFrequency` INTEGER NOT NULL;
