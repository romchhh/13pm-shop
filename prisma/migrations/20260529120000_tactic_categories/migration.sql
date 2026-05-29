-- Категорії 13pm tactic (ідемпотентно за slug)
INSERT INTO "categories" ("name", "slug", "priority", "description")
SELECT v.name, v.slug, v.priority, NULL
FROM (
  VALUES
    ('Комплекти', 'komplekty', 70),
    ('Футболки', 'futbolky', 65),
    ('Флісова кофта', 'flisova-kofta', 60),
    ('UBACS', 'ubacs', 55),
    ('Штани', 'shtany', 50),
    ('Головні убори', 'holovni-ubory', 45),
    ('Аксесуари', 'aksesuary', 40)
) AS v(name, slug, priority)
WHERE NOT EXISTS (
  SELECT 1 FROM "categories" c WHERE c."slug" = v.slug OR lower(c."name") = lower(v.name)
);
