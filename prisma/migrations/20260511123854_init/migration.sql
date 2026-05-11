-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `role` ENUM('super_admin', 'admin_rack', 'user') NOT NULL DEFAULT 'user',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    INDEX `User_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Rack` (
    `id` VARCHAR(191) NOT NULL,
    `status` ENUM('pending', 'active', 'inactive') NOT NULL DEFAULT 'pending',
    `kode_rack` VARCHAR(191) NOT NULL,
    `divisi` ENUM('HR', 'Finance', 'IT', 'Marketing', 'Sales', 'Operations', 'Legal', 'RnD', 'Admin') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,

    INDEX `Rack_userId_idx`(`userId`),
    UNIQUE INDEX `Rack_divisi_kode_rack_key`(`divisi`, `kode_rack`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Box` (
    `id` VARCHAR(191) NOT NULL,
    `name_box` VARCHAR(191) NOT NULL,
    `kode_box` VARCHAR(191) NOT NULL,
    `description` VARCHAR(150) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `rackId` VARCHAR(191) NOT NULL,

    INDEX `Box_rackId_idx`(`rackId`),
    UNIQUE INDEX `Box_rackId_kode_box_key`(`rackId`, `kode_box`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Counter` (
    `id` VARCHAR(191) NOT NULL,
    `value` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Document` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(150) NOT NULL,
    `fileUrl` VARCHAR(191) NOT NULL,
    `fileType` VARCHAR(191) NOT NULL,
    `fileSize` INTEGER NOT NULL,
    `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `uploadedBy` VARCHAR(191) NOT NULL,
    `verifiedBy` VARCHAR(191) NULL,
    `boxId` VARCHAR(191) NOT NULL,

    INDEX `Document_uploadedBy_idx`(`uploadedBy`),
    INDEX `Document_boxId_idx`(`boxId`),
    INDEX `Document_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Rack` ADD CONSTRAINT `Rack_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Box` ADD CONSTRAINT `Box_rackId_fkey` FOREIGN KEY (`rackId`) REFERENCES `Rack`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Document` ADD CONSTRAINT `Document_uploadedBy_fkey` FOREIGN KEY (`uploadedBy`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Document` ADD CONSTRAINT `Document_verifiedBy_fkey` FOREIGN KEY (`verifiedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Document` ADD CONSTRAINT `Document_boxId_fkey` FOREIGN KEY (`boxId`) REFERENCES `Box`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
