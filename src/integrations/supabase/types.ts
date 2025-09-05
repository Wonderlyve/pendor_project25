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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      app_versions: {
        Row: {
          apk_url: string
          created_at: string
          id: string
          is_active: boolean
          release_notes: string | null
          updated_at: string
          version_code: number
          version_name: string
        }
        Insert: {
          apk_url: string
          created_at?: string
          id?: string
          is_active?: boolean
          release_notes?: string | null
          updated_at?: string
          version_code: number
          version_name: string
        }
        Update: {
          apk_url?: string
          created_at?: string
          id?: string
          is_active?: boolean
          release_notes?: string | null
          updated_at?: string
          version_code?: number
          version_name?: string
        }
        Relationships: []
      }
      blocked_users: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
          id: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
          id?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blocked_users_blocked_id_fkey"
            columns: ["blocked_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "blocked_users_blocker_id_fkey"
            columns: ["blocker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      channel_messages: {
        Row: {
          channel_id: string
          content: string
          created_at: string
          id: string
          media_filename: string | null
          media_type: string | null
          media_url: string | null
          reply_to_content: string | null
          reply_to_id: string | null
          reply_to_media_type: string | null
          reply_to_username: string | null
          user_id: string
        }
        Insert: {
          channel_id: string
          content: string
          created_at?: string
          id?: string
          media_filename?: string | null
          media_type?: string | null
          media_url?: string | null
          reply_to_content?: string | null
          reply_to_id?: string | null
          reply_to_media_type?: string | null
          reply_to_username?: string | null
          user_id: string
        }
        Update: {
          channel_id?: string
          content?: string
          created_at?: string
          id?: string
          media_filename?: string | null
          media_type?: string | null
          media_url?: string | null
          reply_to_content?: string | null
          reply_to_id?: string | null
          reply_to_media_type?: string | null
          reply_to_username?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "channel_messages_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
        ]
      }
      channel_subscriptions: {
        Row: {
          channel_id: string
          expires_at: string | null
          id: string
          is_active: boolean
          subscribed_at: string
          user_id: string
        }
        Insert: {
          channel_id: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          subscribed_at?: string
          user_id: string
        }
        Update: {
          channel_id?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          subscribed_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "channel_subscriptions_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
        ]
      }
      channels: {
        Row: {
          created_at: string
          creator_id: string
          currency: string
          description: string | null
          id: string
          image_url: string | null
          is_private: boolean
          name: string
          price: number
          share_code: string | null
          subscription_code: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          currency?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_private?: boolean
          name: string
          price?: number
          share_code?: string | null
          subscription_code?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          currency?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_private?: boolean
          name?: string
          price?: number
          share_code?: string | null
          subscription_code?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      comment_likes: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          likes: number
          parent_id: string | null
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          likes?: number
          parent_id?: string | null
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          likes?: number
          parent_id?: string | null
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      debriefing_comment_likes: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      debriefing_comments: {
        Row: {
          content: string
          created_at: string
          debriefing_id: string
          id: string
          likes: number
          parent_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          debriefing_id: string
          id?: string
          likes?: number
          parent_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          debriefing_id?: string
          id?: string
          likes?: number
          parent_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      debriefing_likes: {
        Row: {
          created_at: string
          debriefing_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          debriefing_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          debriefing_id?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      debriefing_views: {
        Row: {
          created_at: string
          debriefing_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          debriefing_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          debriefing_id?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      debriefings: {
        Row: {
          channel_id: string | null
          comments: number
          created_at: string
          creator_id: string
          description: string
          id: string
          is_public: boolean | null
          likes: number
          post_link: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_url: string | null
          views: number
        }
        Insert: {
          channel_id?: string | null
          comments?: number
          created_at?: string
          creator_id: string
          description: string
          id?: string
          is_public?: boolean | null
          likes?: number
          post_link?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_url?: string | null
          views?: number
        }
        Update: {
          channel_id?: string | null
          comments?: number
          created_at?: string
          creator_id?: string
          description?: string
          id?: string
          is_public?: boolean | null
          likes?: number
          post_link?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_url?: string | null
          views?: number
        }
        Relationships: []
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      hidden_posts: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hidden_posts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hidden_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      message_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          message_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          message_id?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          channel_id: string | null
          content: string
          created_at: string
          from_user_id: string | null
          id: string
          post_id: string | null
          read: boolean
          type: string
          user_id: string
        }
        Insert: {
          channel_id?: string | null
          content: string
          created_at?: string
          from_user_id?: string | null
          id?: string
          post_id?: string | null
          read?: boolean
          type: string
          user_id: string
        }
        Update: {
          channel_id?: string | null
          content?: string
          created_at?: string
          from_user_id?: string | null
          id?: string
          post_id?: string | null
          read?: boolean
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
        ]
      }
      post_boosts: {
        Row: {
          boost_type: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          boost_type?: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          boost_type?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_boosts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      post_reports: {
        Row: {
          created_at: string
          description: string | null
          id: string
          post_id: string
          reason: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          post_id: string
          reason: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          post_id?: string
          reason?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_reports_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_scores: {
        Row: {
          author_reliability_score: number
          content_quality_score: number
          created_at: string
          engagement_score: number
          freshness_score: number
          id: string
          post_id: string
          report_penalty: number
          updated_at: string
          visibility_score: number
        }
        Insert: {
          author_reliability_score?: number
          content_quality_score?: number
          created_at?: string
          engagement_score?: number
          freshness_score?: number
          id?: string
          post_id: string
          report_penalty?: number
          updated_at?: string
          visibility_score?: number
        }
        Update: {
          author_reliability_score?: number
          content_quality_score?: number
          created_at?: string
          engagement_score?: number
          freshness_score?: number
          id?: string
          post_id?: string
          report_penalty?: number
          updated_at?: string
          visibility_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "post_scores_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: true
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_views: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          analysis: string | null
          bet_type: string | null
          comments: number | null
          confidence: number | null
          content: string
          created_at: string
          custom_username: string | null
          id: string
          image_url: string | null
          likes: number | null
          match_teams: string | null
          match_time: string | null
          odds: number | null
          post_type: string | null
          prediction_text: string | null
          reservation_code: string | null
          shares: number | null
          sport: string | null
          updated_at: string
          user_id: string
          video_url: string | null
          views: number
        }
        Insert: {
          analysis?: string | null
          bet_type?: string | null
          comments?: number | null
          confidence?: number | null
          content: string
          created_at?: string
          custom_username?: string | null
          id?: string
          image_url?: string | null
          likes?: number | null
          match_teams?: string | null
          match_time?: string | null
          odds?: number | null
          post_type?: string | null
          prediction_text?: string | null
          reservation_code?: string | null
          shares?: number | null
          sport?: string | null
          updated_at?: string
          user_id: string
          video_url?: string | null
          views?: number
        }
        Update: {
          analysis?: string | null
          bet_type?: string | null
          comments?: number | null
          confidence?: number | null
          content?: string
          created_at?: string
          custom_username?: string | null
          id?: string
          image_url?: string | null
          likes?: number | null
          match_teams?: string | null
          match_time?: string | null
          odds?: number | null
          post_type?: string | null
          prediction_text?: string | null
          reservation_code?: string | null
          shares?: number | null
          sport?: string | null
          updated_at?: string
          user_id?: string
          video_url?: string | null
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          badge: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          badge?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          badge?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      saved_posts: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: []
      }
      stories: {
        Row: {
          comments: number
          content: string | null
          created_at: string
          duration: number | null
          expires_at: string
          id: string
          likes: number
          location: string | null
          media_type: string | null
          media_url: string | null
          updated_at: string
          user_id: string
          views: number
        }
        Insert: {
          comments?: number
          content?: string | null
          created_at?: string
          duration?: number | null
          expires_at?: string
          id?: string
          likes?: number
          location?: string | null
          media_type?: string | null
          media_url?: string | null
          updated_at?: string
          user_id: string
          views?: number
        }
        Update: {
          comments?: number
          content?: string | null
          created_at?: string
          duration?: number | null
          expires_at?: string
          id?: string
          likes?: number
          location?: string | null
          media_type?: string | null
          media_url?: string | null
          updated_at?: string
          user_id?: string
          views?: number
        }
        Relationships: []
      }
      story_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          story_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          story_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          story_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      story_likes: {
        Row: {
          created_at: string
          id: string
          story_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          story_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          story_id?: string
          user_id?: string
        }
        Relationships: []
      }
      story_views: {
        Row: {
          created_at: string
          id: string
          story_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          story_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          story_id?: string
          user_id?: string
        }
        Relationships: []
      }
      update_posts: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          update_url: string
          updated_at: string
          user_id: string
          version_name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          update_url: string
          updated_at?: string
          user_id: string
          version_name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          update_url?: string
          updated_at?: string
          user_id?: string
          version_name?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string
          favorite_bet_types: string[] | null
          favorite_sports: string[] | null
          feed_preferences: Json | null
          id: string
          notification_settings: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          favorite_bet_types?: string[] | null
          favorite_sports?: string[] | null
          feed_preferences?: Json | null
          id?: string
          notification_settings?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          favorite_bet_types?: string[] | null
          favorite_sports?: string[] | null
          feed_preferences?: Json | null
          id?: string
          notification_settings?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vip_prono_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          prono_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          prono_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          prono_id?: string
          user_id?: string
        }
        Relationships: []
      }
      vip_pronos: {
        Row: {
          channel_id: string
          created_at: string
          creator_id: string
          description: string
          id: string
          image_url: string | null
          prediction_text: string
          total_odds: number
          updated_at: string
        }
        Insert: {
          channel_id: string
          created_at?: string
          creator_id: string
          description: string
          id?: string
          image_url?: string | null
          prediction_text: string
          total_odds: number
          updated_at?: string
        }
        Update: {
          channel_id?: string
          created_at?: string
          creator_id?: string
          description?: string
          id?: string
          image_url?: string | null
          prediction_text?: string
          total_odds?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vip_pronos_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_share_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_follower_count: {
        Args: { user_id: string }
        Returns: number
      }
      get_following_count: {
        Args: { user_id: string }
        Returns: number
      }
      is_following: {
        Args: { follower_id: string; following_id: string }
        Returns: boolean
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
