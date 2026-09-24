-- CreateTable
-- Traducciones del contenido del panel (inglés, etc.). Idempotente para el
-- auto-arranque de scripts/setup-db.cjs.
CREATE TABLE IF NOT EXISTS `content_translations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `locale` VARCHAR(8) NOT NULL,
    `resource` VARCHAR(40) NOT NULL,
    `recordId` INTEGER NOT NULL,
    `field` VARCHAR(60) NOT NULL,
    `value` TEXT NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `content_translations_resource_recordId_idx`(`resource`, `recordId`),
    UNIQUE INDEX `content_translations_locale_resource_recordId_field_key`(`locale`, `resource`, `recordId`, `field`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
