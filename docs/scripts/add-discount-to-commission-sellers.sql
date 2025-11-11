-- Add discount fields to commission_sellers table
-- This allows commission sellers to offer discounts to customers

-- Add discount_rate column (nullable, can be 0 or NULL for no discount)
ALTER TABLE commission_sellers 
ADD COLUMN IF NOT EXISTS discount_rate NUMERIC DEFAULT NULL;

-- Add discount_type column (nullable, can be 'percentage' or 'fixed')
ALTER TABLE commission_sellers 
ADD COLUMN IF NOT EXISTS discount_type TEXT DEFAULT NULL;

-- Add check constraint for discount_type
ALTER TABLE commission_sellers 
DROP CONSTRAINT IF EXISTS check_discount_type;

ALTER TABLE commission_sellers 
ADD CONSTRAINT check_discount_type 
CHECK (discount_type IS NULL OR discount_type IN ('percentage', 'fixed'));

-- Add check constraint to ensure discount_rate is positive if discount_type is set
ALTER TABLE commission_sellers 
DROP CONSTRAINT IF EXISTS check_discount_rate;

ALTER TABLE commission_sellers 
ADD CONSTRAINT check_discount_rate 
CHECK (
  (discount_type IS NULL AND discount_rate IS NULL) OR
  (discount_type IS NOT NULL AND discount_rate IS NOT NULL AND discount_rate >= 0)
);

-- Add comment to columns
COMMENT ON COLUMN commission_sellers.discount_rate IS 'Discount amount or percentage offered by this seller. Required if discount_type is set.';
COMMENT ON COLUMN commission_sellers.discount_type IS 'Type of discount: percentage or fixed amount. NULL means no discount.';

