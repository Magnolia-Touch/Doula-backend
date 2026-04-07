-- AlterTable
ALTER TABLE `Schedules` ADD COLUMN `serviceHours` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `ServiceBooking` ADD COLUMN `serviceHours` INTEGER NOT NULL DEFAULT 0;
