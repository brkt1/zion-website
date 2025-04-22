import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// @ts-ignore
import TimeService from '../services/TimeService';
import { ReactNode } from 'react';

export const GameSessionGuard = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!TimeService.isGameActive()) {
      navigate('/qr-scan', { state: { sessionExpired: true } });
    }
  }, [navigate]);

  return TimeService.isGameActive() ? children : null;
};