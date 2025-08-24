import React, { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from '../supabaseClient';

interface GameNightEvent {
  id: string;
  name: string;
  description: string;
  location: string;
  venue_name: string;
  date: string;
  start_time: string;
  end_time: string;
  status: 'setup' | 'active' | 'completed' | 'cancelled';
  max_participants: number;
  current_participants: number;
  created_by: string;
  created_at: string;
  started_at?: string;
  ended_at?: string;
  total_points_awarded: number;
  winner_announced: boolean;
}

interface TabletStation {
  id: string;
  event_id: string;
  tablet_id: string;
  game_type: string;
  status: 'available' | 'occupied' | 'maintenance' | 'offline';
  current_player_id?: string;
  current_game_session_id?: string;
  allocated_at: string;
  last_activity: string;
  location_coordinates?: {
    x: number;
    y: number;
  };
}

interface EventParticipant {
  id: string;
  event_id: string;
  user_id: string;
  tablet_id?: string;
  total_points: number;
  games_played: number;
  joined_at: string;
  left_at?: string;
  is_winner: boolean;
}

interface EventContextType {
  currentEvent: GameNightEvent | null;
  tabletStations: TabletStation[];
  participants: EventParticipant[];
  isLoading: boolean;
  
  // Event management
  createEvent: (eventData: Omit<GameNightEvent, 'id' | 'status' | 'created_at' | 'current_participants' | 'total_points_awarded' | 'winner_announced'>) => Promise<string>;
  updateEvent: (eventId: string, updates: Partial<GameNightEvent>) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  startEvent: (eventId: string) => Promise<void>;
  endEvent: (eventId: string) => Promise<void>;
  
  // Tablet management
  allocateTablets: (eventId: string, allocations: Omit<TabletStation, 'id' | 'allocated_at' | 'last_activity'>[]) => Promise<void>;
  updateTabletStatus: (tabletId: string, status: string, playerId?: string) => Promise<void>;
  getAvailableTablets: (eventId: string) => TabletStation[];
  
  // Participant management
  joinEvent: (eventId: string, userId: string) => Promise<void>;
  leaveEvent: (eventId: string, userId: string) => Promise<void>;
  updateParticipantPoints: (eventId: string, userId: string, points: number) => Promise<void>;
  
  // Data fetching
  fetchEvents: () => Promise<void>;
  fetchEventDetails: (eventId: string) => Promise<void>;
  fetchTabletStations: (eventId: string) => Promise<void>;
  fetchParticipants: (eventId: string) => Promise<void>;
  
  // Winner calculation
  calculateEventWinner: (eventId: string) => Promise<string>;
  announceWinner: (eventId: string, winnerId: string) => Promise<void>;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const useEvent = () => {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEvent must be used within an EventProvider');
  }
  return context;
};

interface EventProviderProps {
  children: ReactNode;
}

export const EventProvider: React.FC<EventProviderProps> = ({ children }) => {
  const [currentEvent, setCurrentEvent] = useState<GameNightEvent | null>(null);
  const [tabletStations, setTabletStations] = useState<TabletStation[]>([]);
  const [participants, setParticipants] = useState<EventParticipant[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Event management
  const createEvent = async (eventData: Omit<GameNightEvent, 'id' | 'status' | 'created_at' | 'current_participants' | 'total_points_awarded' | 'winner_announced'>): Promise<string> => {
    try {
      const event = {
        ...eventData,
        status: 'setup' as const,
        created_at: new Date().toISOString(),
        current_participants: 0,
        total_points_awarded: 0,
        winner_announced: false
      };

      const { data, error } = await supabase
        .from('game_night_events')
        .insert([event])
        .select()
        .single();

      if (error) throw error;

      await fetchEvents();
      return data.id;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  };

  const updateEvent = async (eventId: string, updates: Partial<GameNightEvent>) => {
    try {
      const { error } = await supabase
        .from('game_night_events')
        .update(updates)
        .eq('id', eventId);

      if (error) throw error;

      await fetchEvents();
      if (currentEvent?.id === eventId) {
        setCurrentEvent(prev => prev ? { ...prev, ...updates } : null);
      }
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('game_night_events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      await fetchEvents();
      if (currentEvent?.id === eventId) {
        setCurrentEvent(null);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  };

  const startEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('game_night_events')
        .update({
          status: 'active',
          started_at: new Date().toISOString()
        })
        .eq('id', eventId);

      if (error) throw error;

      await fetchEvents();
    } catch (error) {
      console.error('Error starting event:', error);
      throw error;
    }
  };

  const endEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('game_night_events')
        .update({
          status: 'completed',
          ended_at: new Date().toISOString()
        })
        .eq('id', eventId);

      if (error) throw error;

      await fetchEvents();
    } catch (error) {
      console.error('Error ending event:', error);
      throw error;
    }
  };

  // Tablet management
  const allocateTablets = async (eventId: string, allocations: Omit<TabletStation, 'id' | 'allocated_at' | 'last_activity'>[]) => {
    try {
      const tabletAllocations = allocations.map(allocation => ({
        ...allocation,
        event_id: eventId,
        allocated_at: new Date().toISOString(),
        last_activity: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('tablet_stations')
        .insert(tabletAllocations);

      if (error) throw error;

      await fetchTabletStations(eventId);
    } catch (error) {
      console.error('Error allocating tablets:', error);
      throw error;
    }
  };

  const updateTabletStatus = async (tabletId: string, status: string, playerId?: string) => {
    try {
      const updates: Partial<TabletStation> = {
        status: status as any,
        last_activity: new Date().toISOString()
      };

      if (playerId) {
        updates.current_player_id = playerId;
      } else {
        updates.current_player_id = null;
        updates.current_game_session_id = null;
      }

      const { error } = await supabase
        .from('tablet_stations')
        .update(updates)
        .eq('id', tabletId);

      if (error) throw error;

      await fetchTabletStations(currentEvent?.id || '');
    } catch (error) {
      console.error('Error updating tablet status:', error);
      throw error;
    }
  };

  const getAvailableTablets = (eventId: string): TabletStation[] => {
    return tabletStations.filter(tablet => 
      tablet.event_id === eventId && 
      tablet.status === 'available'
    );
  };

  // Participant management
  const joinEvent = async (eventId: string, userId: string) => {
    try {
      const participant = {
        event_id: eventId,
        user_id: userId,
        total_points: 0,
        games_played: 0,
        joined_at: new Date().toISOString(),
        is_winner: false
      };

      const { error } = await supabase
        .from('event_participants')
        .insert([participant]);

      if (error) throw error;

      // Update event participant count
      await supabase
        .from('game_night_events')
        .update({
          current_participants: supabase.sql`current_participants + 1`
        })
        .eq('id', eventId);

      await fetchParticipants(eventId);
      await fetchEvents();
    } catch (error) {
      console.error('Error joining event:', error);
      throw error;
    }
  };

  const leaveEvent = async (eventId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('event_participants')
        .update({
          left_at: new Date().toISOString()
        })
        .eq('event_id', eventId)
        .eq('user_id', userId);

      if (error) throw error;

      // Update event participant count
      await supabase
        .from('game_night_events')
        .update({
          current_participants: supabase.sql`current_participants - 1`
        })
        .eq('id', eventId);

      await fetchParticipants(eventId);
      await fetchEvents();
    } catch (error) {
      console.error('Error leaving event:', error);
      throw error;
    }
  };

  const updateParticipantPoints = async (eventId: string, userId: string, points: number) => {
    try {
      const { error } = await supabase
        .from('event_participants')
        .update({
          total_points: supabase.sql`total_points + ${points}`,
          games_played: supabase.sql`games_played + 1`
        })
        .eq('event_id', eventId)
        .eq('user_id', userId);

      if (error) throw error;

      // Update event total points
      await supabase
        .from('game_night_events')
        .update({
          total_points_awarded: supabase.sql`total_points_awarded + ${points}`
        })
        .eq('id', eventId);

      await fetchParticipants(eventId);
      await fetchEvents();
    } catch (error) {
      console.error('Error updating participant points:', error);
      throw error;
    }
  };

  // Data fetching
  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('game_night_events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      // setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEventDetails = async (eventId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('game_night_events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (error) throw error;
      setCurrentEvent(data);
    } catch (error) {
      console.error('Error fetching event details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTabletStations = async (eventId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('tablet_stations')
        .select('*')
        .eq('event_id', eventId)
        .order('allocated_at', { ascending: true });

      if (error) throw error;
      setTabletStations(data || []);
    } catch (error) {
      console.error('Error fetching tablet stations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchParticipants = async (eventId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('event_participants')
        .select('*')
        .eq('event_id', eventId)
        .order('total_points', { ascending: false });

      if (error) throw error;
      setParticipants(data || []);
    } catch (error) {
      console.error('Error fetching participants:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Winner calculation
  const calculateEventWinner = async (eventId: string): Promise<string> => {
    try {
      const { data, error } = await supabase
        .from('event_participants')
        .select('user_id, total_points')
        .eq('event_id', eventId)
        .order('total_points', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      return data.user_id;
    } catch (error) {
      console.error('Error calculating event winner:', error);
      throw error;
    }
  };

  const announceWinner = async (eventId: string, winnerId: string) => {
    try {
      // Mark winner in participants
      const { error: participantError } = await supabase
        .from('event_participants')
        .update({ is_winner: true })
        .eq('event_id', eventId)
        .eq('user_id', winnerId);

      if (participantError) throw participantError;

      // Mark winner announced in event
      const { error: eventError } = await supabase
        .from('game_night_events')
        .update({ winner_announced: true })
        .eq('id', eventId);

      if (eventError) throw eventError;

      await fetchParticipants(eventId);
      await fetchEvents();
    } catch (error) {
      console.error('Error announcing winner:', error);
      throw error;
    }
  };

  const value: EventContextType = {
    currentEvent,
    tabletStations,
    participants,
    isLoading,
    createEvent,
    updateEvent,
    deleteEvent,
    startEvent,
    endEvent,
    allocateTablets,
    updateTabletStatus,
    getAvailableTablets,
    joinEvent,
    leaveEvent,
    updateParticipantPoints,
    fetchEvents,
    fetchEventDetails,
    fetchTabletStations,
    fetchParticipants,
    calculateEventWinner,
    announceWinner
  };

  return (
    <EventContext.Provider value={value}>
      {children}
    </EventContext.Provider>
  );
};
