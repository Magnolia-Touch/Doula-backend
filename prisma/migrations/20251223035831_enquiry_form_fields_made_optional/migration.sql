-- AlterTable
ALTER TABLE `EnquiryForm` MODIFY `seviceStartDate` DATETIME(3) NULL,
    MODIFY `serviceEndDate` DATETIME(3) NULL,
    MODIFY `VisitFrequency` INTEGER NULL,
    MODIFY `serviceTimeSlots` VARCHAR(191) NULL;
