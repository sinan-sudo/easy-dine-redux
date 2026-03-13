

## Issues Found

### 1. SMS Not Sending
The edge function logs show Fast2SMS is returning: `"You need to complete one transaction of 100 INR or more before using API route."` This is a **Fast2SMS account limitation**, not a code bug. Your Fast2SMS account needs a minimum recharge of ₹100 before the API route becomes active. You need to log into your Fast2SMS dashboard and add funds.

The code itself is working correctly -- the edge function is being called, the API key is valid, and the request reaches Fast2SMS. The API simply rejects it because the account hasn't been activated with a payment.

**No code change needed for this.** Once you recharge your Fast2SMS account with ₹100+, the SMS will start working automatically.

### 2. Currency Change ($ to ₹)
In `src/pages/Book.tsx` line 301, the menu item price displays with `$`. This needs to be changed to `₹`.

### Implementation
- **File**: `src/pages/Book.tsx`
- **Change**: Replace `${item.price.toFixed(2)}` with `₹{item.price.toFixed(2)}` on the pre-order menu display

