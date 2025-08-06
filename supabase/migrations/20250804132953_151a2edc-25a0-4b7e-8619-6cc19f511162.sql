-- Create table for app versions
CREATE TABLE public.app_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  version_name TEXT NOT NULL,
  version_code INTEGER NOT NULL UNIQUE,
  apk_url TEXT NOT NULL,
  release_notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.app_versions ENABLE ROW LEVEL SECURITY;

-- Create policies (only Smart user can manage versions)
CREATE POLICY "Smart user can view all versions" 
ON public.app_versions 
FOR SELECT 
USING (auth.email() = 'smart@example.com' OR auth.jwt() ->> 'user_metadata' ->> 'display_name' = 'Smart');

CREATE POLICY "Smart user can insert versions" 
ON public.app_versions 
FOR INSERT 
WITH CHECK (auth.email() = 'smart@example.com' OR auth.jwt() ->> 'user_metadata' ->> 'display_name' = 'Smart');

CREATE POLICY "Smart user can update versions" 
ON public.app_versions 
FOR UPDATE 
USING (auth.email() = 'smart@example.com' OR auth.jwt() ->> 'user_metadata' ->> 'display_name' = 'Smart');

-- Public can read active version for update checking
CREATE POLICY "Everyone can view active version" 
ON public.app_versions 
FOR SELECT 
USING (is_active = true);

-- Create storage bucket for APK files
INSERT INTO storage.buckets (id, name, public) VALUES ('apk-files', 'apk-files', true);

-- Create storage policies
CREATE POLICY "Smart user can upload APK files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'apk-files' AND (auth.email() = 'smart@example.com' OR auth.jwt() ->> 'user_metadata' ->> 'display_name' = 'Smart'));

CREATE POLICY "Everyone can download APK files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'apk-files');

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_app_versions_updated_at
BEFORE UPDATE ON public.app_versions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert current version as baseline
INSERT INTO public.app_versions (version_name, version_code, apk_url, is_active, release_notes)
VALUES ('1.0.0', 1, '', true, 'Version initiale de l''application');