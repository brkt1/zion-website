import { Html5Qrcode } from "html5-qrcode";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FaCamera,
  FaGamepad,
  FaKeyboard,
  FaQrcode,
  FaRedo,
} from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { useSessionStore } from "../../stores/sessionStore";
import { supabase } from "../../supabaseClient";

interface ScannedCardData {
  cardId: string;
  cardNumber: string;
  duration: number;
  used: boolean;
  gameTypeId: string;
  gameTypeName: string;
  gameTypeDescription: string;
  cardRouteAccess: string[];
  gameTypeRouteAccess: string[];
  createdAt: string;
  playerEmail: string;
  createdByEmail: string;
  playerId: string;
  timestamp: string;
}

interface GameRoute {
  id: string;
  name: string;
  path: string;
}

const EnhancedQRScanner: React.FC = () => {
  // Manual scan state
  interface CardActivationResult {
    status: boolean;
    message: string;
    card_id?: string;
    game_type_name?: string;
  }
  interface ManualError {
    message: string;
  }
  const [manualCardId, setManualCardId] = useState<string>("");
  const [manualLoading, setManualLoading] = useState<boolean>(false);
  const [manualResult, setManualResult] = useState<
    CardActivationResult[] | null
  >(null);
  const [manualError, setManualError] = useState<ManualError | null>(null);

  // Manual scan handler
  const handleManualScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualLoading(true);
    setManualError(null);
    setManualResult(null);
    try {
      const { data, error } = await supabase.rpc("scan_and_activate_card", {
        p_card_number: manualCardId.toString(),
      });
      if (error) {
        setManualError({ message: error.message || "Unknown error" });
        return;
      }
      setManualResult(data as CardActivationResult[]);
    } catch (err) {
      if (err instanceof Error) {
        setManualError({ message: err.message });
      } else {
        setManualError({ message: "Unknown error" });
      }
    } finally {
      setManualLoading(false);
    }
  };
  const { startSession } = useSessionStore();
  const { initialize } = useAuthStore();

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cameras, setCameras] = useState<any[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
  const [hasCameraAccess, setHasCameraAccess] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedCard, setScannedCard] = useState<ScannedCardData | null>(null);
  const [availableRoutes, setAvailableRoutes] = useState<GameRoute[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string>("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginSent, setLoginSent] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCode = useRef<Html5Qrcode | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Game routes mapping
  const gameRoutes: GameRoute[] = [
    { id: "trivia", name: "Trivia Game", path: "/trivia-game" },
    { id: "truth-dare", name: "Truth or Dare", path: "/truth-or-dare" },
    {
      id: "rock-paper-scissors",
      name: "Rock Paper Scissors",
      path: "/rock-paper-scissors",
    },
    { id: "emoji", name: "Emoji Game", path: "/emoji-game" },
  ];

  // Generate unique player ID
  const generatePlayerId = (): string => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return Array.from(
      { length: 8 },
      () => chars[Math.floor(Math.random() * chars.length)]
    ).join("");
  };

  const requestCameraAccess = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setHasCameraAccess(true);
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch (err) {
      setError("Camera access required - Please enable in browser settings");
      setHasCameraAccess(false);
      return false;
    }
  }, []);

  const getCameras = useCallback(async () => {
    try {
      const hasAccess = await requestCameraAccess();
      if (!hasAccess) return;

      const devices = await Html5Qrcode.getCameras();
      if (devices?.length) {
        setCameras(devices);
        setSelectedCamera(devices[0].id);
      }
    } catch (err) {
      setError("Failed to get camera devices");
    }
  }, [requestCameraAccess]);

  const initScanner = useCallback(async () => {
    if (!selectedCamera || !scannerRef.current || !hasCameraAccess) return;

    // Check if user is logged in before allowing scan
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    try {
      if (html5QrCode.current?.isScanning) {
        await html5QrCode.current.stop();
      }

      const container = scannerRef.current;
      const qrboxSize = Math.min(
        container.offsetWidth - 40,
        container.offsetHeight - 40,
        300
      );

      html5QrCode.current = new Html5Qrcode(container.id);
      setIsScanning(true);

      await html5QrCode.current.start(
        selectedCamera,
        {
          fps: 10,
          qrbox: undefined, // Set qrbox to undefined to disable default rendering
          aspectRatio: 1.0,
          disableFlip: false,
        },
        (decodedText) => handleScan(decodedText),
        (errorMessage) => {
          if (!errorMessage.includes("NotFoundException")) {
            console.warn("Scanner error:", errorMessage);
          }
        }
      );
    } catch (err) {
      setError(
        err instanceof Error && err.message.includes("permission")
          ? "Camera access denied - check browser settings"
          : "Failed to initialize scanner"
      );
      setIsScanning(false);
    }
  }, [selectedCamera, hasCameraAccess]);

  const stopScanner = useCallback(async () => {
    try {
      if (
        html5QrCode.current?.isScanning &&
        !(html5QrCode.current as any)._isStopping
      ) {
        (html5QrCode.current as any)._isStopping = true;
        await html5QrCode.current.stop();
        html5QrCode.current.clear();
        (html5QrCode.current as any)._isStopping = false;
      }
      setIsScanning(false);
    } catch (err) {
      console.error("Error stopping scanner:", err);
    }
  }, []);

  const handleScan = useCallback(
    async (scannedData: string) => {
      if (isLoading) return;
      setIsLoading(true);
      setError(null);

      try {
        // Only expect the card number from the QR code
        const cardNumber = scannedData.replace(/\D/g, "");
        if (!/^\d{13}$/.test(cardNumber)) {
          setError("Invalid card format. Please scan a valid Yenege card.");
          setIsLoading(false);
          return;
        }

        // Call backend function to scan and activate card
        const { data: result, error } = await supabase.rpc(
          "scan_and_activate_card",
          { p_card_number: String(cardNumber) }
        );

        if (error) {
          // Log error for diagnostics
          console.error("Supabase scan_and_activate_card error:", error);
          let userMessage =
            "Card activation failed. Please try again or contact support.";
          if (error.message?.toLowerCase().includes("not found")) {
            userMessage = `Card not found.\nPossible reasons:\n- The card number does not exist in our system.\n- The card was entered incorrectly.\n- The card is not yet registered.\nIf you believe this is an error, please contact support.`;
          } else if (error.message?.toLowerCase().includes("already used")) {
            userMessage = `This card has already been used.\nIf you just purchased this card, please contact support.`;
          }
          setError(userMessage);
          setIsLoading(false);
          return;
        }
        if (!result || result.length === 0) {
          console.error("No data returned from scan_and_activate_card", result);
          setError(
            "Card activation failed. No data returned. Please try again. If this persists, contact support."
          );
          setIsLoading(false);
          return;
        }
        const activation = result[0];
        if (!activation.status) {
          // Log activation status error
          console.error("Activation status false:", activation);
          let userMessage =
            activation.message || "Card activation failed. Please try again.";
          if (activation.message?.toLowerCase().includes("already used")) {
            userMessage = `This card has already been used.\nIf you just purchased this card, please contact support.`;
          } else if (activation.message?.toLowerCase().includes("not found")) {
            userMessage = `Card not found.\nPossible reasons:\n- The card number does not exist in our system.\n- The card was entered incorrectly.\n- The card is not yet registered.\nIf you believe this is an error, please contact support.`;
          }
          setError(userMessage);
          setIsLoading(false);
          return;
        }

        // Fetch all card and game type details in one query
        const { data: cardDetails, error: cardDetailsError } =
          await supabase.rpc("get_enhanced_card_details", {
            p_card_id: activation.card_id,
          });

        if (cardDetailsError) {
          console.error("Error fetching card details:", cardDetailsError);
          setError(
            "Failed to fetch card details. Please try again later. If this persists, contact support."
          );
          setIsLoading(false);
          return;
        }
        if (!cardDetails || cardDetails.length === 0) {
          console.error(
            "No card details found for card_id",
            activation.card_id
          );
          setError("Card details not found. Please contact support.");
          setIsLoading(false);
          return;
        }
        const cardRecord = cardDetails[0];

        // Validate game_type_id
        if (
          !cardRecord.game_type_id ||
          typeof cardRecord.game_type_id !== "string"
        ) {
          console.error("Invalid game_type_id:", cardRecord.game_type_id);
          setError("Invalid game type ID. Please contact support.");
          setIsLoading(false);
          return;
        }

        // Check if card is used
        if (cardRecord.used) {
          setError("This card has already been used. Please scan a new card.");
          setIsLoading(false);
          return;
        }

        // Prepare card data
        const cardData: ScannedCardData = {
          cardId: cardRecord.card_id,
          cardNumber: cardRecord.card_number,
          duration: cardRecord.duration,
          used: cardRecord.used,
          gameTypeId: cardRecord.game_type_id,
          gameTypeName: cardRecord.game_type_name,
          gameTypeDescription: cardRecord.game_type_description,
          cardRouteAccess: cardRecord.card_route_access || [],
          gameTypeRouteAccess: cardRecord.game_type_route_access || [],
          createdAt: cardRecord.created_at,
          playerEmail: cardRecord.player_email || "",
          createdByEmail: cardRecord.created_by_email || "",
          playerId: cardRecord.card_id,
          timestamp: new Date().toISOString(),
        };

        // Set available routes based on game type's route_access
        const cardRoutes = cardData.gameTypeRouteAccess
          .map((routeId: string) =>
            gameRoutes.find((route) => route.id === routeId)
          )
          .filter(Boolean) as GameRoute[];

        setAvailableRoutes(cardRoutes);
        setScannedCard(cardData);
        const numericCardNumber = Number(scannedData.replace(/\D/g, ""));
        if (
          !Number.isFinite(numericCardNumber) ||
          String(numericCardNumber).length !== 13
        ) {
          setError("Invalid card format. Please scan a valid Yenege card.");
          setIsLoading(false);
          return;
        }
        // Stop scanning
        await stopScanner();

        // Automatically start the game after scan (always use first available route)
        if (cardRoutes.length > 0) {
          setSelectedRoute(cardRoutes[0].id);
          await startSession(
            cardData.gameTypeId,
            cardData.playerId,
            cardData.duration * 60
          );
          const selectedGameRoute = gameRoutes.find(
            (route) => route.id === cardRoutes[0].id
          );
          if (selectedGameRoute) {
            navigate(selectedGameRoute.path, {
              state: {
                cardDetails: cardData,
                playerId: cardData.playerId,
                fromScanner: true,
              },
            });
          }
        }
      } catch (err) {
        // Improved error handling: show specific error or fallback
        setIsLoading(false);
        setScannedCard(null);
        setAvailableRoutes([]);
        setSelectedRoute("");
        // Log error for diagnostics
        console.error("Unexpected error in handleScan:", err);
        if (err instanceof Error) {
          if (err.message.includes("Invalid card format")) {
            setError("Invalid card format. Please scan a valid Yenege card.");
          } else if (err.message.includes("Card activation failed")) {
            setError(
              "Card activation failed. Please try again or contact support."
            );
          } else if (err.message.includes("Could not fetch card details")) {
            setError("Failed to fetch card details. Please try again later.");
          } else if (err.message.includes("Invalid game type ID")) {
            setError("Invalid game type ID. Please contact support.");
          } else {
            setError(
              `Unexpected error: ${err.message}. Please try again or contact support.`
            );
          }
        } else {
          setError(
            "Failed to process card. Please try again or contact support."
          );
        }
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, stopScanner, startSession, navigate, gameRoutes]
  );

  const resetScanner = () => {
    setScannedCard(null);
    setAvailableRoutes([]);
    setSelectedRoute("");
    setError(null);
    initScanner();
  };

  const handleManualEntry = () => {
    const manualInput = prompt("Enter card number or scan data:");
    if (manualInput) {
      handleScan(manualInput);
    }
  };

  useEffect(() => {
    if (location.state?.sessionExpired) {
      setError(
        "Your game session has expired. Please scan a new card to continue playing."
      );
    }
  }, [location.state]);

  useEffect(() => {
    getCameras();
    return () => {
      stopScanner();
    };
  }, [getCameras, stopScanner]);

  useEffect(() => {
    if (selectedCamera && hasCameraAccess && !scannedCard) {
      initScanner();
    }
    return () => {
      stopScanner();
    };
  }, [selectedCamera, hasCameraAccess, initScanner, stopScanner, scannedCard]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopScanner();
      } else if (hasCameraAccess && !scannedCard) {
        initScanner();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [stopScanner, initScanner, hasCameraAccess, scannedCard]);

  async function startGame(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): Promise<void> {
    event.preventDefault();
    if (!scannedCard || !selectedRoute || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      await startSession(
        scannedCard.gameTypeId,
        scannedCard.playerId,
        scannedCard.duration * 60
      );
      const selectedGameRoute = gameRoutes.find(
        (route) => route.id === selectedRoute
      );
      if (selectedGameRoute) {
        navigate(selectedGameRoute.path, {
          state: {
            cardDetails: scannedCard,
            playerId: scannedCard.playerId,
            fromScanner: true,
          },
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start game");
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-black-primary to-black-secondary text-cream flex items-center justify-center p-4">
      {/* Manual Card Scan Example */}
      <div className="max-w-md mx-auto mb-8 p-4 bg-black-secondary rounded-xl border border-gold-primary/30">
        <h2 className="text-lg font-bold mb-2 text-gold-primary">
          Manual Card Scan Example
        </h2>
        <form onSubmit={handleManualScan} className="flex gap-2 mb-2">
          <input
            type="text"
            value={manualCardId}
            onChange={(e) => setManualCardId(e.target.value)}
            placeholder="Enter Card Number or Scan QR"
            className="flex-1 p-2 rounded border border-gold-primary"
          />
          <button
            type="submit"
            disabled={manualLoading}
            className="px-4 py-2 bg-gold-primary text-black-primary rounded"
          >
            {manualLoading ? "Processing..." : "Activate Card"}
          </button>
        </form>
        {manualError && (
          <div className="text-red-400">Error: {manualError.message}</div>
        )}
        {manualResult && manualResult.length > 0 && manualResult[0].status && (
          <div className="text-green-400">
            Card activated successfully! Game: {manualResult[0].game_type_name}
          </div>
        )}
        {manualResult && manualResult.length > 0 && !manualResult[0].status && (
          <div className="text-red-400">
            Activation failed: {manualResult[0].message}
          </div>
        )}
      </div>
      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-black-secondary rounded-2xl shadow-2xl border border-gold-primary/30 p-8 max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-gold-primary mb-4">
              Login Required
            </h2>
            <p className="text-cream mb-6">
              You must be logged in to scan and activate a card.
            </p>
            <div className="mb-4">
              <button
                className="bg-gold-primary hover:bg-gold-secondary text-black-primary font-bold py-3 px-6 rounded-lg transition-colors mb-2"
                onClick={async () => {
                  setIsLoading(true);
                  const { error } = await supabase.auth.signInWithOAuth({
                    provider: "google",
                    options: {
                      redirectTo:
                        window.location.origin + window.location.pathname,
                    },
                  });
                  setIsLoading(false);
                  if (error) {
                    setLoginError(error.message || "Google login failed");
                  }
                }}
              >
                {isLoading ? "Redirecting..." : "Login with Google"}
              </button>
            </div>
            {/* Only Google login flow is available */}
          </div>
        </div>
      )}
      <div className="w-full max-w-2xl">
        <div className="bg-black-secondary rounded-2xl shadow-2xl overflow-hidden border border-gold-primary/20">
          <div className="bg-gradient-to-r from-gold-primary to-gold-secondary p-6 text-center">
            <h1 className="text-2xl font-bold text-black-primary flex items-center justify-center gap-3">
              <FaQrcode className="text-xl" /> CARD SCANNER
            </h1>
            <p className="text-sm text-black-secondary mt-1 opacity-90">
              Scan your Yenege game card to access available games
            </p>
          </div>

          <div className="p-6">
            {!scannedCard ? (
              <>
                {/* Camera Selection */}
                {cameras.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-gold-light text-sm font-medium mb-2">
                      Camera Selection
                    </label>
                    <select
                      value={selectedCamera || ""}
                      onChange={(e) => setSelectedCamera(e.target.value)}
                      className="w-full p-3 bg-gray-dark text-cream rounded-lg border border-gray-medium focus:border-gold-primary focus:ring-1 focus:ring-gold-primary"
                      aria-label="Camera Selection"
                    >
                      {cameras.map((camera) => (
                        <option key={camera.id} value={camera.id}>
                          {camera.label || `Camera ${camera.id}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Scanner Area */}
                <div className="relative mb-6 border-2 border-gold-primary rounded-lg overflow-hidden bg-black-primary">
                  <div
                    id="scanner-container"
                    ref={scannerRef}
                    className="h-64 w-full flex items-center justify-center relative min-h-[256px]"
                  >
                    {!hasCameraAccess ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-4">
                        <FaCamera className="text-4xl text-gold-primary" />
                        <button
                          onClick={getCameras}
                          className="bg-gold-primary text-black-primary py-2 px-6 rounded-lg hover:bg-gold-secondary transition-colors flex items-center gap-2"
                        >
                          <FaRedo /> Enable Camera
                        </button>
                        <p className="text-center text-gold-light text-sm">
                          Camera access is required to scan QR codes
                        </p>
                      </div>
                    ) : isScanning ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        {/* Custom Overlay */}
                        <div className="absolute inset-0 bg-black-pure opacity-70" />

                        {/* QR Box Visuals */}
                        <div className="relative z-10 w-[min(300px,80vw)] h-[min(300px,80vw)]">
                          {/* Corner borders */}
                          <div className="absolute top-0 left-0 w-1/4 h-1/4 border-t-4 border-l-4 border-gold-primary rounded-tl-lg" />
                          <div className="absolute top-0 right-0 w-1/4 h-1/4 border-t-4 border-r-4 border-gold-primary rounded-tr-lg" />
                          <div className="absolute bottom-0 left-0 w-1/4 h-1/4 border-b-4 border-l-4 border-gold-primary rounded-bl-lg" />
                          <div className="absolute bottom-0 right-0 w-1/4 h-1/4 border-b-4 border-r-4 border-gold-primary rounded-br-lg" />

                          {/* Scanning line */}
                          <div className="absolute top-0 left-0 w-full h-1 bg-gold-secondary animate-scan-line" />
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <button
                    onClick={handleManualEntry}
                    className="flex items-center justify-center gap-2 bg-gray-dark hover:bg-gray-medium text-gold-light py-3 px-4 rounded-lg border border-gold-primary/30 transition-colors"
                  >
                    <FaKeyboard /> Manual Entry
                  </button>

                  <button
                    onClick={initScanner}
                    disabled={!hasCameraAccess}
                    className="flex items-center justify-center gap-2 bg-gold-primary hover:bg-gold-secondary text-black-primary py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    <FaCamera /> {isScanning ? "Scanning..." : "Start Scan"}
                  </button>
                </div>
              </>
            ) : (
              /* Card Details and Route Selection */
              <div className="space-y-6">
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                  <h3 className="text-green-400 font-bold text-lg mb-3">
                    ✅ Card Scanned Successfully!
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p>
                        <span className="text-gold-light font-semibold">
                          Card Number:
                        </span>{" "}
                        {scannedCard.cardNumber}
                      </p>
                      <p>
                        <span className="text-gold-light font-semibold">
                          Player ID:
                        </span>{" "}
                        {scannedCard.playerId}
                      </p>
                      <p>
                        <span className="text-gold-light font-semibold">
                          Player Email:
                        </span>{" "}
                        {scannedCard.playerEmail}
                      </p>
                      <p>
                        <span className="text-gold-light font-semibold">
                          Created By:
                        </span>{" "}
                        {scannedCard.createdByEmail}
                      </p>
                    </div>
                    <div>
                      <p>
                        <span className="text-gold-light font-semibold">
                          Duration:
                        </span>{" "}
                        {scannedCard.duration} minutes
                      </p>
                      <p>
                        <span className="text-gold-light font-semibold">
                          Game Type:
                        </span>{" "}
                        {scannedCard.gameTypeName}
                      </p>
                      <p>
                        <span className="text-gold-light font-semibold">
                          Description:
                        </span>{" "}
                        {scannedCard.gameTypeDescription}
                      </p>
                      <p>
                        <span className="text-gold-light font-semibold">
                          Routes:
                        </span>{" "}
                        {availableRoutes.length}
                      </p>
                      <p>
                        <span className="text-gold-light font-semibold">
                          Used:
                        </span>{" "}
                        {scannedCard.used ? "Yes" : "No"}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-gold-light font-semibold mb-3">
                    <FaGamepad className="inline mr-2" />
                    Select Game to Play:
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {availableRoutes.map((route) => (
                      <button
                        key={route.id}
                        onClick={() => setSelectedRoute(route.id)}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          selectedRoute === route.id
                            ? "border-gold-primary bg-gold-primary/10 text-gold-light"
                            : "border-gray-medium bg-gray-dark text-gray-light hover:border-gold-primary/50"
                        }`}
                      >
                        <div className="font-semibold">{route.name}</div>
                        <div className="text-sm opacity-75">
                          Tap to select this game
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={resetScanner}
                    className="flex-1 py-3 px-4 bg-gray-medium hover:bg-gray-dark text-cream rounded-lg transition-colors"
                  >
                    Scan Another Card
                  </button>
                  <button
                    onClick={startGame}
                    disabled={!selectedRoute || isLoading}
                    className={`flex-1 py-3 px-4 rounded-lg font-bold transition-colors ${
                      selectedRoute && !isLoading
                        ? "bg-gold-primary hover:bg-gold-secondary text-black-primary"
                        : "bg-gray-medium text-gray-light cursor-not-allowed"
                    }`}
                  >
                    {isLoading ? "Starting..." : "Start Game"}
                  </button>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="p-4 mb-4 bg-red-900/20 rounded-lg border-l-4 border-red-500">
                <div className="text-red-300">
                  <p className="font-medium">{error}</p>
                  {error.includes("Camera access") && (
                    <button
                      onClick={getCameras}
                      className="w-full mt-3 bg-gold-primary text-black-primary py-2 rounded-lg hover:bg-gold-secondary transition-colors flex items-center justify-center gap-2"
                    >
                      <FaRedo /> Retry Camera Access
                    </button>
                  )}
                  {/* Contact Support Button */}
                  <button
                    className="w-full mt-3 bg-gold-primary text-black-primary py-2 rounded-lg hover:bg-gold-secondary transition-colors flex items-center justify-center gap-2"
                    onClick={() => {
                      window.open(
                        "mailto:support@yenege.com?subject=Card%20Scan%20Issue&body=Describe%20your%20issue%20here.",
                        "_blank"
                      );
                    }}
                  >
                    Contact Support
                  </button>
                </div>
              </div>
            )}

            {/* Loading Display */}
            {isLoading && (
              <div className="p-4 text-center text-gold-light">
                <div className="inline-flex items-center gap-2 animate-pulse">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      fill="none"
                      strokeWidth="4"
                      className="opacity-25 stroke-current"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  {scannedCard ? "Starting game..." : "Processing card..."}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedQRScanner;
