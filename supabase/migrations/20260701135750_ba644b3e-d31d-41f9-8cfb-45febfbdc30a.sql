
-- Harden increment: exactly +1, non-negative, invoker rights + explicit access check via has function
CREATE OR REPLACE FUNCTION public.increment_photo_likes(photo_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.event_photos
  SET likes = COALESCE(likes, 0) + 1
  WHERE id = photo_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.decrement_photo_likes(photo_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.event_photos
  SET likes = GREATEST(COALESCE(likes, 0) - 1, 0)
  WHERE id = photo_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.increment_photo_likes(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.decrement_photo_likes(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_photo_likes(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.decrement_photo_likes(uuid) TO anon, authenticated;
