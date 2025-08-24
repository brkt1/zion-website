import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    },
    realtime: {
        params: {
            eventsPerSecond: 10
        }
    }
});

// Database types for TypeScript
export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string;
                    email: string;
                    username: string | null;
                    role: string;
                    points: number;
                    created_at: string;
                    updated_at: string;
                    last_login: string;
                    cafe_id: string | null;
                };
                Insert: {
                    id?: string;
                    email: string;
                    username?: string | null;
                    role?: string;
                    points?: number;
                    created_at?: string;
                    updated_at?: string;
                    last_login?: string;
                    cafe_id?: string | null;
                };
                Update: {
                    id?: string;
                    email?: string;
                    username?: string | null;
                    role?: string;
                    points?: number;
                    created_at?: string;
                    updated_at?: string;
                    last_login?: string;
                    cafe_id?: string | null;
                };
            };
            cafes: {
                Row: {
                    id: string;
                    name: string;
                    location: string;
                    address: string;
                    phone: string;
                    email: string;
                    status: string;
                    created_at: string;
                    updated_at: string;
                    owner_id: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    location: string;
                    address: string;
                    phone: string;
                    email: string;
                    status?: string;
                    created_at?: string;
                    updated_at?: string;
                    owner_id: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    location?: string;
                    address?: string;
                    phone?: string;
                    email?: string;
                    status?: string;
                    created_at?: string;
                    updated_at?: string;
                    owner_id?: string;
                };
            };
            qr_codes: {
                Row: {
                    id: string;
                    code: string;
                    cafe_id: string;
                    game_type: string;
                    mode: string;
                    max_players: number | null;
                    status: string;
                    created_at: string;
                    updated_at: string;
                    created_by: string;
                    expires_at: string | null;
                };
                Insert: {
                    id?: string;
                    code: string;
                    cafe_id: string;
                    game_type: string;
                    mode: string;
                    max_players?: number | null;
                    status?: string;
                    created_at?: string;
                    updated_at?: string;
                    created_by: string;
                    expires_at?: string | null;
                };
                Update: {
                    id?: string;
                    code?: string;
                    cafe_id?: string;
                    game_type?: string;
                    mode?: string;
                    max_players?: number | null;
                    status?: string;
                    created_at?: string;
                    updated_at?: string;
                    created_by?: string;
                    expires_at?: string | null;
                };
            };
            game_sessions: {
                Row: {
                    id: string;
                    user_id: string;
                    game_type: string;
                    mode: string;
                    score: number;
                    max_score: number;
                    duration: number;
                    status: string;
                    started_at: string;
                    ended_at: string | null;
                    qr_code_id: string | null;
                    cafe_id: string | null;
                    event_id: string | null;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    game_type: string;
                    mode: string;
                    score: number;
                    max_score: number;
                    duration: number;
                    status?: string;
                    started_at?: string;
                    ended_at?: string | null;
                    qr_code_id?: string | null;
                    cafe_id?: string | null;
                    event_id?: string | null;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    game_type?: string;
                    mode?: string;
                    score?: number;
                    max_score?: number;
                    duration?: number;
                    status?: string;
                    started_at?: string;
                    ended_at?: string | null;
                    qr_code_id?: string | null;
                    cafe_id?: string | null;
                    event_id?: string | null;
                };
            };
            game_rooms: {
                Row: {
                    id: string;
                    name: string;
                    game_type: string;
                    max_players: number;
                    current_players: number;
                    status: string;
                    is_private: boolean;
                    password: string | null;
                    created_at: string;
                    updated_at: string;
                    host_id: string;
                    qr_code_id: string | null;
                };
                Insert: {
                    id?: string;
                    name: string;
                    game_type: string;
                    max_players: number;
                    current_players?: number;
                    status?: string;
                    is_private?: boolean;
                    password?: string | null;
                    created_at?: string;
                    updated_at?: string;
                    host_id: string;
                    qr_code_id?: string | null;
                };
                Update: {
                    id?: string;
                    name?: string;
                    game_type?: string;
                    max_players?: number;
                    current_players?: number;
                    status?: string;
                    is_private?: boolean;
                    password?: string | null;
                    created_at?: string;
                    updated_at?: string;
                    host_id?: string;
                    qr_code_id?: string | null;
                };
            };
            game_night_events: {
                Row: {
                    id: string;
                    name: string;
                    description: string;
                    location: string;
                    start_date: string;
                    end_date: string;
                    status: string;
                    max_participants: number;
                    current_participants: number;
                    total_points_awarded: number;
                    winner_announced: boolean;
                    created_at: string;
                    updated_at: string;
                    admin_id: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    description: string;
                    location: string;
                    start_date: string;
                    end_date: string;
                    status?: string;
                    max_participants: number;
                    current_participants?: number;
                    total_points_awarded?: number;
                    winner_announced?: boolean;
                    created_at?: string;
                    updated_at?: string;
                    admin_id: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    description?: string;
                    location?: string;
                    start_date?: string;
                    end_date?: string;
                    status?: string;
                    max_participants?: number;
                    current_participants?: number;
                    total_points_awarded?: number;
                    winner_announced?: boolean;
                    created_at?: string;
                    updated_at?: string;
                    admin_id?: string;
                };
            };
            tablet_stations: {
                Row: {
                    id: string;
                    event_id: string;
                    game_type: string;
                    tablet_id: string;
                    status: string;
                    allocated_at: string;
                    last_activity: string | null;
                    current_user_id: string | null;
                };
                Insert: {
                    id?: string;
                    event_id: string;
                    game_type: string;
                    tablet_id: string;
                    status?: string;
                    allocated_at?: string;
                    last_activity?: string | null;
                    current_user_id?: string | null;
                };
                Update: {
                    id?: string;
                    event_id?: string;
                    game_type?: string;
                    tablet_id?: string;
                    status?: string;
                    allocated_at?: string;
                    last_activity?: string | null;
                    current_user_id?: string | null;
                };
            };
            event_participants: {
                Row: {
                    id: string;
                    event_id: string;
                    user_id: string;
                    joined_at: string;
                    left_at: string | null;
                    total_points: number;
                    games_played: number;
                    best_score: number;
                };
                Insert: {
                    id?: string;
                    event_id: string;
                    user_id: string;
                    joined_at?: string;
                    left_at?: string | null;
                    total_points?: number;
                    games_played?: number;
                    best_score?: number;
                };
                Update: {
                    id?: string;
                    event_id?: string;
                    user_id?: string;
                    joined_at?: string;
                    left_at?: string | null;
                    total_points?: number;
                    games_played?: number;
                    best_score?: number;
                };
            };
            rewards: {
                Row: {
                    id: string;
                    name: string;
                    description: string;
                    type: string;
                    points_required: number;
                    value: number;
                    currency: string;
                    category: string;
                    cafe_id: string | null;
                    event_id: string | null;
                    status: string;
                    start_date: string;
                    end_date: string | null;
                    max_redemptions: number;
                    current_redemptions: number;
                    created_at: string;
                    updated_at: string;
                    created_by: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    description: string;
                    type: string;
                    points_required: number;
                    value: number;
                    currency: string;
                    category: string;
                    cafe_id?: string | null;
                    event_id?: string | null;
                    status?: string;
                    start_date: string;
                    end_date?: string | null;
                    max_redemptions: number;
                    current_redemptions?: number;
                    created_at?: string;
                    updated_at?: string;
                    created_by: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    description?: string;
                    type?: string;
                    points_required?: number;
                    value?: number;
                    currency?: string;
                    category?: string;
                    cafe_id?: string | null;
                    event_id?: string | null;
                    status?: string;
                    start_date?: string;
                    end_date?: string | null;
                    max_redemptions?: number;
                    current_redemptions?: number;
                    created_at?: string;
                    updated_at?: string;
                    created_by?: string;
                };
            };
            reward_redemptions: {
                Row: {
                    id: string;
                    reward_id: string;
                    user_id: string;
                    points_spent: number;
                    status: string;
                    redeemed_at: string;
                    approved_at: string | null;
                    completed_at: string | null;
                    admin_notes: string | null;
                    cafe_id: string | null;
                };
                Insert: {
                    id?: string;
                    reward_id: string;
                    user_id: string;
                    points_spent: number;
                    status?: string;
                    redeemed_at?: string;
                    approved_at?: string | null;
                    completed_at?: string | null;
                    admin_notes?: string | null;
                    cafe_id?: string | null;
                };
                Update: {
                    id?: string;
                    reward_id?: string;
                    user_id?: string;
                    points_spent?: number;
                    status?: string;
                    redeemed_at?: string;
                    approved_at?: string | null;
                    completed_at?: string | null;
                    admin_notes?: string | null;
                    cafe_id?: string | null;
                };
            };
            payment_transactions: {
                Row: {
                    id: string;
                    user_id: string;
                    amount: number;
                    currency: string;
                    payment_method: string;
                    status: string;
                    transaction_id: string | null;
                    created_at: string;
                    updated_at: string;
                    description: string;
                    cafe_id: string | null;
                    event_id: string | null;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    amount: number;
                    currency: string;
                    payment_method: string;
                    status?: string;
                    transaction_id?: string | null;
                    created_at?: string;
                    updated_at?: string;
                    description: string;
                    cafe_id?: string | null;
                    event_id?: string | null;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    amount?: number;
                    currency?: string;
                    payment_method?: string;
                    status?: string;
                    transaction_id?: string | null;
                    created_at?: string;
                    updated_at?: string;
                    description?: string;
                    cafe_id?: string | null;
                    event_id?: string | null;
                };
            };
            leaderboards: {
                Row: {
                    id: string;
                    name: string;
                    type: string;
                    time_frame: string;
                    cafe_id: string | null;
                    event_id: string | null;
                    status: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    type: string;
                    time_frame: string;
                    cafe_id?: string | null;
                    event_id?: string | null;
                    status?: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    type?: string;
                    time_frame?: string;
                    cafe_id?: string | null;
                    event_id?: string | null;
                    status?: string;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            leaderboard_entries: {
                Row: {
                    id: string;
                    leaderboard_id: string;
                    user_id: string;
                    rank: number;
                    points: number;
                    games_played: number;
                    win_rate: number;
                    best_score: number;
                    streak: number;
                    last_game: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    leaderboard_id: string;
                    user_id: string;
                    rank: number;
                    points: number;
                    games_played: number;
                    win_rate: number;
                    best_score: number;
                    streak: number;
                    last_game: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    leaderboard_id?: string;
                    user_id?: string;
                    rank?: number;
                    points?: number;
                    games_played?: number;
                    win_rate?: number;
                    best_score?: number;
                    streak?: number;
                    last_game?: string;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            game_content: {
                Row: {
                    id: string;
                    game_type: string;
                    content: string;
                    difficulty: string;
                    category: string;
                    is_active: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    game_type: string;
                    content: string;
                    difficulty: string;
                    category: string;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    game_type?: string;
                    content?: string;
                    difficulty?: string;
                    category?: string;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            user_activity_log: {
                Row: {
                    id: string;
                    user_id: string;
                    action: string;
                    details: string | null;
                    ip_address: string | null;
                    user_agent: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    action: string;
                    details?: string | null;
                    ip_address?: string | null;
                    user_agent?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    action?: string;
                    details?: string | null;
                    ip_address?: string | null;
                    user_agent?: string | null;
                    created_at?: string;
                };
            };
            admin_activity_log: {
                Row: {
                    id: string;
                    admin_id: string;
                    action: string;
                    target_type: string;
                    target_id: string | null;
                    details: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    admin_id: string;
                    action: string;
                    target_type: string;
                    target_id?: string | null;
                    details?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    admin_id?: string;
                    action?: string;
                    target_type?: string;
                    target_id?: string | null;
                    details?: string | null;
                    created_at?: string;
                };
            };
            notifications: {
                Row: {
                    id: string;
                    user_id: string;
                    type: string;
                    title: string;
                    message: string;
                    is_read: boolean;
                    created_at: string;
                    read_at: string | null;
                    data: string | null;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    type: string;
                    title: string;
                    message: string;
                    is_read?: boolean;
                    created_at?: string;
                    read_at?: string | null;
                    data?: string | null;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    type?: string;
                    title?: string;
                    message?: string;
                    is_read?: boolean;
                    created_at?: string;
                    read_at?: string | null;
                    data?: string | null;
                };
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            [_ in never]: never;
        };
        Enums: {
            [_ in never]: never;
        };
    };
}

export default supabase;
