-- Add media support to channel_messages table
ALTER TABLE public.channel_messages 
ADD COLUMN media_url TEXT,
ADD COLUMN media_type TEXT CHECK (media_type IN ('image', 'video', 'audio', 'file')),
ADD COLUMN media_filename TEXT;

-- Allow channel messages to have either content or media (or both)
ALTER TABLE public.channel_messages 
DROP CONSTRAINT IF EXISTS channel_messages_content_check;

-- Create bucket for channel media if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('channel-media', 'channel-media', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for channel media
DROP POLICY IF EXISTS "Channel creators can upload media" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view channel media" ON storage.objects;

CREATE POLICY "Channel creators can upload media" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'channel-media' AND 
  EXISTS (
    SELECT 1 FROM public.channels 
    WHERE creator_id = auth.uid() 
    AND id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Anyone can view channel media" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'channel-media');

CREATE POLICY "Channel creators can update their media" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'channel-media' AND 
  EXISTS (
    SELECT 1 FROM public.channels 
    WHERE creator_id = auth.uid() 
    AND id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Channel creators can delete their media" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'channel-media' AND 
  EXISTS (
    SELECT 1 FROM public.channels 
    WHERE creator_id = auth.uid() 
    AND id::text = (storage.foldername(name))[1]
  )
);