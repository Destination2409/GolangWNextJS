-- Schema for go_db. Executed automatically by the MySQL container the first
-- time the data volume is created. To re-run: `docker compose down -v` then `up`.
-- Column types mirror the GORM models in GolangAPI/internal/models.

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS users (
    id                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    email               VARCHAR(255) NOT NULL,
    password            LONGTEXT NOT NULL,
    prefix              VARCHAR(50) NULL,
    first_name          VARCHAR(100) NOT NULL,
    last_name           VARCHAR(100) NOT NULL,
    gender              ENUM('male','female','other') NULL,
    status              ENUM('active','inactive','blocked') NOT NULL DEFAULT 'active',
    permission_id       BIGINT UNSIGNED NOT NULL DEFAULT 1,
    last_login_at       DATETIME(3) NULL,
    password_updated_at DATETIME(3) NULL,
    created_at          DATETIME(3) NULL,
    updated_at          DATETIME(3) NULL,
    PRIMARY KEY (id),
    UNIQUE KEY idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS genders (
    id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
    name       VARCHAR(50) NOT NULL,
    created_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    UNIQUE KEY uq_genders_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS categories (
    id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
    name       VARCHAR(50) NOT NULL,
    created_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    UNIQUE KEY uq_categories_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sub_categories (
    id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
    category_id INT UNSIGNED NOT NULL,
    name        VARCHAR(100) NOT NULL,
    created_at  DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
    updated_at  DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    UNIQUE KEY uq_sub_categories (category_id, name),
    CONSTRAINT fk_sub_categories_category FOREIGN KEY (category_id)
        REFERENCES categories (id) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS product_types (
    id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
    sub_category_id INT UNSIGNED NOT NULL,
    name            VARCHAR(100) NOT NULL,
    created_at      DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
    updated_at      DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    UNIQUE KEY uq_product_types (sub_category_id, name),
    CONSTRAINT fk_product_types_sub_category FOREIGN KEY (sub_category_id)
        REFERENCES sub_categories (id) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS colours (
    id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
    name       VARCHAR(50) NOT NULL,
    created_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    UNIQUE KEY uq_colours_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS usages (
    id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
    name       VARCHAR(50) NOT NULL,
    created_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    UNIQUE KEY uq_usages_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- gender_id is TINYINT while genders.id is INT, so it has no FK (same as the
-- model, which sets constraint:-). The other references use ON DELETE SET NULL
-- so removing a category never deletes products.
CREATE TABLE IF NOT EXISTS products (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    external_id     VARCHAR(255) NOT NULL,
    gender_id       TINYINT UNSIGNED NULL,
    category_id     INT UNSIGNED NULL,
    sub_category_id INT UNSIGNED NULL,
    product_type_id INT UNSIGNED NULL,
    colour_id       INT UNSIGNED NULL,
    usage_id        INT UNSIGNED NULL,
    title           VARCHAR(255) NOT NULL,
    description     TEXT NULL,
    image           VARCHAR(255) NULL,
    image_url       TEXT NULL,
    price           DECIMAL(10,2) NOT NULL DEFAULT 0,
    compare_at_price DECIMAL(10,2) NULL COMMENT 'original price, shown struck-through when on sale',
    stock           BIGINT NOT NULL DEFAULT 0,
    status          ENUM('active','inactive') NOT NULL DEFAULT 'active',
    created_at      DATETIME(3) NULL,
    updated_at      DATETIME(3) NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_products_external_id (external_id),
    KEY idx_products_title (title),
    KEY idx_products_gender (gender_id),
    CONSTRAINT fk_products_category FOREIGN KEY (category_id)
        REFERENCES categories (id) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_products_sub_category FOREIGN KEY (sub_category_id)
        REFERENCES sub_categories (id) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_products_product_type FOREIGN KEY (product_type_id)
        REFERENCES product_types (id) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_products_colour FOREIGN KEY (colour_id)
        REFERENCES colours (id) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_products_usage FOREIGN KEY (usage_id)
        REFERENCES usages (id) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
