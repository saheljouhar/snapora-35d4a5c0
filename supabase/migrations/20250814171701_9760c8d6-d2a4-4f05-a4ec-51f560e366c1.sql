-- Create RLS policies for event_photos bucket to allow uploads and viewing

-- Allow anyone to upload photos to the event_photos bucket
CREATE POLICY "Allow public uploads to event_photos bucket"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'event_photos');

-- Allow anyone to view photos from the event_photos bucket
CREATE POLICY "Allow public access to event_photos bucket"
ON storage.objects
FOR SELECT
USING (bucket_id = 'event_photos');

-- Allow anyone to delete photos from the event_photos bucket (optional, for future admin functionality)
CREATE POLICY "Allow public delete from event_photos bucket"
ON storage.objects
FOR DELETE
USING (bucket_id = 'event_photos');