/*
  Warnings:

  - You are about to drop the column `weekday` on the `AvailableSlotsForService` table. All the data in the column will be lost.
  - Added the required column `date` to the `AvailableSlotsForService` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `AvailableSlotsForService` DROP FOREIGN KEY `AvailableSlotsForService_doulaId_fkey`;

-- DropIndex
DROP INDEX `AvailableSlotsForService_doulaId_weekday_key` ON `AvailableSlotsForService`;

-- AlterTable
ALTER TABLE `AvailableSlotsForService` DROP COLUMN `weekday`,
    ADD COLUMN `date` DATE NOT NULL;

-- DROP existing FK if it exists
ALTER TABLE `EnquiryForm`
DROP FOREIGN KEY `EnquiryForm_regionId_fkey`;

-- Re-add FK (optional rename recommended)
ALTER TABLE `EnquiryForm`
ADD CONSTRAINT `EnquiryForm_regionId_fkey`
FOREIGN KEY (`regionId`) REFERENCES `Region`(`id`);
