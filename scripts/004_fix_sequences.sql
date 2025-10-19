-- Fix the sequences for tables with SERIAL primary keys
-- This is needed after importing data with explicit IDs

-- Fix posts sequence
SELECT setval('posts_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM posts), false);

-- Fix clothes sequence
SELECT setval('clothes_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM clothes), false);

-- Fix outfits_clothes sequence
SELECT setval('outfits_clothes_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM outfits_clothes), false);
