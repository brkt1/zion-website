import { useCallback } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

export const useReCaptcha = () => {
  const { executeRecaptcha } = useGoogleReCaptcha();

  const verifyCaptcha = useCallback(async (action: string = 'submit'): Promise<string | null> => {
    if (!executeRecaptcha) {
      console.warn('reCAPTCHA not loaded yet');
      return null;
    }

    try {
      const token = await executeRecaptcha(action);
      return token;
    } catch (error) {
      console.error('reCAPTCHA verification failed:', error);
      return null;
    }
  }, [executeRecaptcha]);

  return { verifyCaptcha };
};

