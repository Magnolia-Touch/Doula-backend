/*
  Warnings:

  - You are about to drop the column `TimeSlots` on the `EnquiryForm` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `EnquiryForm` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `EnquiryForm` table. All the data in the column will be lost.
  - Added the required column `meetingsDate` to the `EnquiryForm` table without a default value. This is not possible if the table is not empty.
  - Added the required column `meetingsTimeSlots` to the `EnquiryForm` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serviceEndDate` to the `EnquiryForm` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serviceTimeSlots` to the `EnquiryForm` table without a default value. This is not possible if the table is not empty.
  - Added the required column `seviceStartDate` to the `EnquiryForm` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `EnquiryForm` DROP COLUMN `TimeSlots`,
    DROP COLUMN `endDate`,
    DROP COLUMN `startDate`,
    ADD COLUMN `meetingsDate` DATETIME(3) NOT NULL,
    ADD COLUMN `meetingsTimeSlots` VARCHAR(191) NOT NULL,
    ADD COLUMN `serviceEndDate` DATETIME(3) NOT NULL,
    ADD COLUMN `serviceTimeSlots` VARCHAR(191) NOT NULL,
    ADD COLUMN `seviceStartDate` DATETIME(3) NOT NULL;
