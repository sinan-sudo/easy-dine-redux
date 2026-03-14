

## Plan: Switch SMS Gateway from Fast2SMS to TextBee

### Overview
Replace the Fast2SMS API call in the `send-booking-sms` edge function with TextBee's API. Store the TextBee API key and device ID as secrets.

### Steps

1. **Store secrets**
   - Add `TEXTBEE_API_KEY` with value `69a80e8d0a6ce183b394d7a7`
   - Add `TEXTBEE_DEVICE_ID` with value `Redmi 23124RN87G`

2. **Update `supabase/functions/send-booking-sms/index.ts`**
   - Replace Fast2SMS API call with TextBee endpoint:
     ```
     POST https://api.textbee.dev/api/v1/gateway/devices/{DEVICE_ID}/send-sms
     Headers: { x-api-key: API_KEY, Content-Type: application/json }
     Body: { recipients: ["+91XXXXXXXXXX"], message: "..." }
     ```
   - Read `TEXTBEE_API_KEY` and `TEXTBEE_DEVICE_ID` from env
   - Send the full mobile number with country code (TextBee expects it)
   - Keep the same message format and CORS setup

3. **Redeploy the edge function** (automatic)

No frontend changes needed — the edge function interface stays the same.

