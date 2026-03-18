import { useEffect, useState } from 'react';
import { isAdmin, isSponsorshipManager } from '../services/auth';
import { supabase } from '../services/supabase';
import { Partner, SponsorshipRepresentative } from '../types';

export const useSponsorshipDepartmentData = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [representatives, setRepresentatives] = useState<SponsorshipRepresentative[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [user, setUser] = useState<any>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setIsAuthorized(false);
        setLoading(false);
        return;
      }

      setUser(session.user);
      
      // Verify department status
      const adminStatus = await isAdmin();
      const managerStatus = await isSponsorshipManager();

      if (!adminStatus && !managerStatus) {
        setIsAuthorized(false);
        setLoading(false);
        return;
      }

      setIsAuthorized(true);

      // Fetch ALL partners
      const { data: partnerData, error: partnerError } = await supabase
        .from('partners')
        .select('*')
        .order('name', { ascending: true });

      // Fetch ALL representatives
      const { data: repData, error: repError } = await supabase
        .from('sponsorship_representatives')
        .select('*')
        .order('name', { ascending: true });

      if (!partnerError) setPartners(partnerData || []);
      if (!repError) setRepresentatives(repData || []);

    } catch (err) {
      console.error('Error fetching department data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const stats = {
    totalPartners: partners.length,
    activePartners: partners.filter(p => p.status === 'active').length,
    totalReps: representatives.length,
    grossSponsorship: partners.reduce((sum, p) => sum + p.sponsorship_amount, 0),
    avgCommission: representatives.length > 0 
      ? representatives.reduce((sum, r) => sum + r.default_commission_rate, 0) / representatives.length
      : 0,
  };

  return {
    user,
    partners,
    representatives,
    stats,
    loading,
    isAuthorized,
    refresh: fetchData,
  };
};
