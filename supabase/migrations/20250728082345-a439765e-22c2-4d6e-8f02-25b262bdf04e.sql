-- Ajouter les colonnes reply si elles n'existent pas déjà
DO $$ 
BEGIN
    -- Ajouter reply_to_id si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'channel_messages' 
                   AND column_name = 'reply_to_id') THEN
        ALTER TABLE public.channel_messages ADD COLUMN reply_to_id UUID NULL;
    END IF;

    -- Ajouter reply_to_content si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'channel_messages' 
                   AND column_name = 'reply_to_content') THEN
        ALTER TABLE public.channel_messages ADD COLUMN reply_to_content TEXT NULL;
    END IF;

    -- Ajouter reply_to_username si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'channel_messages' 
                   AND column_name = 'reply_to_username') THEN
        ALTER TABLE public.channel_messages ADD COLUMN reply_to_username TEXT NULL;
    END IF;

    -- Ajouter reply_to_media_type si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'channel_messages' 
                   AND column_name = 'reply_to_media_type') THEN
        ALTER TABLE public.channel_messages ADD COLUMN reply_to_media_type TEXT NULL;
    END IF;
END $$;