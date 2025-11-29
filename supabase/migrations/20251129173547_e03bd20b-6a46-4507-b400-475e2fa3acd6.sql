-- Fix RLS policies for Events table to be permissive
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Allow admin insert on events" ON "Events";
DROP POLICY IF EXISTS "Allow admin update on events" ON "Events";
DROP POLICY IF EXISTS "Allow admin delete on events" ON "Events";

-- Create new permissive policies that allow authenticated users to manage events
CREATE POLICY "Allow authenticated insert on events"
ON "Events"
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated update on events"
ON "Events"
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated delete on events"
ON "Events"
FOR DELETE
TO authenticated
USING (true);