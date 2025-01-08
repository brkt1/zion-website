import React, { useState, useContext, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { TimeContext } from '../App';
import QrScanner from 'react-qr-scanner';

const QRScanMode = () => {
    console.log("QRScanMode component rendered");
    console.log('QRScanMode component mounted');
    const [qrCode, setQRCode] = useState('');
    const [cardDetails, setCardDetails] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    console.log("Loading state:", isLoading);
    const [cameraPermission, setCameraPermission] = useState(false);
    const navigate = useNavigate();
    const { startTimer } = useContext(TimeContext);

    const GAME_ROUTES = {
        1: '/trivia-game',
        2: '/truth-or-dare',
        3: '/rock-paper-scissors',
        4: '/emoji-game',
    };

    // Check camera permissions on component mount
    useEffect(() => {
        const checkCameraPermission = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                setCameraPermission(true);
                stream.getTracks().forEach(track => track.stop());
            } catch (err) {
                console.log('Camera permission denied');
                setCameraPermission(false);
                setError('Camera permission denied');
            }
        };

        checkCameraPermission();
    }, []);

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
                console.log('Invalid QR code format');
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
                console.log('Card not found');
                setError('Card not found');
                setIsLoading(false);
                return;
            }

            if (data.used) {
                console.log('Card has already been used');
                setError('Card has already been used');
                setIsLoading(false);
                return;
            }

            await supabase
                .from('cards')
                .update({ used: true })
                .eq('card_number', cardNumber);

            setCardDetails(data);
            setError(null);

            startTimer(data.duration * 60);

            const gameRoute = GAME_ROUTES[data.game_type];
            if (gameRoute) {
                navigate(gameRoute, {
                    state: {
                        cardDetails: data,
                        remainingTime: data.duration * 60,
                    },
                });
            } else {
                console.log('Invalid game type');
                setError('Invalid game type');
            }
        } catch (err) {
            console.error('Error verifying card number:', err);
            console.log('Error processing card');
            setError('Error processing card');
        } finally {
            setIsLoading(false);
        }
    }, [navigate, startTimer]);

    const handleScan = useCallback((data) => {
        console.log("Scan data received:", data);
        if (data) {
            try {
                console.log('Scanned data:', data);
                const scanText = typeof data === 'object' ? data.text : data;
                const parsedData = JSON.parse(scanText);
                verifyQRCode(parsedData);
            } catch (error) {
                console.log('Parsing failed, trying direct verification');
                verifyQRCode(data);
            }
        }
    }, [verifyQRCode]);

    const handleError = (err) => {
        console.error("Scanning error:", err);
        console.error('Scanning error:', err);
        console.log('Error scanning QR code');
        setError('Error scanning QR code');
    };

    const handleManualEntry = () => {
        const manualCardNumber = prompt('Enter Card Number:');
        if (manualCardNumber) {
            verifyQRCode({ card_number: manualCardNumber });
        }
    };

    if (!cameraPermission) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl p-8 text-center max-w-md w-full">
                    <div className="mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Camera Access Required</h2>
                    <p className="text-gray-600 mb-6">Please grant camera permissions to scan QR codes</p>
                    <button 
                        className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center space-x-2"
                        onClick={() => window.location.reload()}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                        </svg>
                        <span>Retry</span>
                    </button>
                </div>
            </div>
        );
    }

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

                        <div className="mb-6 border-4 border-blue-200 rounded-lg overflow-hidden">
                            <QrScanner
                                onScan={handleScan}
                                onError={handleError}
                                style={{ width: '100%' }}
                            />
                        </div>

                        <button 
                            onClick={handleManualEntry}
                            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center space-x-2 mb-4"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                            <span>Manual Card Entry</span>
                        </button>

                        {error && (
                            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-4">
                                <p>{error}</p>
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
                                        <span>Card Number: {cardDetails.card_number}</span></p>
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
