import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAdmin, isTicketScanner } from '../services/auth';
import { supabase } from '../services/supabase';

export const useScannerAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [isScanner, setIsScanner] = useState(false);
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

      // Check if user is admin or ticket scanner
      const admin = await isAdmin();
      const scanner = await isTicketScanner();
      
      if (!admin && !scanner) {
        await supabase.auth.signOut();
        navigate('/admin/login?error=unauthorized');
        setLoading(false);
        return;
      }

      setIsAdminUser(admin); // Only true if full admin
      setIsScanner(scanner && !admin); // True if scanner but not admin
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

  return { isAuthenticated, isAdminUser, isScanner, loading };
};

