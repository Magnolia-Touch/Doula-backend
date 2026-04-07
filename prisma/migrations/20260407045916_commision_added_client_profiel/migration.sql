/*
  Warnings:

  - You are about to drop the column `commission` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `ClientProfile` ADD COLUMN `commission` DOUBLE NOT NULL DEFAULT 10.0;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `commission`;
