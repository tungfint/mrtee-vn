-- WEB-MRTEE manual migration for Tenten/phpMyAdmin.
-- Use this only when cPanel "Run JS Script" fails with cagefs/resource-limit errors.
-- It creates ClassMember so one student profile can belong to multiple classes.

CREATE TABLE IF NOT EXISTS `ClassMember` (
  `id` VARCHAR(191) NOT NULL,
  `classId` VARCHAR(191) NOT NULL,
  `studentProfileId` VARCHAR(191) NOT NULL,
  `role` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `ClassMember_studentProfileId_idx` (`studentProfileId`),
  UNIQUE INDEX `ClassMember_classId_studentProfileId_key` (`classId`, `studentProfileId`),
  PRIMARY KEY (`id`),
  CONSTRAINT `ClassMember_classId_fkey`
    FOREIGN KEY (`classId`) REFERENCES `Class` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ClassMember_studentProfileId_fkey`
    FOREIGN KEY (`studentProfileId`) REFERENCES `StudentProfile` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT IGNORE INTO `ClassMember` (`id`, `classId`, `studentProfileId`, `createdAt`)
SELECT CONCAT('cm_', REPLACE(UUID(), '-', '')), `User`.`classId`, `StudentProfile`.`id`, CURRENT_TIMESTAMP(3)
FROM `User`
INNER JOIN `StudentProfile` ON `StudentProfile`.`userId` = `User`.`id`
WHERE `User`.`classId` IS NOT NULL;

INSERT INTO `_prisma_migrations`
  (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`)
SELECT
  UUID(),
  'f4bc8f68df3103eeac0b8aa713e0d8d103269d83722c34a93642c989af35e19e',
  CURRENT_TIMESTAMP(3),
  '20260530120000_class_members',
  NULL,
  NULL,
  CURRENT_TIMESTAMP(3),
  1
WHERE NOT EXISTS (
  SELECT 1 FROM `_prisma_migrations`
  WHERE `migration_name` = '20260530120000_class_members'
);
