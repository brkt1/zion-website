# Testing Commission Seller and Quantity Saving

This guide explains how to test that commission seller ID and quantity are properly saved and updated when processing payments.

## Prerequisites

1. Make sure you have:
   - A commission seller created in the admin panel
   - An event that allows commission sellers (or no restrictions)
   - Access to browser developer console
   - Access to server logs (if testing locally)

## Test Scenarios

### Test 1: New Ticket with Commission Seller and Quantity

**Steps:**
1. Go to an event detail page
2. Select a commission seller from the dropdown
3. Select a quantity (e.g., 2 or 3 tickets)
4. Fill in payment form and complete payment
5. After payment success, check:

**What to Verify:**
- Browser Console (F12 → Console tab):
  - Look for logs like:
    ```
    Quantity info: { quantityParam: "2", parsedQuantity: 2, ... }
    Commission seller found: { id: "...", name: "..." }
    Saving ticket with data: { tx_ref: "...", quantity: 2, commission_seller_id: "..." }
    Ticket saved successfully: { id: "...", quantity: 2, commission_seller_id: "..." }
    ```

- Database Check:
  ```sql
  SELECT tx_ref, quantity, commission_seller_id, commission_seller_name 
  FROM tickets 
  WHERE tx_ref = 'YOUR_TX_REF'
  ORDER BY created_at DESC 
  LIMIT 1;
  ```
  - `quantity` should match what you selected
  - `commission_seller_id` should match the selected seller's ID
  - `commission_seller_name` should match the seller's name

### Test 2: New Ticket without Commission Seller

**Steps:**
1. Go to an event detail page
2. Leave commission seller dropdown empty (or select "None")
3. Select a quantity (e.g., 1 ticket)
4. Complete payment

**What to Verify:**
- Browser Console:
  - Should NOT show "Commission seller found" log
  - Should show: `commission_seller_id: undefined` in the save log
- Database:
  - `commission_seller_id` should be `NULL`
  - `quantity` should be 1 (or whatever you selected)

### Test 3: Update Existing Ticket

**Steps:**
1. Complete a payment (creates a ticket)
2. Note the `tx_ref` from the success page
3. Go back to the same event and make another payment with:
   - Different commission seller
   - Different quantity
   - Use the SAME email/phone (or manually set the same tx_ref in URL)
4. Actually, better approach: Manually test the update function

**Manual Update Test:**
1. Create a ticket first (Test 1)
2. Note the `tx_ref`
3. In browser console on PaymentSuccess page, you can check if update logic works by:
   - Looking at the logs when you refresh the payment success page
   - It should detect existing ticket and update it

**What to Verify:**
- Browser Console:
  ```
  Ticket already exists in database, checking if update is needed
  Updating ticket with: { commission_seller_id: "...", quantity: 3, ... }
  Ticket updated successfully with commission_seller_id and quantity
  ```
- Database:
  - The ticket should have updated `quantity` and `commission_seller_id`

### Test 4: Edge Cases

#### Test 4a: Empty String Commission Seller
- If commission seller ID comes as empty string, it should be saved as NULL
- Check logs: should show `commission_seller_id: null`

#### Test 4b: Invalid Quantity
- If quantity is 0 or negative, it should default to 1
- Check logs: should show `quantity: 1` even if invalid value was passed

#### Test 4c: Missing Quantity Parameter
- If quantity is not in URL, should default to 1
- Check logs: should show warning "No quantity param in URL, defaulting to 1"

## Quick Test Checklist

- [ ] New ticket saves with commission seller ID
- [ ] New ticket saves with correct quantity
- [ ] New ticket without commission seller saves correctly (NULL)
- [ ] Existing ticket updates with commission seller ID
- [ ] Existing ticket updates with quantity
- [ ] Empty string commission seller ID is handled (becomes NULL)
- [ ] Invalid quantity defaults to 1
- [ ] Database shows correct values

## Database Verification Queries

### Check recent tickets with commission sellers:
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
WHERE commission_seller_id IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;
```

### Check tickets with quantity > 1:
```sql
SELECT 
  tx_ref,
  quantity,
  commission_seller_id,
  amount,
  status
FROM tickets
WHERE quantity > 1
ORDER BY created_at DESC
LIMIT 10;
```

### Verify a specific ticket:
```sql
SELECT 
  t.*,
  cs.name as seller_name
FROM tickets t
LEFT JOIN commission_sellers cs ON t.commission_seller_id = cs.id
WHERE t.tx_ref = 'YOUR_TX_REF';
```

## Browser Console Logs to Look For

### Successful Save:
```
✅ Quantity info: { quantityParam: "2", parsedQuantity: 2, amount: 100, commission_seller_id_param: "uuid-here" }
✅ Commission seller found: { id: "uuid-here", name: "Seller Name" }
✅ Saving ticket with data: { tx_ref: "...", amount: 100, quantity: 2, commission_seller_id: "uuid-here", commission_seller_name: "Seller Name" }
✅ Ticket saved successfully: { id: "...", tx_ref: "...", quantity: 2, commission_seller_id: "uuid-here" }
```

### Successful Update:
```
✅ Ticket already exists in database, checking if update is needed
✅ Updating ticket with: { commission_seller_id: "uuid-here", quantity: 3, existing_commission_seller_id: null, existing_quantity: 1 }
✅ Ticket updated successfully with commission_seller_id and quantity
```

### Errors to Watch For:
```
❌ Error saving ticket: [error details]
❌ Error fetching commission seller: [error details]
❌ Invalid quantity param: [value] defaulting to 1
❌ No quantity param in URL, defaulting to 1
```

## Testing via Admin Panel

After creating tickets, you can also verify in the admin panel:

1. Go to Admin → Dashboard
2. Check the tickets list
3. Look for:
   - Quantity column showing correct values
   - Commission seller information (if applicable)
4. Go to Admin → Commission Sellers → [Select Seller] → Sales
5. Verify tickets appear with correct quantities

## Server-Side Testing

If you have access to server logs, check for:

### Payment Initialization:
```
Payment initialization request received: { body: { commission_seller_id: "...", quantity: 2, ... } }
```

### Return URL:
```
return_url: "https://yoursite.com/payment/success?tx_ref=...&quantity=2&commission_seller_id=..."
```

## Troubleshooting

### Issue: Commission seller not saving
- Check browser console for errors
- Verify commission_seller_id is in the URL parameters on PaymentSuccess page
- Check if commission seller exists in database
- Verify the ID format (should be UUID)

### Issue: Quantity always 1
- Check URL parameters on PaymentSuccess page: `?quantity=2&...`
- Check browser console for "No quantity param in URL" warning
- Verify quantity is being passed in payment initialization

### Issue: Update not working
- Check if ticket already exists in database
- Verify the update logic is being triggered (check logs)
- Check database for updated_at timestamp

## Automated Testing (Future)

Consider adding unit tests for:
- `saveTicket` function with various inputs
- `updateTicket` function
- Validation logic for commission_seller_id and quantity
- Edge cases (empty strings, invalid numbers, etc.)

