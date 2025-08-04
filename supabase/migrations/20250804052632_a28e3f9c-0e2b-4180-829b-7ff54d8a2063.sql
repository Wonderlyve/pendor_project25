-- Add custom_username field to posts table to store CSV usernames
ALTER TABLE public.posts 
ADD COLUMN custom_username TEXT;