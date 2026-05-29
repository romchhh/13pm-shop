-- Оновити застарілі тексти херо (Plywood / абстрактний лозунг)
UPDATE "hero_slides"
SET
    "title" = E'МАГАЗИН\nТАКТИЧНОГО\nОДЯГУ',
    "subtitle" = 'Куртки, штани, футболки та худі власного виробництва. Лінійки ALPHA, BRAVO та DELTA — доставка по Україні 1–3 дні.',
    "updated_at" = CURRENT_TIMESTAMP
WHERE
    "title" LIKE '%СЬОГОДНІ%'
    OR "title" LIKE '%Подарунки з дерева%'
    OR "subtitle" ILIKE '%подарун%'
    OR "subtitle" ILIKE '%дерев%';
