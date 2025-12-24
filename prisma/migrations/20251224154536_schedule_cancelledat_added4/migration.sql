/*
  Warnings:

  - You are about to drop the column `cancelledAt` on the `Notification` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Notification` DROP COLUMN `cancelledAt`;

-- AlterTable
ALTER TABLE `Schedules` ADD COLUMN `cancelledAt` DATETIME(3) NULL;
