-- Add id column to Bookings table
ALTER TABLE "Bookings" ADD COLUMN IF NOT EXISTS id SERIAL UNIQUE;