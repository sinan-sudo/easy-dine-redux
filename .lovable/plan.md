

## SMS Flow Change: Send User SMS Only on Admin Approval

### Current behavior
- User books → SMS sent immediately to both user and admin
- Admin approves/rejects → no SMS sent

### New behavior
- User books → SMS sent only to **admin** (new booking alert)
- Admin approves → SMS sent to **user** (confirmation)
- Admin rejects → no SMS to user

### Changes

**1. Split edge function into two flows**

Update `supabase/functions/send-booking-sms/index.ts` to accept a `type` parameter:
- `type: "admin-alert"` — sends only the admin SMS about a new booking
- `type: "user-confirmation"` — sends only the user confirmation SMS

**2. Update `src/pages/Book.tsx` (handleSubmit)**

Change the SMS invoke call to send `type: "admin-alert"` so only the admin gets notified of the new booking. Update the success toast to say "Your reservation has been submitted for approval" instead of "Booking confirmed".

**3. Update `src/pages/Admin.tsx` (updateStatus)**

When admin confirms a reservation, invoke `send-booking-sms` with `type: "user-confirmation"` and the reservation's mobile number/details to notify the user their booking is approved.

### Technical details

- The edge function already receives all needed fields (mobile_number, date, time, table, party_size, occasion)
- Admin dashboard already has access to reservation data including `mobile_number` and related table info via the joined query
- No database schema changes needed

