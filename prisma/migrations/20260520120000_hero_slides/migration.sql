-- CreateTable
CREATE TABLE "hero_slides" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "desktop_image_url" TEXT NOT NULL,
    "mobile_image_url" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hero_slides_pkey" PRIMARY KEY ("id")
);

-- Default slide (existing static assets)
INSERT INTO "hero_slides" (
    "title",
    "subtitle",
    "desktop_image_url",
    "mobile_image_url",
    "sort_order",
    "is_active",
    "updated_at"
) VALUES (
    'Подарунки з дерева, створені спеціально для Вас',
    'Іменні вироби, сімейний декор, фоторамки та унікальні подарунки ручної роботи.',
    '/images/pages/hero-desktop.jpg',
    '/images/pages/hero-mobile.jpg',
    0,
    true,
    CURRENT_TIMESTAMP
);
