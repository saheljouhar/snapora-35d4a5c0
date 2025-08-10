-- Create function to get event poster URL by event ID
CREATE OR REPLACE FUNCTION public.get_event_poster(event_id_param TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    poster_url_result TEXT;
BEGIN
    -- Try to get poster_url from Events table where event_id matches
    SELECT poster_url INTO poster_url_result
    FROM public.Events
    WHERE event_id = event_id_param
    LIMIT 1;
    
    -- Return the poster URL or null if not found
    RETURN poster_url_result;
END;
$$;