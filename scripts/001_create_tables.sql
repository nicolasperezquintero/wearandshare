-- Create users table
CREATE TABLE IF NOT EXISTS users (
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  name TEXT NOT NULL,
  username TEXT PRIMARY KEY
);

-- Create clothes table
CREATE TABLE IF NOT EXISTS clothes (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  name TEXT NOT NULL,
  description TEXT,
  public BOOLEAN NOT NULL DEFAULT true,
  selling BOOLEAN,
  username TEXT NOT NULL REFERENCES users(username) ON DELETE CASCADE,
  type TEXT NOT NULL
);

-- Create outfits table
CREATE TABLE IF NOT EXISTS outfits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  username TEXT NOT NULL REFERENCES users(username) ON DELETE CASCADE
);

-- Create outfits_clothes junction table
CREATE TABLE IF NOT EXISTS outfits_clothes (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cloth_id INTEGER NOT NULL REFERENCES clothes(id) ON DELETE CASCADE,
  outfit_id UUID NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
  UNIQUE(cloth_id, outfit_id)
);

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  likes INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  outfit_id UUID NOT NULL REFERENCES outfits(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_clothes_username ON clothes(username);
CREATE INDEX IF NOT EXISTS idx_clothes_type ON clothes(type);
CREATE INDEX IF NOT EXISTS idx_outfits_username ON outfits(username);
CREATE INDEX IF NOT EXISTS idx_outfits_clothes_cloth_id ON outfits_clothes(cloth_id);
CREATE INDEX IF NOT EXISTS idx_outfits_clothes_outfit_id ON outfits_clothes(outfit_id);
CREATE INDEX IF NOT EXISTS idx_posts_outfit_id ON posts(outfit_id);
CREATE INDEX IF NOT EXISTS idx_posts_likes ON posts(likes DESC);
