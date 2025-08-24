import { motion } from 'framer-motion';
import React, { useState } from 'react';
import {
  FaArrowLeft,
  FaCheckCircle,
  FaCreditCard,
  FaLock,
  FaMobile,
  FaShieldAlt,
  FaSpinner,
  FaTimes,
  FaUniversity,
  FaWallet
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { usePayment } from '../../contexts/PaymentContext';

interface PaymentMethod {
    id: string;
    name: string;
    icon: React.ReactNode;
    description: string;
    isAvailable: boolean;
    processingTime: string;
}

interface PaymentForm {
    amount: number;
    method: string;
    phoneNumber?: string;
    cardNumber?: string;
    cardExpiry?: string;
    cardCvv?: string;
    bankAccount?: string;
    walletId?: string;
}

const PaymentPage: React.FC = () => {
    const { user } = useAuth();
    const { initiatePayment, verifyPayment } = usePayment();
    const navigate = useNavigate();

    const [selectedMethod, setSelectedMethod] = useState<string>('');
    const [paymentForm, setPaymentForm] = useState<PaymentForm>({
        amount: 0,
        method: ''
    });
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const paymentMethods: PaymentMethod[] = [
        {
            id: 'telebirr',
            name: 'Telebirr',
            icon: <FaMobile className="text-2xl" />,
            description: 'Mobile money transfer via Ethio Telecom',
            isAvailable: true,
            processingTime: 'Instant'
        },
        {
            id: 'cbe',
            name: 'CBE Birr',
            icon: <FaUniversity className="text-2xl" />,
            description: 'Commercial Bank of Ethiopia mobile banking',
            isAvailable: true,
            processingTime: '2-5 minutes'
        },
        {
            id: 'card',
            name: 'Credit/Debit Card',
            icon: <FaCreditCard className="text-2xl" />,
            description: 'Visa, Mastercard, and local bank cards',
            isAvailable: true,
            processingTime: '1-3 minutes'
        },
        {
            id: 'wallet',
            name: 'Digital Wallet',
            icon: <FaWallet className="text-2xl" />,
            description: 'Various digital wallet services',
            isAvailable: true,
            processingTime: 'Instant'
        }
    ];

    const handleMethodSelect = (methodId: string) => {
        setSelectedMethod(methodId);
        setPaymentForm(prev => ({ ...prev, method: methodId }));
        setErrorMessage('');
        setPaymentStatus('idle');
    };

    const handleInputChange = (field: keyof PaymentForm, value: string | number) => {
        setPaymentForm(prev => ({ ...prev, [field]: value }));
    };

    const validateForm = (): boolean => {
        if (!paymentForm.amount || paymentForm.amount <= 0) {
            setErrorMessage('Please enter a valid amount');
            return false;
        }

        if (!paymentForm.method) {
            setErrorMessage('Please select a payment method');
            return false;
        }

        // Method-specific validation
        switch (paymentForm.method) {
            case 'telebirr':
            case 'cbe':
                if (!paymentForm.phoneNumber || paymentForm.phoneNumber.length < 10) {
                    setErrorMessage('Please enter a valid phone number');
                    return false;
                }
                break;
            case 'card':
                if (!paymentForm.cardNumber || !paymentForm.cardExpiry || !paymentForm.cardCvv) {
                    setErrorMessage('Please fill in all card details');
                    return false;
                }
                break;
            case 'wallet':
                if (!paymentForm.walletId) {
                    setErrorMessage('Please enter your wallet ID');
                    return false;
                }
                break;
        }

        return true;
    };

    const handlePayment = async () => {
        if (!validateForm()) return;

        try {
            setIsProcessing(true);
            setPaymentStatus('processing');
            setErrorMessage('');

            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Mock payment result
            const paymentResult = await initiatePayment({
                amount: paymentForm.amount,
                method: paymentForm.method,
                userId: user?.id || '',
                metadata: paymentForm
            });

            if (paymentResult.success) {
                setPaymentStatus('success');
                // Redirect to success page or game after a delay
                setTimeout(() => {
                    navigate('/game/selection');
                }, 2000);
            } else {
                setPaymentStatus('failed');
                setErrorMessage(paymentResult.message || 'Payment failed. Please try again.');
            }
        } catch (error) {
            setPaymentStatus('failed');
            setErrorMessage('An unexpected error occurred. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const renderPaymentForm = () => {
        if (!selectedMethod) return null;

        const method = paymentMethods.find(m => m.id === selectedMethod);
        if (!method) return null;

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-black-secondary rounded-xl border border-gray-dark p-6"
            >
                <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-gold-primary to-gold-secondary rounded-lg flex items-center justify-center text-black-primary">
                        {method.icon}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">{method.name}</h3>
                        <p className="text-gray-light">{method.description}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Amount Input */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Amount (ETB)</label>
                        <input
                            type="number"
                            value={paymentForm.amount}
                            onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                            className="w-full px-4 py-3 bg-black-primary border border-gray-dark rounded-lg text-white focus:border-gold-primary focus:outline-none"
                            placeholder="Enter amount"
                            min="1"
                            step="0.01"
                        />
                    </div>

                    {/* Method-specific fields */}
                    {(selectedMethod === 'telebirr' || selectedMethod === 'cbe') && (
                        <div>
                            <label className="block text-sm font-medium mb-2">Phone Number</label>
                            <input
                                type="tel"
                                value={paymentForm.phoneNumber || ''}
                                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                className="w-full px-4 py-3 bg-black-primary border border-gray-dark rounded-lg text-white focus:border-gold-primary focus:outline-none"
                                placeholder="e.g., 0912345678"
                            />
                        </div>
                    )}

                    {selectedMethod === 'card' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Card Number</label>
                                <input
                                    type="text"
                                    value={paymentForm.cardNumber || ''}
                                    onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                                    className="w-full px-4 py-3 bg-black-primary border border-gray-dark rounded-lg text-white focus:border-gold-primary focus:outline-none"
                                    placeholder="1234 5678 9012 3456"
                                    maxLength={19}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Expiry Date</label>
                                    <input
                                        type="text"
                                        value={paymentForm.cardExpiry || ''}
                                        onChange={(e) => handleInputChange('cardExpiry', e.target.value)}
                                        className="w-full px-4 py-3 bg-black-primary border border-gray-dark rounded-lg text-white focus:border-gold-primary focus:outline-none"
                                        placeholder="MM/YY"
                                        maxLength={5}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">CVV</label>
                                    <input
                                        type="text"
                                        value={paymentForm.cardCvv || ''}
                                        onChange={(e) => handleInputChange('cardCvv', e.target.value)}
                                        className="w-full px-4 py-3 bg-black-primary border border-gray-dark rounded-lg text-white focus:border-gold-primary focus:outline-none"
                                        placeholder="123"
                                        maxLength={4}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedMethod === 'wallet' && (
                        <div>
                            <label className="block text-sm font-medium mb-2">Wallet ID</label>
                            <input
                                type="text"
                                value={paymentForm.walletId || ''}
                                onChange={(e) => handleInputChange('walletId', e.target.value)}
                                className="w-full px-4 py-3 bg-black-primary border border-gray-dark rounded-lg text-white focus:border-gold-primary focus:outline-none"
                                placeholder="Enter your wallet ID"
                            />
                        </div>
                    )}

                    {/* Payment Button */}
                    <button
                        onClick={handlePayment}
                        disabled={isProcessing}
                        className="w-full py-4 bg-gradient-to-r from-gold-primary to-gold-secondary text-black-primary font-bold rounded-lg hover:from-gold-secondary hover:to-gold-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? (
                            <div className="flex items-center justify-center">
                                <FaSpinner className="animate-spin mr-2" />
                                Processing Payment...
                            </div>
                        ) : (
                            `Pay ${paymentForm.amount > 0 ? `ETB ${paymentForm.amount.toFixed(2)}` : ''}`
                        )}
                    </button>

                    {/* Processing Time Info */}
                    <div className="text-center text-sm text-gray-light">
                        Processing time: {method.processingTime}
                    </div>
                </div>
            </motion.div>
        );
    };

    const renderPaymentStatus = () => {
        if (paymentStatus === 'idle') return null;

        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`fixed inset-0 bg-black-primary/80 flex items-center justify-center z-50`}
            >
                <div className="bg-black-secondary rounded-xl border border-gray-dark p-8 text-center max-w-md mx-4">
                    {paymentStatus === 'processing' && (
                        <>
                            <FaSpinner className="w-16 h-16 text-gold-primary animate-spin mx-auto mb-4" />
                            <h3 className="text-xl font-bold mb-2">Processing Payment</h3>
                            <p className="text-gray-light">Please wait while we process your payment...</p>
                        </>
                    )}

                    {paymentStatus === 'success' && (
                        <>
                            <FaCheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                            <h3 className="text-xl font-bold mb-2 text-green-400">Payment Successful!</h3>
                            <p className="text-gray-light">Redirecting to game selection...</p>
                        </>
                    )}

                    {paymentStatus === 'failed' && (
                        <>
                            <FaTimes className="w-16 h-16 text-red-400 mx-auto mb-4" />
                            <h3 className="text-xl font-bold mb-2 text-red-400">Payment Failed</h3>
                            <p className="text-gray-light mb-4">{errorMessage}</p>
                            <button
                                onClick={() => setPaymentStatus('idle')}
                                className="px-6 py-2 bg-gray-dark text-white rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                Try Again
                            </button>
                        </>
                    )}
                </div>
            </motion.div>
        );
    };

    return (
        <div className="min-h-screen bg-black-primary text-white">
            {/* Header */}
            <div className="relative z-10 px-6 py-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center text-gray-light hover:text-white transition-colors"
                        >
                            <FaArrowLeft className="mr-2" />
                            Back to Home
                        </button>

                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-gold-primary to-gold-secondary rounded-lg flex items-center justify-center">
                                <FaLock className="text-black-primary text-xl" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-gold-primary to-gold-secondary bg-clip-text text-transparent">
                                Secure Payment
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Page Header */}
            <div className="px-6 mb-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center">
                        <h1 className="text-3xl md:text-4xl font-bold mb-4">Complete Your Payment</h1>
                        <p className="text-xl text-gray-light">
                            Choose your preferred payment method to access the games
                        </p>
                    </div>
                </div>
            </div>

            {/* Payment Methods */}
            <div className="px-6 mb-8">
                <div className="max-w-4xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {paymentMethods.map((method) => (
                            <motion.div
                                key={method.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                                    selectedMethod === method.id
                                        ? 'border-gold-primary bg-gold-primary/10'
                                        : 'border-gray-dark bg-black-secondary hover:border-gray-light'
                                } ${!method.isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={() => method.isAvailable && handleMethodSelect(method.id)}
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-gold-primary to-gold-secondary rounded-lg flex items-center justify-center text-black-primary">
                                        {method.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold mb-2">{method.name}</h3>
                                        <p className="text-gray-light text-sm mb-2">{method.description}</p>
                                        <div className="flex items-center space-x-2">
                                            <FaShieldAlt className="text-green-400 text-sm" />
                                            <span className="text-xs text-gray-light">Secure & Fast</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Payment Form */}
            {selectedMethod && (
                <div className="px-6 mb-8">
                    <div className="max-w-2xl mx-auto">
                        {renderPaymentForm()}
                    </div>
                </div>
            )}

            {/* Security Notice */}
            <div className="px-6 pb-12">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-black-secondary rounded-xl border border-gray-dark p-6 text-center">
                        <div className="flex items-center justify-center space-x-2 mb-3">
                            <FaShieldAlt className="text-gold-primary" />
                            <span className="text-gold-primary font-medium">100% Secure Payment</span>
                        </div>
                        <p className="text-gray-light text-sm">
                            Your payment information is encrypted and secure. We never store your card details.
                        </p>
                    </div>
                </div>
            </div>

            {/* Payment Status Modal */}
            {renderPaymentStatus()}
        </div>
    );
};

export default PaymentPage;
