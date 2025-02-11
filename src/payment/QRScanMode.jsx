import React, { useState, useContext, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { TimeContext } from '../App';
import { storage } from '../utils/storage';
import QrScanner from 'qr-scanner';

const GAME_ROUTES = {
    1: '/trivia-game',
    2: '/truth-or-dare',
    3: '/rock-paper-scissors',
    4: '/emoji-game',
};

const QRScanMode = () => {
    const [cardDetails, setCardDetails] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [scanner, setScanner] = useState(null);
    const [hasScanned, setHasScanned] = useState(false);
    const [cameras, setCameras] = useState([]);
    const [selectedCamera, setSelectedCamera] = useState(null);
    const videoRef = useRef(null);
    const navigate = useNavigate();
    const { startTimer } = useContext(TimeContext);
    const location = useLocation();

    // Camera handling
    const getCameras = useCallback(async () => {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            setCameras(videoDevices);
            
            const defaultCamera = videoDevices.find(device => 
                device.label.toLowerCase().includes('back') || 
                device.label.toLowerCase().includes('environment')
            ) || videoDevices[0];
            
            setSelectedCamera(defaultCamera?.deviceId);
        } catch (err) {
            console.error('Error getting cameras:', err);
            setError('Camera enumeration failed');
        }
    }, []);

    const initializeScanner = useCallback(async () => {
        try {
            if (!videoRef.current) return;

            const qrScanner = new QrScanner(
                videoRef.current,
                result => {
                    if (result?.data && !hasScanned) {
                        handleScan(result.data);
                    }
                },
                {
                    preferredCamera: selectedCamera,
                    highlightScanRegion: true,
                    maxScansPerSecond: 3,
                    returnDetailedScanResult: true,
                    onDecodeError: (error) => {
                        if (error !== 'No QR code found') {
                            setError('Invalid QR code format');
                        }
                    }
                }
            );

            await qrScanner.start();
            setScanner(qrScanner);
        } catch (err) {
            console.error('Scanner initialization error:', err);
            setError('Camera initialization failed');
        }
    }, [selectedCamera, hasScanned]);

    useEffect(() => {
        getCameras();
    }, [getCameras]);

    // Scanner lifecycle management
    useEffect(() => {
        if (selectedCamera && !scanner) {
            initializeScanner();
        }

        return () => {
            if (scanner) {
                scanner.stop();
                scanner.destroy();
                setScanner(null);
            }
        };
    }, [selectedCamera, scanner, initializeScanner]);

    // Navigation state handling
    useEffect(() => {
        const checkExistingGame = async () => {
            if (location.state?.fromGame) return;

            try {
                const timerState = storage.getTimerState();
                if (!timerState || timerState.remainingTime <= 0) return;

                const cards = storage.getCards();
                const lastCard = cards[cards.length - 1];
                if (!lastCard) return;

                const { data } = await supabase
                    .from('cards')
                    .select('*, game_types(name)')
                    .eq('card_number', lastCard.cardNumber)
                    .single();

                if (data?.game_type) {
                    navigate(GAME_ROUTES[data.game_type], {
                        state: { 
                            cardDetails: data,
                            fromQRScan: true 
                        },
                    });
                }
            } catch (err) {
                console.error('Game restoration error:', err);
                storage.clearGameState();
                navigate('/');
            }
        };

        checkExistingGame();
    }, [navigate, location]);

    // QR Processing
    const verifyQRCode = useCallback(async (scannedData) => {
        setIsLoading(true);
        setError(null);

        try {
            const cardNumber = typeof scannedData === 'string' 
                ? scannedData.replace(/[^0-9]/g, '')
                : scannedData.card_number?.toString();

            if (!cardNumber || !/^\d{14}$/.test(cardNumber)) {
                throw new Error('Invalid Card Number (must be 14 digits)');
            }

            const { data, error } = await supabase
                .from('cards')
                .select('*, game_types(name)')
                .eq('card_number', cardNumber)
                .single();

            if (error || !data) throw new Error('Card not found');
            if (data.used) throw new Error('Card has already been used');

            await supabase
                .from('cards')
                .update({ used: true })
                .eq('card_number', cardNumber);

            storage.setCard(cardNumber);
            setCardDetails(data);
            setHasScanned(true);
            startTimer(data.duration * 60);

            navigate(GAME_ROUTES[data.game_type], {
                state: { 
                    cardDetails: data,
                    remainingTime: data.duration * 60,
                    fromQRScan: true 
                },
            });

        } catch (err) {
            console.error('Verification error:', err);
            setError(err.message || 'Error processing card');
            setHasScanned(false);
        } finally {
            setIsLoading(false);
        }
    }, [navigate, startTimer]);

    const handleScan = useCallback((data) => {
        try {
            verifyQRCode(JSON.parse(data));
        } catch {
            verifyQRCode(data);
        }
    }, [verifyQRCode]);

    // UI Handlers
    const handleCameraChange = async (deviceId) => {
        if (scanner) {
            await scanner.setCamera(deviceId);
            setSelectedCamera(deviceId);
        }
    };

    const handleRetry = async () => {
        setError(null);
        setHasScanned(false);
        if (scanner) await scanner.start();
    };

    const handleManualEntry = async () => {
        const manualCardNumber = prompt('Enter 14-digit Card Number:');
        if (manualCardNumber) {
            await verifyQRCode(manualCardNumber);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-center">
                        <h1 className="text-3xl font-bold text-white">Scan QR Code</h1>
                    </div>

                    <div className="p-6">
                        {isLoading && (
                            <div className="flex justify-center mb-4">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
                            </div>
                        )}

                        {cameras.length > 1 && (
                            <select 
                                value={selectedCamera}
                                onChange={(e) => handleCameraChange(e.target.value)}
                                className="mb-4 w-full p-2 border rounded-lg bg-white"
                            >
                                {cameras.map(camera => (
                                    <option key={camera.deviceId} value={camera.deviceId}>
                                        {camera.label || `Camera ${camera.deviceId.slice(0, 5)}`}
                                    </option>
                                ))}
                            </select>
                        )}

                        {!hasScanned && (
                            <div className="mb-6 border-4 border-blue-200 rounded-lg overflow-hidden relative">
                                <video 
                                    ref={videoRef}
                                    className="w-full h-64 object-cover"
                                    playsInline
                                />
                                <div className="absolute inset-0 pointer-events-none">
                                    <div className="absolute inset-0 border-2 border-blue-500 opacity-30"></div>
                                    <div className="absolute left-1/4 right-1/4 top-1/4 bottom-1/4 border-2 border-blue-500"></div>
                                </div>
                            </div>
                        )}

                        {/* Rest of UI remains similar but with improved error handling */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QRScanMode;