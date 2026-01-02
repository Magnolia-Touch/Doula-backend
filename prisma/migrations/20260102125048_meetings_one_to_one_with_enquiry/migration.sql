/*
  Warnings:

  - A unique constraint covering the columns `[meetingsId]` on the table `EnquiryForm` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `EnquiryForm_meetingsId_key` ON `EnquiryForm`(`meetingsId`);
