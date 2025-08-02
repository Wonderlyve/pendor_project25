-- Créer la table pour les réactions VIP pronos
CREATE TABLE public.vip_prono_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prono_id UUID NOT NULL,
  user_id UUID NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(prono_id, user_id, emoji)
);

-- Enable Row Level Security
ALTER TABLE public.vip_prono_reactions ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view all VIP prono reactions" 
ON public.vip_prono_reactions 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own VIP prono reactions" 
ON public.vip_prono_reactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own VIP prono reactions" 
ON public.vip_prono_reactions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add foreign key constraint (if vip_pronos table exists)
-- ALTER TABLE public.vip_prono_reactions 
-- ADD CONSTRAINT fk_vip_prono_reactions_prono_id 
-- FOREIGN KEY (prono_id) REFERENCES public.vip_pronos(id) ON DELETE CASCADE;