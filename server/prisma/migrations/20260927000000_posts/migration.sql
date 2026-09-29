-- CreateTable
-- Idempotente (IF NOT EXISTS + FK en línea) para que el auto-arranque de
-- scripts/setup-db.cjs pueda aplicarla sobre instalaciones existentes.
CREATE TABLE IF NOT EXISTS `posts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `excerpt` TEXT NULL,
    `content` MEDIUMTEXT NULL,
    `coverImage` VARCHAR(191) NULL,
    `tags` VARCHAR(191) NULL,
    `status` ENUM('DRAFT', 'PUBLISHED') NOT NULL DEFAULT 'DRAFT',
    `publishedAt` DATETIME(3) NULL,
    `seoTitle` VARCHAR(191) NULL,
    `seoDescription` TEXT NULL,
    `categoryId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `posts_slug_key`(`slug`),
    INDEX `posts_categoryId_idx`(`categoryId`),
    INDEX `posts_status_publishedAt_idx`(`status`, `publishedAt`),
    PRIMARY KEY (`id`),
    CONSTRAINT `posts_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
