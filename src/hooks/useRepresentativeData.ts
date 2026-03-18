import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { Partner, SponsorshipRepresentative } from '../types';

export const useRepresentativeData = () => {
  const [rep, setRep] = useState<SponsorshipRepresentative | null>(null);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
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
        const email = session.user.email?.toLowerCase().trim();

        // Find the representative record
        const { data: repData, error: repError } = await supabase
          .from('sponsorship_representatives')
          .select('*')
          .eq('email', email)
          .eq('is_active', true)
          .maybeSingle();

        if (repError || !repData) {
          setIsAuthorized(false);
          setLoading(false);
          return;
        }

        setRep(repData);
        setIsAuthorized(true);

        // Fetch their partners
        const { data: partnerData, error: partnerError } = await supabase
          .from('partners')
          .select('*')
          .eq('representative_id', repData.id)
          .order('name', { ascending: true });

        if (!partnerError) {
          setPartners(partnerData || []);
        }

      } catch (err) {
        console.error('Error fetching rep data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = {
    totalPartners: partners.length,
    activePartners: partners.filter(p => p.status === 'active').length,
    totalSponsorship: partners.reduce((sum, p) => sum + p.sponsorship_amount, 0),
    totalCommission: partners.reduce((sum, p) => {
      const rate = p.commission_rate || rep?.default_commission_rate || 0;
      return sum + (p.sponsorship_amount * rate) / 100;
    }, 0),
  };

  return {
    rep,
    user,
    partners,
    stats,
    loading,
    isAuthorized,
  };
};
