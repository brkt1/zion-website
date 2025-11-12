# Testing Payment Flow - Commission Seller & Quantity

This guide shows how to test the complete payment flow to ensure commission_seller_id and quantity are passed correctly through each step.

## Payment Flow Steps

1. **Event Detail Page** → User selects commission seller and quantity
2. **Payment Initialization** → Data sent to server
3. **Chapa Payment** → User completes payment
4. **Payment Callback** → Chapa redirects back with parameters
5. **Payment Success Page** → Ticket saved/updated with data

## Step-by-Step Testing

### Step 1: Test Payment Initialization

**What to Check:** Verify data is sent correctly to the server when payment is initialized.

1. **Open Browser DevTools** (F12)
2. **Go to Network tab**
3. **Navigate to an event page**
4. **Fill payment form:**
   - Select commission seller
   - Select quantity (e.g., 2)
   - Fill customer details
5. **Click "Pay" or "Submit"**
6. **In Network tab, find the request to `/api/payments/initialize`**
7. **Click on it and check:**
   - **Request Payload** (or Request tab):
     ```json
     {
       "first_name": "...",
       "email": "...",
       "amount": "100.00",
       "quantity": 2,
       "commission_seller_id": "uuid-here",
       "event_id": "...",
       "event_title": "..."
     }
     ```
   - ✅ Verify `quantity` is present and correct
   - ✅ Verify `commission_seller_id` is present (if selected)

8. **Check Response:**
   - Should contain `checkout_url`
   - The `return_url` in the response should include parameters:
     ```
     /payment/success?tx_ref=...&quantity=2&commission_seller_id=uuid-here&...
     ```

### Step 2: Test Return URL Parameters

**What to Check:** Verify the return URL includes quantity and commission_seller_id.

1. **After clicking "Pay", you'll be redirected to Chapa**
2. **Before completing payment, check the browser address bar**
   - The return URL should be visible in the Chapa page (sometimes in page source)
3. **Or check server logs** for the return URL:
   ```
   return_url: "https://yoursite.com/payment/success?tx_ref=...&quantity=2&commission_seller_id=..."
   ```

### Step 3: Test Payment Completion

**What to Check:** Verify parameters are preserved when Chapa redirects back.

1. **Complete the payment on Chapa**
2. **You'll be redirected to:** `/payment/success?tx_ref=...&quantity=2&commission_seller_id=...`
3. **Check the URL in browser address bar:**
   ```
   https://yoursite.com/payment/success?tx_ref=YENEGE-123&quantity=2&commission_seller_id=uuid-here&event_id=...
   ```
   - ✅ `quantity` parameter should be in URL
   - ✅ `commission_seller_id` parameter should be in URL (if selected)

### Step 4: Test Payment Success Page

**What to Check:** Verify the page reads parameters and saves ticket correctly.

1. **On Payment Success page, open Console (F12)**
2. **Check for these logs:**
   ```
   Quantity info: { quantityParam: "2", parsedQuantity: 2, amount: 100, commission_seller_id_param: "uuid-here" }
   Commission seller found: { id: "uuid-here", name: "Seller Name" }
   Saving ticket with data: { tx_ref: "...", quantity: 2, commission_seller_id: "uuid-here", ... }
   Ticket saved successfully: { quantity: 2, commission_seller_id: "uuid-here" }
   ```

3. **Verify URL parameters are read:**
   - Run in console:
     ```javascript
     const params = new URLSearchParams(window.location.search);
     console.log('Quantity:', params.get('quantity'));
     console.log('Commission Seller ID:', params.get('commission_seller_id'));
     ```

### Step 5: Verify Database

**What to Check:** Final verification that data was saved correctly.

Run this SQL query:
```sql
SELECT 
  tx_ref,
  quantity,
  commission_seller_id,
  commission_seller_name,
  amount,
  status,
  created_at
FROM tickets
WHERE tx_ref = 'YOUR_TX_REF_FROM_URL'
ORDER BY created_at DESC
LIMIT 1;
```

## Testing with Different Scenarios

### Scenario 1: Payment with Commission Seller and Quantity > 1

**Test:**
- Select commission seller: "John Doe"
- Select quantity: 3
- Complete payment

