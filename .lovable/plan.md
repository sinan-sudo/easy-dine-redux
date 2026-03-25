

## Admin-Specific Changes

Three changes scoped to admin users only:

### 1. Hide Chat Support link for admins in Navbar

In `src/components/Navbar.tsx`, wrap the Chat Support nav link so it only renders when `!isAdmin`.

### 2. Remove SupportBanner from Admin page

In `src/pages/Admin.tsx`, remove the `<SupportBanner />` component and its import.

### 3. Auto-confirm bookings when admin books a seat

In `src/pages/Book.tsx`, detect if the current user is an admin (via `useAuth`). If admin:
- Insert the reservation with `status: 'confirmed'` instead of default `'pending'`
- Send an SMS to the user immediately (type `user-confirmation`) instead of `admin-alert`
- Show a success toast saying "Reservation confirmed!" instead of "pending admin approval"

### Files to modify

- `src/components/Navbar.tsx` — conditionally hide Chat Support link for admins
- `src/pages/Admin.tsx` — remove SupportBanner import and usage
- `src/pages/Book.tsx` — add `isAdmin` from `useAuth`, branch logic in `handleSubmit` for auto-confirm + instant SMS

