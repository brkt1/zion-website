# Browser Console Test Helper

You can use these functions in the browser console to quickly test and verify the commission seller and quantity functionality.

## Quick Test Functions

### 1. Check URL Parameters on Payment Success Page

Open the browser console on the Payment Success page and run:

```javascript
// Check what parameters are in the URL
const params = new URLSearchParams(window.location.search);
console.log('URL Parameters:');
console.log('  tx_ref:', params.get('tx_ref'));
console.log('  quantity:', params.get('quantity'));
console.log('  commission_seller_id:', params.get('commission_seller_id'));
console.log('  event_id:', params.get('event_id'));
```

### 2. Verify Ticket in Database (via API)

```javascript
// Replace with your actual tx_ref
const txRef = 'YOUR_TX_REF_HERE';

// This will check if the ticket exists and show its data
fetch(`/api/tickets/${txRef}`)
  .then(r => r.json())
  .then(data => {
    console.log('Ticket Data:', data);
    console.log('Quantity:', data.quantity);
    console.log('Commission Seller ID:', data.commission_seller_id);
    console.log('Commission Seller Name:', data.commission_seller_name);
  })
  .catch(err => console.error('Error:', err));
```

### 3. Test Update Function Manually

```javascript
// Test the update function directly
async function testUpdateTicket() {
  const txRef = prompt('Enter tx_ref:');
  const quantity = prompt('Enter quantity:', '2');
  const commissionSellerId = prompt('Enter commission_seller_id (or leave empty):');
  
  // You'll need to import or access the updateTicket function
  // This is just a template - adjust based on your API structure
  const response = await fetch('/api/tickets/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tx_ref: txRef,
      quantity: parseInt(quantity),
      commission_seller_id: commissionSellerId || null
    })
  });
  
  const result = await response.json();
  console.log('Update Result:', result);
}

// Run: testUpdateTicket()
```

### 4. Monitor Console Logs

Add this to watch for specific log messages:

```javascript
// Override console.log to filter relevant messages
const originalLog = console.log;
console.log = function(...args) {
  const message = args.join(' ');
  if (
    message.includes('quantity') || 
    message.includes('commission_seller') ||
    message.includes('Saving ticket') ||
    message.includes('Ticket saved') ||
    message.includes('Ticket updated')
  ) {
    originalLog.apply(console, ['✅', ...args]);
  } else {
    originalLog.apply(console, args);
  }
};
```

### 5. Check All Recent Tickets

```javascript
// This assumes you have an admin API endpoint
// Adjust the endpoint based on your API structure
async function checkRecentTickets() {
  try {
    const response = await fetch('/api/admin/tickets?limit=5');
    const tickets = await response.json();
    
    console.table(tickets.map(t => ({
      tx_ref: t.tx_ref?.substring(0, 10) + '...',
      quantity: t.quantity,
      commission_seller: t.commission_seller_name || 'None',
      amount: t.amount,
      status: t.status
    })));
  } catch (err) {
    console.error('Error fetching tickets:', err);
  }
}

// Run: checkRecentTickets()
```

## Quick Verification Script

Copy and paste this into the browser console on the Payment Success page:

```javascript
(function() {
  console.log('🔍 Testing Commission Seller & Quantity...\n');
  
  // Check URL params
  const params = new URLSearchParams(window.location.search);
  const txRef = params.get('tx_ref');
  const quantity = params.get('quantity');
  const commissionSellerId = params.get('commission_seller_id');
  
  console.log('📋 URL Parameters:');
  console.log('  ✅ tx_ref:', txRef || '❌ MISSING');
  console.log('  ✅ quantity:', quantity || '❌ MISSING (will default to 1)');
  console.log('  ✅ commission_seller_id:', commissionSellerId || '❌ MISSING (will be NULL)');
  
  // Check if we're on payment success page
  if (window.location.pathname.includes('/payment/success')) {
    console.log('\n✅ On Payment Success page');
    console.log('👀 Watch the console for save/update logs...');
  } else {
    console.log('\n⚠️ Not on Payment Success page');
  }
  
  // Monitor for relevant logs
  console.log('\n📊 Monitoring logs for:');
  console.log('  - "Saving ticket with data"');
  console.log('  - "Ticket saved successfully"');
  console.log('  - "Ticket updated successfully"');
  console.log('  - "Commission seller found"');
})();
```

## Expected Console Output

When everything works correctly, you should see:

```
🔍 Testing Commission Seller & Quantity...

📋 URL Parameters:
  ✅ tx_ref: YENEGE-1234567890
  ✅ quantity: 2
  ✅ commission_seller_id: 550e8400-e29b-41d4-a716-446655440000

✅ On Payment Success page
👀 Watch the console for save/update logs...

📊 Monitoring logs for:
  - "Saving ticket with data"
  - "Ticket saved successfully"
  - "Ticket updated successfully"
  - "Commission seller found"

Quantity info: { quantityParam: "2", parsedQuantity: 2, amount: 100, commission_seller_id_param: "550e8400..." }
Commission seller found: { id: "550e8400...", name: "Test Seller" }
Saving ticket with data: { tx_ref: "YENEGE-...", amount: 100, quantity: 2, commission_seller_id: "550e8400...", commission_seller_name: "Test Seller" }
Ticket saved successfully: { id: "...", tx_ref: "...", quantity: 2, commission_seller_id: "550e8400..." }
```

## Troubleshooting in Console

### If quantity is missing:
```javascript
// Check if quantity is being passed in the payment initialization
// Look for network requests to /api/payments/initialize
// In Network tab, check the request payload
```

### If commission_seller_id is missing:
```javascript
// Check the payment form data
// Look for the commission_seller_id field in the form
document.querySelector('[name="commission_seller_id"]')?.value
```

### Check localStorage/sessionStorage:
```javascript
// Some apps store payment data temporarily
console.log('localStorage:', localStorage);
console.log('sessionStorage:', sessionStorage);
```

