-- CreateTable
CREATE TABLE `OffDays` (
    `id` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `startTime` TIME(0) NULL,
    `endTime` TIME(0) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `zoneManagerProfileId` VARCHAR(191) NULL,
    `doulaProfileId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OffDays` ADD CONSTRAINT `OffDays_zoneManagerProfileId_fkey` FOREIGN KEY (`zoneManagerProfileId`) REFERENCES `ZoneManagerProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OffDays` ADD CONSTRAINT `OffDays_doulaProfileId_fkey` FOREIGN KEY (`doulaProfileId`) REFERENCES `DoulaProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
