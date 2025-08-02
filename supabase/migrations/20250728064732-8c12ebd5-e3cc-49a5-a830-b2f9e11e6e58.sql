-- Create bucket for channel media uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('channel-media', 'channel-media', true);

-- Create policy to allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload channel media" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'channel-media' AND auth.role() = 'authenticated');

-- Create policy to allow everyone to view channel media (since bucket is public)
CREATE POLICY "Allow public access to channel media" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'channel-media');

-- Create policy to allow users to update their own uploads
CREATE POLICY "Allow users to update their own channel media" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'channel-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create policy to allow users to delete their own uploads
CREATE POLICY "Allow users to delete their own channel media" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'channel-media' AND auth.uid()::text = (storage.foldername(name))[1]);