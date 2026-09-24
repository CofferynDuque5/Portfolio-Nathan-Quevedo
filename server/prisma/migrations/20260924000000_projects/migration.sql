-- CreateTable
-- Idempotente (IF NOT EXISTS + FK en línea) para que el auto-arranque de
-- scripts/setup-db.cjs pueda aplicarla sobre instalaciones existentes.
CREATE TABLE IF NOT EXISTS `projects` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `client` VARCHAR(191) NULL,
    `year` VARCHAR(191) NULL,
    `summary` TEXT NULL,
    `challenge` TEXT NULL,
    `solution` TEXT NULL,
    `results` TEXT NULL,
    `coverImage` VARCHAR(191) NULL,
    `gallery` TEXT NULL,
    `tags` VARCHAR(191) NULL,
    `url` VARCHAR(191) NULL,
    `status` ENUM('DRAFT', 'PUBLISHED') NOT NULL DEFAULT 'DRAFT',
    `publishedAt` DATETIME(3) NULL,
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `order` INTEGER NOT NULL DEFAULT 0,
    `seoTitle` VARCHAR(191) NULL,
    `seoDescription` TEXT NULL,
    `categoryId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `projects_slug_key`(`slug`),
    INDEX `projects_categoryId_idx`(`categoryId`),
    INDEX `projects_status_order_idx`(`status`, `order`),
    INDEX `projects_featured_idx`(`featured`),
    PRIMARY KEY (`id`),
    CONSTRAINT `projects_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
