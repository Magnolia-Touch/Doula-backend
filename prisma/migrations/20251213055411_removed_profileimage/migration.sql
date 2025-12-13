/*
  Warnings:

  - You are about to drop the column `profileImage` on the `DoulaProfile` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[doulaProfileId,isMain]` on the table `DoulaImages` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `DoulaProfile` DROP COLUMN `profileImage`;

-- CreateIndex
CREATE UNIQUE INDEX `unique_main_image` ON `DoulaImages`(`doulaProfileId`, `isMain`);
