import { useState } from 'react';
import { X, Calendar, Users, CreditCard, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Hotel, Room } from '../lib/database.types';

interface BookingFormProps {
  hotel: Hotel;
  room: Room;
  onClose: () => void;
}

const ROOM_IMAGES: Record<string, string> = {
  "Standard Room": "/image.png",
  "Deluxe Room": "/de3.png",
};

export default function BookingForm({ hotel, room, onClose }: BookingFormProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [bookingData, setBookingData] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    checkIn: '',
    checkOut: '',
    numGuests: 1,
    specialRequests: '',
    includeBreakfast: false
  });

  const calculateNights = () => {
    if (!bookingData.checkIn || !bookingData.checkOut) return 0;
    const start = new Date(bookingData.checkIn);
    const end = new Date(bookingData.checkOut);
    const diff = end.getTime() - start.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const calculateTotal = () => {
    const basePrice = room.price_per_night;
    const breakfastPrice = bookingData.includeBreakfast ? 200 : 0;
    return calculateNights() * (basePrice + breakfastPrice);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 1) {
      setStep(2);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('bookings').insert({
        hotel_id: hotel.id,
        room_id: room.id,
        guest_name: bookingData.guestName,
        guest_email: bookingData.guestEmail,
        guest_phone: bookingData.guestPhone,
        check_in: bookingData.checkIn,
        check_out: bookingData.checkOut,
        num_guests: bookingData.numGuests,
        total_price: calculateTotal(),
        status: 'confirmed',
        special_requests: bookingData.specialRequests
      });

      if (error) throw error;

      setStep(3);
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">
            {step === 3 ? 'Booking Confirmed!' : 'Complete Your Booking'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {step !== 3 && (
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <div className="flex items-start gap-4">
                <img
                  src={room.image_url}
                  alt={room.room_type}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-slate-900">{hotel.name}</h3>
                  <p className="text-gray-600">{room.room_type}</p>
                  <p className="text-amber-600 font-semibold mt-1">
                    ₹{room.price_per_night.toLocaleString('en-IN')}/night
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="inline mr-1" size={16} />
                    Check-in Date
                  </label>
                  <input
                    type="date"
                    required
                    value={bookingData.checkIn}
                    onChange={(e) => setBookingData({ ...bookingData, checkIn: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="inline mr-1" size={16} />
                    Check-out Date
                  </label>
                  <input
                    type="date"
                    required
                    value={bookingData.checkOut}
                    onChange={(e) => setBookingData({ ...bookingData, checkOut: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="inline mr-1" size={16} />
                  Number of Guests
                </label>
                <select
                  value={bookingData.numGuests}
                  onChange={(e) => setBookingData({ ...bookingData, numGuests: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  {Array.from({ length: room.max_guests }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={bookingData.guestName}
                  onChange={(e) => setBookingData({ ...bookingData, guestName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={bookingData.guestEmail}
                  onChange={(e) => setBookingData({ ...bookingData, guestEmail: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={bookingData.guestPhone}
                  onChange={(e) => setBookingData({ ...bookingData, guestPhone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Add-ons
                </label>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bookingData.includeBreakfast}
                      onChange={(e) => setBookingData({ ...bookingData, includeBreakfast: e.target.checked })}
                      className="w-5 h-5 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                    />
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">Include Breakfast</span>
                      <p className="text-sm text-gray-600">Daily breakfast for all guests</p>
                    </div>
                    <span className="font-semibold text-amber-600">+₹200/night</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Requests (Optional)
                </label>
                <textarea
                  value={bookingData.specialRequests}
                  onChange={(e) => setBookingData({ ...bookingData, specialRequests: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  rows={3}
                  placeholder="Any special requirements or requests..."
                />
              </div>

              {calculateNights() > 0 && (
                <div className="bg-amber-50 rounded-lg p-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700">
                      ₹{room.price_per_night.toLocaleString('en-IN')} × {calculateNights()} night{calculateNights() > 1 ? 's' : ''}
                    </span>
                    <span className="font-semibold">₹{(room.price_per_night * calculateNights()).toLocaleString('en-IN')}</span>
                  </div>
                  {bookingData.includeBreakfast && (
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-700">
                        Breakfast × {calculateNights()} night{calculateNights() > 1 ? 's' : ''}
                      </span>
                      <span className="font-semibold">₹{(200 * calculateNights()).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="border-t border-amber-200 pt-2 flex justify-between">
                    <span className="font-bold text-lg">Total</span>
                    <span className="font-bold text-lg text-amber-600">₹{calculateTotal().toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-amber-600 text-white py-4 rounded-lg hover:bg-amber-700 transition-colors font-medium text-lg"
              >
                Continue to Payment
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-amber-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700">
                    ₹{room.price_per_night.toLocaleString('en-IN')} × {calculateNights()} night{calculateNights() > 1 ? 's' : ''}
                  </span>
                  <span className="font-semibold">₹{(room.price_per_night * calculateNights()).toLocaleString('en-IN')}</span>
                </div>
                {bookingData.includeBreakfast && (
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700">
                      Breakfast × {calculateNights()} night{calculateNights() > 1 ? 's' : ''}
                    </span>
                    <span className="font-semibold">₹{(200 * calculateNights()).toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="border-t border-amber-200 pt-2 flex justify-between">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-lg text-amber-600">₹{calculateTotal().toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <CreditCard className="inline mr-1" size={16} />
                  Card Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="MM/YY"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="123"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-600 text-white py-4 rounded-lg hover:bg-amber-700 transition-colors font-medium text-lg disabled:opacity-50"
              >
                {loading ? 'Processing...' : `Pay ₹${calculateTotal().toLocaleString('en-IN')}`}
              </button>
            </form>
          )}

          {step === 3 && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="text-green-600" size={40} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Booking Confirmed!</h3>
              <p className="text-gray-600 mb-6">
                Your reservation at {hotel.name} has been confirmed. We've sent a confirmation email to {bookingData.guestEmail}.
              </p>

              <div className="bg-gray-50 rounded-xl p-6 text-left mb-6">
                <h4 className="font-bold text-lg mb-4">Booking Details</h4>
                <div className="space-y-2 text-gray-700">
                  <p><span className="font-semibold">Hotel:</span> {hotel.name}</p>
                  <p><span className="font-semibold">Room:</span> {room.room_type}</p>
                  <p><span className="font-semibold">Guest:</span> {bookingData.guestName}</p>
                  <p><span className="font-semibold">Check-in:</span> {bookingData.checkIn}</p>
                  <p><span className="font-semibold">Check-out:</span> {bookingData.checkOut}</p>
                  <p><span className="font-semibold">Guests:</span> {bookingData.numGuests}</p>
                  <p><span className="font-semibold">Total:</span> ₹{calculateTotal().toLocaleString('en-IN')}</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full bg-amber-600 text-white py-4 rounded-lg hover:bg-amber-700 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
