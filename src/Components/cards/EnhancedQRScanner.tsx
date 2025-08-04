import { Html5Qrcode } from "html5-qrcode";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  FaCamera,
  FaGamepad,
  FaKeyboard,
  FaQrcode,
  FaRedo,
} from "react-icons/fa";
import { useAuthStore } from "../../stores/authStore";
import { useSessionStore } from "../../stores/sessionStore";
import { supabase } from "../../supabaseClient";

interface ScannedCardData {
  cardNumber: string;
  gameTypeId: string;
  duration: number;
  routeAccess: string[];
  playerId: string;
  timestamp: string;
}

interface GameRoute {
  id: string;
  name: string;
  path: string;
}

const EnhancedQRScanner: React.FC = () => {
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
  const [showAuth, setShowAuth] = useState(false);

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
          qrbox: qrboxSize, // Use calculated qrbox size instead of null
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
        let cardData: ScannedCardData;

        try {
          const parsedData = JSON.parse(scannedData);

          // Check if it's a winner card
          if (parsedData.type === "winner_card") {
            setError(
              "This is a winner card. Please use the winner verification scanner."
            );
            return;
          }

          // Validate card data structure
          if (
            !parsedData.cardNumber ||
            !parsedData.gameTypeId ||
            !parsedData.routeAccess
          ) {
            throw new Error("Invalid card data structure");
          }

          cardData = {
            cardNumber: parsedData.cardNumber,
            gameTypeId: parsedData.gameTypeId,
            duration: parsedData.duration || 30,
            routeAccess: parsedData.routeAccess || [],
            playerId: parsedData.playerId || generatePlayerId(),
            timestamp: parsedData.timestamp || new Date().toISOString(),
          };
        } catch {
          // Fallback for simple card number
          const cardNumber = scannedData.replace(/\D/g, "");
          if (!/^\d{13}$/.test(cardNumber)) {
            throw new Error(`Invalid card format: ${scannedData}`);
          }

          // For guest users, we assume card data is self-contained in QR or fetched anonymously
          // If backend fetch is needed, it should be an unauthenticated endpoint.
          // For now, we'll simulate a card record if not parsed from QR directly.
          cardData = {
            cardNumber: cardNumber,
            gameTypeId: "UNKNOWN", // Placeholder, ideally from QR or anonymous fetch
            duration: 30, // Default duration
            routeAccess: [
              "trivia",
              "truth-dare",
              "rock-paper-scissors",
              "emoji",
            ], // Default routes
            playerId: generatePlayerId(),
            timestamp: new Date().toISOString(),
          };
        }

        // No need for separate 'used' check here, backend handles it
        // The API call above already checks if the card is used.

        // Set available routes based on card
        const cardRoutes = cardData.routeAccess
          .map((routeId) => gameRoutes.find((route) => route.id === routeId))
          .filter(Boolean) as GameRoute[];

        setAvailableRoutes(cardRoutes);
        setScannedCard(cardData);

        // Auto-select first route if only one available
        if (cardRoutes.length === 1) {
          setSelectedRoute(cardRoutes[0].id);
        }

        // Stop scanning
        await stopScanner();

        // Update enhanced_cards record to assign current user and mark used
        try {
          const currentUser = useAuthStore.getState().user;
          if (currentUser) {
            const { data: updatedCard, error: updateError } = await supabase
              .from("enhanced_cards")
              .update({ player_id: currentUser.id, used: true })
              .eq("card_number", cardData.cardNumber)
              .select("*")
              .single();
            if (updateError) {
              console.error("Error updating scanned card:", updateError);
            } else {
              console.log("Scanned card updated:", updatedCard);
            }
            // Link card to user in card_users table
            try {
              const { data: userLink, error: userError } = await supabase
                .from("card_users")
                .insert({
                  card_name: cardData.cardNumber,
                  card_data: {
                    name:
                      currentUser.user_metadata?.full_name || currentUser.email,
                    email: currentUser.email,
                  },
                })
                .select("*")
                .single();
              if (userError) {
                console.error("Error linking card to user:", userError);
              } else {
                console.log("Card-user link saved:", userLink);
              }
            } catch (err) {
              console.error("Exception linking card to user:", err);
            }
          }
        } catch (err) {
          console.error("Exception updating scanned card:", err);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to process card");
        setTimeout(() => setError(null), 5000);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, stopScanner]
  );

  const startGame = async () => {
    if (!scannedCard || !selectedRoute) {
      setError("Please select a game route");
      return;
    }

    setIsLoading(true);

    try {
      const token = useAuthStore.getState().session?.access_token;
      if (!token) {
        throw new Error("Authentication required to start game.");
      }

      // Start game session
      await startSession(
        scannedCard.gameTypeId,
        scannedCard.playerId,
        scannedCard.duration * 60
      );

      // Navigate to selected game route
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
  };

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

  // Google Auth handler
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
      });
      if (error) throw error;
      // Supabase will redirect, so no further action needed here
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
    } finally {
      setIsLoading(false);
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

  // If not authenticated, show Google login prompt
  const { session } = useAuthStore();
  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black-primary">
        <div className="bg-black rounded-xl p-8 max-w-md w-full border border-amber-500/30 shadow-lg shadow-amber-500/10">
          <div className="flex flex-col items-center space-y-6">
            {/* Logo/Icon */}
            <div className="p-3 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-black"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                />
              </svg>
            </div>

            {/* Heading */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-amber-400 mb-1 font-serif">
                Log in
              </h2>
              <p className="text-gray-400 text-sm tracking-wider">
                ACCESS YOUR ACCOUNT
              </p>
            </div>

            {/* Google Button */}
            <button
              onClick={handleGoogleSignIn}
              className="flex items-center justify-center gap-3 w-full bg-transparent hover:bg-amber-500/10 text-amber-400 font-medium py-3 px-4 rounded-lg transition-all duration-200 border border-amber-500/50 hover:border-amber-400 group"
              disabled={isLoading}
            >
              {isLoading ? (
                <svg
                  className="animate-spin h-5 w-5 text-amber-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 48 48"
                    className="group-hover:brightness-125"
                  >
                    <path
                      fill="#4285F4"
                      d="M43.611 20.083H42V20H24v8h11.303C33.962 32.083 29.418 35 24 35c-6.065 0-11-4.935-11-11s4.935-11 11-11c2.507 0 4.805.857 6.646 2.278l6.364-6.364C33.527 6.527 28.977 4 24 4 12.954 4 4 12.954 4 24s8.954 20 20 20c9.798 0 18.799-7.065 19.799-16.065c.134-1.144.201-2.312.201-3.435c0-1.364-.122-2.695-.389-3.917z"
                    />
                    <path
                      fill="#34A853"
                      d="M6.306 14.691l6.571 4.819C14.655 16.108 19.004 13 24 13c2.507 0 4.805.857 6.646 2.278l6.364-6.364C33.527 6.527 28.977 4 24 4c-7.732 0-14.41 4.41-17.694 10.691z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M24 44c5.318 0 10.13-1.824 13.885-4.965l-6.415-5.263C29.418 35 24 35 24 35c-5.418 0-9.962-2.917-11.303-7.083l-6.571 5.081C9.59 39.59 16.268 44 24 44z"
                    />
                    <path
                      fill="#EA4335"
                      d="M43.611 20.083H42V20H24v8h11.303c-1.23 3.31-4.418 7.083-11.303 7.083c-4.003 0-7.573-1.318-10.303-3.581l-6.571 5.081C9.59 39.59 16.268 44 24 44c9.798 0 18.799-7.065 19.799-16.065c.134-1.144.201-2.312.201-3.435c0-1.364-.122-2.695-.389-3.917z"
                    />
                  </svg>
                  <span className="group-hover:text-amber-300">
                    Continue with Google
                  </span>
                </>
              )}
            </button>

            {/* Error message */}
            {error && (
              <div className="w-full p-3 bg-amber-900/10 text-amber-300 rounded-lg text-sm text-center border border-amber-500/30 animate-pulse">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-black-primary to-black-secondary text-cream flex items-center justify-center p-4">
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
                          Routes:
                        </span>{" "}
                        {availableRoutes.length}
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
