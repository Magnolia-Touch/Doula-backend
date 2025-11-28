-- AlterTable
ALTER TABLE `DoulaProfile` ADD COLUMN `regionId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `DoulaProfile` ADD CONSTRAINT `DoulaProfile_regionId_fkey` FOREIGN KEY (`regionId`) REFERENCES `Region`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
