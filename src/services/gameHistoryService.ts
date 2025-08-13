import { supabase } from '../supabaseClient';

export interface GameHistory {
  game_type_id: string;
  game_name: string;
  game_description: string;
  first_played_at: string;
  last_played_at: string;
  total_sessions: number;
  total_score: number;
}

export interface UnplayedGame {
  game_type_id: string;
  game_name: string;
  game_description: string;
}

export class GameHistoryService {
  /**
   * Record that a user has played a specific game
   */
  static async recordGamePlayed(
    playerId: string,
    gameTypeId: string,
    score: number = 0
  ): Promise<void> {
    try {
      const { error } = await supabase.rpc('update_user_game_history', {
        p_player_id: playerId,
        p_game_type_id: gameTypeId,
        p_score: score
      });

      if (error) {
        console.error('Error recording game played:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to record game played:', error);
      throw error;
    }
  }

  /**
   * Get all games that a user has not played yet
   */
  static async getUnplayedGames(playerId: string): Promise<UnplayedGame[]> {
    try {
      const { data, error } = await supabase.rpc('get_unplayed_games', {
        p_player_id: playerId
      });

      if (error) {
        console.error('Error fetching unplayed games:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch unplayed games:', error);
      return [];
    }
  }

  /**
   * Get all games that a user has played
   */
  static async getPlayedGames(playerId: string): Promise<GameHistory[]> {
    try {
      const { data, error } = await supabase.rpc('get_played_games', {
        p_player_id: playerId
      });

      if (error) {
        console.error('Error fetching played games:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch played games:', error);
      return [];
    }
  }

  /**
   * Check if a user has played a specific game
   */
  static async hasPlayedGame(playerId: string, gameTypeId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_game_history')
        .select('id')
        .eq('player_id', playerId)
        .eq('game_type_id', gameTypeId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error checking if user has played game:', error);
        throw error;
      }

      return !!data;
    } catch (error) {
      console.error('Failed to check if user has played game:', error);
      return false;
    }
  }

  /**
   * Get game type ID by game name (for mapping game routes to game types)
   */
  static async getGameTypeIdByName(gameName: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('game_types')
        .select('id')
        .eq('name', gameName)
        .single();

      if (error) {
        console.error('Error fetching game type ID:', error);
        return null;
      }

      return data?.id || null;
    } catch (error) {
      console.error('Failed to fetch game type ID:', error);
      return null;
    }
  }

  /**
   * Get all available game types
   */
  static async getAllGameTypes(): Promise<Array<{ id: string; name: string; description: string }>> {
    try {
      const { data, error } = await supabase
        .from('game_types')
        .select('id, name, description')
        .order('name');

      if (error) {
        console.error('Error fetching game types:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch game types:', error);
      return [];
    }
  }
}
