import React, { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';
import { FaCamera } from 'react-icons/fa';


const QRScanner = ({ onScan }) => {
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);


  useEffect(() => {
    const initializeScanner = async () => {
      try {
        // Check for camera permissions
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream; // Set the video source to the stream
          qrScannerRef.current = new QrScanner(
            videoRef.current,
            result => {
              try {
                const data = JSON.parse(result.data);
                if (!data.playerName || !data.playerId) {
                  throw new Error('Invalid QR code format: Missing player information');
                }
                onScan(data);
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
      } catch (err) {
        console.error('Camera access denied:', err);
        setError('Camera access is required to scan QR codes.');
        setShowPermissionPrompt(true);

      }
    };

    initializeScanner();

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
        <div className="mt-2 text-center">
          <p className="text-red-500 text-sm mb-2">{error}</p>
          {showPermissionPrompt && (
            <button
              onClick={async () => {
                try {
                  await navigator.mediaDevices.getUserMedia({ video: true });
                  window.location.reload();
                } catch (err) {
                  setError('Please enable camera access in your browser settings.');
                }
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center justify-center gap-2"
            >
              <FaCamera />
              Allow Camera Access
            </button>
          )}
        </div>
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
