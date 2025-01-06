import React, { useState, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { TimeContext } from '../App';
import QrScanner from 'react-qr-scanner';
import { 
    Box, 
    VStack, 
    Heading, 
    Text, 
    Alert, 
    AlertIcon, 
    AlertTitle, 
    AlertDescription,
    Spinner,
    Center 
} from '@chakra-ui/react';

const QRScanMode = () => {
    const [qrCode, setQRCode] = useState('');
    const [cardDetails, setCardDetails] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { startTimer } = useContext(TimeContext);

    const GAME_ROUTES = {
        1: '/trivia-game',
        2: '/truth-or-dare',
        3: '/rock-paper-scissors',
        4: '/emoji-game',
    };

    const verifyQRCode = useCallback(async (scannedData) => {
        setIsLoading(true);
        setError(null);

        try {
            // [Previous verification logic remains the same]
        } catch (err) {
            console.error('Error verifying card number:', err);
            setError('Error processing card');
        } finally {
            setIsLoading(false);
        }
    }, [navigate, startTimer]);

    const handleScan = useCallback((data) => {
        if (data) {
            try {
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
        console.error('Scanning error:', err);
        setError('Error scanning QR code');
    };

    return (
        <Box 
            height="100vh" 
            display="flex" 
            flexDirection="column" 
            alignItems="center" 
            justifyContent="center" 
            bg="gray.100" 
            p={4}
        >
            <VStack spacing={6} width="100%" maxWidth="500px">
                <Heading 
                    textAlign="center" 
                    color="blue.600" 
                    mb={4}
                >
                    Scan QR Code
                </Heading>

                {isLoading ? (
                    <Center width="100%">
                        <Spinner 
                            size="xl" 
                            color="blue.500" 
                            thickness="4px" 
                        />
                    </Center>
                ) : (
                    <Box 
                        width="100%" 
                        borderRadius="lg" 
                        overflow="hidden" 
                        boxShadow="md"
                    >
                        <QrScanner
                            onScan={handleScan}
                            onError={handleError}
                            style={{ 
                                width: '100%', 
                                borderRadius: '10px' 
                            }}
                        />
                    </Box>
                )}

                {error && (
                    <Alert status="error" borderRadius="md">
                        <AlertIcon />
                        <AlertTitle mr={2}>Error!</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {cardDetails && (
                    <Box 
                        bg="white" 
                        p={6} 
                        borderRadius="lg" 
                        boxShadow="md" 
                        width="100%"
                    >
                        <Heading size="md" mb={4} color="blue.600">
                            Card Details
                        </Heading>
                        <VStack align="start" spacing={2}>
                            <Text>
                                <strong>Card Number:</strong> {cardDetails.card_number}
                            </Text>
                            <Text>
                                <strong>Game Type:</strong> {cardDetails.game_types.name}
                            </Text>
                            <Text>
                                <strong>Duration:</strong> {cardDetails.duration} minutes
                            </Text>
                        </VStack>
                    </Box>
                )}
            </VStack>
        </Box>
    );
};

export default QRScanMode;