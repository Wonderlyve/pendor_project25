-- Add views column to debriefings table
ALTER TABLE public.debriefings ADD COLUMN views integer NOT NULL DEFAULT 0;

-- Create debriefing_views table to track unique views per user
CREATE TABLE public.debriefing_views (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  debriefing_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(debriefing_id, user_id)
);

-- Enable RLS on debriefing_views
ALTER TABLE public.debriefing_views ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for debriefing_views
CREATE POLICY "Users can create their own debriefing views" 
ON public.debriefing_views 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view all debriefing views" 
ON public.debriefing_views 
FOR SELECT 
USING (true);

-- Create function to update debriefing views count
CREATE OR REPLACE FUNCTION public.update_debriefing_views_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.debriefings 
    SET views = views + 1 
    WHERE id = NEW.debriefing_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.debriefings 
    SET views = views - 1 
    WHERE id = OLD.debriefing_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for debriefing views
CREATE TRIGGER update_debriefing_views_count_trigger
  AFTER INSERT OR DELETE ON public.debriefing_views
  FOR EACH ROW
  EXECUTE FUNCTION public.update_debriefing_views_count();