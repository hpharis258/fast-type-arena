export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          badge_color: string
          category: string
          created_at: string
          description: string
          icon: string
          id: string
          name: string
          requirement_type: string
          requirement_value: number
        }
        Insert: {
          badge_color?: string
          category?: string
          created_at?: string
          description: string
          icon?: string
          id?: string
          name: string
          requirement_type: string
          requirement_value: number
        }
        Update: {
          badge_color?: string
          category?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          name?: string
          requirement_type?: string
          requirement_value?: number
        }
        Relationships: []
      }
      car_colors: {
        Row: {
          created_at: string | null
          hex_color: string
          id: string
          name: string
          price: number
        }
        Insert: {
          created_at?: string | null
          hex_color: string
          id?: string
          name: string
          price?: number
        }
        Update: {
          created_at?: string | null
          hex_color?: string
          id?: string
          name?: string
          price?: number
        }
        Relationships: []
      }
      car_upgrades: {
        Row: {
          created_at: string | null
          description: string
          effect_type: string
          icon: string | null
          id: string
          name: string
          price: number
        }
        Insert: {
          created_at?: string | null
          description: string
          effect_type: string
          icon?: string | null
          id?: string
          name: string
          price?: number
        }
        Update: {
          created_at?: string | null
          description?: string
          effect_type?: string
          icon?: string | null
          id?: string
          name?: string
          price?: number
        }
        Relationships: []
      }
      duel_progress: {
        Row: {
          accuracy: number
          duel_id: string
          finished: boolean
          id: string
          progress: number
          updated_at: string
          user_id: string
          wpm: number
        }
        Insert: {
          accuracy?: number
          duel_id: string
          finished?: boolean
          id?: string
          progress?: number
          updated_at?: string
          user_id: string
          wpm?: number
        }
        Update: {
          accuracy?: number
          duel_id?: string
          finished?: boolean
          id?: string
          progress?: number
          updated_at?: string
          user_id?: string
          wpm?: number
        }
        Relationships: [
          {
            foreignKeyName: "duel_progress_duel_id_fkey"
            columns: ["duel_id"]
            isOneToOne: false
            referencedRelation: "duels"
            referencedColumns: ["id"]
          },
        ]
      }
      duels: {
        Row: {
          coin_wager: number
          created_at: string
          finished_at: string | null
          id: string
          player1_id: string
          player2_id: string
          started_at: string | null
          status: string
          winner_id: string | null
        }
        Insert: {
          coin_wager?: number
          created_at?: string
          finished_at?: string | null
          id?: string
          player1_id: string
          player2_id: string
          started_at?: string | null
          status?: string
          winner_id?: string | null
        }
        Update: {
          coin_wager?: number
          created_at?: string
          finished_at?: string | null
          id?: string
          player1_id?: string
          player2_id?: string
          started_at?: string | null
          status?: string
          winner_id?: string | null
        }
        Relationships: []
      }
      friends: {
        Row: {
          created_at: string
          friend_id: string
          id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          friend_id: string
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          friend_id?: string
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      owned_colors: {
        Row: {
          color_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          color_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          color_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "owned_colors_color_id_fkey"
            columns: ["color_id"]
            isOneToOne: false
            referencedRelation: "car_colors"
            referencedColumns: ["id"]
          },
        ]
      }
      owned_upgrades: {
        Row: {
          created_at: string | null
          id: string
          upgrade_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          upgrade_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          upgrade_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "owned_upgrades_upgrade_id_fkey"
            columns: ["upgrade_id"]
            isOneToOne: false
            referencedRelation: "car_upgrades"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          car_color: string | null
          car_upgrades: string[] | null
          created_at: string
          display_name: string | null
          id: string
          owned_icons: string[] | null
          player_icon: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          car_color?: string | null
          car_upgrades?: string[] | null
          created_at?: string
          display_name?: string | null
          id?: string
          owned_icons?: string[] | null
          player_icon?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          car_color?: string | null
          car_upgrades?: string[] | null
          created_at?: string
          display_name?: string | null
          id?: string
          owned_icons?: string[] | null
          player_icon?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scores: {
        Row: {
          accuracy: number
          correct_chars: number
          created_at: string
          duration: number
          id: string
          incorrect_chars: number
          total_chars: number
          user_id: string
          wpm: number
        }
        Insert: {
          accuracy: number
          correct_chars: number
          created_at?: string
          duration?: number
          id?: string
          incorrect_chars: number
          total_chars: number
          user_id: string
          wpm: number
        }
        Update: {
          accuracy?: number
          correct_chars?: number
          created_at?: string
          duration?: number
          id?: string
          incorrect_chars?: number
          total_chars?: number
          user_id?: string
          wpm?: number
        }
        Relationships: [
          {
            foreignKeyName: "scores_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_wallets: {
        Row: {
          coins: number
          created_at: string
          current_streak: number
          id: string
          last_play_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          coins?: number
          created_at?: string
          current_streak?: number
          id?: string
          last_play_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          coins?: number
          created_at?: string
          current_streak?: number
          id?: string
          last_play_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_view_profile: {
        Args: { _profile_user_id: string; _viewer_id: string }
        Returns: boolean
      }
      get_best_scores_per_user: {
        Args: {
          filter_duration_param?: number
          page_limit?: number
          page_offset?: number
          search_query_param?: string
          sort_by_param?: string
          sort_order_param?: string
        }
        Returns: {
          accuracy: number
          correct_chars: number
          created_at: string
          display_name: string
          duration: number
          id: string
          incorrect_chars: number
          total_chars: number
          total_count: number
          user_id: string
          wpm: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
