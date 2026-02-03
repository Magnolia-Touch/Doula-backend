-- AlterTable
ALTER TABLE `Meetings` MODIFY `createdby` ENUM('ADMIN', 'CLIENT', 'DOULA', 'ZONE_MANAGER') NULL;
