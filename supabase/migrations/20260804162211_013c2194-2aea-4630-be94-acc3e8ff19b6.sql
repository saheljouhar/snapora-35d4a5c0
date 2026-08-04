CREATE TABLE IF NOT EXISTS public.event_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL,
  visited_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT INSERT ON public.event_visits TO anon;
GRANT SELECT, INSERT ON public.event_visits TO authenticated;
GRANT ALL ON public.event_visits TO service_role;

ALTER TABLE public.event_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public insert visits"
ON public.event_visits FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can read visits"
ON public.event_visits FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS event_visits_event_id_idx ON public.event_visits (event_id, visited_at DESC);