**Expected:**
- ✅ Network request includes `quantity: 3` and `commission_seller_id: "uuid"`
- ✅ Return URL includes `quantity=3&commission_seller_id=uuid`
- ✅ Payment success URL includes both parameters
- ✅ Console shows quantity: 3 and commission seller info
- ✅ Database shows quantity: 3 and commission_seller_id

### Scenario 2: Payment without Commission Seller

**Test:**
- Leave commission seller empty
- Select quantity: 1
- Complete payment

**Expected:**
- ✅ Network request includes `quantity: 1` but no `commission_seller_id`
- ✅ Return URL includes `quantity=1` but no `commission_seller_id`
- ✅ Payment success URL includes `quantity=1` only
- ✅ Console shows quantity: 1, no commission seller logs
- ✅ Database shows quantity: 1, commission_seller_id: NULL

### Scenario 3: Payment with Quantity = 1 (default)

**Test:**
- Select commission seller
- Don't change quantity (defaults to 1)
- Complete payment

**Expected:**
- ✅ Network request includes `quantity: 1`
- ✅ Return URL includes `quantity=1`
- ✅ Database shows quantity: 1

## Network Tab Checklist

When testing payment initialization, check:

- [ ] Request to `/api/payments/initialize` is made
- [ ] Request payload includes `quantity`
- [ ] Request payload includes `commission_seller_id` (if selected)
- [ ] Response includes `checkout_url`
- [ ] Response `return_url` includes `quantity` parameter
- [ ] Response `return_url` includes `commission_seller_id` parameter (if selected)

## Common Issues & Solutions

### Issue: Quantity not in return URL

**Symptoms:**
- Payment works but quantity is always 1 in database
- Return URL doesn't have `quantity` parameter

**Check:**
1. Network tab → `/api/payments/initialize` request
2. Verify `quantity` is in request payload
3. Check server logs for return URL construction

**Fix:**
- Ensure quantity is passed in payment initialization
- Check `server/src/routes/payment.ts` line 82-83

### Issue: Commission Seller ID not in return URL

**Symptoms:**
- Commission seller selected but not saved
- Return URL doesn't have `commission_seller_id` parameter

**Check:**
1. Network tab → Request payload
2. Verify `commission_seller_id` is sent
3. Check if it's empty string (should be filtered out)

**Fix:**
- Ensure commission_seller_id is passed (not empty string)
- Check form submission includes the field

### Issue: Parameters lost during Chapa redirect

**Symptoms:**
- Parameters in return URL but not in final redirect URL

**Check:**
1. Check Chapa callback/redirect behavior
2. Verify return_url is properly formatted
3. Check if Chapa modifies the URL

**Fix:**
- Ensure return_url is absolute URL
- Check Chapa documentation for URL parameter handling

## Quick Test Script

Run this in browser console on Event Detail page before submitting payment:

```javascript
// Monitor payment initialization request
const originalFetch = window.fetch;
window.fetch = function(...args) {
  if (args[0].includes('/payments/initialize')) {
    console.log('🔍 Payment Initialization Request:', args);
    return originalFetch.apply(this, args)
      .then(response => {
        response.clone().json().then(data => {
          console.log('✅ Payment Response:', data);
          if (data.data?.checkout_url) {
            // Extract return URL from checkout_url or response
            console.log('📍 Checkout URL:', data.data.checkout_url);
          }
        });
        return response;
      });
  }
  return originalFetch.apply(this, args);
};

console.log('👀 Monitoring payment requests...');
```

Then submit the payment form and watch the console.

## Server-Side Logging

Check server logs for:

```
Payment initialization request received: { 
  body: { 
    quantity: 2, 
    commission_seller_id: "uuid-here",
    ...
  } 
}

return_url: "https://yoursite.com/payment/success?tx_ref=...&quantity=2&commission_seller_id=..."
```

## End-to-End Test Checklist

- [ ] Form submission includes quantity and commission_seller_id
- [ ] Payment initialization request includes both fields
- [ ] Server logs show both fields in request
- [ ] Return URL includes both parameters
- [ ] Payment success page URL includes both parameters
- [ ] Console logs show both values being read
- [ ] Ticket saved with correct quantity
- [ ] Ticket saved with correct commission_seller_id
- [ ] Database query confirms both values

