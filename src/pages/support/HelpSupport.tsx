import { motion } from 'framer-motion';
import React, { useState } from 'react';
import {
    FaArrowLeft,
    FaComments,
    FaCreditCard,
    FaEnvelope,
    FaGamepad,
    FaGift,
    FaPhone,
    FaQrcode,
    FaQuestionCircle,
    FaSearch,
    FaTimes,
    FaTools
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../components/notifications/NotificationSystem';

interface FAQ {
    id: string;
    question: string;
    answer: string;
    category: 'general' | 'games' | 'payment' | 'technical' | 'rewards';
    tags: string[];
}

interface SupportTicket {
    id: string;
    subject: string;
    description: string;
    category: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    createdAt: string;
    updatedAt: string;
}

const HelpSupport: React.FC = () => {
    const { success, error, info } = useNotification();
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [showContactForm, setShowContactForm] = useState(false);
    const [contactForm, setContactForm] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
        category: 'general'
    });

    const faqs: FAQ[] = [
        {
            id: '1',
            question: 'How do I start playing games?',
            answer: 'To start playing, scan a QR code at any participating cafe or join a multiplayer room. You can also play solo games directly from the app.',
            category: 'games',
            tags: ['getting-started', 'qr-code', 'multiplayer']
        },
        {
            id: '2',
            question: 'What payment methods are accepted?',
            answer: 'We accept Telebirr, CBE Birr, credit/debit cards, and digital wallets. All payments are secure and processed locally in Ethiopia.',
            category: 'payment',
            tags: ['payment', 'telebirr', 'cbe', 'security']
        },
        {
            id: '3',
            question: 'How do I redeem rewards?',
            answer: 'Earn points by playing games, then visit the Rewards section to browse available rewards. Select a reward and confirm to redeem it at participating cafes.',
            category: 'rewards',
            tags: ['rewards', 'points', 'redemption']
        },
        {
            id: '4',
            question: 'Can I play with friends?',
            answer: 'Yes! Create a multiplayer room or join existing ones. You can invite friends using room codes or find public rooms to join.',
            category: 'games',
            tags: ['multiplayer', 'friends', 'rooms']
        },
        {
            id: '5',
            question: 'What if I lose my internet connection?',
            answer: 'Games automatically save your progress. If you lose connection, you can resume when you reconnect. Solo games work offline.',
            category: 'technical',
            tags: ['offline', 'connection', 'progress']
        },
        {
            id: '6',
            question: 'How do I become a cafe owner?',
            answer: 'Contact our business development team through the admin panel. We\'ll guide you through the setup process and tablet station configuration.',
            category: 'general',
            tags: ['business', 'cafe-owner', 'partnership']
        },
        {
            id: '7',
            question: 'Are my personal details safe?',
            answer: 'Yes, we use industry-standard encryption and never share your personal information. Your data is stored securely and you control your privacy settings.',
            category: 'general',
            tags: ['privacy', 'security', 'data']
        },
        {
            id: '8',
            question: 'How do I report a bug?',
            answer: 'Use the contact form below or email support@yenege.com. Include details about the issue, your device, and steps to reproduce the problem.',
            category: 'technical',
            tags: ['bugs', 'support', 'reporting']
        }
    ];

    const troubleshootingGuides = [
        {
            title: 'QR Code Not Scanning',
            steps: [
                'Ensure your camera has permission to access the app',
                'Clean your camera lens',
                'Hold the QR code steady and well-lit',
                'Try moving closer or further from the code'
            ],
            icon: FaQrcode
        },
        {
            title: 'Payment Issues',
            steps: [
                'Check your internet connection',
                'Verify your payment method details',
                'Ensure sufficient funds in your account',
                'Try a different payment method if available'
            ],
            icon: FaCreditCard
        },
        {
            title: 'Game Not Loading',
            steps: [
                'Refresh the page or restart the app',
                'Check your internet connection',
                'Clear your browser cache',
                'Try using a different browser or device'
            ],
            icon: FaGamepad
        },
        {
            title: 'Reward Redemption Failed',
            steps: [
                'Verify you have enough points',
                'Check if the reward is still available',
                'Ensure you\'re at the correct cafe location',
                'Contact cafe staff for assistance'
            ],
            icon: FaGift
        }
    ];

    const filteredFAQs = faqs.filter(faq => {
        const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             faq.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleContactSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!contactForm.name || !contactForm.email || !contactForm.subject || !contactForm.message) {
            error('Form Error', 'Please fill in all required fields');
            return;
        }

        try {
            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            success('Message Sent', 'Your support request has been submitted successfully. We\'ll respond within 24 hours.');
            setShowContactForm(false);
            setContactForm({ name: '', email: '', subject: '', message: '', category: 'general' });
        } catch (err) {
            error('Submission Failed', 'Failed to send message. Please try again.');
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'games': return <FaGamepad />;
            case 'payment': return <FaCreditCard />;
            case 'rewards': return <FaGift />;
            case 'technical': return <FaTools />;
            default: return <FaQuestionCircle />;
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'games': return 'text-green-400 bg-green-400/10 border-green-400/20';
            case 'payment': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
            case 'rewards': return 'text-gold-primary bg-gold-primary/10 border-gold-primary/20';
            case 'technical': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
            default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
        }
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
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
                                <FaQuestionCircle className="text-white text-xl" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">
                                Help & Support
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Page Header */}
            <div className="px-6 mb-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center">
                        <h1 className="text-3xl md:text-4xl font-bold mb-4">How Can We Help?</h1>
                        <p className="text-xl text-gray-light">
                            Find answers to common questions, troubleshoot issues, and get in touch with our support team
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="px-6 mb-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => setShowContactForm(true)}
                            className="p-6 bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl text-white hover:from-blue-600 hover:to-blue-800 transition-all"
                        >
                            <FaEnvelope className="text-2xl mb-3" />
                            <h3 className="font-bold mb-2">Contact Support</h3>
                            <p className="text-sm text-blue-100">Get help from our team</p>
                        </motion.button>

                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            onClick={() => setSelectedCategory('games')}
                            className="p-6 bg-gradient-to-r from-green-500 to-green-700 rounded-xl text-white hover:from-green-600 hover:to-green-800 transition-all"
                        >
                            <FaGamepad className="text-2xl mb-3" />
                            <h3 className="font-bold mb-2">Game Help</h3>
                            <p className="text-sm text-green-100">Learn how to play</p>
                        </motion.button>

                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            onClick={() => setSelectedCategory('payment')}
                            className="p-6 bg-gradient-to-r from-gold-primary to-gold-secondary rounded-xl text-black-primary hover:from-gold-secondary hover:to-gold-primary transition-all"
                        >
                            <FaCreditCard className="text-2xl mb-3" />
                            <h3 className="font-bold mb-2">Payment Help</h3>
                            <p className="text-sm text-black-primary/80">Payment troubleshooting</p>
                        </motion.button>

                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            onClick={() => setSelectedCategory('technical')}
                            className="p-6 bg-gradient-to-r from-purple-500 to-purple-700 rounded-xl text-white hover:from-purple-600 hover:to-purple-800 transition-all"
                        >
                            <FaTools className="text-2xl mb-3" />
                            <h3 className="font-bold mb-2">Technical Issues</h3>
                            <p className="text-sm text-purple-100">Fix common problems</p>
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="px-6 mb-8">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-black-secondary rounded-xl border border-gray-dark p-6">
                        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-light" />
                                    <input
                                        type="text"
                                        placeholder="Search for help..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-black-primary border border-gray-dark rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                    />
                                </div>
                            </div>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="px-4 py-3 bg-black-primary border border-gray-dark rounded-lg text-white focus:border-blue-500 focus:outline-none"
                            >
                                <option value="all">All Categories</option>
                                <option value="general">General</option>
                                <option value="games">Games</option>
                                <option value="payment">Payment</option>
                                <option value="rewards">Rewards</option>
                                <option value="technical">Technical</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* FAQs */}
            <div className="px-6 mb-8">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
                    
                    {filteredFAQs.length === 0 ? (
                        <div className="text-center py-12">
                            <FaQuestionCircle className="text-6xl text-gray-light mx-auto mb-4" />
                            <p className="text-xl text-gray-light">No questions found</p>
                            <p className="text-gray-light">Try adjusting your search or category filter</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredFAQs.map((faq) => (
                                <motion.div
                                    key={faq.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-black-secondary rounded-xl border border-gray-dark overflow-hidden"
                                >
                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center space-x-3">
                                                <span className={`px-3 py-1 rounded-full text-xs border ${getCategoryColor(faq.category)}`}>
                                                    {getCategoryIcon(faq.category)}
                                                    <span className="ml-1 capitalize">{faq.category}</span>
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <h3 className="text-lg font-bold mb-3">{faq.question}</h3>
                                        <p className="text-gray-light leading-relaxed">{faq.answer}</p>
                                        
                                        <div className="flex flex-wrap gap-2 mt-4">
                                            {faq.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="px-2 py-1 bg-gray-dark text-gray-light text-xs rounded"
                                                >
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Troubleshooting Guides */}
            <div className="px-6 mb-8">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-2xl font-bold mb-6">Troubleshooting Guides</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {troubleshootingGuides.map((guide, index) => (
                            <motion.div
                                key={guide.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-black-secondary rounded-xl border border-gray-dark p-6"
                            >
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
                                        <guide.icon className="text-white text-xl" />
                                    </div>
                                    <h3 className="text-xl font-bold">{guide.title}</h3>
                                </div>
                                
                                <div className="space-y-3">
                                    {guide.steps.map((step, stepIndex) => (
                                        <div key={stepIndex} className="flex items-start space-x-3">
                                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                                <span className="text-white text-xs font-bold">{stepIndex + 1}</span>
                                            </div>
                                            <p className="text-gray-light text-sm">{step}</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Contact Information */}
            <div className="px-6 mb-8">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-black-secondary rounded-xl border border-gray-dark p-6">
                        <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FaEnvelope className="text-white text-2xl" />
                                </div>
                                <h3 className="font-bold mb-2">Email Support</h3>
                                <p className="text-gray-light text-sm mb-3">Get help via email</p>
                                <a href="mailto:support@yenege.com" className="text-blue-400 hover:text-blue-300">
                                    support@yenege.com
                                </a>
                            </div>
                            
                            <div className="text-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FaPhone className="text-white text-2xl" />
                                </div>
                                <h3 className="font-bold mb-2">Phone Support</h3>
                                <p className="text-gray-light text-sm mb-3">Call us directly</p>
                                <a href="tel:+251911234567" className="text-green-400 hover:text-green-300">
                                    +251 91 123 4567
                                </a>
                            </div>
                            
                            <div className="text-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FaComments className="text-white text-2xl" />
                                </div>
                                <h3 className="font-bold mb-2">Live Chat</h3>
                                <p className="text-gray-light text-sm mb-3">Chat with support</p>
                                <button className="text-purple-400 hover:text-purple-300">
                                    Start Chat
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Form Modal */}
            {showContactForm && (
                <div className="fixed inset-0 bg-black-primary/80 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-black-secondary rounded-xl border border-gray-dark p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold">Contact Support</h3>
                            <button
                                onClick={() => setShowContactForm(false)}
                                className="text-gray-light hover:text-white"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <form onSubmit={handleContactSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Name *</label>
                                    <input
                                        type="text"
                                        value={contactForm.name}
                                        onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full px-4 py-3 bg-black-primary border border-gray-dark rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Email *</label>
                                    <input
                                        type="email"
                                        value={contactForm.email}
                                        onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                                        className="w-full px-4 py-3 bg-black-primary border border-gray-dark rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-2">Category</label>
                                <select
                                    value={contactForm.category}
                                    onChange={(e) => setContactForm(prev => ({ ...prev, category: e.target.value }))}
                                    className="w-full px-4 py-3 bg-black-primary border border-gray-dark rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                >
                                    <option value="general">General Inquiry</option>
                                    <option value="technical">Technical Issue</option>
                                    <option value="billing">Billing Question</option>
                                    <option value="feature">Feature Request</option>
                                    <option value="bug">Bug Report</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-2">Subject *</label>
                                <input
                                    type="text"
                                    value={contactForm.subject}
                                    onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                                    className="w-full px-4 py-3 bg-black-primary border border-gray-dark rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-2">Message *</label>
                                <textarea
                                    value={contactForm.message}
                                    onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                                    rows={5}
                                    className="w-full px-4 py-3 bg-black-primary border border-gray-dark rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                    placeholder="Describe your issue or question..."
                                    required
                                />
                            </div>
                            
                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowContactForm(false)}
                                    className="flex-1 px-6 py-3 bg-gray-dark text-white rounded-lg hover:bg-gray-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    Send Message
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default HelpSupport;
