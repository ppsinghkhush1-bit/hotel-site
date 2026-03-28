import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface BookingEmailRequest {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  pricePerNight: number;
  totalAmount: number;
  specialRequests?: string;
  amenities?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const bookingData: BookingEmailRequest = await req.json();

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
    .detail-row:last-child { border-bottom: none; }
    .label { font-weight: bold; color: #4b5563; }
    .value { color: #111827; }
    .total { background: #ecfdf5; padding: 20px; border-radius: 8px; margin-top: 20px; }
    .total-amount { font-size: 32px; font-weight: bold; color: #059669; }
    .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 28px;">New Booking Received!</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Hotel Green Garden</p>
    </div>

    <div class="content">
      <h2 style="color: #059669; margin-top: 0;">Guest Information</h2>
      <div class="booking-details">
        <div class="detail-row">
          <span class="label">Guest Name:</span>
          <span class="value">${bookingData.customerName}</span>
        </div>
        <div class="detail-row">
          <span class="label">Email:</span>
          <span class="value">${bookingData.customerEmail}</span>
        </div>
        <div class="detail-row">
          <span class="label">Phone:</span>
          <span class="value">${bookingData.customerPhone}</span>
        </div>
      </div>

      <h2 style="color: #059669;">Booking Details</h2>
      <div class="booking-details">
        <div class="detail-row">
          <span class="label">Room Type:</span>
          <span class="value">${bookingData.roomName}</span>
        </div>
        <div class="detail-row">
          <span class="label">Check-in Date:</span>
          <span class="value">${new Date(bookingData.checkIn).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
        <div class="detail-row">
          <span class="label">Check-out Date:</span>
          <span class="value">${new Date(bookingData.checkOut).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
        <div class="detail-row">
          <span class="label">Number of Guests:</span>
          <span class="value">${bookingData.guests}</span>
        </div>
        <div class="detail-row">
          <span class="label">Number of Nights:</span>
          <span class="value">${bookingData.nights}</span>
        </div>
        ${bookingData.amenities ? `
        <div class="detail-row">
          <span class="label">Amenities:</span>
          <span class="value">${bookingData.amenities}</span>
        </div>
        ` : ''}
        ${bookingData.specialRequests ? `
        <div class="detail-row">
          <span class="label">Special Requests:</span>
          <span class="value">${bookingData.specialRequests}</span>
        </div>
        ` : ''}
      </div>

      <div class="total">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 14px; color: #6b7280; margin-bottom: 5px;">Price per Night</div>
            <div style="font-size: 18px; color: #111827;">₹${bookingData.pricePerNight.toLocaleString('en-IN')}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 14px; color: #6b7280; margin-bottom: 5px;">Total Amount</div>
            <div class="total-amount">₹${bookingData.totalAmount.toLocaleString('en-IN')}</div>
          </div>
        </div>
      </div>

      <div class="footer">
        <p>This booking was made through the Hotel Green Garden website.</p>
        <p>Please contact the guest to confirm the booking.</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    if (!resendApiKey) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Booking saved (email not configured)'
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Hotel Green Garden <onboarding@resend.dev>',
        to: ['hotelgreengarden0112@gmail.com'],
        subject: `New Booking: ${bookingData.roomName} - ${bookingData.customerName}`,
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('Resend API error:', errorText);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Booking saved (email delivery failed)',
          error: errorText
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const result = await emailResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Booking confirmed and email sent successfully',
        emailId: result.id
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error processing booking email:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
