-- CreateTable
CREATE TABLE `studentpage` (
    `id` VARCHAR(191) NOT NULL,
    `scope` ENUM('CLASS', 'TEAM') NOT NULL,
    `studentSlug` VARCHAR(191) NOT NULL,
    `inputToken` VARCHAR(191) NOT NULL,
    `fullNameSnapshot` VARCHAR(191) NOT NULL,
    `classId` VARCHAR(191) NULL,
    `teamId` VARCHAR(191) NULL,
    `studentProfileId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `StudentPage_inputToken_key`(`inputToken`),
    INDEX `StudentPage_scope_idx`(`scope`),
    INDEX `StudentPage_studentProfileId_idx`(`studentProfileId`),
    UNIQUE INDEX `StudentPage_classId_studentSlug_key`(`classId`, `studentSlug`),
    UNIQUE INDEX `StudentPage_teamId_studentSlug_key`(`teamId`, `studentSlug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `studentpage` ADD CONSTRAINT `StudentPage_classId_fkey` FOREIGN KEY (`classId`) REFERENCES `class`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `studentpage` ADD CONSTRAINT `StudentPage_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `team`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `studentpage` ADD CONSTRAINT `StudentPage_studentProfileId_fkey` FOREIGN KEY (`studentProfileId`) REFERENCES `studentprofile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
