-- Enable Row Level Security on Events table and create public read policy
ALTER TABLE "Events" ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to read events (public access)
CREATE POLICY "Allow public read access to events" ON "Events"
    FOR SELECT 
    USING (true);