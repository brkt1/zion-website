import { supabase } from '../supabaseClient';

export interface ContentHistory {
  content_id: string;
  content_type: string;
  first_seen_at: string;
  last_seen_at: string;
  times_seen: number;
}

export interface UnseenEmoji {
  id: string;
  emoji: string;
  title: string;
  difficulty: number;
}

export interface UnseenQuestion {
  id: string;
  question: string;
  options: any;
  correct_option: number;
  difficulty: number;
}

export interface UnseenLoversQuestion {
  id: string;
  content: string;
  type: string;
  subtype: string;
}

export interface UnseenFriendsQuestion {
  id: string;
  question: string;
  type: string;
}

export class ContentHistoryService {
  /**
   * Record that a user has seen specific content
   */
  static async recordContentSeen(
    playerId: string,
    gameTypeId: string,
    contentId: string,
    contentType: string
  ): Promise<void> {
    try {
      const { error } = await supabase.rpc('update_user_content_history', {
        p_player_id: playerId,
        p_game_type_id: gameTypeId,
        p_content_id: contentId,
        p_content_type: contentType
      });

      if (error) {
        console.error('Error recording content seen:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to record content seen:', error);
      throw error;
    }
  }

  /**
   * Get unseen emojis for a user
   */
  static async getUnseenEmojis(playerId: string): Promise<UnseenEmoji[]> {
    try {
      const { data, error } = await supabase.rpc('get_unseen_emojis', {
        p_player_id: playerId
      });

      if (error) {
        console.error('Error fetching unseen emojis:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch unseen emojis:', error);
      return [];
    }
  }

  /**
   * Get unseen questions for a user
   */
  static async getUnseenQuestions(playerId: string): Promise<UnseenQuestion[]> {
    try {
      const { data, error } = await supabase.rpc('get_unseen_questions', {
        p_player_id: playerId
      });

      if (error) {
        console.error('Error fetching unseen questions:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch unseen questions:', error);
      return [];
    }
  }

  /**
   * Get unseen lovers questions for a user
   */
  static async getUnseenLoversQuestions(
    playerId: string, 
    type: string, 
    subtype: string
  ): Promise<UnseenLoversQuestion[]> {
    try {
      const { data, error } = await supabase.rpc('get_unseen_lovers_questions', {
        p_player_id: playerId,
        p_type: type,
        p_subtype: subtype
      });

      if (error) {
        console.error('Error fetching unseen lovers questions:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch unseen lovers questions:', error);
      return [];
    }
  }

  /**
   * Get unseen friends questions for a user
   */
  static async getUnseenFriendsQuestions(
    playerId: string, 
    type: string
  ): Promise<UnseenFriendsQuestion[]> {
    try {
      const { data, error } = await supabase.rpc('get_unseen_friends_questions', {
        p_player_id: playerId,
        p_type: type
      });

      if (error) {
        console.error('Error fetching unseen friends questions:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch unseen friends questions:', error);
      return [];
    }
  }

  /**
   * Check if a user has seen specific content
   */
  static async hasSeenContent(
    playerId: string,
    gameTypeId: string,
    contentId: string
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('has_seen_content', {
        p_player_id: playerId,
        p_game_type_id: gameTypeId,
        p_content_id: contentId
      });

      if (error) {
        console.error('Error checking if content has been seen:', error);
        throw error;
      }

      return data || false;
    } catch (error) {
      console.error('Failed to check if content has been seen:', error);
      return false;
    }
  }

  /**
   * Get all content that a user has seen for a specific game type
   */
  static async getSeenContent(
    playerId: string,
    gameTypeId: string,
    contentType?: string
  ): Promise<ContentHistory[]> {
    try {
      let query = supabase
        .from('user_content_history')
        .select('*')
        .eq('player_id', playerId)
        .eq('game_type_id', gameTypeId);

      if (contentType) {
        query = query.eq('content_type', contentType);
      }

      const { data, error } = await query.order('last_seen_at', { ascending: false });

      if (error) {
        console.error('Error fetching seen content:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch seen content:', error);
      return [];
    }
  }

  /**
   * Get game type ID by game name
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
   * Get fallback content when user has seen all content
   * This returns a subset of seen content to ensure the game can continue
   */
  static async getFallbackContent(
    playerId: string,
    gameTypeId: string,
    contentType: string,
    limit: number = 10
  ): Promise<any[]> {
    try {
      // Get recently seen content as fallback
      const { data, error } = await supabase
        .from('user_content_history')
        .select('content_id')
        .eq('player_id', playerId)
        .eq('game_type_id', gameTypeId)
        .eq('content_type', contentType)
        .order('last_seen_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching fallback content:', error);
        return [];
      }

      // Fetch the actual content items
      if (data && data.length > 0) {
        const contentIds = data.map(item => item.content_id);
        
        if (contentType === 'emoji') {
          const { data: emojis, error: emojiError } = await supabase
            .from('emojis')
            .select('*')
            .in('id', contentIds);
          
          if (emojiError) {
            console.error('Error fetching fallback emojis:', emojiError);
            return [];
          }
          
          return emojis || [];
        } else if (contentType === 'question') {
          const { data: questions, error: questionError } = await supabase
            .from('quiz_questions')
            .select('*')
            .in('id', contentIds);
          
          if (questionError) {
            console.error('Error fetching fallback questions:', questionError);
            return [];
          }
          
          return questions || [];
        }
      }

      return [];
    } catch (error) {
      console.error('Failed to fetch fallback content:', error);
      return [];
    }
  }
}
