import { CreateTicketData, Ticket } from '../types';
import { supabase } from './supabase';

/**
 * Save a ticket to the database
 */
export const saveTicket = async (ticketData: CreateTicketData): Promise<Ticket> => {
  try {
    // Ensure quantity is a valid number (default to 1 if invalid)
    const validQuantity = ticketData.quantity && ticketData.quantity > 0 ? ticketData.quantity : 1;
    
    // Ensure commission_seller_id is either a valid string or null (not empty string)
    const validCommissionSellerId = ticketData.commission_seller_id && 
      typeof ticketData.commission_seller_id === 'string' && 
      ticketData.commission_seller_id.trim() !== ''
      ? ticketData.commission_seller_id.trim()
      : null;
    
    // Log the data being saved for debugging
    console.log('Saving ticket to database:', {
      tx_ref: ticketData.tx_ref,
      quantity: validQuantity,
      commission_seller_id: validCommissionSellerId,
      commission_seller_name: ticketData.commission_seller_name,
    });

    const { data, error } = await supabase
      .from('tickets')
      .insert([{
        tx_ref: ticketData.tx_ref,
        event_id: ticketData.event_id || null,
        event_title: ticketData.event_title || null,
        customer_name: ticketData.customer_name || null,
        customer_email: ticketData.customer_email,
        customer_phone: ticketData.customer_phone || null,
        amount: ticketData.amount,
        currency: ticketData.currency,
        quantity: validQuantity,
        status: ticketData.status || 'pending',
        chapa_reference: ticketData.chapa_reference || null,
        commission_seller_id: validCommissionSellerId,
        commission_seller_name: ticketData.commission_seller_name || null,
        qr_code_data: ticketData.qr_code_data || null,
        payment_date: ticketData.payment_date || new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) {
      console.error('Error saving ticket:', error);
      console.error('Ticket data that failed:', {
        tx_ref: ticketData.tx_ref,
        quantity: validQuantity,
        commission_seller_id: validCommissionSellerId,
      });
      throw new Error(error.message || 'Failed to save ticket');
    }

    console.log('Ticket saved successfully:', {
      id: data.id,
      tx_ref: data.tx_ref,
      quantity: data.quantity,
      commission_seller_id: data.commission_seller_id,
    });

    return data as Ticket;
  } catch (error: any) {
    console.error('Error in saveTicket:', error);
    throw error;
  }
};

/**
 * Update ticket with full data (including commission_seller_id and quantity)
 */
export const updateTicket = async (
  txRef: string,
  ticketData: Partial<CreateTicketData>
): Promise<Ticket> => {
  try {
    // Ensure quantity is a valid number if provided
    let validQuantity: number | undefined = undefined;
    if (ticketData.quantity !== undefined) {
      validQuantity = ticketData.quantity && ticketData.quantity > 0 ? ticketData.quantity : 1;
    }
    
    // Ensure commission_seller_id is either a valid string or null (not empty string)
    let validCommissionSellerId: string | null | undefined = undefined;
    if (ticketData.commission_seller_id !== undefined) {
      validCommissionSellerId = ticketData.commission_seller_id && 
        typeof ticketData.commission_seller_id === 'string' && 
        ticketData.commission_seller_id.trim() !== ''
        ? ticketData.commission_seller_id.trim()
        : null;
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // Update fields if provided
    if (ticketData.event_id !== undefined) updateData.event_id = ticketData.event_id || null;
    if (ticketData.event_title !== undefined) updateData.event_title = ticketData.event_title || null;
    if (ticketData.customer_name !== undefined) updateData.customer_name = ticketData.customer_name || null;
    if (ticketData.customer_email !== undefined) updateData.customer_email = ticketData.customer_email;
    if (ticketData.customer_phone !== undefined) updateData.customer_phone = ticketData.customer_phone || null;
    if (ticketData.amount !== undefined) updateData.amount = ticketData.amount;
    if (ticketData.currency !== undefined) updateData.currency = ticketData.currency;
    if (validQuantity !== undefined) updateData.quantity = validQuantity;
    if (ticketData.status !== undefined) updateData.status = ticketData.status;
    if (ticketData.chapa_reference !== undefined) updateData.chapa_reference = ticketData.chapa_reference || null;
    if (validCommissionSellerId !== undefined) updateData.commission_seller_id = validCommissionSellerId;
    if (ticketData.commission_seller_name !== undefined) updateData.commission_seller_name = ticketData.commission_seller_name || null;
    if (ticketData.qr_code_data !== undefined) updateData.qr_code_data = ticketData.qr_code_data || null;
    if (ticketData.payment_date !== undefined) updateData.payment_date = ticketData.payment_date;

    console.log('Updating ticket:', {
      tx_ref: txRef,
      quantity: validQuantity,
      commission_seller_id: validCommissionSellerId,
      updateData,
    });

    const { data, error } = await supabase
      .from('tickets')
      .update(updateData)
      .eq('tx_ref', txRef)
      .select()
      .single();

    if (error) {
      console.error('Error updating ticket:', error);
      throw new Error(error.message || 'Failed to update ticket');
    }

    console.log('Ticket updated successfully:', {
      id: data.id,
      tx_ref: data.tx_ref,
      quantity: data.quantity,
      commission_seller_id: data.commission_seller_id,
    });

    return data as Ticket;
  } catch (error: any) {
    console.error('Error in updateTicket:', error);
    throw error;
  }
};

/**
 * Update ticket status
 */
export const updateTicketStatus = async (
  txRef: string,
  status: 'pending' | 'success' | 'failed' | 'cancelled' | 'used',
  chapaReference?: string
): Promise<Ticket> => {
  try {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (chapaReference) {
      updateData.chapa_reference = chapaReference;
    }

    if (status === 'success') {
      updateData.payment_date = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('tickets')
      .update(updateData)
      .eq('tx_ref', txRef)
      .select()
      .single();

    if (error) {
      console.error('Error updating ticket:', error);
      throw new Error(error.message || 'Failed to update ticket');
    }

    return data as Ticket;
  } catch (error: any) {
    console.error('Error in updateTicketStatus:', error);
    throw error;
  }
};

/**
 * Mark a ticket as used (verified and scanned)
 */
export const markTicketAsUsed = async (
  txRef: string,
  verifiedBy: string
): Promise<Ticket> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const verifierId = session?.user?.id || verifiedBy;

    const updateData: any = {
      status: 'used',
      verified_at: new Date().toISOString(),
      verified_by: verifierId,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('tickets')
      .update(updateData)
      .eq('tx_ref', txRef)
      .select()
      .single();

    if (error) {
      console.error('Error marking ticket as used:', error);
      throw new Error(error.message || 'Failed to mark ticket as used');
    }

    return data as Ticket;
  } catch (error: any) {
    console.error('Error in markTicketAsUsed:', error);
    throw error;
  }
};

/**
 * Get ticket by transaction reference
 */
export const getTicketByTxRef = async (txRef: string): Promise<Ticket | null> => {
  try {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('tx_ref', txRef)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error('Error fetching ticket:', error);
      throw new Error(error.message || 'Failed to fetch ticket');
    }

    return data as Ticket;
  } catch (error: any) {
    console.error('Error in getTicketByTxRef:', error);
    throw error;
  }
};

/**
 * Get tickets by customer email
 */
export const getTicketsByEmail = async (email: string): Promise<Ticket[]> => {
  try {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('customer_email', email)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tickets:', error);
      throw new Error(error.message || 'Failed to fetch tickets');
    }

    return (data || []) as Ticket[];
  } catch (error: any) {
    console.error('Error in getTicketsByEmail:', error);
    throw error;
  }
};

/**
 * Get tickets by event ID
 */
export const getTicketsByEventId = async (eventId: string): Promise<Ticket[]> => {
  try {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tickets:', error);
      throw new Error(error.message || 'Failed to fetch tickets');
    }

    return (data || []) as Ticket[];
  } catch (error: any) {
    console.error('Error in getTicketsByEventId:', error);
    throw error;
  }
};

