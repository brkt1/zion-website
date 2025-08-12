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
  id: string;
  card_number: string;
  duration: number;
  game_type_id: string;
  game_name: string;
  game_description: string;
  card_routes: string[];
  game_routes: string[];
  effective_routes: string[];
  activated: boolean;
  activated_at: string;
  used: boolean;
  allowedGames: {
    id: string;
    name: string;
    path: string;
    description?: string;
  }[];
}

interface GameRoute {
  id: string;
  name: string;
  path: string;
  description?: string;
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
  const [showLoginModal, setShowLoginModal] = useState(false);

  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCode = useRef<Html5Qrcode | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const gameRoutes: GameRoute[] = React.useMemo(() => [
    {
      id: "trivia",
      name: "Trivia Game",
      path: "/trivia-game",
      description: "Answer trivia questions to win!",
    },
    {
      id: "truth-dare",
      name: "Truth or Dare",
      path: "/truth-or-dare",
      description: "Play truth or dare challenges.",
    },
    {
      id: "rock-paper-scissors",
      name: "Rock Paper Scissors",
      path: "/rock-paper-scissors",
      description: "Classic rock paper scissors game.",
    },
    {
      id: "emoji",
      name: "Emoji Game",
      path: "/emoji-game",
      description: "Guess the emoji meanings!",
    },
  ], []);

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
      html5QrCode.current = new Html5Qrcode(container.id);
      setIsScanning(true);

