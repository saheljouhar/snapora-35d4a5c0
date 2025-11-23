-- Add name column to Events table
ALTER TABLE "Events" 
ADD COLUMN IF NOT EXISTS name TEXT DEFAULT '';

-- Update existing events to have their event_id as name (backward compatibility)
UPDATE "Events" SET name = event_id WHERE name = '';

-- Create event_photos table to store uploaded photos
CREATE TABLE IF NOT EXISTS public.event_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL,
  photo_url TEXT NOT NULL,
  thumbnail_url TEXT,
  device_info TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_event_photos_event_id ON public.event_photos(event_id);
CREATE INDEX IF NOT EXISTS idx_event_photos_created_at ON public.event_photos(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.event_photos ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to event photos"
ON public.event_photos
FOR SELECT
USING (true);

-- Create policy for public insert (guests can upload)
CREATE POLICY "Allow public insert of event photos"
ON public.event_photos
FOR INSERT
WITH CHECK (true);

-- Enable real-time for event_photos table
ALTER TABLE public.event_photos REPLICA IDENTITY FULL;

-- Add table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.event_photos;