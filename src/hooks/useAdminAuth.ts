import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAdmin } from '../services/auth';
import { supabase } from '../services/supabase';

export const useAdminAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
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

      // Check if user is admin
      const admin = await isAdmin();
      if (!admin) {
        await supabase.auth.signOut();
        navigate('/admin/login?error=unauthorized');
        setLoading(false);
        return;
      }

      setIsAdminUser(true);
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

  return { isAuthenticated, isAdminUser, loading };
};

