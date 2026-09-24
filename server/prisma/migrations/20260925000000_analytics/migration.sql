-- CreateTable
-- Idempotente para el auto-arranque de scripts/setup-db.cjs.
CREATE TABLE IF NOT EXISTS `analytics_events` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` VARCHAR(32) NOT NULL,
    `path` VARCHAR(191) NOT NULL,
    `source` VARCHAR(100) NULL,
    `device` VARCHAR(16) NOT NULL,
    `browser` VARCHAR(32) NULL,
    `visitorId` VARCHAR(64) NOT NULL,
    `sessionId` VARCHAR(64) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `analytics_events_createdAt_idx`(`createdAt`),
    INDEX `analytics_events_type_createdAt_idx`(`type`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
