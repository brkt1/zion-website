import { useEffect, useState } from 'react';
import { adminApi } from '../services/adminApi';
import { supabase } from '../services/supabase';
import { CommissionSeller, Ticket } from '../types';
import { useAdminAuth } from './useAdminAuth';

export const useSellerData = () => {
  const { loading: authLoading, isAdminUser, isSeller } = useAdminAuth();
  const [seller, setSeller] = useState<CommissionSeller | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [salesStats, setSalesStats] = useState({
    totalTickets: 0,
    successfulTickets: 0,
    totalRevenue: 0,
    totalCommission: 0,
    totalVAT: 0,
    netCommission: 0,
    averageTicketPrice: 0,
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
      }
    };
    checkUser();
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (isSeller && !isAdminUser) {
        loadSellerData();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAdminUser, isSeller]);

  const loadSellerData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        const data = await adminApi.commissionSellers.getAll();
        const sellerData = data.find(s => s.email.toLowerCase() === session.user.email?.toLowerCase());
        setSeller(sellerData || null);
      }
    } catch (error) {
      console.error('Error loading seller data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSalesData = async () => {
    try {
      setLoadingTickets(true);
      if (!seller) return;

      const sellerTickets = await adminApi.tickets.getByCommissionSeller(seller.id);
      setTickets(sellerTickets || []);

      const successfulTickets = (sellerTickets || []).filter(t => t.status === 'success' || t.status === 'used');
      const totalRevenue = successfulTickets.reduce((sum, t) => {
        let amount = typeof t.amount === 'number' ? t.amount : parseFloat(String(t.amount)) || 0;
        
        // Fix: If amount is suspiciously small (less than 10), it might have been incorrectly divided
        if (amount > 0 && amount < 10 && amount * 100 > 50) {
          // Likely incorrectly stored - multiply by 100 to correct
          amount = amount * 100;
        }
        
        return sum + (amount * t.quantity);
      }, 0);
      
      const totalTicketQuantity = successfulTickets.reduce((sum, t) => sum + t.quantity, 0);
      const averageTicketPrice = totalTicketQuantity > 0 ? totalRevenue / totalTicketQuantity : 0;
      
      let totalCommission = 0;
      successfulTickets.forEach(ticket => {
        let amount = typeof ticket.amount === 'number' ? ticket.amount : parseFloat(String(ticket.amount)) || 0;
        
        // Fix: If amount is suspiciously small (less than 10), it might have been incorrectly divided
        if (amount > 0 && amount < 10 && amount * 100 > 50) {
          // Likely incorrectly stored - multiply by 100 to correct
          amount = amount * 100;
        }
        
        const ticketTotal = amount * ticket.quantity;
        if (seller.commission_type === 'percentage') {
          totalCommission += (ticketTotal * seller.commission_rate) / 100;
        } else {
          totalCommission += seller.commission_rate * ticket.quantity;
        }
      });

      // Calculate VAT (15% of commission)
      const totalVAT = (totalCommission * 15) / 100;
      const netCommission = totalCommission - totalVAT;

      setSalesStats({
        totalTickets: sellerTickets?.length || 0,
        successfulTickets: successfulTickets.length,
        totalRevenue,
        totalCommission,
        totalVAT,
        netCommission,
        averageTicketPrice,
      });
    } catch (error) {
      console.error('Error loading sales data:', error);
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    if (seller) {
      loadSalesData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seller]);

  return {
    seller,
    user,
    tickets,
    salesStats,
    loading: loading || authLoading,
    loadingTickets,
    isAuthorized: isSeller && !isAdminUser,
    reloadSalesData: loadSalesData,
  };
};

