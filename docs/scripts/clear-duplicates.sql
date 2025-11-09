-- Script to clear duplicate records from the database
-- Run this in your Supabase SQL Editor to remove duplicates
-- This keeps the record with the earliest created_at timestamp

-- Clear duplicate Events (keep the oldest one by created_at)
DELETE FROM events
WHERE id IN (
  SELECT id
  FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY title, date ORDER BY created_at ASC) as rn
    FROM events
  ) t
  WHERE rn > 1
);

-- Clear duplicate Categories (keep the oldest one by created_at)
DELETE FROM categories
WHERE id IN (
  SELECT id
  FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY slug ORDER BY created_at ASC) as rn
    FROM categories
  ) t
  WHERE rn > 1
);

-- Clear duplicate Destinations (keep the oldest one by created_at)
DELETE FROM destinations
WHERE id IN (
  SELECT id
  FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY name, location ORDER BY created_at ASC) as rn
    FROM destinations
  ) t
  WHERE rn > 1
);

-- Clear duplicate Gallery items (keep the oldest one by created_at)
DELETE FROM gallery
WHERE id IN (
  SELECT id
  FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY main ORDER BY created_at ASC) as rn
    FROM gallery
  ) t
  WHERE rn > 1
);

-- Clear duplicate Contact Info (keep the oldest one by created_at)
DELETE FROM contact_info
WHERE id IN (
  SELECT id
  FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at ASC) as rn
    FROM contact_info
  ) t
  WHERE rn > 1
);

-- Clear duplicate Social Links (keep the oldest one by created_at)
DELETE FROM social_links
WHERE id IN (
  SELECT id
  FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY platform ORDER BY created_at ASC) as rn
    FROM social_links
  ) t
  WHERE rn > 1
);

-- Clear duplicate Site Config (keep only the oldest one)
DELETE FROM site_config
WHERE id IN (
  SELECT id
  FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) as rn
    FROM site_config
  ) t
  WHERE rn > 1
);

-- Clear duplicate Navigation Links (keep the oldest one by created_at)
DELETE FROM navigation_links
WHERE id IN (
  SELECT id
  FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY path ORDER BY created_at ASC) as rn
    FROM navigation_links
  ) t
  WHERE rn > 1
);

-- Clear duplicate About Content (keep only the oldest one)
DELETE FROM about_content
WHERE id IN (
  SELECT id
  FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) as rn
    FROM about_content
  ) t
  WHERE rn > 1
);

-- Clear duplicate About Values (keep the oldest one by created_at)
DELETE FROM about_values
WHERE id IN (
  SELECT id
  FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY number ORDER BY created_at ASC) as rn
    FROM about_values
  ) t
  WHERE rn > 1
);

-- Clear duplicate About Milestones (keep the oldest one by created_at)
DELETE FROM about_milestones
WHERE id IN (
  SELECT id
  FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY year, title ORDER BY created_at ASC) as rn
    FROM about_milestones
  ) t
  WHERE rn > 1
);

-- Clear duplicate Home Content (keep only the oldest one)
DELETE FROM home_content
WHERE id IN (
  SELECT id
  FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) as rn
    FROM home_content
  ) t
  WHERE rn > 1
);

-- Clear duplicate Hero Categories (keep the oldest one by created_at)
DELETE FROM hero_categories
WHERE id IN (
  SELECT id
  FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY label ORDER BY created_at ASC) as rn
    FROM hero_categories
  ) t
  WHERE rn > 1
);

-- Clear duplicate Home Categories (keep the oldest one by created_at)
DELETE FROM home_categories
WHERE id IN (
  SELECT id
  FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY title ORDER BY created_at ASC) as rn
    FROM home_categories
  ) t
  WHERE rn > 1
);

-- Clear duplicate Home CTA Buttons (keep the oldest one by created_at)
DELETE FROM home_cta_buttons
WHERE id IN (
  SELECT id
  FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY text, link ORDER BY created_at ASC) as rn
    FROM home_cta_buttons
  ) t
  WHERE rn > 1
);

-- Note: Tickets table should not have duplicates due to UNIQUE constraint on tx_ref
-- But if there are any, we can clear them too:
-- DELETE FROM tickets
-- WHERE id NOT IN (
--   SELECT MIN(id)
--   FROM tickets
--   GROUP BY tx_ref
-- );

