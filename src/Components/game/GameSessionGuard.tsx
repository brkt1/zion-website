import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TimeService } from '../../services/timeService';
import { ReactNode } from 'react';
import { useSessionStore } from '../../stores/sessionStore';

export const GameSessionGuard = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const { isExpired } = useSessionStore();

  console.log("GameSessionGuard: isExpired", isExpired);
  console.log("GameSessionGuard: TimeService.isGameActive()", TimeService.isGameActive());

  useEffect(() => {
    if (isExpired) {
      console.log("GameSessionGuard: Navigating to /thank-you due to expiration.");
      navigate('/thank-you');
    } else if (!TimeService.isGameActive()) {
      console.log("GameSessionGuard: Navigating to /game-select as game is not active.");
      navigate('/game-select');
    }
  }, [isExpired, navigate]);

  const shouldRenderChildren = TimeService.isGameActive();
  console.log("GameSessionGuard: shouldRenderChildren", shouldRenderChildren);

  return shouldRenderChildren ? children : null;
};
