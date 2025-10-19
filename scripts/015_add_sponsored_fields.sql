-- Add sponsored field to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS sponsored BOOLEAN DEFAULT FALSE;

-- Add sponsored and link fields to clothes table
ALTER TABLE clothes ADD COLUMN IF NOT EXISTS sponsored BOOLEAN DEFAULT FALSE;
ALTER TABLE clothes ADD COLUMN IF NOT EXISTS link TEXT;

-- Add comments for documentation
COMMENT ON COLUMN posts.sponsored IS 'Indicates if this post is sponsored content';
COMMENT ON COLUMN clothes.sponsored IS 'Indicates if this clothing item is sponsored';
COMMENT ON COLUMN clothes.link IS 'Link to official store if item is sponsored';
