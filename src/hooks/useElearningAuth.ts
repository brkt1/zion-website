import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isElearningUser } from '../services/auth';
import { supabase } from '../services/supabase';

export const useElearningAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const checkAuth = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/elearning/login');
        setLoading(false);
        return;
      }

      const hasAccess = await isElearningUser();
      
      if (!hasAccess) {
        await supabase.auth.signOut();
        navigate('/elearning/login?error=unauthorized');
        setLoading(false);
        return;
      }

      setIsAuthenticated(true);
      setLoading(false);
    } catch (error) {
      console.error('Auth check error:', error);
      navigate('/elearning/login');
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return { isAuthenticated, loading };
};

