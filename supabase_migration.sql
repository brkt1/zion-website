-- Migration: Add financial fields to masterclass_reservations
-- Description: Adds payment_status, total_amount, paid_amount, remaining_amount, and payment_completion_date columns

ALTER TABLE masterclass_reservations 
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'full')),
ADD COLUMN IF NOT EXISTS total_amount DECIMAL(12, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS paid_amount DECIMAL(12, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS remaining_amount DECIMAL(12, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_completion_date TIMESTAMP WITH TIME ZONE;

-- Optional: Update existing records to have a default unpaid status if null
UPDATE masterclass_reservations SET payment_status = 'unpaid' WHERE payment_status IS NULL;
UPDATE masterclass_reservations SET total_amount = 0 WHERE total_amount IS NULL;
UPDATE masterclass_reservations SET paid_amount = 0 WHERE paid_amount IS NULL;
UPDATE masterclass_reservations SET remaining_amount = 0 WHERE remaining_amount IS NULL;
