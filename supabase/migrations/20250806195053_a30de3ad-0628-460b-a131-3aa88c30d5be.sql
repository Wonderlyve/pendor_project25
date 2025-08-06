-- Add currency column to channels table
ALTER TABLE public.channels 
ADD COLUMN currency text NOT NULL DEFAULT 'EUR' CHECK (currency IN ('EUR', 'USD', 'CDF'));