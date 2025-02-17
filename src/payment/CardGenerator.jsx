import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';

const CardGenerator = () => {
    const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loadingAuth, setLoadingAuth] = useState(true);

    // Check if user is admin on mount
    useEffect(() => {
        const checkAdmin = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/login');
                return;
            }

            const userRole = sessionStorage.getItem('userRole');
            if (userRole !== 'admin') {
                navigate('/');
                return;
            }

            setIsAdmin(true);
            setLoadingAuth(false);
        };

        checkAdmin();
    }, [navigate]);

    if (loadingAuth) return null;
    if (!isAdmin) return null;

    const [gameTypes, setGameTypes] = useState([]);
    const [gameType, setGameType] = useState(null);
    const [duration, setDuration] = useState(30);
    const [generatedCards, setGeneratedCards] = useState([]);
    const [numberOfCards, setNumberOfCards] = useState(6); // New state for number of cards
    const [isLoading, setIsLoading] = useState(false);
    const [showDownloadMessage, setShowDownloadMessage] = useState(false);

    // Generate a 14-digit card number
    const generateCardNumber = () => {
        return Array.from({ length: 14 }, () => Math.floor(Math.random() * 10)).join('');
    };

    // Fetch game types on component mount
    useEffect(() => {
        const fetchGameTypes = async () => {
            const { data, error } = await supabase.from('game_types').select('*');
            if (data) {
                setGameTypes(data);
                setGameType(data[0]?.id);
            }
            if (error) console.error('Error fetching game types:', error);
        };
        fetchGameTypes();
    }, []);

    // Generate 6 cards
    const generateSixCards = async () => {
        setIsLoading(true);
        setShowDownloadMessage(false);
        try {
            const cardsToGenerate = Array.from({ length: 6 }, () => ({
                duration,
                used: false,
                game_type: gameType,
                card_number: generateCardNumber()
            }));

            const { data, error } = await supabase
                .from('cards')
                .insert(cardsToGenerate)
                .select('*');

            if (data) {
                setGeneratedCards(data);
                setShowDownloadMessage(true);
            }
            if (error) throw error;
        } catch (error) {
            console.error('Error generating cards:', error);
            alert('Failed to generate cards');
        } finally {
            setIsLoading(false);
        }
    };

    // Create A4 PDF with 6 cards
    const createA4PdfWithCards = async () => {
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
    
        // Create a container for the cards
        const container = document.createElement('div');
        container.style.display = 'grid';
        container.style.gridTemplateColumns = 'repeat(3, 1fr)';
        container.style.gridTemplateRows = 'repeat(2, 1fr)';
        container.style.gap = '20px';
        container.style.padding = '20px';
        container.style.width = '210mm';
        container.style.height = '297mm';
        container.style.backgroundColor = '#F3F4F6';
        container.style.fontFamily = 'Arial, sans-serif';
    
        // Create promises for QR code generation
        const cardPromises = generatedCards.map(async (card) => {
            return new Promise((resolve) => {
                const cardDiv = document.createElement('div');
                cardDiv.style.backgroundColor = 'white';
                cardDiv.style.border = '2px solid #4338CA';
                cardDiv.style.borderRadius = '16px';
                cardDiv.style.display = 'flex';
                cardDiv.style.flexDirection = 'column';
                cardDiv.style.alignItems = 'center';
                cardDiv.style.justifyContent = 'space-between';
                cardDiv.style.overflow = 'hidden';
                cardDiv.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
                cardDiv.style.transition = 'transform 0.3s ease';
    
                // Header with gradient background
                const headerDiv = document.createElement('div');
                headerDiv.style.width = '100%';
                headerDiv.style.background = 'linear-gradient(135deg, #4338CA, #6366F1)';
                headerDiv.style.color = 'white';
                headerDiv.style.padding = '12px';
                headerDiv.style.textAlign = 'center';
                headerDiv.style.fontWeight = 'bold';
                headerDiv.innerHTML = `Game Card #${card.card_number}`;
    
                // QR Code Container
                const qrContainer = document.createElement('div');
                qrContainer.style.margin = '15px 0';
                qrContainer.style.border = '3px dashed #4338CA';
                qrContainer.style.borderRadius = '12px';
                qrContainer.style.padding = '10px';
                qrContainer.style.backgroundColor = '#F0F5FF';
    
                // Create QR Code canvas
                const canvas = document.createElement('canvas');
                canvas.width = 200;
                canvas.height = 200;
    
                // Generate QR Code
                QRCode.toCanvas(canvas, JSON.stringify(card), {
                    width: 200,
                    height: 200,
                    colorDark: "#4338CA",
                    colorLight: "#ffffff"
                }, (error) => {
                    if (error) console.error(error);
                });
    
                qrContainer.appendChild(canvas);
    
                // Card Details
                const detailsDiv = document.createElement('div');
                detailsDiv.style.textAlign = 'center';
                detailsDiv.style.width = '100%';
                detailsDiv.style.padding = '0 15px';
                detailsDiv.innerHTML = `
                    <div style="background-color: #E6E7F0; padding: 12px; border-radius: 10px; margin: 10px 0;">
                        <p style="margin: 8px 0; color: #1E293B; font-size: 14px;">
                            <span style="font-weight: bold; color: #4338CA;">Game Type:</span> 
                            ${gameTypes.find(g => g.id === card.game_type)?.name}
                        </p>
                        <p style="margin: 8px 0; color: #1E293B; font-size: 14px;">
                            <span style="font-weight: bold; color: #4338CA;">Duration:</span> 
                            ${card.duration} minutes
                        </p>
                    </div>
                `;
    
                // Footer
                const footerDiv = document.createElement('div');
                footerDiv.style.width = '100%';
                footerDiv.style.background = '#4338CA';
                footerDiv.style.color = 'white';
                footerDiv.style.padding = '10px';
                footerDiv.style.textAlign = 'center';
                footerDiv.style.fontSize = '12px';
                footerDiv.innerHTML = 'Valid for One Game Session';
    
                // Assemble Card
                cardDiv.appendChild(headerDiv);
                cardDiv.appendChild(qrContainer);
                cardDiv.appendChild(detailsDiv);
                cardDiv.appendChild(footerDiv);
    
                container.appendChild(cardDiv);
                resolve();
            });
        });
    
        // Wait for all QR codes to be generated
        await Promise.all(cardPromises);
    
        // Append to body to render
        document.body.appendChild(container);
    
        try {
            // Convert to PDF
            const canvas = await html2canvas(container, { 
                scale: 3,
                useCORS: true,
                logging: false,
                allowTaint: true,
                backgroundColor: null
            });
    
            // Remove the temporary container
            document.body.removeChild(container);
    
            // Create PDF
            const imgData = canvas.toDataURL('image/png');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save('game_cards.pdf');
        } catch (error) {
            console.error('Error creating PDF:', error);
            // Remove the temporary container in case of error
            if (document.body.contains(container)) {
                document.body.removeChild(container);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-8">
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-2xl p-8">
                <h1 className="text-3xl font-bold text-center mb-8 text-blue-600">
                    Game Card Generator
                </h1>

                <div className="space-y-6">
                    <div>
                        <label className="block text-gray-700 font-bold mb-2">Game Type</label>
                        <select 
                            className="w-full p-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={gameType || ''}
                            onChange={(e) => setGameType(Number(e.target.value))}
                        >
                            {gameTypes.map(type => (
                                <option key={type.id} value={type.id}>
                                    {type.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-gray-700 font-bold mb-2">Duration (minutes)</label>
                        <input 
                            type="number" 
                            className="w-full p-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={duration}
                            min={10}
                            max={120}
                            onChange={(e) => setDuration(Number(e.target.value))}
                        />
                    </div>

                    {/* Generate Cards Button */} <div className="flex space-x-4">
                        <button 
                            onClick={generateSixCards}
                            disabled={isLoading}
                            className={`flex-1 p-3 text-white font-bold rounded-lg ${isLoading ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'}`}
                        >
                            {isLoading ? 'Generating...' : 'Generate Again'}
                        </button>
                        <button 
                            onClick={createA4PdfWithCards}
                            disabled={generatedCards.length === 0}
                            className={`flex-1 p-3 text-white font-bold rounded-lg ${generatedCards.length === 0 ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
                        >
                            Create PDF
                        </button>
                    </div>
                    {showDownloadMessage && (
                        <p className="text-center text-green-600 font-semibold">
                            You can download the PDF now!
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CardGenerator;
