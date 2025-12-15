/*
  Warnings:

  - Added the required column `serviceName` to the `EnquiryForm` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `EnquiryForm` ADD COLUMN `serviceName` VARCHAR(191) NOT NULL;
