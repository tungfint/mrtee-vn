-- Allow one student profile to appear in multiple classes, while keeping
-- the existing User.classId column as legacy/default-class data.
CREATE TABLE `ClassMember` (
  `id` VARCHAR(191) NOT NULL,
  `classId` VARCHAR(191) NOT NULL,
  `studentProfileId` VARCHAR(191) NOT NULL,
  `role` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  INDEX `ClassMember_studentProfileId_idx`(`studentProfileId`),
  UNIQUE INDEX `ClassMember_classId_studentProfileId_key`(`classId`, `studentProfileId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `ClassMember`
  ADD CONSTRAINT `ClassMember_classId_fkey`
  FOREIGN KEY (`classId`) REFERENCES `Class`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `ClassMember`
  ADD CONSTRAINT `ClassMember_studentProfileId_fkey`
  FOREIGN KEY (`studentProfileId`) REFERENCES `StudentProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

INSERT IGNORE INTO `ClassMember` (`id`, `classId`, `studentProfileId`, `createdAt`)
SELECT CONCAT('cm_', REPLACE(UUID(), '-', '')), `User`.`classId`, `StudentProfile`.`id`, CURRENT_TIMESTAMP(3)
FROM `User`
INNER JOIN `StudentProfile` ON `StudentProfile`.`userId` = `User`.`id`
WHERE `User`.`classId` IS NOT NULL;
