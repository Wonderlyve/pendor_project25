-- Ajouter la colonne badge à la table profiles
ALTER TABLE public.profiles 
ADD COLUMN badge TEXT;

-- Mettre à jour le profil pour donner le badge pro à Padmin@pendor.com
UPDATE public.profiles 
SET badge = 'Pro'
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'Padmin@pendor.com'
);