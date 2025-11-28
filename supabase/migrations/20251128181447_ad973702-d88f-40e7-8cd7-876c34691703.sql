-- Add new columns to Events table for enhanced event management
ALTER TABLE "Events" 
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  ADD COLUMN IF NOT EXISTS date DATE,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';

-- Create index for faster queries on event status
CREATE INDEX IF NOT EXISTS idx_events_status ON "Events"(status);

-- Create index for faster queries on event date
CREATE INDEX IF NOT EXISTS idx_events_date ON "Events"(date);

-- Update RLS policy to allow admin insert on Events
CREATE POLICY "Allow admin insert on events"
ON "Events"
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Update RLS policy to allow admin update on Events
CREATE POLICY "Allow admin update on events"
ON "Events"
FOR UPDATE
TO authenticated
USING (true);

-- Update RLS policy to allow admin delete on Events
CREATE POLICY "Allow admin delete on events"
ON "Events"
FOR DELETE
TO authenticated
USING (true);