-- Hero: окремі фото для мобільної та десктопної версії
UPDATE "hero_slides"
SET "mobile_image_url" = '/IMG_5273.PNG'
WHERE "mobile_image_url" IN ('/hero-main.png', '/IMG_5342.PNG');

UPDATE "hero_slides"
SET "desktop_image_url" = '/IMG_5342.PNG'
WHERE "desktop_image_url" IN ('/hero-main.png', '/IMG_5273.PNG');
