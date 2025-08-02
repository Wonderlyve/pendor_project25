-- Drop existing conflicting policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to upload channel media" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to channel media" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own channel media" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own channel media" ON storage.objects;

-- Create proper storage policies for channel-media bucket
CREATE POLICY "Channel media: authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'channel-media' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Channel media: public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'channel-media');

CREATE POLICY "Channel media: users can update own files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'channel-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Channel media: users can delete own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'channel-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);