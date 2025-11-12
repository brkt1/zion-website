# Quick Test Guide - Commission Seller & Quantity

## Fastest Way to Test

### Step 1: Prepare Test Data
1. **Create a Commission Seller** (if you don't have one):
   - Go to Admin → Commission Sellers
   - Click "Add New"
   - Fill in name, email, commission rate
   - Save and note the ID

2. **Create/Select an Event**:
   - Go to Admin → Events
   - Create or select an event
   - Make sure it allows commission sellers (or has no restrictions)

### Step 2: Test Payment Flow

1. **Open Browser Developer Tools** (F12)
   - Go to Console tab
   - Keep it open during the test

2. **Navigate to Event Page**:
   - Go to the public event page
   - Click "Buy Tickets" or "Register"

3. **Fill Payment Form**:
   - Select a **Commission Seller** from dropdown
   - Select **Quantity: 2** (or any number > 1)
   - Fill in customer details
   - Submit payment

4. **Complete Payment**:
   - Complete the payment process
   - You'll be redirected to Payment Success page

### Step 3: Verify in Console

Look for these logs in the browser console:

```
✅ Quantity info: { quantityParam: "2", parsedQuantity: 2, ... }
✅ Commission seller found: { id: "...", name: "..." }
✅ Saving ticket with data: { quantity: 2, commission_seller_id: "..." }
✅ Ticket saved successfully: { quantity: 2, commission_seller_id: "..." }
```

### Step 4: Verify in Database

Run this SQL query in Supabase SQL Editor:

```sql
-- Get the most recent ticket
SELECT 
  tx_ref,
  quantity,
  commission_seller_id,
  commission_seller_name,
  amount,
  status,
  created_at
FROM tickets
ORDER BY created_at DESC
LIMIT 1;
```

**Expected Results:**
- `quantity` = 2 (or whatever you selected)
- `commission_seller_id` = UUID of selected seller
- `commission_seller_name` = Name of selected seller

### Step 5: Test Update (Optional)

To test the update functionality:

1. **Get the tx_ref** from the payment success page URL
2. **Manually check** if the ticket exists:
   ```sql
   SELECT * FROM tickets WHERE tx_ref = 'YOUR_TX_REF';
   ```
3. **Refresh the payment success page** (or visit it again with the same tx_ref)
4. **Check console** for update logs:
   ```
   Ticket already exists in database, checking if update is needed
   ```

## Quick Verification Checklist

- [ ] Console shows quantity in logs
- [ ] Console shows commission_seller_id in logs
- [ ] Database shows correct quantity
- [ ] Database shows correct commission_seller_id
- [ ] Database shows commission_seller_name

## Common Issues

### "No quantity param in URL"
- **Cause**: Quantity not being passed in return URL
- **Fix**: Check server logs to see if quantity is in payment initialization

### "Commission seller not found"
- **Cause**: Invalid commission_seller_id or seller doesn't exist
- **Fix**: Verify seller exists in database and ID is correct

### Quantity is always 1
- **Cause**: Quantity not being passed or parsed correctly
- **Fix**: Check URL parameters on PaymentSuccess page: `?quantity=2&...`

## Test Without Payment (Development)

If you want to test without making actual payments:

1. **Use Test Mode** in Chapa (if available)
2. **Or manually insert a test ticket**:
   ```sql
   INSERT INTO tickets (
     tx_ref, 
     quantity, 
     commission_seller_id,
     commission_seller_name,
     customer_email,
     amount,
     currency,
     status
   ) VALUES (
     'TEST-' || gen_random_uuid()::text,
     2,
     'YOUR_SELLER_ID',
     'Test Seller',
     'test@example.com',
     100,
     'ETB',
     'success'
   );
   ```

3. **Then test the update function** by visiting:
   ```
   /payment/success?tx_ref=YOUR_TEST_TX_REF&quantity=3&commission_seller_id=YOUR_SELLER_ID
   ```

