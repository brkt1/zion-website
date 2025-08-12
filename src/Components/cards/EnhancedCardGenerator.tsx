import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import QRCode from "qrcode";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";

interface GameType {
  id: string;
  name: string;
  description?: string;
}

interface CardData {
  id: string;
  card_number: string;
  duration: number;
  game_type_id: string;
  game_types?: GameType;
  route_access: string[];
  used: boolean;
  created_at: string;
}

const EnhancedCardGenerator: React.FC = () => {
  const [gameTypes, setGameTypes] = useState<GameType[]>([]);
  const [selectedGameType, setSelectedGameType] = useState<string>("");
  const [duration, setDuration] = useState(30);
  const [cardQuantity, setCardQuantity] = useState(6);
  const [generatedCards, setGeneratedCards] = useState<CardData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDownloadMessage, setShowDownloadMessage] = useState(false);
  // Define routeAccess as array containing the selected game type's name
  const selectedGameTypeObj = gameTypes.find(
    (gt) => gt.id === selectedGameType
  );
  const routeAccess = selectedGameTypeObj
    ? [selectedGameTypeObj.name.toLowerCase()]
    : [];

  const navigate = useNavigate();

  // gameRoutes - dynamically from gameTypes fetched from database, uses actual game type IDs
  const gameRoutes = gameTypes.map((gt) => ({
    id: gt.id,
    name: gt.name,
    path: `/game/${gt.id}`,
  }));

  // Activate card by scanning (calls Supabase function)
  const activateCard = async (cardNumber: string, userId: string) => {
    try {
      // Ensure cardNumber is a string
      const stringCardNumber = String(cardNumber);
      const { data, error } = await supabase.rpc("activate_card", {
        p_card_number: stringCardNumber,
        p_player_id: userId,
      });

      if (error) throw error;

      return {
        success: true,
        card: data[0],
      };
    } catch (error: any) {
      console.error("Activation error details:", {
        code: error.code,
        message: error.message,
        details: error.details,
      });
      const errorMessages: Record<string, string> = {
        YNFC1: "Card not found",
        YNGT1: "Invalid card type",
        YNGT2: "Game type not found",
        YNAU1: "Card registered to another player",
        YNAL1: "Card already activated",
        42702: "System error - please contact support",
      };
      return {
        success: false,
        error: errorMessages[error.code] || "Activation failed",
      };
    }
  };

  // Scan a card and automatically activate it
  // You can call scanCard from your QR code scanner or UI
  const scanCard = async (scannedCardNumber: string) => {
    // Get the current user's ID
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      alert("You must be logged in to activate cards.");
      return;
    }
    const result = await activateCard(scannedCardNumber, user.id);
    if (result.success) {
      alert("Card activated successfully!");
    } else {
      alert(result.error);
    }
  };
  // Fetch game types
  useEffect(() => {
    const fetchGameTypes = async () => {
      try {
        const { data: types, error } = await supabase
          .from("game_types")
          .select("*")
          .order("name", { ascending: true });
        if (error) throw error;
        console.log("Game types fetched:", types);
        if (types && types.length > 0) {
          setGameTypes(types);
          setSelectedGameType(types[0].id);
        } else {
          setGameTypes([]);
          setSelectedGameType("");
        }
      } catch (err) {
        console.error("Failed to fetch game types:", err);
      }
    };
    fetchGameTypes();
  }, []);

  // Generate unique 13-digit card number
  const generateCardNumber = (): string => {
    return Array.from({ length: 13 }, () =>
      Math.floor(Math.random() * 10)
    ).join("");
  };

  // Generate unique player ID (8 characters)
  const generatePlayerId = (): string => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return Array.from(
      { length: 8 },
      () => chars[Math.floor(Math.random() * chars.length)]
    ).join("");
  };

  // Generate cards with enhanced features
  const generateEnhancedCards = async () => {
    // ensure a valid game type is selected
    const validGameType = gameTypes.find((gt) => gt.id === selectedGameType);
    if (!selectedGameType || selectedGameType === "0" || !validGameType) {
      alert("Please select a valid game type for the cards.");
      return;
    }

    setIsLoading(true);
    setShowDownloadMessage(false);

    try {
      // Get the current user's ID
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        alert("You must be logged in to generate cards.");
        setIsLoading(false);
        return;
      }

      const cardsToGenerate = Array.from({ length: cardQuantity }, () => ({
        card_number: generateCardNumber(),
        duration,
        game_type_id: selectedGameType,
        route_access: selectedGameTypeObj.route_access, // Use the route_access from the selected game type
        used: false,
        player_id: null,
        created_by: user.id, // Set created_by to the current user's ID
        created_at: new Date().toISOString(),
      }));

      // Insert cards into database
      const { data, error } = await supabase
        .from("enhanced_cards")
        .insert(cardsToGenerate)
        .select("*");

      if (error) throw error;

      if (data) {
        setGeneratedCards(data);
        setShowDownloadMessage(true);
      }
    } catch (error) {
      console.error("Error generating cards:", error);
      alert("Failed to generate cards: " + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  // Create PDF with enhanced card design
  const createEnhancedPDF = async () => {
    if (generatedCards.length === 0) {
      alert("No cards to generate PDF for.");
      return;
    }

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Create container for cards
    const container = document.createElement("div");
    container.style.cssText = `
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      padding: 20px;
      background: white;
      font-family: 'Arial', sans-serif;
    `;

    // Generate card promises
    const cardPromises = generatedCards.map(async (card) => {
      return new Promise<void>((resolve) => {
        const cardDiv = document.createElement("div");
        cardDiv.style.cssText = `
          width: 300px;
          height: 400px;
          border: 2px solid #4338CA;
          border-radius: 15px;
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-shadow: 0 8px 16px rgba(0,0,0,0.1);
          margin-bottom: 20px;
        `;

        // Header
        const headerDiv = document.createElement("div");
        headerDiv.style.cssText = `
          text-align: center;
          border-bottom: 2px solid rgba(255,255,255,0.3);
          padding-bottom: 10px;
          margin-bottom: 15px;
        `;
        headerDiv.innerHTML = `
          <h2 style="margin: 0; font-size: 18px; font-weight: bold;">YENEGE GAME CARD</h2>
          <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.8;">#${card.card_number}</p>
        `;

        // QR Code container
        const qrContainer = document.createElement("div");
        qrContainer.style.cssText = `
          display: flex;
          justify-content: center;
          margin: 15px 0;
        `;

        // Create QR Code
        const canvas = document.createElement("canvas");
        canvas.width = 150;
        canvas.height = 150;

        const cardData = {
          cardNumber: card.card_number,
          gameTypeId: card.game_type_id,
          duration: card.duration,
          timestamp: new Date().toISOString(),
        };

        QRCode.toCanvas(
          canvas,
          JSON.stringify(cardData),
          {
            width: 150,
            color: {
              dark: "#1E293B",
              light: "#ffffff",
            },
            margin: 1,
          },
          (error) => {
            if (error) console.error("QR Code generation error:", error);
          }
        );

        qrContainer.appendChild(canvas);

        // Card details
        const detailsDiv = document.createElement("div");
        detailsDiv.style.cssText = `
          font-size: 12px;
          line-height: 1.4;
        `;

        const gameTypeName =
          gameTypes.find((gt) => gt.id === card.game_type_id)?.name ||
          "Unknown";
        const routeNames =
          card.route_access
            .map((routeId: string) => {
              try {
                const route = gameRoutes.find((r) => r.id === routeId);
                if (!route) {
                  console.error(
                    `Route mapping not found for routeId: ${routeId}`
                  );
                  return `Unknown Route (${routeId})`;
                }
                return `${route.name} (${route.path})`;
              } catch (err) {
                console.error(
                  `Error mapping route for routeId: ${routeId}`,
                  err
                );
                return `Error Route (${routeId})`;
              }
            })
            .join(", ") || "No valid routes found";

        detailsDiv.innerHTML = `
          <p style="margin: 5px 0;"><strong>Game Type:</strong> ${gameTypeName}</p>
          <p style="margin: 5px 0;"><strong>Duration:</strong> ${card.duration} minutes</p>
          <p style="margin: 5px 0;"><strong>Game Types:</strong></p>
          <p style="margin: 5px 0; font-size: 10px; opacity: 0.9;">${routeNames}</p>
        `;

        // Footer
        const footerDiv = document.createElement("div");
        footerDiv.style.cssText = `
          text-align: center;
          border-top: 2px solid rgba(255,255,255,0.3);
          padding-top: 10px;
          font-size: 10px;
          opacity: 0.8;
        `;
        footerDiv.innerHTML = `
          <p style="margin: 0;">Valid for One Game Session</p>
          <p style="margin: 5px 0 0 0;">Scan to Start Playing</p>
        `;

        // Assemble card
        cardDiv.appendChild(headerDiv);
        cardDiv.appendChild(qrContainer);
        cardDiv.appendChild(detailsDiv);
        cardDiv.appendChild(footerDiv);

        container.appendChild(cardDiv);
        resolve();
      });
    });

    // Wait for all cards to be generated
    await Promise.all(cardPromises);

    // Append to body temporarily
    document.body.appendChild(container);

    try {
      // Convert to PDF
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      // Remove container
      document.body.removeChild(container);

      // Add to PDF
      const imgData = canvas.toDataURL("image/png");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(
        `yenege_game_cards_${new Date().toISOString().split("T")[0]}.pdf`
      );
    } catch (error) {
      console.error("Error creating PDF:", error);
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 sm:p-8">
      {/* Demo: Scan and activate the first generated card (for testing) */}
      {generatedCards.length > 0 && (
        <div className="mb-4 flex justify-center">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => scanCard(generatedCards[0].card_number)}
          >
            Scan & Activate First Card
          </button>
        </div>
      )}
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 border border-amber-500/20">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-amber-400">
          Card Generator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuration Panel */}
          <div className="space-y-6">
            <div>
              <label
                htmlFor="gameType"
                className="block text-amber-400 font-semibold mb-2"
              >
                Game Type
              </label>
              <select
                id="gameType"
                name="gameType"
                aria-label="Game Type"
                className="w-full p-3 bg-gray-700 border border-amber-500/30 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                value={selectedGameType}
                onChange={(e) => setSelectedGameType(e.target.value)}
              >
                <option value="" disabled className="bg-gray-800 text-gray-500">
                  -- Select Game Type --
                </option>
                {gameTypes.map((type) => (
                  <option key={type.id} value={type.id} className="bg-gray-800">
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="duration"
                className="block text-amber-400 font-semibold mb-2"
              >
                Duration (minutes)
              </label>
              <input
                id="duration"
                name="duration"
                type="number"
                placeholder="Enter duration"
                aria-label="Duration in minutes"
                className="w-full p-3 bg-gray-700 border border-amber-500/30 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                value={duration}
                min={10}
                max={120}
                onChange={(e) => setDuration(Number(e.target.value))}
              />
            </div>

            <div>
              <label
                htmlFor="cardQuantity"
                className="block text-amber-400 font-semibold mb-2"
              >
                Number of Cards
              </label>
              <input
                id="cardQuantity"
                name="cardQuantity"
                type="number"
                placeholder="Enter number of cards"
                aria-label="Number of cards to generate"
                className="w-full p-3 bg-gray-700 border border-amber-500/30 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                value={cardQuantity}
                min={1}
                max={20}
                onChange={(e) => setCardQuantity(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <button
            onClick={generateEnhancedCards}
            disabled={isLoading}
            className={`flex-1 p-3 font-semibold rounded-lg transition-colors ${
              isLoading
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-amber-500 text-gray-900 hover:bg-amber-600"
            }`}
          >
            {isLoading ? "Generating..." : `Generate ${cardQuantity} Cards`}
          </button>

          <button
            onClick={createEnhancedPDF}
            disabled={generatedCards.length === 0}
            className={`flex-1 p-3 font-semibold rounded-lg transition-colors ${
              generatedCards.length === 0
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            Download PDF
          </button>
        </div>

        {/* Status Messages */}
        {showDownloadMessage && (
          <div className="mt-6 p-4 bg-green-900/20 rounded-lg border border-green-500/30">
            <p className="text-center text-green-400 font-semibold">
              ✅ {generatedCards.length} cards generated successfully! You can
              now download the PDF.
            </p>
          </div>
        )}

        {/* Generated Cards Summary */}
        {generatedCards.length > 0 && (
          <div className="mt-6 p-4 bg-gray-700 rounded-lg">
            <h3 className="text-amber-400 font-semibold mb-3">
              Generated Cards Summary
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {generatedCards.slice(0, 6).map((card, index) => (
                <div key={card.id} className="bg-gray-600 p-3 rounded text-sm">
                  <p className="text-amber-400 font-semibold">
                    Card #{index + 1}
                  </p>
                  <p className="text-gray-300">Number: {card.card_number}</p>
                  <p className="text-gray-300">Duration: {card.duration}min</p>
                </div>
              ))}
            </div>
            {generatedCards.length > 6 && (
              <p className="text-gray-400 text-sm mt-3">
                ... and {generatedCards.length - 6} more cards
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedCardGenerator;
