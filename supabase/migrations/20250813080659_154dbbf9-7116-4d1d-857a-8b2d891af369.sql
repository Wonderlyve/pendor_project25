
-- Ajouter une colonne pour le code de partage unique dans la table channels
ALTER TABLE public.channels 
ADD COLUMN share_code TEXT UNIQUE;

-- Créer un index pour optimiser les recherches par code de partage
CREATE INDEX idx_channels_share_code ON public.channels(share_code);

-- Fonction pour générer un code de partage unique
CREATE OR REPLACE FUNCTION generate_share_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..8 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour générer automatiquement un code de partage lors de la création d'un canal
CREATE OR REPLACE FUNCTION set_channel_share_code()
RETURNS TRIGGER AS $$
DECLARE
    new_code TEXT;
BEGIN
    -- Générer un code unique
    LOOP
        new_code := generate_share_code();
        EXIT WHEN NOT EXISTS (SELECT 1 FROM public.channels WHERE share_code = new_code);
    END LOOP;
    
    NEW.share_code := new_code;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger
CREATE TRIGGER trigger_set_channel_share_code
    BEFORE INSERT ON public.channels
    FOR EACH ROW
    EXECUTE FUNCTION set_channel_share_code();

-- Générer des codes de partage pour les canaux existants
UPDATE public.channels 
SET share_code = (
    SELECT generate_share_code()
    WHERE share_code IS NULL
)
WHERE share_code IS NULL;

-- Politique RLS pour permettre l'accès aux canaux via le code de partage
CREATE POLICY "Canaux accessibles via code de partage"
ON public.channels
FOR SELECT
USING (true); -- Cette politique permet la lecture via le code de partage
