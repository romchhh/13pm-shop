-- Hero: дефолтне фото public/IMG_5273.PNG
UPDATE "hero_slides"
SET
    "desktop_image_url" = '/IMG_5273.PNG',
    "mobile_image_url" = '/IMG_5273.PNG'
WHERE "desktop_image_url" = '/hero-main.png'
   OR "mobile_image_url" = '/hero-main.png';
