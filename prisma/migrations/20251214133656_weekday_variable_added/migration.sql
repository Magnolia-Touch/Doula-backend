/*
  Warnings:

  - You are about to drop the column `date` on the `AvailableSlotsForMeeting` table. All the data in the column will be lost.
  - You are about to alter the column `weekday` on the `AvailableSlotsForMeeting` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(4))`.
  - You are about to drop the column `date` on the `AvailableSlotsForService` table. All the data in the column will be lost.
  - You are about to alter the column `weekday` on the `AvailableSlotsForService` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(4))`.
  - A unique constraint covering the columns `[doulaId,weekday]` on the table `AvailableSlotsForMeeting` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[adminId,weekday]` on the table `AvailableSlotsForMeeting` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[zoneManagerId,weekday]` on the table `AvailableSlotsForMeeting` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[doulaId,weekday]` on the table `AvailableSlotsForService` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `AdminProfile` DROP FOREIGN KEY `AdminProfile_userId_fkey`;

-- DropForeignKey
ALTER TABLE `AvailableSlotsForMeeting` DROP FOREIGN KEY `AvailableSlotsForMeeting_adminId_fkey`;

-- DropForeignKey
ALTER TABLE `AvailableSlotsForMeeting` DROP FOREIGN KEY `AvailableSlotsForMeeting_doulaId_fkey`;

-- DropForeignKey
ALTER TABLE `AvailableSlotsForMeeting` DROP FOREIGN KEY `AvailableSlotsForMeeting_zoneManagerId_fkey`;

-- DropForeignKey
ALTER TABLE `AvailableSlotsForService` DROP FOREIGN KEY `AvailableSlotsForService_doulaId_fkey`;

-- DropForeignKey
ALTER TABLE `AvailableSlotsTimeForMeeting` DROP FOREIGN KEY `AvailableSlotsTimeForMeeting_dateId_fkey`;

-- DropForeignKey
ALTER TABLE `AvailableSlotsTimeForService` DROP FOREIGN KEY `AvailableSlotsTimeForService_dateId_fkey`;

-- DropForeignKey
ALTER TABLE `ClientProfile` DROP FOREIGN KEY `ClientProfile_userId_fkey`;

-- DropForeignKey
ALTER TABLE `DoulaImages` DROP FOREIGN KEY `DoulaImages_doulaProfileId_fkey`;

-- DropForeignKey
ALTER TABLE `DoulaProfile` DROP FOREIGN KEY `DoulaProfile_userId_fkey`;

-- DropForeignKey
ALTER TABLE `EnquiryForm` DROP FOREIGN KEY `EnquiryForm_regionId_fkey`;

-- DropForeignKey
ALTER TABLE `EnquiryForm` DROP FOREIGN KEY `EnquiryForm_serviceId_fkey`;

-- DropForeignKey
ALTER TABLE `EnquiryForm` DROP FOREIGN KEY `EnquiryForm_slotId_fkey`;

-- DropForeignKey
ALTER TABLE `IntakeForm` DROP FOREIGN KEY `IntakeForm_clientId_fkey`;

-- DropForeignKey
ALTER TABLE `IntakeForm` DROP FOREIGN KEY `IntakeForm_doulaProfileId_fkey`;

-- DropForeignKey
ALTER TABLE `IntakeForm` DROP FOREIGN KEY `IntakeForm_regionId_fkey`;

-- DropForeignKey
ALTER TABLE `Meetings` DROP FOREIGN KEY `Meetings_adminProfileId_fkey`;

-- DropForeignKey
ALTER TABLE `Meetings` DROP FOREIGN KEY `Meetings_availableSlotsForMeetingId_fkey`;

-- DropForeignKey
ALTER TABLE `Meetings` DROP FOREIGN KEY `Meetings_bookedById_fkey`;

-- DropForeignKey
ALTER TABLE `Meetings` DROP FOREIGN KEY `Meetings_doulaProfileId_fkey`;

-- DropForeignKey
ALTER TABLE `Meetings` DROP FOREIGN KEY `Meetings_serviceId_fkey`;

-- DropForeignKey
ALTER TABLE `Meetings` DROP FOREIGN KEY `Meetings_slotId_fkey`;

-- DropForeignKey
ALTER TABLE `Meetings` DROP FOREIGN KEY `Meetings_zoneManagerProfileId_fkey`;

-- DropForeignKey
ALTER TABLE `Notes` DROP FOREIGN KEY `Notes_adminId_fkey`;

-- DropForeignKey
ALTER TABLE `Notes` DROP FOREIGN KEY `Notes_zoneManagerId_fkey`;

-- DropForeignKey
ALTER TABLE `Schedules` DROP FOREIGN KEY `Schedules_clientId_fkey`;

-- DropForeignKey
ALTER TABLE `Schedules` DROP FOREIGN KEY `Schedules_doulaProfileId_fkey`;

-- DropForeignKey
ALTER TABLE `Schedules` DROP FOREIGN KEY `Schedules_serviceId_fkey`;

-- DropForeignKey
ALTER TABLE `ServicePricing` DROP FOREIGN KEY `ServicePricing_doulaProfileId_fkey`;

-- DropForeignKey
ALTER TABLE `ServicePricing` DROP FOREIGN KEY `ServicePricing_serviceId_fkey`;

-- DropForeignKey
ALTER TABLE `Testimonials` DROP FOREIGN KEY `Testimonials_clientId_fkey`;

-- DropForeignKey
ALTER TABLE `Testimonials` DROP FOREIGN KEY `Testimonials_doulaProfileId_fkey`;

-- DropForeignKey
ALTER TABLE `Testimonials` DROP FOREIGN KEY `Testimonials_serviceId_fkey`;

-- DropForeignKey
ALTER TABLE `ZoneManagerProfile` DROP FOREIGN KEY `ZoneManagerProfile_userId_fkey`;

-- DropIndex
DROP INDEX `AvailableSlotsForMeeting_adminId_date_key` ON `AvailableSlotsForMeeting`;

-- DropIndex
DROP INDEX `AvailableSlotsForMeeting_doulaId_date_key` ON `AvailableSlotsForMeeting`;

-- DropIndex
DROP INDEX `AvailableSlotsForMeeting_zoneManagerId_date_key` ON `AvailableSlotsForMeeting`;

-- DropIndex
DROP INDEX `AvailableSlotsForService_doulaId_date_key` ON `AvailableSlotsForService`;

-- DropIndex
DROP INDEX `AvailableSlotsTimeForMeeting_dateId_fkey` ON `AvailableSlotsTimeForMeeting`;

-- DropIndex
DROP INDEX `AvailableSlotsTimeForService_dateId_fkey` ON `AvailableSlotsTimeForService`;

-- DropIndex
DROP INDEX `EnquiryForm_regionId_fkey` ON `EnquiryForm`;

-- DropIndex
DROP INDEX `EnquiryForm_serviceId_fkey` ON `EnquiryForm`;

-- DropIndex
DROP INDEX `EnquiryForm_slotId_fkey` ON `EnquiryForm`;

-- DropIndex
DROP INDEX `IntakeForm_clientId_fkey` ON `IntakeForm`;

-- DropIndex
DROP INDEX `IntakeForm_doulaProfileId_fkey` ON `IntakeForm`;

-- DropIndex
DROP INDEX `IntakeForm_regionId_fkey` ON `IntakeForm`;

-- DropIndex
DROP INDEX `Meetings_adminProfileId_fkey` ON `Meetings`;

-- DropIndex
DROP INDEX `Meetings_availableSlotsForMeetingId_fkey` ON `Meetings`;

-- DropIndex
DROP INDEX `Meetings_bookedById_fkey` ON `Meetings`;

-- DropIndex
DROP INDEX `Meetings_doulaProfileId_fkey` ON `Meetings`;

-- DropIndex
DROP INDEX `Meetings_serviceId_fkey` ON `Meetings`;

-- DropIndex
DROP INDEX `Meetings_zoneManagerProfileId_fkey` ON `Meetings`;

-- DropIndex
DROP INDEX `Notes_adminId_fkey` ON `Notes`;

-- DropIndex
DROP INDEX `Notes_zoneManagerId_fkey` ON `Notes`;

-- DropIndex
DROP INDEX `Schedules_clientId_fkey` ON `Schedules`;

-- DropIndex
DROP INDEX `Schedules_doulaProfileId_fkey` ON `Schedules`;

-- DropIndex
DROP INDEX `Schedules_serviceId_fkey` ON `Schedules`;

-- DropIndex
DROP INDEX `ServicePricing_doulaProfileId_fkey` ON `ServicePricing`;

-- DropIndex
DROP INDEX `ServicePricing_serviceId_fkey` ON `ServicePricing`;

-- DropIndex
DROP INDEX `Testimonials_clientId_fkey` ON `Testimonials`;

-- DropIndex
DROP INDEX `Testimonials_doulaProfileId_fkey` ON `Testimonials`;

-- DropIndex
DROP INDEX `Testimonials_serviceId_fkey` ON `Testimonials`;

-- AlterTable
ALTER TABLE `AvailableSlotsForMeeting` DROP COLUMN `date`,
    MODIFY `weekday` ENUM('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY') NOT NULL;

-- AlterTable
ALTER TABLE `AvailableSlotsForService` DROP COLUMN `date`,
    MODIFY `weekday` ENUM('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY') NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `AvailableSlotsForMeeting_doulaId_weekday_key` ON `AvailableSlotsForMeeting`(`doulaId`, `weekday`);

-- CreateIndex
CREATE UNIQUE INDEX `AvailableSlotsForMeeting_adminId_weekday_key` ON `AvailableSlotsForMeeting`(`adminId`, `weekday`);

-- CreateIndex
CREATE UNIQUE INDEX `AvailableSlotsForMeeting_zoneManagerId_weekday_key` ON `AvailableSlotsForMeeting`(`zoneManagerId`, `weekday`);

-- CreateIndex
CREATE UNIQUE INDEX `AvailableSlotsForService_doulaId_weekday_key` ON `AvailableSlotsForService`(`doulaId`, `weekday`);

-- AddForeignKey
ALTER TABLE `ZoneManagerProfile` ADD CONSTRAINT `ZoneManagerProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DoulaProfile` ADD CONSTRAINT `DoulaProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClientProfile` ADD CONSTRAINT `ClientProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdminProfile` ADD CONSTRAINT `AdminProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EnquiryForm` ADD CONSTRAINT `EnquiryForm_regionId_fkey` FOREIGN KEY (`regionId`) REFERENCES `Region`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EnquiryForm` ADD CONSTRAINT `EnquiryForm_slotId_fkey` FOREIGN KEY (`slotId`) REFERENCES `AvailableSlotsTimeForMeeting`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EnquiryForm` ADD CONSTRAINT `EnquiryForm_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notes` ADD CONSTRAINT `Notes_zoneManagerId_fkey` FOREIGN KEY (`zoneManagerId`) REFERENCES `ZoneManagerProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notes` ADD CONSTRAINT `Notes_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `AdminProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AvailableSlotsForMeeting` ADD CONSTRAINT `AvailableSlotsForMeeting_zoneManagerId_fkey` FOREIGN KEY (`zoneManagerId`) REFERENCES `ZoneManagerProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AvailableSlotsForMeeting` ADD CONSTRAINT `AvailableSlotsForMeeting_doulaId_fkey` FOREIGN KEY (`doulaId`) REFERENCES `DoulaProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AvailableSlotsForMeeting` ADD CONSTRAINT `AvailableSlotsForMeeting_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `AdminProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AvailableSlotsTimeForMeeting` ADD CONSTRAINT `AvailableSlotsTimeForMeeting_dateId_fkey` FOREIGN KEY (`dateId`) REFERENCES `AvailableSlotsForMeeting`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Meetings` ADD CONSTRAINT `Meetings_slotId_fkey` FOREIGN KEY (`slotId`) REFERENCES `AvailableSlotsTimeForMeeting`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Meetings` ADD CONSTRAINT `Meetings_bookedById_fkey` FOREIGN KEY (`bookedById`) REFERENCES `ClientProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Meetings` ADD CONSTRAINT `Meetings_availableSlotsForMeetingId_fkey` FOREIGN KEY (`availableSlotsForMeetingId`) REFERENCES `AvailableSlotsForMeeting`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Meetings` ADD CONSTRAINT `Meetings_zoneManagerProfileId_fkey` FOREIGN KEY (`zoneManagerProfileId`) REFERENCES `ZoneManagerProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Meetings` ADD CONSTRAINT `Meetings_doulaProfileId_fkey` FOREIGN KEY (`doulaProfileId`) REFERENCES `DoulaProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Meetings` ADD CONSTRAINT `Meetings_adminProfileId_fkey` FOREIGN KEY (`adminProfileId`) REFERENCES `AdminProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Meetings` ADD CONSTRAINT `Meetings_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AvailableSlotsForService` ADD CONSTRAINT `AvailableSlotsForService_doulaId_fkey` FOREIGN KEY (`doulaId`) REFERENCES `DoulaProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AvailableSlotsTimeForService` ADD CONSTRAINT `AvailableSlotsTimeForService_dateId_fkey` FOREIGN KEY (`dateId`) REFERENCES `AvailableSlotsForService`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IntakeForm` ADD CONSTRAINT `IntakeForm_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `ClientProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IntakeForm` ADD CONSTRAINT `IntakeForm_regionId_fkey` FOREIGN KEY (`regionId`) REFERENCES `Region`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IntakeForm` ADD CONSTRAINT `IntakeForm_doulaProfileId_fkey` FOREIGN KEY (`doulaProfileId`) REFERENCES `DoulaProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ServicePricing` ADD CONSTRAINT `ServicePricing_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ServicePricing` ADD CONSTRAINT `ServicePricing_doulaProfileId_fkey` FOREIGN KEY (`doulaProfileId`) REFERENCES `DoulaProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Testimonials` ADD CONSTRAINT `Testimonials_doulaProfileId_fkey` FOREIGN KEY (`doulaProfileId`) REFERENCES `DoulaProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Testimonials` ADD CONSTRAINT `Testimonials_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `ServicePricing`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Testimonials` ADD CONSTRAINT `Testimonials_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `ClientProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Schedules` ADD CONSTRAINT `Schedules_doulaProfileId_fkey` FOREIGN KEY (`doulaProfileId`) REFERENCES `DoulaProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Schedules` ADD CONSTRAINT `Schedules_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `ServicePricing`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Schedules` ADD CONSTRAINT `Schedules_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `ClientProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DoulaImages` ADD CONSTRAINT `DoulaImages_doulaProfileId_fkey` FOREIGN KEY (`doulaProfileId`) REFERENCES `DoulaProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
