import React, { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from '../supabaseClient';

interface GameSession {
  id: string;
  game_type: 'emoji' | 'trivia' | 'truth_dare' | 'rock_paper_scissors';
  mode: 'solo' | 'multiplayer';
  room_id?: string;
  player_id: string;
  cafe_id?: string;
  event_id?: string;
  status: 'active' | 'completed' | 'paused';
  start_time: string;
  end_time?: string;
  score: number;
  max_score: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface QRCode {
  id: string;
  code: string;
  cafe_id: string;
  waiter_id: string;
  game_type: string;
  mode: 'solo' | 'multiplayer';
  is_active: boolean;
  created_at: string;
  expires_at: string;
  max_players?: number;
  event_id?: string;
}

interface GameContextType {
  currentSession: GameSession | null;
  scannedQR: QRCode | null;
  isGameActive: boolean;
  scanQRCode: (qrData: string) => Promise<QRCode>;
  startGame: (gameType: string, mode: 'solo' | 'multiplayer', roomId?: string) => Promise<void>;
  endGame: (finalScore: number) => Promise<void>;
  pauseGame: () => void;
  resumeGame: () => void;
  joinRoom: (roomId: string) => Promise<void>;
  createRoom: (gameType: string, maxPlayers: number) => Promise<string>;
  getActiveRooms: () => Promise<any[]>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [currentSession, setCurrentSession] = useState<GameSession | null>(null);
  const [scannedQR, setScannedQR] = useState<QRCode | null>(null);
  const [isGameActive, setIsGameActive] = useState(false);

  const scanQRCode = async (qrData: string): Promise<QRCode> => {
    try {
      // Parse QR data (assuming it contains a session ID or code)
      const qrCode = qrData;
      
      // Fetch QR code details from database
      const { data, error } = await supabase
        .from('qr_codes')
        .select('*')
        .eq('code', qrCode)
        .eq('is_active', true)
        .single();

      if (error) {
        throw new Error('Invalid or expired QR code');
      }

      // Check if QR code is expired
      if (new Date(data.expires_at) < new Date()) {
        throw new Error('QR code has expired');
      }

      setScannedQR(data);
      return data;
    } catch (error) {
      console.error('Error scanning QR code:', error);
      throw error;
    }
  };

  const startGame = async (gameType: string, mode: 'solo' | 'multiplayer', roomId?: string) => {
    try {
      if (!scannedQR) {
        throw new Error('No QR code scanned');
      }

      const session: Omit<GameSession, 'id'> = {
        game_type: gameType as any,
        mode,
        room_id: roomId,
        player_id: '', // Will be set from auth context
        cafe_id: scannedQR.cafe_id,
        event_id: scannedQR.event_id,
        status: 'active',
        start_time: new Date().toISOString(),
        score: 0,
        max_score: 100, // Default max score
        difficulty: 'medium'
      };

      // Create game session in database
      const { data, error } = await supabase
        .from('game_sessions')
        .insert([session])
        .select()
        .single();

      if (error) throw error;

      setCurrentSession(data);
      setIsGameActive(true);
    } catch (error) {
      console.error('Error starting game:', error);
      throw error;
    }
  };

  const endGame = async (finalScore: number) => {
    try {
      if (!currentSession) return;

      const { error } = await supabase
        .from('game_sessions')
        .update({
          status: 'completed',
          end_time: new Date().toISOString(),
          score: finalScore
        })
        .eq('id', currentSession.id);

      if (error) throw error;

      // Update user points
      const { error: pointsError } = await supabase
        .from('users')
        .update({
          points: supabase.sql`points + ${finalScore}`
        })
        .eq('id', currentSession.player_id);

      if (pointsError) throw pointsError;

      setCurrentSession(null);
      setIsGameActive(false);
      setScannedQR(null);
    } catch (error) {
      console.error('Error ending game:', error);
      throw error;
    }
  };

  const pauseGame = () => {
    if (currentSession) {
      setCurrentSession(prev => prev ? { ...prev, status: 'paused' } : null);
      setIsGameActive(false);
    }
  };

  const resumeGame = () => {
    if (currentSession) {
      setCurrentSession(prev => prev ? { ...prev, status: 'active' } : null);
      setIsGameActive(true);
    }
  };

  const joinRoom = async (roomId: string) => {
    try {
      // Check if room exists and has space
      const { data: room, error: roomError } = await supabase
        .from('game_rooms')
        .select('*')
        .eq('id', roomId)
        .eq('status', 'active')
        .single();

      if (roomError || !room) {
        throw new Error('Room not found or inactive');
      }

      // Check if room is full
      const { count: playerCount } = await supabase
        .from('game_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('room_id', roomId)
        .eq('status', 'active');

      if (playerCount && playerCount >= room.max_players) {
        throw new Error('Room is full');
      }

      // Join the room by updating the current session
      if (currentSession) {
        const { error } = await supabase
          .from('game_sessions')
          .update({ room_id: roomId })
          .eq('id', currentSession.id);

        if (error) throw error;

        setCurrentSession(prev => prev ? { ...prev, room_id: roomId } : null);
      }
    } catch (error) {
      console.error('Error joining room:', error);
      throw error;
    }
  };

  const createRoom = async (gameType: string, maxPlayers: number): Promise<string> => {
    try {
      const room = {
        game_type: gameType,
        max_players: maxPlayers,
        status: 'active',
        created_at: new Date().toISOString(),
        created_by: '', // Will be set from auth context
        cafe_id: scannedQR?.cafe_id
      };

      const { data, error } = await supabase
        .from('game_rooms')
        .insert([room])
        .select()
        .single();

      if (error) throw error;

      return data.id;
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  };

  const getActiveRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('game_rooms')
        .select(`
          *,
          game_sessions (
            id,
            player_id,
            score,
            status
          )
        `)
        .eq('status', 'active')
        .eq('cafe_id', scannedQR?.cafe_id);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching active rooms:', error);
      return [];
    }
  };

  const value: GameContextType = {
    currentSession,
    scannedQR,
    isGameActive,
    scanQRCode,
    startGame,
    endGame,
    pauseGame,
    resumeGame,
    joinRoom,
    createRoom,
    getActiveRooms
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};
