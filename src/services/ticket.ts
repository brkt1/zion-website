import { CreateTicketData, Ticket } from '../types';
import { supabase } from './supabase';

/**
 * Save a ticket to the database
 */
export const saveTicket = async (ticketData: CreateTicketData): Promise<Ticket> => {
  try {
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
        quantity: ticketData.quantity,
        status: ticketData.status || 'pending',
        chapa_reference: ticketData.chapa_reference || null,
        qr_code_data: ticketData.qr_code_data || null,
        payment_date: ticketData.payment_date || new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) {
      console.error('Error saving ticket:', error);
      throw new Error(error.message || 'Failed to save ticket');
    }

    return data as Ticket;
  } catch (error: any) {
    console.error('Error in saveTicket:', error);
    throw error;
  }
};

/**
 * Update ticket status
 */
export const updateTicketStatus = async (
  txRef: string,
  status: 'pending' | 'success' | 'failed' | 'cancelled',
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

