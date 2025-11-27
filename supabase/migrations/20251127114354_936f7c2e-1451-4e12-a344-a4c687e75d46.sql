-- Add RLS policy to allow public updates to event_photos (for likes)
CREATE POLICY "Allow public update of event photos"
ON public.event_photos
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);