-- AlterTable
ALTER TABLE `AvailableSlotsForMeeting` MODIFY `weekday` ENUM('SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY') NOT NULL;

-- AlterTable
ALTER TABLE `AvailableSlotsForService` MODIFY `weekday` ENUM('SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY') NOT NULL;

-- CreateTable
CREATE TABLE `DoulaGallery` (
    `id` VARCHAR(191) NOT NULL,
    `doulaProfileId` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `altText` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DoulaGallery` ADD CONSTRAINT `DoulaGallery_doulaProfileId_fkey` FOREIGN KEY (`doulaProfileId`) REFERENCES `DoulaProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
