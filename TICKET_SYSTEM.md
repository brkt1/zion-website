# Ticket System Implementation

This document describes the ticket system implementation for the Yenege website.

## Overview

The ticket system allows users to:
- Receive tickets with QR codes after successful payment
- Download tickets as images
- Present tickets at event entrance

Event staff can:
- Scan QR codes to verify tickets
- View all payment and ticket details from the QR code

## Database Schema

### Tickets Table

The `tickets` table has been added to Supabase with the following structure:

- `id` (UUID, Primary Key)
- `tx_ref` (TEXT, Unique) - Transaction reference from payment
- `event_id` (UUID, Foreign Key to events) - Optional event reference
- `event_title` (TEXT) - Event title
- `customer_name` (TEXT) - Customer's full name
- `customer_email` (TEXT, Required) - Customer's email
- `customer_phone` (TEXT) - Customer's phone number
- `amount` (NUMERIC) - Payment amount
- `currency` (TEXT) - Payment currency (default: ETB)
- `quantity` (INTEGER) - Number of tickets (default: 1)
- `status` (TEXT) - Payment status: 'pending', 'success', 'failed', 'cancelled'
- `chapa_reference` (TEXT) - Chapa payment reference
- `qr_code_data` (JSONB) - QR code data containing all ticket information
- `payment_date` (TIMESTAMP) - When payment was completed
- `verified_at` (TIMESTAMP) - When ticket was verified by staff
- `verified_by` (UUID) - Staff member who verified the ticket
- `created_at` (TIMESTAMP) - Ticket creation timestamp
- `updated_at` (TIMESTAMP) - Last update timestamp

### Indexes

Indexes have been created on:
- `tx_ref` - For fast ticket lookups
- `event_id` - For event-based queries
- `customer_email` - For customer ticket history
- `status` - For status-based filtering

## Row Level Security (RLS)

- **Public Read Access**: Anyone can read tickets (for verification)
- **Public Insert**: Anyone can insert tickets (for payment webhooks and frontend)
- **Authenticated Update/Delete**: Only authenticated admin users can update or delete tickets

## Implementation Details

### 1. Ticket Service (`src/services/ticket.ts`)

Provides functions to:
- `saveTicket()` - Save a new ticket to the database
- `updateTicketStatus()` - Update ticket status and payment reference
- `getTicketByTxRef()` - Get ticket by transaction reference
- `getTicketsByEmail()` - Get all tickets for a customer
- `getTicketsByEventId()` - Get all tickets for an event

### 2. Payment Success Flow (`src/pages/PaymentSuccess.tsx`)

After successful payment verification:
1. Payment is verified with Chapa
2. Ticket is automatically saved to Supabase with:
   - All payment details
   - Customer information
   - QR code data (JSON containing all ticket info)
   - Event information (if available)
3. User sees ticket with QR code
4. User can download ticket as image

### 3. QR Code Data Structure

The QR code contains a JSON object with:
```json
{
  "tx_ref": "Transaction reference",
  "amount": 500.00,
  "currency": "ETB",
  "date": "2024-01-15T10:30:00Z",
  "status": "success",
  "reference": "Chapa reference",
  "quantity": 2,
  "email": "customer@example.com",
  "name": "John Doe"
}
```

### 4. Ticket Verification (`src/pages/admin/VerifyTicket.tsx`)

Staff can verify tickets by:
- Scanning QR code with camera
- Uploading QR code image
- Manual entry of QR code data

The verification page displays:
- Payment status
- Transaction reference
- Amount paid
- Number of tickets
- Customer information
- Payment date and time

### 5. Payment Return URL

The payment return URL now includes:
- `tx_ref` - Transaction reference
- `event_id` - Event ID (if available)
- `event_title` - Event title (if available)

This ensures ticket data includes event information.

## Setup Instructions

### 1. Run Database Migration

Execute the updated `supabase-schema.sql` in your Supabase SQL Editor to create the tickets table.

### 2. Apply RLS Policies

Execute the updated `supabase-admin-policies.sql` to set up Row Level Security policies.

### 3. Verify Environment Variables

Ensure your frontend has:
- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`

## Usage

### For Users

1. Complete payment for an event
2. After successful payment, you'll be redirected to the success page
3. Your ticket with QR code will be displayed
4. Click "Download Ticket" to save as image
5. Present the ticket (digital or printed) at the event entrance

### For Event Staff

1. Navigate to Admin > Verify Tickets
2. Click "Start Camera Scanner" or "Upload QR Image"
3. Scan the customer's QR code
4. Verify the payment status and ticket details
5. Allow entry if payment is verified

## Future Enhancements

- Add quantity selector on event detail page
- Add ticket history page for users
- Add ticket management in admin dashboard
- Add email notifications with ticket attachments
- Add server-side ticket saving in webhook (optional)

