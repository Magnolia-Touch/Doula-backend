/*
  Warnings:

  - You are about to drop the column `message` on the `EnquiryForm` table. All the data in the column will be lost.
  - You are about to drop the column `serviceInterest` on the `EnquiryForm` table. All the data in the column will be lost.
  - Added the required column `regionId` to the `EnquiryForm` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serviceId` to the `EnquiryForm` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slotId` to the `EnquiryForm` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `EnquiryForm` DROP COLUMN `message`,
    DROP COLUMN `serviceInterest`,
    ADD COLUMN `additionalNotes` VARCHAR(191) NULL,
    ADD COLUMN `regionId` VARCHAR(191) NOT NULL,
    ADD COLUMN `serviceId` VARCHAR(191) NOT NULL,
    ADD COLUMN `slotId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `EnquiryForm` ADD CONSTRAINT `EnquiryForm_regionId_fkey` FOREIGN KEY (`regionId`) REFERENCES `Region`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EnquiryForm` ADD CONSTRAINT `EnquiryForm_slotId_fkey` FOREIGN KEY (`slotId`) REFERENCES `AvailableSlotsForMeeting`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EnquiryForm` ADD CONSTRAINT `EnquiryForm_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