/**
 * Register for a free event (creates ticket with amount 0)
 */
export const registerForFreeEvent = async (
  eventId: string,
  eventTitle: string,
  customerName: string,
  customerEmail: string,
  customerPhone: string,
  quantity: number
): Promise<Ticket> => {
  try {
    // Generate a unique transaction reference for free registration
    const txRef = `FREE-${eventId}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    // Create QR code data for the ticket
    const qrData = {
      tx_ref: txRef,
      amount: 0,
      currency: 'ETB',
      date: new Date().toISOString(),
      status: 'success',
      reference: txRef,
      quantity: quantity,
      email: customerEmail,
      name: customerName,
    };

    // Save ticket with status 'success' and amount 0
    const ticket = await saveTicket({
      tx_ref: txRef,
      event_id: eventId,
      event_title: eventTitle,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      amount: 0,
      currency: 'ETB',
      quantity: quantity,
      status: 'success',
      qr_code_data: qrData,
      payment_date: new Date().toISOString(),
    });

    // Update event attendees count
    try {
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('attendees')
        .eq('id', eventId)
        .single();

      if (!eventError && eventData) {
        const currentAttendees = eventData.attendees || 0;
        await supabase
          .from('events')
          .update({ 
            attendees: currentAttendees + quantity,
            updated_at: new Date().toISOString()
          })
          .eq('id', eventId);
      }
    } catch (updateError) {
      // Don't fail registration if attendee count update fails
      console.warn('Failed to update event attendees count:', updateError);
    }

    return ticket;
  } catch (error: any) {
    console.error('Error registering for free event:', error);
    throw error;
  }
};

