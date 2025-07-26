-- Donner le badge Pro à l'utilisateur Smart
UPDATE public.profiles 
SET badge = 'Pro'
WHERE username = 'Smart';