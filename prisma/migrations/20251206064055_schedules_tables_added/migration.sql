-- CreateTable
CREATE TABLE `Schedules` (
    `id` VARCHAR(191) NOT NULL,
    `date` DATE NOT NULL,
    `startTime` DATETIME(3) NOT NULL,
    `endTime` DATETIME(3) NOT NULL,
    `status` ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED') NOT NULL DEFAULT 'PENDING',
    `doulaProfileId` VARCHAR(191) NOT NULL,
    `serviceId` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Schedules` ADD CONSTRAINT `Schedules_doulaProfileId_fkey` FOREIGN KEY (`doulaProfileId`) REFERENCES `DoulaProfile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Schedules` ADD CONSTRAINT `Schedules_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `ServicePricing`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Schedules` ADD CONSTRAINT `Schedules_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `ClientProfile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
