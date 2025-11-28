-- AlterTable
ALTER TABLE `AvailableSlotsForMeeting` MODIFY `ownerRole` ENUM('ADMIN', 'CLIENT', 'DOULA', 'ZONE_MANAGER') NOT NULL;