      await html5QrCode.current.start(
        selectedCamera,
        {
          fps: 10,
          qrbox: undefined,
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

  const activateCard = async (cardNumber: string, userId: string) => {
    try {
      if (!cardNumber?.trim()) {
        throw new Error("Card number is required");
      }
      if (!userId) {
        throw new Error("Authentication required");
      }

      const { data, error } = await supabase.rpc("activate_card_v2", {
        p_card_number: cardNumber.trim(),
        p_player_id: userId,
      });

      if (error) throw error;
      if (!data || data.length === 0)
        throw new Error("No activation data returned");

      return {
        success: true,
        card: data[0],
      };
    } catch (error: any) {
      console.error("Card activation failed:", {
        code: error.code,
        message: error.message,
        details: error.details,
      });
      const errorMap: Record<string, string> = {
        YNFC1: "Invalid card number",
        YNGT1: "This card has no game association",
        YNGT2: "Game type not configured",
        YNAU1: "Card registered to another player",
        YNAL1: "Card already activated",
        PGRST301: "System error - please contact support",
        default: "Activation failed. Please try again.",
      };
      return {
        success: false,
        error: errorMap[error.code] || errorMap.default,
      };
    }
  };

  const handleScan = useCallback(
    async (scannedData: string) => {
      if (isLoading) return;
      setIsLoading(true);
      setError(null);

      try {
        const cardNumber = scannedData.replace(/\D/g, "");
        if (!/^\d{13}$/.test(cardNumber)) {
          setError("Invalid card format. Please scan a valid Yenege card.");
          setIsLoading(false);
          return;
        }

        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setShowLoginModal(true);
          setIsLoading(false);
          return;
        }

        const result = await activateCard(cardNumber, user.id);
        if (!result.success) {
          setError(result.error ?? "Activation failed");
          setIsLoading(false);
          return;
        }
        const activation = result.card;

        // effective_routes now contains route names (e.g., ['emoji'])
        const allowedGames = gameRoutes.filter((game) =>
          activation.effective_routes.includes(game.path)
        );

        const cardData: ScannedCardData = {
          id: activation.id,
          card_number: activation.card_number.toString(),
          duration: activation.duration,
          game_type_id: activation.game_type_id,
          game_name: activation.game_name,
          game_description: activation.game_description,
          card_routes: activation.card_routes || [],
          game_routes: activation.game_routes || [],
          effective_routes: activation.effective_routes || [],
          activated: activation.activated,
          activated_at: activation.activated_at,
          used: activation.used,
          allowedGames,
        };

        if (activation.used) {
          setError("This card has already been used. Please scan a new card.");
          setIsLoading(false);
          return;
        }

        if (allowedGames.length === 0) {
          setError(
            "No games available for this card. The card may not be associated with any games."
          );
          setIsLoading(false);
          return;
        }

        setAvailableRoutes(allowedGames);
        setScannedCard(cardData);
        setSelectedRoute(allowedGames[0].id);

        await startSession(
          cardData.game_type_id,
          cardData.id,
          cardData.duration * 60
        );
        navigate(allowedGames[0].path, {
          state: {
            cardDetails: cardData,
            playerId: cardData.id,
            fromScanner: true,
          },
        });

        await stopScanner();
      } catch (err) {
        console.error("Unexpected error in handleScan:", err);
        setError(
          "Failed to process card. Please try again or contact support."
        );
        setIsLoading(false);
      }
    },
    [isLoading, stopScanner, startSession, navigate]
  );

  const resetScanner = () => {
    setScannedCard(null);
    setAvailableRoutes([]);
    setSelectedRoute("");
    setError(null);
    initScanner();
  };

  const handleManualEntry = () => {
    const manualInput = prompt("Enter 13-digit card number:");
    if (manualInput) {
      handleScan(manualInput);
    }
  };

  const startGame = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (!scannedCard || !selectedRoute || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      await startSession(
        scannedCard.game_type_id,
        scannedCard.id,
        scannedCard.duration * 60
      );
      // Find the correct route by route name (lowercase)
      const selectedGameRoute = gameRoutes.find(
        (route) =>
          route.id === selectedRoute ||
          route.name.toLowerCase() === selectedRoute.toLowerCase()
      );
      if (selectedGameRoute) {
        // If user is not on the correct route, navigate automatically
        if (location.pathname !== selectedGameRoute.path) {
          navigate(selectedGameRoute.path, {
            state: {
              cardDetails: scannedCard,
              playerId: scannedCard.id,
              fromScanner: true,
            },
          });
        }
      } else {
        setError("Selected game route is not allowed for this card.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start game");
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to handle session expiration messages
  useEffect(() => {
    if (location.state?.sessionExpired) {
      setError(
        "Your game session has expired. Please scan a new card to continue playing."
      );
    }
  }, [location.state]);

  // Effect to auto-correct route after scanning
  useEffect(() => {
    if (scannedCard && selectedRoute) {
      const correctGameRoute = gameRoutes.find(
        (route) =>
          route.id === selectedRoute ||
          route.name.toLowerCase() === selectedRoute.toLowerCase()
      );
      if (correctGameRoute && location.pathname !== correctGameRoute.path) {
        navigate(correctGameRoute.path, {
          state: {
            cardDetails: scannedCard,
            playerId: scannedCard.id,
            fromScanner: true,
          },
        });
      }
    }
  }, [scannedCard, selectedRoute, location.pathname, navigate, gameRoutes]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-black-primary to-black-secondary text-cream flex items-center justify-center p-4">
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
                    setError(error.message || "Google login failed");
                  }
                }}
              >
                {isLoading ? "Redirecting..." : "Login with Google"}
              </button>
            </div>
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
                        <div className="absolute inset-0 bg-black-pure opacity-70" />
                        <div className="relative z-10 w-[min(300px,80vw)] h-[min(300px,80vw)]">
                          <div className="absolute top-0 left-0 w-1/4 h-1/4 border-t-4 border-l-4 border-gold-primary rounded-tl-lg" />
                          <div className="absolute top-0 right-0 w-1/4 h-1/4 border-t-4 border-r-4 border-gold-primary rounded-tr-lg" />
                          <div className="absolute bottom-0 left-0 w-1/4 h-1/4 border-b-4 border-l-4 border-gold-primary rounded-bl-lg" />
                          <div className="absolute bottom-0 right-0 w-1/4 h-1/4 border-b-4 border-r-4 border-gold-primary rounded-br-lg" />
                          <div className="absolute top-0 left-0 w-full h-1 bg-gold-secondary animate-scan-line" />
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

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
                        {scannedCard.card_number}
                      </p>
                      <p>
                        <span className="text-gold-light font-semibold">
                          Duration:
                        </span>{" "}
                        {scannedCard.duration} minutes
                      </p>
                      <p>
                        <span className="text-gold-light font-semibold">
                          Activated At:
                        </span>{" "}
                        {new Date(scannedCard.activated_at).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p>
                        <span className="text-gold-light font-semibold">
                          Game Type:
                        </span>{" "}
                        {scannedCard.game_name}
                      </p>
                      <p>
                        <span className="text-gold-light font-semibold">
                          Description:
                        </span>{" "}
                        {scannedCard.game_description}
                      </p>
                      <p>
                        <span className="text-gold-light font-semibold">
                          Available Games:
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
                    {scannedCard.allowedGames.map((game) => (
                      <button
                        key={game.id}
                        onClick={() => setSelectedRoute(game.id)}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          selectedRoute === game.id
                            ? "border-gold-primary bg-gold-primary/10 text-gold-light"
                            : "border-gray-medium bg-gray-dark text-gray-light hover:border-gold-primary/50"
                        }`}
                      >
                        <div className="font-semibold">{game.name}</div>
                        <div className="text-sm opacity-75">
                          {game.description || "Tap to select this game"}
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

            {error && (
              <div className="p-4 mb-4 bg-red-900/20 rounded-lg border-l-4 border-red-500">
                <div className="text-red-300">
                  <p className="font-medium whitespace-pre-line">{error}</p>
                  {error.includes("Camera access") && (
                    <button
                      onClick={getCameras}
                      className="w-full mt-3 bg-gold-primary text-black-primary py-2 rounded-lg hover:bg-gold-secondary transition-colors flex items-center justify-center gap-2"
                    >
                      <FaRedo /> Retry Camera Access
                    </button>
                  )}
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
