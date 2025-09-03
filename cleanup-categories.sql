-- Clean up duplicate categories and ensure data consistency

-- First, let's see what we have
SELECT 'Current categories:' as info;
SELECT id, name, sort_order FROM categories ORDER BY id;

-- Remove duplicate categories (keep the first occurrence of each name)
DELETE FROM categories 
WHERE id NOT IN (
  SELECT MIN(id) 
  FROM categories 
  GROUP BY name
);

-- Reset the category sequence to avoid gaps
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));

-- Show final result
SELECT 'Final categories:' as info;
SELECT id, name, sort_order FROM categories ORDER BY sort_order;

SELECT 'Menu items count:' as info;
SELECT COUNT(*) FROM menu_items;
