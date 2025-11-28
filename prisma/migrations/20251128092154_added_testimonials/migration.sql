-- AlterTable
ALTER TABLE `AdminProfile` ADD COLUMN `profile_image` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `ClientProfile` ADD COLUMN `profile_image` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `DoulaProfile` ADD COLUMN `profile_image` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `ZoneManagerProfile` ADD COLUMN `profile_image` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Testimonials` (
    `id` VARCHAR(191) NOT NULL,
    `doulaProfileId` VARCHAR(191) NOT NULL,
    `serviceId` VARCHAR(191) NOT NULL,
    `ratings` INTEGER NOT NULL,
    `reviews` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Testimonials` ADD CONSTRAINT `Testimonials_doulaProfileId_fkey` FOREIGN KEY (`doulaProfileId`) REFERENCES `DoulaProfile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Testimonials` ADD CONSTRAINT `Testimonials_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `ServicePricing`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
