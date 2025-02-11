import React, { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';

const QRScanner = ({ onScan }) => {
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (videoRef.current) {
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        result => {
          try {
            const data = JSON.parse(result.data);
            // Ensure the QR code contains the required player information
            if (!data.playerName || !data.playerId) {
              throw new Error('Invalid QR code format: Missing player information');
            }
            onScan(data); // Call the onScan function
          } catch (err) {
            console.error('Invalid QR code format:', err);
            setError('Invalid QR code format. Please try again.');
          }
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );

      qrScannerRef.current.start();
      setIsScanning(true);
    }

    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.destroy();
        setIsScanning(false);
      }
    };
  }, [onScan]);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative aspect-video">
        <video ref={videoRef} className="w-full h-full rounded-lg" />
      </div>
      <p className="mt-2 text-sm text-gray-600 text-center">
        Position the QR code within the frame to scan
      </p>
      {error && (
        <p className="mt-2 text-red-500 text-sm text-center">
          {error}
        </p>
      )}
      {isScanning && (
        <p className="mt-2 text-green-500 text-sm text-center">
          Scanning...
        </p>
      )}
    </div>
  );
};

export default QRScanner; 