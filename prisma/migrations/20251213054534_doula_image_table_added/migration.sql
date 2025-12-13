-- CreateTable
CREATE TABLE `DoulaImages` (
    `id` VARCHAR(191) NOT NULL,
    `doulaProfileId` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `altText` VARCHAR(191) NULL,
    `isMain` BOOLEAN NOT NULL DEFAULT false,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DoulaImages` ADD CONSTRAINT `DoulaImages_doulaProfileId_fkey` FOREIGN KEY (`doulaProfileId`) REFERENCES `DoulaProfile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
