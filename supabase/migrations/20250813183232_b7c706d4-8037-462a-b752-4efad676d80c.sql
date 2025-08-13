-- First, ensure the Bookings table exists with proper structure
CREATE TABLE IF NOT EXISTS "Bookings" (
    client_name text NOT NULL DEFAULT 'Guest''s full name',
    phone text NOT NULL DEFAULT 'Phone number',
    email text DEFAULT 'Contact email',
    event_type text DEFAULT 'Type of event (dropdown selection)',
    event_location text DEFAULT 'Location of the event',
    event_date date,
    submission_date timestamp without time zone DEFAULT now(),
    status text DEFAULT 'e.g., "Pending", "Contacted", "Booked"'
);

-- Enable Row Level Security on Bookings table
ALTER TABLE "Bookings" ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to insert bookings (since it's a public booking form)
CREATE POLICY "Allow public booking submissions" ON "Bookings"
    FOR INSERT 
    WITH CHECK (true);

-- Create a policy that prevents public reading of bookings (admin only access)
CREATE POLICY "Admin only read access" ON "Bookings"
    FOR SELECT 
    USING (false); -- This will be updated later when authentication is implemented