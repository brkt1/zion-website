import React from 'react';
import CardGenerator from '../../payment/CardGenerator';
import WinnerList from './WinnerList';

const AdminPanel = () => {
    return (
        <div className="min-h-screen bg-gray-100 p-8">
            {/* Header Section */}
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
                <p className="text-gray-600 mt-2">Manage card generation and winner tracking</p>
            </header>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
                {/* Card Generator Panel */}
                <section className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-700 flex-grow">
                            🎴 Card Generation
                        </h2>
                        <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                            Active Session
                        </span>
                    </div>
                    <CardGenerator />
                </section>

                {/* Winner List Panel */}
                <section className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-700 flex-grow">
                            🏆 Winners Board
                        </h2>
                        <div className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                            Updated 5m ago
                        </div>
                    </div>
                    <WinnerList />
                </section>
            </div>
        </div>
    );
};

export default AdminPanel;