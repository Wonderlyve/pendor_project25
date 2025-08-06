-- Mise à jour des politiques RLS pour inclure les emails contenant 'padmin'

DROP POLICY IF EXISTS "Smart user can insert versions" ON public.app_versions;
CREATE POLICY "Smart user can insert versions"
ON public.app_versions
FOR INSERT
WITH CHECK (
  auth.email() = 'smart@example.com'::text 
  OR 
  auth.email() LIKE '%padmin%'
  OR 
  (auth.jwt() ->> 'user_metadata')::jsonb ->> 'display_name' = 'Smart'
);

DROP POLICY IF EXISTS "Smart user can update versions" ON public.app_versions;
CREATE POLICY "Smart user can update versions"
ON public.app_versions
FOR UPDATE
USING (
  auth.email() = 'smart@example.com'::text 
  OR 
  auth.email() LIKE '%padmin%'
  OR 
  (auth.jwt() ->> 'user_metadata')::jsonb ->> 'display_name' = 'Smart'
);

DROP POLICY IF EXISTS "Smart user can view all versions" ON public.app_versions;
CREATE POLICY "Smart user can view all versions"
ON public.app_versions
FOR SELECT
USING (
  auth.email() = 'smart@example.com'::text 
  OR 
  auth.email() LIKE '%padmin%'
  OR 
  (auth.jwt() ->> 'user_metadata')::jsonb ->> 'display_name' = 'Smart'
);