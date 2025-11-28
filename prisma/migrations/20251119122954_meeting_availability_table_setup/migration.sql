-- CreateTable
CREATE TABLE `AvailableSlotsForMeeting` (
    `id` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `startTime` DATETIME(3) NOT NULL,
    `endTime` DATETIME(3) NOT NULL,
    `availabe` BOOLEAN NOT NULL DEFAULT true,
    `isBooked` BOOLEAN NOT NULL DEFAULT false,
    `ownerRole` ENUM('DOULA', 'ZONE_MANAGER', 'ADMIN') NOT NULL,
    `doulaId` VARCHAR(191) NULL,
    `adminId` VARCHAR(191) NULL,
    `zoneManagerId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AvailableSlotsForMeeting_ownerRole_doulaId_adminId_zoneManag_key`(`ownerRole`, `doulaId`, `adminId`, `zoneManagerId`, `date`, `startTime`, `endTime`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Meetings` (
    `id` VARCHAR(191) NOT NULL,
    `link` VARCHAR(191) NOT NULL,
    `slotId` VARCHAR(191) NOT NULL,
    `status` ENUM('SCHEDULED', 'COMPLETED', 'CANCELED') NOT NULL,
    `remarks` VARCHAR(191) NULL,
    `bookedById` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `cancelledAt` DATETIME(3) NULL,
    `rescheduledAt` DATETIME(3) NULL,

    UNIQUE INDEX `Meetings_slotId_key`(`slotId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AvailableSlotsForMeeting` ADD CONSTRAINT `AvailableSlotsForMeeting_zoneManagerId_fkey` FOREIGN KEY (`zoneManagerId`) REFERENCES `ZoneManagerProfile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AvailableSlotsForMeeting` ADD CONSTRAINT `AvailableSlotsForMeeting_doulaId_fkey` FOREIGN KEY (`doulaId`) REFERENCES `DoulaProfile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AvailableSlotsForMeeting` ADD CONSTRAINT `AvailableSlotsForMeeting_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `AdminProfile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Meetings` ADD CONSTRAINT `Meetings_slotId_fkey` FOREIGN KEY (`slotId`) REFERENCES `AvailableSlotsForMeeting`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Meetings` ADD CONSTRAINT `Meetings_bookedById_fkey` FOREIGN KEY (`bookedById`) REFERENCES `ClientProfile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
