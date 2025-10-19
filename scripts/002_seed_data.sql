-- Seed users from CSV
INSERT INTO users (created_at, name, username)
SELECT 
  created_at::TIMESTAMPTZ,
  name,
  username
FROM (
  SELECT 
    '2025-10-18 21:08:35.402354+00'::TEXT as created_at,
    'Nicolas Perez' as name,
    'nicoperez' as username
) AS user_data
ON CONFLICT (username) DO NOTHING;

-- Seed clothes from CSV
INSERT INTO clothes (id, created_at, name, description, public, selling, username, type)
SELECT 
  id::INTEGER,
  created_at::TIMESTAMPTZ,
  name,
  description,
  CASE WHEN public = 'true' THEN true ELSE false END,
  CASE WHEN selling = 'true' THEN true WHEN selling = 'false' THEN false ELSE NULL END,
  username,
  type
FROM (
  SELECT 
    '1' as id,
    '2025-10-18 21:25:50.893543+00' as created_at,
    'remera blanca' as name,
    'remera blanca' as description,
    'true' as public,
    NULL as selling,
    'nicoperez' as username,
    'top' as type
) AS clothes_data
ON CONFLICT (id) DO NOTHING;

-- Seed outfits from CSV
INSERT INTO outfits (id, created_at, username)
SELECT 
  id::UUID,
  created_at::TIMESTAMPTZ,
  username
FROM (
  SELECT 
    'a75cd0bb-0c1e-4267-a127-4d22fe01c96a' as id,
    '2025-10-18 22:44:54.509045+00' as created_at,
    'nicoperez' as username
) AS outfits_data
ON CONFLICT (id) DO NOTHING;

-- Seed outfits_clothes junction table from CSV
INSERT INTO outfits_clothes (id, created_at, cloth_id, outfit_id)
SELECT 
  id::INTEGER,
  created_at::TIMESTAMPTZ,
  cloth_id::INTEGER,
  outfit_id::UUID
FROM (
  SELECT 
    '1' as id,
    '2025-10-18 22:45:33.818628+00' as created_at,
    '1' as cloth_id,
    'a75cd0bb-0c1e-4267-a127-4d22fe01c96a' as outfit_id
) AS outfits_clothes_data
ON CONFLICT (id) DO NOTHING;

-- Seed posts from CSV
INSERT INTO posts (id, created_at, likes, description, outfit_id)
SELECT 
  id::INTEGER,
  created_at::TIMESTAMPTZ,
  likes::INTEGER,
  description,
  outfit_id::UUID
FROM (
  SELECT 
    '1' as id,
    '2025-10-18 21:09:03.223606+00' as created_at,
    '875' as likes,
    'hola, esta es mi primera publicacion' as description,
    'a75cd0bb-0c1e-4267-a127-4d22fe01c96a' as outfit_id
) AS posts_data
ON CONFLICT (id) DO NOTHING;
