/*
  Warnings:

  - You are about to drop the column `VisitFrequency` on the `EnquiryForm` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `EnquiryForm` DROP COLUMN `VisitFrequency`,
    ADD COLUMN `visitDays` JSON NULL;
