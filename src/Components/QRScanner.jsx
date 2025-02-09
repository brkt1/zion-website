import React, { useEffect, useRef } from 'react';
import QrScanner from 'qr-scanner';

const QRScanner = ({ onScanSuccess }) => {
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);

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
            onScanSuccess(data);
          } catch (err) {
            console.error('Invalid QR code format:', err);
          }
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );

      qrScannerRef.current.start();
    }

    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.destroy();
      }
    };
  }, [onScanSuccess]);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative aspect-video">
        <video ref={videoRef} className="w-full h-full rounded-lg" />
      </div>
      <p className="mt-2 text-sm text-gray-600 text-center">
        Position the QR code within the frame to scan
      </p>
    </div>
  );
};

export default QRScanner;
