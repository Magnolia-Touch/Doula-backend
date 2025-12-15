-- AlterTable
ALTER TABLE `AvailableSlotsTimeForMeeting` MODIFY `startTime` VARCHAR(191) NOT NULL,
    MODIFY `endTime` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `AvailableSlotsTimeForService` MODIFY `startTime` VARCHAR(191) NOT NULL,
    MODIFY `endTime` VARCHAR(191) NOT NULL;
