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

    const getCameras = async () => {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            setCameras(videoDevices);
            
            // Select environment camera by default, or first available camera
            const defaultCamera = videoDevices.find(device => 
                device.label.toLowerCase().includes('back') || 
                device.label.toLowerCase().includes('environment')
            ) || videoDevices[0];
            
            setSelectedCamera(defaultCamera?.deviceId);
        } catch (err) {
            console.error('Error getting cameras:', err);
        }
    };

    // Call getCameras when component mounts
    useEffect(() => {
        getCameras();
    }, []);

    useEffect(() => {
        const checkExistingGame = async () => {
            const timerState = localStorage.getItem('gameTimerState');
            if (!timerState) {
                return; // Allow scanning if no timer exists
            }

            try {
                const { remainingTime, timestamp, isActive } = JSON.parse(timerState);
                if (!isActive || remainingTime <= 0) {
                    return; // Allow scanning if timer is not active or expired
                }

                const elapsedSeconds = Math.floor((Date.now() - timestamp) / 1000);
                const newRemainingTime = Math.max(0, remainingTime - elapsedSeconds);
                
                if (newRemainingTime <= 0) {
                    return; // Allow scanning if time has run out
                }

                // If we have an active timer with remaining time, restore the game
                const cards = storage.getCards();
                const lastCard = cards[cards.length - 1];
                
                if (lastCard) {
                    try {
                        const { data, error } = await supabase
                            .from('cards')
                            .select('*, game_types(name)')
                            .eq('card_number', lastCard.cardNumber)
                            .single();

                        if (data && !error) {
                            const gameRoute = GAME_ROUTES[data.game_type];
                            if (gameRoute) {
                                navigate(gameRoute, {
                                    state: {
                                        cardDetails: data,
                                        remainingTime: newRemainingTime,
                                    },
                                });
                                return;
                            }
                        }
                    } catch (err) {
                        console.error('Error fetching card details:', err);
                        navigate('/');
                    }
                }
            } catch (err) {
                console.error('Error checking game state:', err);
                navigate('/');
            }
        };

        // Only check for existing game if we're not coming from a game route
        if (!location.state?.fromGame) {
            checkExistingGame();
        }
    }, [navigate, GAME_ROUTES, location]);

    // Check if the browser supports the required APIs
    const checkBrowserSupport = () => {
        if (!navigator.mediaDevices?.getUserMedia) {
            setError('Camera access is not supported in this browser. Please try using a modern browser.');
            return false;
        }
        return true;
    };

    const requestCameraAccess = async () => {
        setIsLoading(true);
        try {
            if (!checkBrowserSupport()) {
                return false;
            }

            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } 
            });
            // Immediately stop the unused stream (QrScanner will create its own)
            stream.getTracks().forEach(track => track.stop());
            setIsLoading(false);
            return true;
        } catch (err) {
            console.error('Camera access error:', err);
            setError(
                err.name === 'NotAllowedError'
                    ? 'Camera access was denied. Please enable permissions in your browser settings.'
                    : 'Failed to access camera. Please make sure your camera is connected and not in use.'
            );
            setIsLoading(false);
            return false;
        }
    };

    useEffect(() => {
        const setupScanner = async () => {
            try {
                if (!videoRef.current) return;

                // Request camera permission first
                const hasPermission = await requestCameraAccess();
                if (!hasPermission) return;

                const qrScanner = new QrScanner(
                    videoRef.current,
                    result => {
                        if (result?.data && !hasScanned) {
                            handleScan(result.data);
                        }
                    },
                    {
                        preferredCamera: selectedCamera || 'environment',
                        highlightScanRegion: true,
                        maxScansPerSecond: 3,
                        returnDetailedScanResult: true
                    }
                );

                await qrScanner.start();
                setScanner(qrScanner);
            } catch (err) {
                console.error('Scanner setup error:', err);
                setError('Failed to initialize camera. Please refresh and allow camera access.');
            }
        };

        const initScanner = async () => {
            await setupScanner();
        };

        initScanner();

        return () => {
            if (scanner) {
                scanner.destroy();
            }
            // Clean up any media tracks
            if (videoRef.current?.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
        };
    }, [selectedCamera, hasScanned]);

    const verifyQRCode = useCallback(async (scannedData) => {
        setIsLoading(true);
        setError(null);

        try {
            let cardData;

            if (typeof scannedData === 'string') {
                try {
                    cardData = JSON.parse(scannedData);
                } catch {
                    cardData = { card_number: scannedData };
                }
            } else if (typeof scannedData === 'object') {
                cardData = scannedData;
            } else {
                setError('Invalid QR code format');
                setIsLoading(false);
                return;
            }

            const cardNumber = cardData.card_number?.toString() || 
                            cardData.cardNumber?.toString();

            if (!cardNumber || cardNumber.length !== 14) {
                setError('Invalid Card Number');
                setIsLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('cards')
                .select('*, game_types(name)')
                .eq('card_number', cardNumber)
                .single();

            if (error || !data) {
                setError('Card not found');
                setIsLoading(false);
                return;
            }

            if (data.used) {
                setError('Card has already been used');
                setIsLoading(false);
                return;
            }

            await supabase
                .from('cards')
                .update({ used: true })
                .eq('card_number', cardNumber);

            // Save card data to local storage
            storage.setCard(cardNumber);

            setCardDetails(data);
            setError(null);
            setHasScanned(true);

            startTimer(data.duration * 60);

            const gameRoute = GAME_ROUTES[data.game_type];
            if (gameRoute) {
                if (scanner) {
                    scanner.destroy();
                }
                
                navigate(gameRoute, {
                    state: {
                        cardDetails: data,
                        remainingTime: data.duration * 60,
                    },
                });
            } else {
                setError('Invalid game type');
            }
        } catch (err) {
            console.error('Error verifying card number:', err);
            setError('Error processing card');
        } finally {
            setIsLoading(false);
        }
    }, [navigate, startTimer, scanner]);

    const handleScan = useCallback((data) => {
        if (data) {
            try {
                const parsedData = JSON.parse(data);
                verifyQRCode(parsedData);
            } catch (error) {
                verifyQRCode(data);
            }
        }
    }, [verifyQRCode]);

    const handleManualEntry = () => {
        const manualCardNumber = prompt('Enter Card Number:');
        if (manualCardNumber) {
            verifyQRCode({ card_number: manualCardNumber });
        }
    };

    const handleRetry = async () => {
        setError(null);
        setHasScanned(false);
        
        try {
            const hasPermission = await requestCameraAccess();
            if (hasPermission && scanner) {
                await scanner.start();
            }
        } catch (err) {
            setError('Failed to restart camera. Please check permissions.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-center">
                        <h1 className="text-3xl font-bold text-white">
                            Scan QR Code
                        </h1>
                    </div>

                    <div className="p-6">
                        {isLoading && (
                            <div className="flex justify-center mb-4">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
                            </div>
                        )}

                        {!hasScanned && (
                            <div className="mb-6 border-4 border-blue-200 rounded-lg overflow-hidden relative">
                                <video 
                                    ref={videoRef}
                                    className="w-full h-64 object-cover"
                                />
                                <div className="absolute inset-0 pointer-events-none">
                                    <div className="absolute inset-0 border-2 border-blue-500 opacity-30"></div>
                                    <div className="absolute left-1/4 right-1/4 top-1/4 bottom-1/4 border-2 border-blue-500"></div>
                                </div>
                            </div>
                        )}

                        {!hasScanned && (
                            <div className="flex space-x-4 mb-4">
                                <button 
                                    onClick={handleManualEntry}
                                    className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center space-x-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                    </svg>
                                    <span>Manual Entry</span>
                                </button>

                                <button 
                                    onClick={handleRetry}
                                    className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center space-x-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                                    </svg>
                                    <span>Retry Scan</span>
                                </button>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-4">
                                <p>{error}</p>
                                {error.includes('permissions') && (
                                    <button
                                        onClick={handleRetry}
                                        className="mt-2 text-red-700 underline hover:text-red-900"
                                    >
                                        Click here to try again
                                    </button>
                                )}
                            </div>
                        )}

                        {cardDetails && (
                            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                                <h2 className="text-xl font-bold mb-2 text-blue-800">Card Details</h2>
                                <div className="space-y-2">
                                    <p className="flex items-center space-x-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                                        </svg>
                                        <span>Card Number: {cardDetails.card_number}</span>
                                    </p>
                                    <p className="flex items-center space-x-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 100-12 6 6 0 000 12z" />
                                            <path d="M10 4a6 6 0 100 12 6 6 0 000-12zm0 10a4 4 0 100-8 4 4 0 000 8z" />
                                        </svg>
                                        <span>Game Type: {cardDetails.game_types.name}</span>
                                    </p>
                                    <p className="flex items-center space-x-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 100-12 6 6 0 000 12z" />
                                            <path d="M10 4a6 6 0 100 12 6 6 0 000-12zm0 10a4 4 0 100-8 4 4 0 000 8z" />
                                        </svg>
                                        <span>Duration: {cardDetails.duration} minutes</span>
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QRScanMode;
