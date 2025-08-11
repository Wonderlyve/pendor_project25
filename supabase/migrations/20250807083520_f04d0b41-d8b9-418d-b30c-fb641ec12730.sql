-- Add image_url column to channels table
ALTER TABLE public.channels 
ADD COLUMN image_url TEXT;

-- Create RLS policy for channel-media bucket if not exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('channel-media', 'channel-media', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for channel images
CREATE POLICY "Anyone can view channel images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'channel-media');

CREATE POLICY "Users can upload channel images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'channel-media' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own channel images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'channel-media' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own channel images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'channel-media' AND auth.uid() IS NOT NULL);