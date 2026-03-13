

## Plan: Add Fast2SMS Integration for Booking Confirmation

### Overview
Create a backend function that sends an SMS via Fast2SMS API after a successful booking, and show a popup dialog with booking details confirming the SMS was sent.

### Steps

1. **Store the Fast2SMS API key as a secret**
   - Use the `add_secret` tool to store `FAST2SMS_API_KEY` securely.

2. **Create edge function `send-booking-sms`**
   - File: `supabase/functions/send-booking-sms/index.ts`
   - Accepts: mobile number, reservation date, time slot, party size, table number, occasion
   - Calls Fast2SMS Quick SMS API (`https://www.fast2sms.com/dev/bulkV2`) with the stored API key
   - Composes a message like: "Your table is booked! Date: Mar 15, Time: 19:00, Table: 5, Guests: 4. See you soon! - EasyDine"
   - Includes CORS headers, proper error handling
   - Set `verify_jwt = false` in config.toml

3. **Update `src/pages/Book.tsx`**
   - After successful reservation insert, invoke the edge function (already calls `send-booking-sms`)
   - On success, show a **Dialog popup** with booking details and a message "Booking details sent to +91XXXXXXXXXX"
   - Dialog has a "View My Reservations" button that navigates to `/my-reservations`
   - Remove the immediate `navigate("/my-reservations")` — let the user dismiss the dialog first

### Technical Details

**Fast2SMS API call** (in edge function):
```
POST https://www.fast2sms.com/dev/bulkV2
Headers: { authorization: FAST2SMS_API_KEY }
Body: { route: "q", message: "...", language: "english", numbers: "9876543210" }
```

**Popup**: Uses the existing `Dialog` component from shadcn/ui to show confirmation with booking summary and SMS status.

