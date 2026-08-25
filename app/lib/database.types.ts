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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      chipma_admin_settings: {
        Row: {
          analytics_lookback_days: number
          default_country_code: string
          id: string
          order_notification_email: string
          support_email: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          analytics_lookback_days?: number
          default_country_code?: string
          id?: string
          order_notification_email?: string
          support_email?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          analytics_lookback_days?: number
          default_country_code?: string
          id?: string
          order_notification_email?: string
          support_email?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      chipma_inquiries: {
        Row: {
          company: string | null
          configuration: Json
          consent_at: string
          created_at: string
          email: string
          id: string
          message: string | null
          name: string
          origin: string | null
          pricing_version: string
          quoted_total_cents: number
          source_hash: string
          status: string
          user_agent: string | null
        }
        Insert: {
          company?: string | null
          configuration: Json
          consent_at: string
          created_at?: string
          email: string
          id?: string
          message?: string | null
          name: string
          origin?: string | null
          pricing_version: string
          quoted_total_cents: number
          source_hash: string
          status?: string
          user_agent?: string | null
        }
        Update: {
          company?: string | null
          configuration?: Json
          consent_at?: string
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          name?: string
          origin?: string | null
          pricing_version?: string
          quoted_total_cents?: number
          source_hash?: string
          status?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      chipma_orders: {
        Row: {
          billing_city: string
          billing_company: string | null
          billing_country_code: string
          billing_postal_code: string
          billing_street: string
          configuration: Json
          consent_at: string
          created_at: string
          customer_name: string
          email: string
          id: string
          message: string | null
          order_number: number
          origin: string | null
          phone: string | null
          pricing_version: string
          quoted_total_cents: number
          source_hash: string
          status: string
          updated_at: string
          user_agent: string | null
          user_id: string | null
          vat_id: string | null
        }
        Insert: {
          billing_city: string
          billing_company?: string | null
          billing_country_code?: string
          billing_postal_code: string
          billing_street: string
          configuration: Json
          consent_at: string
          created_at?: string
          customer_name: string
          email: string
          id?: string
          message?: string | null
          order_number?: never
          origin?: string | null
          phone?: string | null
          pricing_version: string
          quoted_total_cents: number
          source_hash: string
          status?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
          vat_id?: string | null
        }
        Update: {
          billing_city?: string
          billing_company?: string | null
          billing_country_code?: string
          billing_postal_code?: string
          billing_street?: string
          configuration?: Json
          consent_at?: string
          created_at?: string
          customer_name?: string
          email?: string
          id?: string
          message?: string | null
          order_number?: never
          origin?: string | null
          phone?: string | null
          pricing_version?: string
          quoted_total_cents?: number
          source_hash?: string
          status?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
          vat_id?: string | null
        }
        Relationships: []
      }
      chipma_profiles: {
        Row: {
          billing_city: string | null
          billing_country_code: string
          billing_postal_code: string | null
          billing_street: string | null
          company: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          vat_id: string | null
        }
        Insert: {
          billing_city?: string | null
          billing_country_code?: string
          billing_postal_code?: string | null
          billing_street?: string | null
          company?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
          vat_id?: string | null
        }
        Update: {
          billing_city?: string | null
          billing_country_code?: string
          billing_postal_code?: string | null
          billing_street?: string | null
          company?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          vat_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_my_chipma_orders: { Args: never; Returns: number }
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
