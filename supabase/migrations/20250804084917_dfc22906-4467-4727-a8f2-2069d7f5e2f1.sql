-- Add reservation_code column to posts table
ALTER TABLE public.posts 
ADD COLUMN reservation_code TEXT;