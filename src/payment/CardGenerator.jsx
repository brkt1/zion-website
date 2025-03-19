import React, { useState, useEffect, useCallback } from 'react';
import { canUseLocalStorage } from '../utils/storage'; 
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';

const CardGenerator = () => {
    // State declarations
    const [isAdmin, setIsAdmin] = useState(false);
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [gameTypes, setGameTypes] = useState([]);
    const [gameType, setGameType] = useState(null);
    const [duration, setDuration] = useState(30);
    const [generatedCards, setGeneratedCards] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showDownloadMessage, setShowDownloadMessage] = useState(false);

    const navigate = useNavigate();

    // Authentication check
    const checkAuth = useCallback(async () => {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (!user || userError) {
            navigate('/login');
            return;
        }
  
        const { data: userData, error: roleError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
  
        if (roleError || !userData || userData.role !== 'admin') {
            navigate('/login');
            return;
        }
  
        setIsAdmin(true);
        setLoadingAuth(false);
    }, [navigate]);

    // Authentication effect
    useEffect(() => {
        checkAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
            if (event === 'SIGNED_OUT') {
                navigate('/login');
            } else if (event === 'SIGNED_IN') {
                await checkAuth();
            }
        });

        return () => subscription?.unsubscribe();
    }, [checkAuth, navigate]);

    // Game types effect
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

    // Generate a 14-digit card number
    const generateCardNumber = () => {
        return Array.from({ length: 14 }, () => Math.floor(Math.random() * 10)).join('');
    };

    // Generate 6 cards
const generateSixCards = async () => {
    if (!canUseLocalStorage()) {
        alert('Local storage is unavailable. Please ensure you are running in a secure context (HTTPS) to generate cards.');
        return;
    }

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
        container.className = 'card-container'; // Use the new CSS class

    
        // Create promises for QR code generation
        const cardPromises = generatedCards.map(async (card) => {
            return new Promise((resolve) => {
                const cardDiv = document.createElement('div');
                cardDiv.className = 'card'; // Use the new CSS class

    
                // Header with gradient background
                const headerDiv = document.createElement('div');
                headerDiv.className = 'card-header'; // Use the new CSS class

                headerDiv.innerHTML = `Game Card #${card.card_number}`;
    
                // QR Code Container
                const qrContainer = document.createElement('div');
                qrContainer.className = 'qr-container'; // Use the new CSS class

    
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
                detailsDiv.className = 'card-details'; // Use the new CSS class
                detailsDiv.innerHTML = `
                    <div class="card-details"> <!-- Use the new CSS class -->

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
                footerDiv.className = 'card-footer'; // Use the new CSS class

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

    if (loadingAuth) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
            </div>
        );
    }
    
    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
                <div className="max-w-md bg-gray-800 rounded-2xl shadow-xl p-8 text-center border border-amber-500/20">
                    <h2 className="text-2xl font-bold text-amber-400 mb-4">Access Denied</h2>
                    <p className="text-gray-300 mb-6">
                        You don't have permission to access this page. Please contact an administrator.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-amber-500 text-gray-900 px-6 py-2 rounded-lg hover:bg-amber-600 transition duration-300 font-semibold"
                    >
                        Return Home
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 sm:p-8">
            <div className="max-w-2xl mx-auto bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 border border-amber-500/20">
                <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-amber-400">
                    Game Card Generator
                </h1>
    
                <div className="space-y-6">
                    <div>
                        <label className="block text-amber-400 font-semibold mb-2">Game Type</label>
                        <select 
                            className="w-full p-3 bg-gray-700 border border-amber-500/30 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                            value={gameType || ''}
                            onChange={(e) => setGameType(Number(e.target.value))}
                        >
                            {gameTypes.map(type => (
                                <option key={type.id} value={type.id} className="bg-gray-800">
                                    {type.name}
                                </option>
                            ))}
                        </select>
                    </div>
    
                    <div>
                        <label className="block text-amber-400 font-semibold mb-2">Duration (minutes)</label>
                        <input 
                            type="number" 
                            className="w-full p-3 bg-gray-700 border border-amber-500/30 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                            value={duration}
                            min={10}
                            max={120}
                            onChange={(e) => setDuration(Number(e.target.value))}
                        />
                    </div>
    
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button 
                            onClick={generateSixCards}
                            disabled={isLoading}
                            className={`flex-1 p-3 font-semibold rounded-lg transition-colors ${
                                isLoading 
                                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                                    : 'bg-amber-500 text-gray-900 hover:bg-amber-600'
                            }`}
                        >
                            {isLoading ? 'Generating...' : 'Generate Again'}
                        </button>
                        <button 
                            onClick={createA4PdfWithCards}
                            disabled={generatedCards.length === 0}
                            className={`flex-1 p-3 font-semibold rounded-lg transition-colors ${
                                generatedCards.length === 0 
                                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                                    : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                        >
                            Create PDF
                        </button>
                    </div>
                    
                    {showDownloadMessage && (
                        <p className="text-center text-amber-400 font-semibold">
                            You can download the PDF now!
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CardGenerator;
