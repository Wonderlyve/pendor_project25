-- Mise à jour de la politique RLS pour permettre l'insertion par l'utilisateur Smart
DROP POLICY IF EXISTS "Smart user can insert versions" ON public.app_versions;

CREATE POLICY "Smart user can insert versions"
ON public.app_versions
FOR INSERT
WITH CHECK (
  auth.email() = 'smart@example.com'::text 
  OR 
  (auth.jwt() ->> 'user_metadata')::jsonb ->> 'display_name' = 'Smart'
);

-- Mise à jour de la politique RLS pour permettre la mise à jour par l'utilisateur Smart
DROP POLICY IF EXISTS "Smart user can update versions" ON public.app_versions;

CREATE POLICY "Smart user can update versions"
ON public.app_versions
FOR UPDATE
USING (
  auth.email() = 'smart@example.com'::text 
  OR 
  (auth.jwt() ->> 'user_metadata')::jsonb ->> 'display_name' = 'Smart'
);

-- Mise à jour de la politique RLS pour permettre la lecture par l'utilisateur Smart
DROP POLICY IF EXISTS "Smart user can view all versions" ON public.app_versions;

CREATE POLICY "Smart user can view all versions"
ON public.app_versions
FOR SELECT
USING (
  auth.email() = 'smart@example.com'::text 
  OR 
  (auth.jwt() ->> 'user_metadata')::jsonb ->> 'display_name' = 'Smart'
);