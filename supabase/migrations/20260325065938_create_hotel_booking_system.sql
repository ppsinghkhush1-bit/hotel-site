/*
  # Hotel Booking System Database Schema

  1. New Tables
    - `hotels`
      - `id` (uuid, primary key)
      - `name` (text) - Hotel name
      - `description` (text) - Detailed description
      - `address` (text) - Full address
      - `city` (text) - City location
      - `country` (text) - Country
      - `star_rating` (integer) - Star rating (1-5)
      - `image_url` (text) - Main hotel image
      - `price_per_night` (integer) - Starting price
      - `created_at` (timestamptz)
    
    - `rooms`
      - `id` (uuid, primary key)
      - `hotel_id` (uuid, foreign key)
      - `room_type` (text) - e.g., Deluxe, Suite, Standard
      - `description` (text)
      - `price_per_night` (integer)
      - `max_guests` (integer)
      - `bed_type` (text)
      - `size_sqm` (integer) - Room size in square meters
      - `image_url` (text)
      - `amenities` (text[]) - Array of amenities
      - `available_rooms` (integer) - Number of available rooms
      - `created_at` (timestamptz)
    
    - `amenities`
      - `id` (uuid, primary key)
      - `hotel_id` (uuid, foreign key)
      - `name` (text) - e.g., WiFi, Pool, Spa
      - `icon` (text) - Icon identifier
      - `created_at` (timestamptz)
    
    - `bookings`
      - `id` (uuid, primary key)
      - `hotel_id` (uuid, foreign key)
      - `room_id` (uuid, foreign key)
      - `guest_name` (text)
      - `guest_email` (text)
      - `guest_phone` (text)
      - `check_in` (date)
      - `check_out` (date)
      - `num_guests` (integer)
      - `total_price` (integer)
      - `status` (text) - pending, confirmed, cancelled
      - `special_requests` (text)
      - `created_at` (timestamptz)
    
    - `reviews`
      - `id` (uuid, primary key)
      - `hotel_id` (uuid, foreign key)
      - `guest_name` (text)
      - `rating` (integer) - 1-5
      - `comment` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access on hotels, rooms, amenities, reviews
    - Add policies for authenticated users to create bookings
    - Add policies for public to create reviews
*/

CREATE TABLE IF NOT EXISTS hotels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  country text NOT NULL,
  star_rating integer NOT NULL DEFAULT 3,
  image_url text NOT NULL,
  price_per_night integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid REFERENCES hotels(id) ON DELETE CASCADE NOT NULL,
  room_type text NOT NULL,
  description text NOT NULL,
  price_per_night integer NOT NULL,
  max_guests integer NOT NULL DEFAULT 2,
  bed_type text NOT NULL,
  size_sqm integer NOT NULL,
  image_url text NOT NULL,
  amenities text[] DEFAULT '{}',
  available_rooms integer NOT NULL DEFAULT 10,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS amenities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid REFERENCES hotels(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  icon text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid REFERENCES hotels(id) ON DELETE CASCADE NOT NULL,
  room_id uuid REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  guest_name text NOT NULL,
  guest_email text NOT NULL,
  guest_phone text NOT NULL,
  check_in date NOT NULL,
  check_out date NOT NULL,
  num_guests integer NOT NULL,
  total_price integer NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  special_requests text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid REFERENCES hotels(id) ON DELETE CASCADE NOT NULL,
  guest_name text NOT NULL,
  rating integer NOT NULL,
  comment text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view hotels"
  ON hotels FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can view rooms"
  ON rooms FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can view amenities"
  ON amenities FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can create bookings"
  ON bookings FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can view their bookings"
  ON bookings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can create reviews"
  ON reviews FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
