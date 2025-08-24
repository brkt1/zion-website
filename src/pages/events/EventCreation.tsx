import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FaArrowLeft,
    FaCalendar,
    FaMapMarkerAlt,
    FaClock,
    FaUsers,
    FaTablet,
    FaGamepad,
    FaSave,
    FaTimes,
    FaPlus,
    FaTrash,
    FaEye,
    FaEdit
} from 'react-icons/fa';
import { useEvent } from '../../contexts/EventContext';
import { useNotification } from '../../components/notifications/NotificationSystem';

interface EventForm {
    name: string;
    description: string;
    location: string;
    startDate: string;
    endDate: string;
    maxParticipants: number;
    entryFee: number;
    gameTypes: string[];
    tabletStations: TabletStation[];
}

interface TabletStation {
    id: string;
    gameType: string;
    maxPlayers: number;
    isActive: boolean;
    location: string;
}

const EventCreation: React.FC = () => {
    const { createEvent } = useEvent();
    const { success, error, warning } = useNotification();
    const navigate = useNavigate();

    const [eventForm, setEventForm] = useState<EventForm>({
        name: '',
        description: '',
        location: '',
        startDate: '',
        endDate: '',
        maxParticipants: 100,
        entryFee: 0,
        gameTypes: [],
        tabletStations: []
    });

    const [isLoading, setIsLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [showTabletModal, setShowTabletModal] = useState(false);
    const [editingTablet, setEditingTablet] = useState<TabletStation | null>(null);

    const availableGameTypes = [
        'Emoji Game',
        'Trivia',
        'Truth or Dare',
        'Rock Paper Scissors',
        'Word Association',
        'Memory Game',
        'Puzzle Challenge'
    ];

    const handleInputChange = (field: keyof EventForm, value: any) => {
        setEventForm(prev => ({ ...prev, [field]: value }));
    };

    const handleGameTypeToggle = (gameType: string) => {
        setEventForm(prev => ({
            ...prev,
            gameTypes: prev.gameTypes.includes(gameType)
                ? prev.gameTypes.filter(gt => gt !== gameType)
                : [...prev.gameTypes, gameType]
        }));
    };

    const addTabletStation = () => {
        const newTablet: TabletStation = {
            id: Date.now().toString(),
            gameType: '',
            maxPlayers: 4,
            isActive: true,
            location: ''
        };
        setEventForm(prev => ({
            ...prev,
            tabletStations: [...prev.tabletStations, newTablet]
        }));
    };

    const updateTabletStation = (id: string, updates: Partial<TabletStation>) => {
        setEventForm(prev => ({
            ...prev,
            tabletStations: prev.tabletStations.map(ts =>
                ts.id === id ? { ...ts, ...updates } : ts
            )
        }));
    };

    const removeTabletStation = (id: string) => {
        setEventForm(prev => ({
            ...prev,
            tabletStations: prev.tabletStations.filter(ts => ts.id !== id)
        }));
    };

    const validateForm = (): boolean => {
        if (!eventForm.name.trim()) {
            error('Validation Error', 'Event name is required');
            return false;
        }
        if (!eventForm.location.trim()) {
            error('Validation Error', 'Event location is required');
            return false;
        }
        if (!eventForm.startDate) {
            error('Validation Error', 'Start date is required');
            return false;
        }
        if (!eventForm.endDate) {
            error('Validation Error', 'End date is required');
            return false;
        }
        if (new Date(eventForm.startDate) >= new Date(eventForm.endDate)) {
            error('Validation Error', 'End date must be after start date');
            return false;
        }
        if (eventForm.gameTypes.length === 0) {
            error('Validation Error', 'At least one game type must be selected');
            return false;
        }
        if (eventForm.tabletStations.length === 0) {
            error('Validation Error', 'At least one tablet station must be configured');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            setIsLoading(true);
            
            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            success('Event Created', 'Your game night event has been created successfully!');
            
            // Navigate to event dashboard
            setTimeout(() => {
                navigate('/events/dashboard');
            }, 1500);
        } catch (err) {
            error('Creation Failed', 'Failed to create event. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const nextStep = () => {
        if (currentStep < 4) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const renderStepIndicator = () => (
        <div className="flex items-center justify-center mb-8">
            {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        step <= currentStep
                            ? 'bg-gold-primary text-black-primary'
                            : 'bg-gray-dark text-gray-light'
                    }`}>
                        {step}
                    </div>
                    {step < 4 && (
                        <div className={`w-16 h-1 mx-2 ${
                            step < currentStep ? 'bg-gold-primary' : 'bg-gray-dark'
                        }`} />
                    )}
                </div>
            ))}
        </div>
    );

    const renderBasicInfo = () => (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
        >
            <div className="bg-black-secondary rounded-xl border border-gray-dark p-6">
                <h3 className="text-xl font-bold mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Event Name *</label>
                        <input
                            type="text"
                            value={eventForm.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className="w-full px-4 py-3 bg-black-primary border border-gray-dark rounded-lg text-white focus:border-gold-primary focus:outline-none"
                            placeholder="Friday Night Games"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Location *</label>
                        <input
                            type="text"
                            value={eventForm.location}
                            onChange={(e) => handleInputChange('location', e.target.value)}
                            className="w-full px-4 py-3 bg-black-primary border border-gray-dark rounded-lg text-white focus:border-gold-primary focus:outline-none"
                            placeholder="Cafe Yenege, Addis Ababa"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Start Date & Time *</label>
                        <input
                            type="datetime-local"
                            value={eventForm.startDate}
                            onChange={(e) => handleInputChange('startDate', e.target.value)}
                            className="w-full px-4 py-3 bg-black-primary border border-gray-dark rounded-lg text-white focus:border-gold-primary focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">End Date & Time *</label>
                        <input
                            type="datetime-local"
                            value={eventForm.endDate}
                            onChange={(e) => handleInputChange('endDate', e.target.value)}
                            className="w-full px-4 py-3 bg-black-primary border border-gray-dark rounded-lg text-white focus:border-gold-primary focus:outline-none"
                        />
                    </div>
                </div>
                <div className="mt-4">
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                        value={eventForm.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 bg-black-primary border border-gray-dark rounded-lg text-white focus:border-gold-primary focus:outline-none"
                        placeholder="Describe your event..."
                    />
                </div>
            </div>

            <div className="bg-black-secondary rounded-xl border border-gray-dark p-6">
                <h3 className="text-xl font-bold mb-4">Event Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Max Participants</label>
                        <input
                            type="number"
                            value={eventForm.maxParticipants}
                            onChange={(e) => handleInputChange('maxParticipants', parseInt(e.target.value))}
                            className="w-full px-4 py-3 bg-black-primary border border-gray-dark rounded-lg text-white focus:border-gold-primary focus:outline-none"
                            min="1"
                            max="1000"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Entry Fee (ETB)</label>
                        <input
                            type="number"
                            value={eventForm.entryFee}
                            onChange={(e) => handleInputChange('entryFee', parseFloat(e.target.value))}
                            className="w-full px-4 py-3 bg-black-primary border border-gray-dark rounded-lg text-white focus:border-gold-primary focus:outline-none"
                            min="0"
                            step="0.01"
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    );

    const renderGameTypes = () => (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-black-secondary rounded-xl border border-gray-dark p-6"
        >
            <h3 className="text-xl font-bold mb-4">Select Game Types</h3>
            <p className="text-gray-light mb-6">Choose which games will be available at your event</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableGameTypes.map((gameType) => (
                    <div
                        key={gameType}
                        onClick={() => handleGameTypeToggle(gameType)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            eventForm.gameTypes.includes(gameType)
                                ? 'border-gold-primary bg-gold-primary/10'
                                : 'border-gray-dark bg-black-primary hover:border-gray-light'
                        }`}
                    >
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-gold-primary to-gold-secondary rounded-lg flex items-center justify-center text-black-primary">
                                <FaGamepad />
                            </div>
                            <div>
                                <h4 className="font-medium">{gameType}</h4>
                                <p className="text-sm text-gray-light">Interactive game</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );

    const renderTabletStations = () => (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
        >
            <div className="bg-black-secondary rounded-xl border border-gray-dark p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">Tablet Stations</h3>
                    <button
                        onClick={addTabletStation}
                        className="px-4 py-2 bg-gold-primary text-black-primary rounded-lg hover:bg-gold-secondary transition-colors"
                    >
                        <FaPlus className="inline mr-2" />
                        Add Station
                    </button>
                </div>
                
                <div className="space-y-4">
                    {eventForm.tabletStations.map((tablet) => (
                        <div key={tablet.id} className="p-4 bg-black-primary rounded-lg border border-gray-dark">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Game Type</label>
                                    <select
                                        value={tablet.gameType}
                                        onChange={(e) => updateTabletStation(tablet.id, { gameType: e.target.value })}
                                        className="w-full px-3 py-2 bg-black-secondary border border-gray-dark rounded text-white focus:border-gold-primary focus:outline-none"
                                    >
                                        <option value="">Select Game</option>
                                        {eventForm.gameTypes.map(gt => (
                                            <option key={gt} value={gt}>{gt}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Max Players</label>
                                    <input
                                        type="number"
                                        value={tablet.maxPlayers}
                                        onChange={(e) => updateTabletStation(tablet.id, { maxPlayers: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 bg-black-secondary border border-gray-dark rounded text-white focus:border-gold-primary focus:outline-none"
                                        min="1"
                                        max="8"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Location</label>
                                    <input
                                        type="text"
                                        value={tablet.location}
                                        onChange={(e) => updateTabletStation(tablet.id, { location: e.target.value })}
                                        className="w-full px-3 py-2 bg-black-secondary border border-gray-dark rounded text-white focus:border-gold-primary focus:outline-none"
                                        placeholder="Table 1"
                                    />
                                </div>
                                <div className="flex items-end space-x-2">
                                    <button
                                        onClick={() => updateTabletStation(tablet.id, { isActive: !tablet.isActive })}
                                        className={`px-3 py-2 rounded text-sm ${
                                            tablet.isActive
                                                ? 'bg-green-500 text-white'
                                                : 'bg-gray-500 text-white'
                                        }`}
                                    >
                                        {tablet.isActive ? 'Active' : 'Inactive'}
                                    </button>
                                    <button
                                        onClick={() => removeTabletStation(tablet.id)}
                                        className="px-3 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );

    const renderReview = () => (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
        >
            <div className="bg-black-secondary rounded-xl border border-gray-dark p-6">
                <h3 className="text-xl font-bold mb-4">Event Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-medium text-gold-primary mb-3">Event Details</h4>
                        <div className="space-y-2 text-sm">
                            <div><span className="text-gray-light">Name:</span> {eventForm.name}</div>
                            <div><span className="text-gray-light">Location:</span> {eventForm.location}</div>
                            <div><span className="text-gray-light">Start:</span> {new Date(eventForm.startDate).toLocaleString()}</div>
                            <div><span className="text-gray-light">End:</span> {new Date(eventForm.endDate).toLocaleString()}</div>
                            <div><span className="text-gray-light">Max Participants:</span> {eventForm.maxParticipants}</div>
                            <div><span className="text-gray-light">Entry Fee:</span> ETB {eventForm.entryFee}</div>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-medium text-gold-primary mb-3">Games & Stations</h4>
                        <div className="space-y-2 text-sm">
                            <div><span className="text-gray-light">Game Types:</span> {eventForm.gameTypes.length}</div>
                            <div><span className="text-gray-light">Tablet Stations:</span> {eventForm.tabletStations.length}</div>
                            <div><span className="text-gray-light">Active Stations:</span> {eventForm.tabletStations.filter(ts => ts.isActive).length}</div>
                        </div>
                    </div>
                </div>
                
                {eventForm.description && (
                    <div className="mt-4">
                        <h4 className="font-medium text-gold-primary mb-2">Description</h4>
                        <p className="text-sm text-gray-light">{eventForm.description}</p>
                    </div>
                )}
            </div>

            <div className="bg-black-secondary rounded-xl border border-gray-dark p-6">
                <h3 className="text-xl font-bold mb-4">Ready to Create Event?</h3>
                <p className="text-gray-light mb-4">
                    Review your event details above. Once created, you'll be able to manage participants, 
                    track scores, and announce winners.
                </p>
                <div className="flex space-x-4">
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="px-6 py-3 bg-gold-primary text-black-primary font-medium rounded-lg hover:bg-gold-secondary transition-colors disabled:opacity-50"
                    >
                        {isLoading ? 'Creating Event...' : 'Create Event'}
                    </button>
                    <button
                        onClick={() => setCurrentStep(3)}
                        className="px-6 py-3 bg-gray-dark text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                        Edit Details
                    </button>
                </div>
            </div>
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-black-primary text-white">
            {/* Header */}
            <div className="relative z-10 px-6 py-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigate('/events/dashboard')}
                            className="flex items-center text-gray-light hover:text-white transition-colors"
                        >
                            <FaArrowLeft className="mr-2" />
                            Back to Dashboard
                        </button>

                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center">
                                <FaCalendar className="text-white text-xl" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-purple-500 to-purple-700 bg-clip-text text-transparent">
                                Create Event
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Page Header */}
            <div className="px-6 mb-8">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center">
                        <h1 className="text-3xl md:text-4xl font-bold mb-4">Create Game Night Event</h1>
                        <p className="text-xl text-gray-light">
                            Set up your event with games, tablet stations, and participant limits
                        </p>
                    </div>
                </div>
            </div>

            {/* Step Indicator */}
            <div className="px-6 mb-8">
                <div className="max-w-4xl mx-auto">
                    {renderStepIndicator()}
                </div>
            </div>

            {/* Step Content */}
            <div className="px-6 pb-12">
                <div className="max-w-4xl mx-auto">
                    {currentStep === 1 && renderBasicInfo()}
                    {currentStep === 2 && renderGameTypes()}
                    {currentStep === 3 && renderTabletStations()}
                    {currentStep === 4 && renderReview()}
                </div>
            </div>

            {/* Navigation */}
            {currentStep < 4 && (
                <div className="px-6 pb-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex justify-between">
                            <button
                                onClick={prevStep}
                                disabled={currentStep === 1}
                                className="px-6 py-3 bg-gray-dark text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={nextStep}
                                className="px-6 py-3 bg-gold-primary text-black-primary font-medium rounded-lg hover:bg-gold-secondary transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventCreation;
