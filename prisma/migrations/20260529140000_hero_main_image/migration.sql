-- Hero: tactic-фото з public/hero-main.png замість старих plywood-шляхів
UPDATE "hero_slides"
SET
    "desktop_image_url" = '/hero-main.png',
    "mobile_image_url" = '/hero-main.png',
    "updated_at" = CURRENT_TIMESTAMP
WHERE
    "desktop_image_url" IN (
        '/images/pages/hero-desktop.jpg',
        '/Gemini_Generated_Image_5oxqcg5oxqcg5oxq.png'
    )
    OR "mobile_image_url" IN (
        '/images/pages/hero-mobile.jpg',
        '/Gemini_Generated_Image_5oxqcg5oxqcg5oxq.png'
    );
