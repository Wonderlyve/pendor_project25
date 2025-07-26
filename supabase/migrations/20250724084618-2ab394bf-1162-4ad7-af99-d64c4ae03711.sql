-- Create storage bucket for channel media
INSERT INTO storage.buckets (id, name, public) 
VALUES ('channel-media', 'channel-media', true);

-- Create policies for channel media uploads
CREATE POLICY "Channel creators can upload media" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'channel-media' AND auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view channel media" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'channel-media');

CREATE POLICY "Channel creators can update their media" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'channel-media' AND auth.uid() IS NOT NULL);

CREATE POLICY "Channel creators can delete their media" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'channel-media' AND auth.uid() IS NOT NULL);