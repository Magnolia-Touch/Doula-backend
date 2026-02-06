-- DropForeignKey
ALTER TABLE `Meetings` DROP FOREIGN KEY `Meetings_enquiryId_fkey`;

-- DropIndex
DROP INDEX `Meetings_enquiryId_key` ON `Meetings`;

ALTER TABLE `IntakeForm`
DROP FOREIGN KEY `IntakeForm_regionId_fkey`;

DROP INDEX `IntakeForm_regionId_fkey` ON `IntakeForm`;


ALTER TABLE `IntakeForm`
ADD CONSTRAINT `IntakeForm_regionId_fkey`
FOREIGN KEY (`regionId`)
REFERENCES `Region`(`id`)
ON DELETE CASCADE
ON UPDATE CASCADE;
