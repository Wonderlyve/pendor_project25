-- Mettre à jour le profil pour donner le badge pro à Padmin@pendor.com
UPDATE profiles 
SET badge = 'Pro'
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'Padmin@pendor.com'
);