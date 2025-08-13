-- This migration ensures the Bookings table structure is properly recognized
-- The table should already exist, so we'll just add a comment to refresh the types
COMMENT ON TABLE "Bookings" IS 'Table for storing event booking requests';