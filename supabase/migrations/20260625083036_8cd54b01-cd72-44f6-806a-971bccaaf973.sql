DROP POLICY IF EXISTS "Allow public insert of event photos" ON public.event_photos;

CREATE POLICY "Allow public insert of event photos"
ON public.event_photos
FOR INSERT
TO public
WITH CHECK (
  likes = 0
  AND EXISTS (SELECT 1 FROM public."Events" e WHERE e.event_id = event_photos.event_id)
);