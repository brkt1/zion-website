import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import {
  FaArrowLeft,
  FaCheckCircle,
  FaClock,
  FaCreditCard,
  FaDownload,
  FaEye,
  FaHistory,
  FaMobile,
  FaSearch,
  FaSort,
  FaSortDown,
  FaSortUp,
  FaTimes,
  FaUniversity,
  FaWallet
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { usePayment } from '../../contexts/PaymentContext';

interface PaymentTransaction {
    id: string;
    amount: number;
    method: string;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    timestamp: string;
    description: string;
    reference: string;
    metadata?: any;
}

type SortField = 'amount' | 'timestamp' | 'status' | 'method';
type SortDirection = 'asc' | 'desc';

const PaymentHistory: React.FC = () => {
    const { user } = useAuth();
    const { getPaymentHistory } = usePayment();
    const navigate = useNavigate();

    const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
    const [filteredTransactions, setFilteredTransactions] = useState<PaymentTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [methodFilter, setMethodFilter] = useState<string>('all');
    const [sortField, setSortField] = useState<SortField>('timestamp');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    useEffect(() => {
        if (!user) {
            navigate('/auth/login');
            return;
        }
        loadPaymentHistory();
    }, [user, navigate]);

    useEffect(() => {
        filterAndSortTransactions();
    }, [transactions, searchTerm, statusFilter, methodFilter, sortField, sortDirection]);

    const loadPaymentHistory = async () => {
        try {
            setIsLoading(true);
            
            // Mock data for demonstration
            const mockTransactions: PaymentTransaction[] = [
                {
                    id: '1',
                    amount: 50.00,
                    method: 'telebirr',
                    status: 'completed',
                    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
                    description: 'Game Access Payment',
                    reference: 'TXN-001-2024',
                    metadata: { phoneNumber: '0912345678' }
                },
                {
                    id: '2',
                    amount: 75.00,
                    method: 'cbe',
                    status: 'completed',
                    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
                    description: 'Premium Game Package',
                    reference: 'TXN-002-2024',
                    metadata: { accountNumber: '1000123456789' }
                },
                {
                    id: '3',
                    amount: 100.00,
                    method: 'card',
                    status: 'pending',
                    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
                    description: 'Event Registration',
                    reference: 'TXN-003-2024',
                    metadata: { cardLast4: '1234' }
                },
                {
                    id: '4',
                    amount: 25.00,
                    method: 'wallet',
                    status: 'failed',
                    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
                    description: 'Quick Game Access',
                    reference: 'TXN-004-2024',
                    metadata: { walletId: 'WLT-001' }
                },
                {
                    id: '5',
                    amount: 150.00,
                    method: 'telebirr',
                    status: 'refunded',
                    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
                    description: 'Event Package (Refunded)',
                    reference: 'TXN-005-2024',
                    metadata: { phoneNumber: '0912345678', refundReason: 'Event cancelled' }
                }
            ];

            setTransactions(mockTransactions);
        } catch (error) {
            console.error('Error loading payment history:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filterAndSortTransactions = () => {
        let filtered = [...transactions];

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(txn => 
                txn.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                txn.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                txn.method.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(txn => txn.status === statusFilter);
        }

        // Apply method filter
        if (methodFilter !== 'all') {
            filtered = filtered.filter(txn => txn.method === methodFilter);
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let aValue: any, bValue: any;

            switch (sortField) {
                case 'amount':
                    aValue = a.amount;
                    bValue = b.amount;
                    break;
                case 'timestamp':
                    aValue = new Date(a.timestamp).getTime();
                    bValue = new Date(b.timestamp).getTime();
                    break;
                case 'status':
                    aValue = a.status;
                    bValue = b.status;
                    break;
                case 'method':
                    aValue = a.method;
                    bValue = b.method;
                    break;
                default:
                    return 0;
            }

            if (sortDirection === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        setFilteredTransactions(filtered);
    };

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'text-green-400 bg-green-400/10 border-green-400/20';
            case 'pending': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
            case 'failed': return 'text-red-400 bg-red-400/10 border-red-400/20';
            case 'refunded': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
            default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <FaCheckCircle />;
            case 'pending': return <FaClock />;
            case 'failed': return <FaTimes />;
            case 'refunded': return <FaCheckCircle />;
            default: return <FaClock />;
        }
    };

    const getMethodIcon = (method: string) => {
        switch (method) {
            case 'telebirr': return <FaMobile />;
            case 'cbe': return <FaUniversity />;
            case 'card': return <FaCreditCard />;
            case 'wallet': return <FaWallet />;
            default: return <FaCreditCard />;
        }
    };

    const getMethodName = (method: string) => {
        switch (method) {
            case 'telebirr': return 'Telebirr';
            case 'cbe': return 'CBE Birr';
            case 'card': return 'Card';
            case 'wallet': return 'Wallet';
            default: return method;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return 'Today';
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString();
        }
    };

    const exportToCSV = () => {
        const headers = ['Date', 'Reference', 'Description', 'Amount', 'Method', 'Status'];
        const csvContent = [
            headers.join(','),
            ...filteredTransactions.map(txn => [
                formatDate(txn.timestamp),
                txn.reference,
                txn.description,
                txn.amount.toFixed(2),
                getMethodName(txn.method),
                txn.status
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payment-history-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black-primary text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-gold-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-xl">Loading payment history...</p>
                </div>
            </div>
        );
    }

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
                                <FaHistory className="text-black-primary text-xl" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-gold-primary to-gold-secondary bg-clip-text text-transparent">
                                Payment History
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Page Header */}
            <div className="px-6 mb-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center">
                        <h1 className="text-3xl md:text-4xl font-bold mb-4">Payment History</h1>
                        <p className="text-xl text-gray-light">
                            View and manage your payment transactions
                        </p>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="px-6 mb-8">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-black-secondary rounded-xl border border-gray-dark p-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            {/* Search */}
                            <div className="relative">
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-light" />
                                <input
                                    type="text"
                                    placeholder="Search transactions..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-black-primary border border-gray-dark rounded-lg text-white focus:border-gold-primary focus:outline-none"
                                />
                            </div>

                            {/* Status Filter */}
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-2 bg-black-primary border border-gray-dark rounded-lg text-white focus:border-gold-primary focus:outline-none"
                            >
                                <option value="all">All Status</option>
                                <option value="completed">Completed</option>
                                <option value="pending">Pending</option>
                                <option value="failed">Failed</option>
                                <option value="refunded">Refunded</option>
                            </select>

                            {/* Method Filter */}
                            <select
                                value={methodFilter}
                                onChange={(e) => setMethodFilter(e.target.value)}
                                className="px-4 py-2 bg-black-primary border border-gray-dark rounded-lg text-white focus:border-gold-primary focus:outline-none"
                            >
                                <option value="all">All Methods</option>
                                <option value="telebirr">Telebirr</option>
                                <option value="cbe">CBE Birr</option>
                                <option value="card">Card</option>
                                <option value="wallet">Wallet</option>
                            </select>

                            {/* Export Button */}
                            <button
                                onClick={exportToCSV}
                                className="px-4 py-2 bg-gold-primary text-black-primary font-medium rounded-lg hover:bg-gold-secondary transition-colors flex items-center justify-center"
                            >
                                <FaDownload className="mr-2" />
                                Export CSV
                            </button>
                        </div>

                        {/* Results Count */}
                        <div className="text-sm text-gray-light">
                            Showing {filteredTransactions.length} of {transactions.length} transactions
                        </div>
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="px-6 pb-12">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-black-secondary rounded-xl border border-gray-dark overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-black-primary">
                                    <tr>
                                        <th className="px-6 py-4 text-left">
                                            <button
                                                onClick={() => handleSort('timestamp')}
                                                className="flex items-center space-x-2 hover:text-gold-primary transition-colors"
                                            >
                                                <span>Date</span>
                                                {sortField === 'timestamp' ? (
                                                    sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />
                                                ) : (
                                                    <FaSort />
                                                )}
                                            </button>
                                        </th>
                                        <th className="px-6 py-4 text-left">Reference</th>
                                        <th className="px-6 py-4 text-left">Description</th>
                                        <th className="px-6 py-4 text-left">
                                            <button
                                                onClick={() => handleSort('amount')}
                                                className="flex items-center space-x-2 hover:text-gold-primary transition-colors"
                                            >
                                                <span>Amount</span>
                                                {sortField === 'amount' ? (
                                                    sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />
                                                ) : (
                                                    <FaSort />
                                                )}
                                            </button>
                                        </th>
                                        <th className="px-6 py-4 text-left">
                                            <button
                                                onClick={() => handleSort('method')}
                                                className="flex items-center space-x-2 hover:text-gold-primary transition-colors"
                                            >
                                                <span>Method</span>
                                                {sortField === 'method' ? (
                                                    sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />
                                                ) : (
                                                    <FaSort />
                                                )}
                                            </button>
                                        </th>
                                        <th className="px-6 py-4 text-left">
                                            <button
                                                onClick={() => handleSort('status')}
                                                className="flex items-center space-x-2 hover:text-gold-primary transition-colors"
                                            >
                                                <span>Status</span>
                                                {sortField === 'status' ? (
                                                    sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />
                                                ) : (
                                                    <FaSort />
                                                )}
                                            </button>
                                        </th>
                                        <th className="px-6 py-4 text-left">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-dark">
                                    {filteredTransactions.map((transaction) => (
                                        <motion.tr
                                            key={transaction.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="hover:bg-black-primary/50 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="font-medium">{formatDate(transaction.timestamp)}</div>
                                                    <div className="text-sm text-gray-light">
                                                        {new Date(transaction.timestamp).toLocaleTimeString()}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-sm">{transaction.reference}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="max-w-xs">
                                                    <div className="font-medium">{transaction.description}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-lg">
                                                    ETB {transaction.amount.toFixed(2)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-8 h-8 bg-gray-dark rounded-lg flex items-center justify-center">
                                                        {getMethodIcon(transaction.method)}
                                                    </div>
                                                    <span>{getMethodName(transaction.method)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(transaction.status)}`}>
                                                    {getStatusIcon(transaction.status)}
                                                    <span className="ml-2 capitalize">{transaction.status}</span>
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button className="text-gold-primary hover:text-gold-secondary transition-colors">
                                                    <FaEye />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {filteredTransactions.length === 0 && (
                            <div className="text-center py-12">
                                <FaHistory className="w-16 h-16 text-gray-light mx-auto mb-4" />
                                <h3 className="text-xl font-medium text-gray-light mb-2">No transactions found</h3>
                                <p className="text-gray-light">Try adjusting your filters or search terms</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentHistory;
