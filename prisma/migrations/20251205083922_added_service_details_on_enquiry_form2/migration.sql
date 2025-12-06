/*
  Warnings:

  - Added the required column `endDate` to the `EnquiryForm` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `EnquiryForm` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `EnquiryForm` ADD COLUMN `TimeSlots` VARCHAR(191) NULL,
    ADD COLUMN `VisitFrequency` VARCHAR(191) NULL,
    ADD COLUMN `endDate` VARCHAR(191) NOT NULL,
    ADD COLUMN `startDate` VARCHAR(191) NOT NULL;
