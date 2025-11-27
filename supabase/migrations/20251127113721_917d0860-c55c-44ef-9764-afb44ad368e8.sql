-- Create function to increment photo likes
CREATE OR REPLACE FUNCTION public.increment_photo_likes(photo_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.event_photos
  SET likes = likes + 1
  WHERE id = photo_id;
END;
$$;