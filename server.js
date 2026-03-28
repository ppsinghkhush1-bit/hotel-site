import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { Resend } from "resend";

const app = express();
app.use(cors());
app.use(bodyParser.json());

const resend = new Resend("re_9u62JF7u_K9eY7LfmFGnaJxse42q3hU4A");

app.post("/send-booking", async (req, res) => {
  const { name, email, phone, room, guests, date } = req.body;

  try {
    await resend.emails.send({
      from: "Hotel Booking <onboarding@resend.dev>",
      to: ["hotelgreengarden0112@gmail.com"],
      subject: "New Room Booking 🏨",
      html: `
        <h2>New Booking Received</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${phone}</p>
        <p><b>Room:</b> ${room}</p>
        <p><b>Guests:</b> ${guests}</p>
        <p><b>Date:</b> ${date}</p>
      `,
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));