-- Allow channel_id to be nullable for public debriefings
ALTER TABLE public.debriefings ALTER COLUMN channel_id DROP NOT NULL;