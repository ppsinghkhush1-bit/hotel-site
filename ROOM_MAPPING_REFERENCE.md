# Room Mapping Utilities - Quick Reference

## Location
`src/lib/roomMapping.ts`

## Usage Examples

### In Components

#### Example 1: Map Room Name
```typescript
import { mapRoomName } from '../lib/roomMapping';

const displayName = mapRoomName(room.room_type);
// "Twin Room" → "Premium Room"
```

#### Example 2: Get Image URL with Fallback
```typescript
import { getImageUrl } from '../lib/roomMapping';

const imageUrl = getImageUrl(mappedName, room.image_url);
// Returns mapped image or database URL or fallback
```

#### Example 3: Check if Premium Room
```typescript
import { isPremiumRoom } from '../lib/roomMapping';

if (isPremiumRoom(mappedName)) {
  // Disable booking, show unavailable
}
```

#### Example 4: Get Availability Status
```typescript
import { getAvailabilityStatus } from '../lib/roomMapping';

const status = getAvailabilityStatus(mappedName, availableRooms);
// Returns: 'available' | 'unavailable' | 'premium'
```

---

## Mapping Tables

### Room Name Mapping
| Raw Type | Mapped Display Name |
|----------|-------------------|
| Budget Room | Standard Room |
| Standard Room | Deluxe Room |
| Twin Room | Premium Room |
| (any other) | (unchanged) |

### Image Mapping
| Room Type | Image Path |
|-----------|-----------|
| Standard Room | /standard-room.jpg |
| Deluxe Room | /deluxe-room.jpg |
| Premium Room | /premium-room.jpg |
| (undefined) | /hotel-room.jpg |

---

## Implementation in FeaturedRooms.tsx

```typescript
// At the top of the map() function
const mappedRoomName = mapRoomName(room.room_type);
const imageUrl = getImageUrl(mappedRoomName, room.image_url);
const isPremium = isPremiumRoom(mappedRoomName);

// Display room name
<h3>{mappedRoomName}</h3>

// Display image with fallback
<img
  src={imageUrl}
  alt={mappedRoomName}
  onError={(e) => {
    e.currentTarget.src = '/hotel-room.jpg';
  }}
/>

// Handle booking button
<button
  onClick={() => !isPremium && room.available_rooms > 0 && handleBookNow(room)}
  disabled={isPremium || room.available_rooms === 0}
>
  {isPremium ? 'Unavailable' : 'Book Now'}
</button>
```

---

## Implementation in RoomsPage.tsx

```typescript
// In fetchRooms() function
const mappedName = mapRoomName(room.room_type || '');
const imageUrl = getImageUrl(mappedName, room.image_url);
const isPremium = isPremiumRoom(mappedName);

// Create room object
return {
  id: roomId,
  name: mappedName,
  image: imageUrl,
  available: isPremium ? false : (room.available_rooms || 0) > 0,
  isPremiumRoom: isPremium,
  // ... other fields
};

// In handleBookNow()
if (room.isPremiumRoom) {
  return; // Prevent booking
}

// In amenity selection
disabled={!room.available || room.isPremiumRoom}
```

---

## Adding New Room Types

To add a new room type mapping:

1. **Update ROOM_NAME_MAPPING**
```typescript
export const ROOM_NAME_MAPPING: Record<string, string> = {
  'Budget Room': 'Standard Room',
  'Standard Room': 'Deluxe Room',
  'Twin Room': 'Premium Room',
  'Suite Room': 'Luxury Suite',  // Add new mapping
};
```

2. **Update ROOM_IMAGE_MAPPING** (if needed)
```typescript
export const ROOM_IMAGE_MAPPING: Record<string, string> = {
  'Standard Room': '/standard-room.jpg',
  'Deluxe Room': '/deluxe-room.jpg',
  'Premium Room': '/premium-room.jpg',
  'Luxury Suite': '/luxury-suite.jpg',  // Add new image
};
```

3. **Update Special Handling** (if needed)
```typescript
// If Luxury Suite should also be unavailable
export function isPremiumRoom(mappedRoomName: string): boolean {
  return ['Premium Room', 'Luxury Suite'].includes(mappedRoomName);
}
```

---

## Error Handling

### Image Error Fallback
```typescript
<img
  src={imageUrl}
  alt={mappedRoomName}
  onError={(e) => {
    e.currentTarget.src = '/hotel-room.jpg';  // Falls back to default
  }}
/>
```

### Null/Undefined Safeguards
```typescript
// Safe property access
const max_occupancy = room.max_occupancy || 2;
const bed_type = room.bed_type || 'Queen';
const description = room.description || 'Comfortable room';
const amenities = room.amenities || [];
```

---

## Testing Quick Checks

✅ Check room names are mapped correctly
✅ Verify images load without errors
✅ Confirm Premium rooms show "Unavailable"
✅ Test booking button is disabled for Premium
✅ Try amenity selection - disabled for Premium
✅ Verify fallback image appears on error
✅ Check null/undefined values show defaults

---

## Notes

- All mappings are case-sensitive
- Image paths are relative to public/ folder
- Premium rooms prevent any booking actions
- Fallback image is always /hotel-room.jpg
- Amenities work normally except for Premium rooms

