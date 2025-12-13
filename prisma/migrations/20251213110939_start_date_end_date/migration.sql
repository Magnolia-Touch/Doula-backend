/*
  Warnings:

  - You are about to drop the column `date` on the `IntakeForm` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `ServiceBooking` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `IntakeForm` DROP COLUMN `date`,
    ADD COLUMN `endDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `startDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `ServiceBooking` DROP COLUMN `date`,
    ADD COLUMN `endDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `startDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
