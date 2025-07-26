-- Create policies for channel media uploads (only if they don't exist)
DO $$
BEGIN
    -- Check if "Channel creators can upload media" policy exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Channel creators can upload media'
    ) THEN
        CREATE POLICY "Channel creators can upload media" 
        ON storage.objects 
        FOR INSERT 
        WITH CHECK (bucket_id = 'channel-media' AND auth.uid() IS NOT NULL);
    END IF;

    -- Check if "Anyone can view channel media" policy exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Anyone can view channel media'
    ) THEN
        CREATE POLICY "Anyone can view channel media" 
        ON storage.objects 
        FOR SELECT 
        USING (bucket_id = 'channel-media');
    END IF;

    -- Check if "Channel creators can update their media" policy exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Channel creators can update their media'
    ) THEN
        CREATE POLICY "Channel creators can update their media" 
        ON storage.objects 
        FOR UPDATE 
        USING (bucket_id = 'channel-media' AND auth.uid() IS NOT NULL);
    END IF;

    -- Check if "Channel creators can delete their media" policy exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Channel creators can delete their media'
    ) THEN
        CREATE POLICY "Channel creators can delete their media" 
        ON storage.objects 
        FOR DELETE 
        USING (bucket_id = 'channel-media' AND auth.uid() IS NOT NULL);
    END IF;
END
$$;