-- Create storage bucket for debriefing videos
INSERT INTO storage.buckets (id, name, public) VALUES ('debriefing-videos', 'debriefing-videos', true);

-- Create policies for debriefing videos bucket
CREATE POLICY "Debriefing videos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'debriefing-videos');

CREATE POLICY "Users can upload their own debriefing videos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'debriefing-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own debriefing videos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'debriefing-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own debriefing videos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'debriefing-videos' AND auth.uid()::text = (storage.foldername(name))[1]);