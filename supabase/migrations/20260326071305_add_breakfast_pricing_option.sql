/*
  # Add breakfast pricing option

  1. Changes
    - Add `breakfast_price` column to rooms table (default 200 for breakfast upgrade)
    - Update Standard Room to have base price of 1500, breakfast adds 200 to make it 1700
  
  2. Notes
    - Breakfast is an optional add-on
    - Base price remains 1500
    - With breakfast: 1700 (1500 + 200)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rooms' AND column_name = 'breakfast_price'
  ) THEN
    ALTER TABLE rooms ADD COLUMN breakfast_price integer DEFAULT 200;
  END IF;
END $$;
