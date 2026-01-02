-- AlterTable
ALTER TABLE `DoulaProfile` ADD COLUMN `clientDoulaEnquiriesId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `ClientDoulaEnquiries` (
    `id` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NULL,
    `time` TIME(0) NULL,
    `notes` VARCHAR(191) NULL,
    `clientId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DoulaProfile` ADD CONSTRAINT `DoulaProfile_clientDoulaEnquiriesId_fkey` FOREIGN KEY (`clientDoulaEnquiriesId`) REFERENCES `ClientDoulaEnquiries`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClientDoulaEnquiries` ADD CONSTRAINT `ClientDoulaEnquiries_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `ClientProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
