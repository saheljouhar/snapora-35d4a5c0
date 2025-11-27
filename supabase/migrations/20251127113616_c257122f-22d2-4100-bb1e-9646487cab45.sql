-- Add likes column to event_photos table
ALTER TABLE public.event_photos 
ADD COLUMN likes integer NOT NULL DEFAULT 0;

-- Add index on likes for potential sorting/filtering
CREATE INDEX idx_event_photos_likes ON public.event_photos(likes);

-- Enable realtime for likes updates (already enabled but ensuring it's set)
ALTER TABLE public.event_photos REPLICA IDENTITY FULL;