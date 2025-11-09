import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAdmin, isCommissionSeller } from '../services/auth';
import { supabase } from '../services/supabase';

export const useCommissionSellerAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const checkAuth = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/admin/login');
        setLoading(false);
        return;
      }

      setIsAuthenticated(true);

      // Check if user is admin or commission seller
      const admin = await isAdmin();
      const seller = await isCommissionSeller();
      
      if (!admin && !seller) {
        await supabase.auth.signOut();
        navigate('/admin/login?error=unauthorized');
        setLoading(false);
        return;
      }

      setIsAdminUser(admin);
      setIsSeller(seller);
      setLoading(false);
    } catch (error) {
      console.error('Auth check error:', error);
      navigate('/admin/login');
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return { isAuthenticated, isAdminUser, isSeller, loading };
};

