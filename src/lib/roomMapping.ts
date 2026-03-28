/**
 * Room name mapping utility
 * Maps raw room type from database to display names
 */

export const ROOM_NAME_MAPPING: Record<string, string> = {
  'Budget Room': 'Standard Room',
  'Standard Room': 'Deluxe Room',
  'Twin Room': 'Premium Room',
  'Suite Room': 'Luxury Suite',
};

/**
 * Room image mapping
 * Maps room type to image URL
 */
export const ROOM_IMAGE_MAPPING: Record<string, string> = {
  'Standard Room': '/standard-room.jpg',
  'Deluxe Room': '/deluxe-room.jpg',
  'Premium Room': '/premium-room.jpg',
  'Luxury Suite': '/premium-room.jpg',
};

const DEFAULT_IMAGE = '/hotel-room.jpg';

/**
 * Maps raw room type to display name
 * @param roomType - The room type from database
 * @returns Mapped display name or original if no mapping exists
 */
export function mapRoomName(roomType: string): string {
  if (!roomType) return 'Room';
  return ROOM_NAME_MAPPING[roomType] || roomType;
}

/**
 * Gets the correct image URL for a room type
 * Falls back to room.image_url or default image if mapping not found
 * @param mappedRoomName - The mapped display name of the room
 * @param originalImageUrl - The image URL from database
 * @returns Image URL to use for rendering
 */
export function getImageUrl(mappedRoomName: string, originalImageUrl?: string): string {
  if (!mappedRoomName) {
    return originalImageUrl || DEFAULT_IMAGE;
  }
  
  // Try to find image in mapping
  const mappedImage = ROOM_IMAGE_MAPPING[mappedRoomName];
  if (mappedImage) {
    return mappedImage;
  }
  
  // Fall back to original URL or default
  return originalImageUrl || DEFAULT_IMAGE;
}

/**
 * Checks if a room is Premium Room (which should be unavailable for booking)
 * @param mappedRoomName - The mapped display name of the room
 * @returns true if room is Premium Room
 */
export function isPremiumRoom(mappedRoomName: string): boolean {
  return mappedRoomName === 'Premium Room' || mappedRoomName === 'Luxury Suite';
}

/**
 * Gets the availability label for a room
 * @param mappedRoomName - The mapped display name
 * @param availableRooms - Number of available rooms
 * @returns Availability status string
 */
export function getAvailabilityStatus(
  mappedRoomName: string,
  availableRooms: number
): 'available' | 'unavailable' | 'premium' {
  if (isPremiumRoom(mappedRoomName)) {
    return 'premium';
  }
  
  return availableRooms > 0 ? 'available' : 'unavailable';
}
