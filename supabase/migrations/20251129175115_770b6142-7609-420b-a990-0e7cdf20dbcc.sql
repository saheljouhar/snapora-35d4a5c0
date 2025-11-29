-- Fix Bookings table RLS policies to allow authenticated users to read bookings
DROP POLICY IF EXISTS "Admin only read access" ON "Bookings";

-- Create new policy that allows authenticated users to read bookings
CREATE POLICY "Allow authenticated read access to bookings"
ON "Bookings"
FOR SELECT
TO authenticated
USING (true);

-- Also allow authenticated users to update and delete bookings
CREATE POLICY "Allow authenticated update on bookings"
ON "Bookings"
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated delete on bookings"
ON "Bookings"
FOR DELETE
TO authenticated
USING (true);