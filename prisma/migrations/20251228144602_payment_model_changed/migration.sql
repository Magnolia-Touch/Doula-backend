/*
  Warnings:

  - You are about to drop the column `orderId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `paymentRef` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `transactionId` on the `Payment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[checkoutSessionId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `checkoutSessionId` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Payment` DROP COLUMN `orderId`,
    DROP COLUMN `paymentRef`,
    DROP COLUMN `transactionId`,
    ADD COLUMN `amountRefunded` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `checkoutSessionId` VARCHAR(191) NOT NULL,
    ADD COLUMN `paymentIntentId` VARCHAR(191) NULL,
    ADD COLUMN `providerOrderId` VARCHAR(191) NULL,
    ADD COLUMN `providerPaymentId` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Payment_checkoutSessionId_key` ON `Payment`(`checkoutSessionId`);
