
import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import EnhancedQRScanner from '../cards/EnhancedQRScanner';

interface WinnerScannerProps {
  onWinnerFound: (winner: any) => void;
}

const WinnerScanner: React.FC<WinnerScannerProps> = ({ onWinnerFound }) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleScan = async (data: string) => {
    if (data) {
      setLoading(true);
      setError(null);
      try {
        const { data: winner, error } = await supabase
          .from('certificates')
          .select('*')
          .eq('id', data)
          .single();

        if (error) throw error;

        if (winner) {
          onWinnerFound(winner);
        } else {
          setError('No winner found for this QR code.');
        }
      } catch (err) {
        if (err instanceof Error) {
          setError('Error scanning QR code: ' + err.message);
        } else {
          setError('Error scanning QR code: ' + String(err));
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Scan Winner&apos;s QR Code</h2>
      <EnhancedQRScanner onScan={handleScan} />
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default WinnerScanner;
