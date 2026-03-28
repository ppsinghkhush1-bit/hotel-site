/*
  # Add gallery images field to rooms table

  1. Changes
    - Add `gallery_images` column to `rooms` table to store array of image URLs
    - This allows each room to have multiple images for the photo gallery
  
  2. Notes
    - Default gallery will include the main image_url plus 3 additional images
    - Array format allows flexible number of images per room
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rooms' AND column_name = 'gallery_images'
  ) THEN
    ALTER TABLE rooms ADD COLUMN gallery_images text[] DEFAULT ARRAY[]::text[];
  END IF;
END $$;

-- Update existing rooms with default gallery images
UPDATE rooms
SET gallery_images = ARRAY[
  image_url,
  '/room-view-2.png',
  '/10.jpg',
  '/image.png'
]
WHERE gallery_images = ARRAY[]::text[] OR gallery_images IS NULL;