-- AlterTable
ALTER TABLE `Payment` MODIFY `method` ENUM('UPI', 'CARD', 'NET_BANKING', 'WALLET', 'CASH') NULL;
