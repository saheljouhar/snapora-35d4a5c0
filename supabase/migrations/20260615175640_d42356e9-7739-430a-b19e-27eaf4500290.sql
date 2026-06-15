
-- 1) Admin roles infrastructure
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

-- 2) Bookings: lock down to admins only (keep public INSERT)
DROP POLICY IF EXISTS "Allow authenticated read access to bookings" ON public."Bookings";
DROP POLICY IF EXISTS "Allow authenticated update on bookings" ON public."Bookings";
DROP POLICY IF EXISTS "Allow authenticated delete on bookings" ON public."Bookings";

CREATE POLICY "Admins can read bookings"
ON public."Bookings" FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update bookings"
ON public."Bookings" FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete bookings"
ON public."Bookings" FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

REVOKE SELECT ON public."Bookings" FROM anon;

-- 3) Events: restrict write paths to admins
DROP POLICY IF EXISTS "Allow authenticated insert on events" ON public."Events";
DROP POLICY IF EXISTS "Allow authenticated update on events" ON public."Events";
DROP POLICY IF EXISTS "Allow authenticated delete on events" ON public."Events";

CREATE POLICY "Admins can insert events"
ON public."Events" FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update events"
ON public."Events" FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete events"
ON public."Events" FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 4) event_photos: remove public UPDATE, restrict modifications to admins.
DROP POLICY IF EXISTS "Allow public update of event photos" ON public.event_photos;

CREATE POLICY "Admins can update event photos"
ON public.event_photos FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete event photos"
ON public.event_photos FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Likes RPC stays SECURITY DEFINER so public can increment via the function (only)
REVOKE EXECUTE ON FUNCTION public.increment_photo_likes(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_photo_likes(uuid) TO anon, authenticated;

-- 5) Tighten get_event_poster (Events is publicly readable, no need for DEFINER)
CREATE OR REPLACE FUNCTION public.get_event_poster(event_id_param text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT poster_url FROM public."Events" WHERE event_id = event_id_param LIMIT 1;
$$;

-- 6) Storage: remove public DELETE on event_photos bucket; admins only
DROP POLICY IF EXISTS "Allow public delete from event_photos bucket" ON storage.objects;

CREATE POLICY "Admins can delete event_photos bucket files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'event_photos' AND public.has_role(auth.uid(), 'admin'));
