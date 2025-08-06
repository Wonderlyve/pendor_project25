-- Drop the policies that reference user_metadata (security issue)
DROP POLICY IF EXISTS "Smart user can view all versions" ON public.app_versions;
DROP POLICY IF EXISTS "Smart user can insert versions" ON public.app_versions;
DROP POLICY IF EXISTS "Smart user can update versions" ON public.app_versions;
DROP POLICY IF EXISTS "Smart user can upload APK files" ON storage.objects;

-- Create more secure policies using only email comparison
CREATE POLICY "Smart user can view all versions" 
ON public.app_versions 
FOR SELECT 
USING (auth.email() = 'smart@example.com');

CREATE POLICY "Smart user can insert versions" 
ON public.app_versions 
FOR INSERT 
WITH CHECK (auth.email() = 'smart@example.com');

CREATE POLICY "Smart user can update versions" 
ON public.app_versions 
FOR UPDATE 
USING (auth.email() = 'smart@example.com');

-- Storage policy for Smart user only
CREATE POLICY "Smart user can upload APK files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'apk-files' AND auth.email() = 'smart@example.com');