-- Add subscription_code column to channels table
ALTER TABLE public.channels ADD COLUMN subscription_code text;