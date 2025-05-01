export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      account_security: {
        Row: {
          created_at: string | null
          data_consent: boolean | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          id: string
          two_factor_enabled: boolean | null
          updated_at: string | null
          user_id: string | null
          user_role: string | null
          username: string | null
        }
        Insert: {
          created_at?: string | null
          data_consent?: boolean | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          id?: string
          two_factor_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string | null
          user_role?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string | null
          data_consent?: boolean | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          id?: string
          two_factor_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string | null
          user_role?: string | null
          username?: string | null
        }
        Relationships: []
      }
      health_metrics: {
        Row: {
          blood_pressure: string | null
          bmi: string | null
          created_at: string | null
          exercise_routine: string | null
          glucose_levels: string | null
          heart_rate: string | null
          height: string | null
          id: string
          oxygen_saturation: string | null
          sleep_patterns: string | null
          updated_at: string | null
          user_id: string | null
          weight: string | null
        }
        Insert: {
          blood_pressure?: string | null
          bmi?: string | null
          created_at?: string | null
          exercise_routine?: string | null
          glucose_levels?: string | null
          heart_rate?: string | null
          height?: string | null
          id?: string
          oxygen_saturation?: string | null
          sleep_patterns?: string | null
          updated_at?: string | null
          user_id?: string | null
          weight?: string | null
        }
        Update: {
          blood_pressure?: string | null
          bmi?: string | null
          created_at?: string | null
          exercise_routine?: string | null
          glucose_levels?: string | null
          heart_rate?: string | null
          height?: string | null
          id?: string
          oxygen_saturation?: string | null
          sleep_patterns?: string | null
          updated_at?: string | null
          user_id?: string | null
          weight?: string | null
        }
        Relationships: []
      }
      health_records: {
        Row: {
          appointment_history: Json | null
          created_at: string | null
          hospital_visits: Json | null
          id: string
          insurance_coverage: string | null
          insurance_policy_number: string | null
          insurance_provider: string | null
          medical_reports: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          appointment_history?: Json | null
          created_at?: string | null
          hospital_visits?: Json | null
          id?: string
          insurance_coverage?: string | null
          insurance_policy_number?: string | null
          insurance_provider?: string | null
          medical_reports?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          appointment_history?: Json | null
          created_at?: string | null
          hospital_visits?: Json | null
          id?: string
          insurance_coverage?: string | null
          insurance_policy_number?: string | null
          insurance_provider?: string | null
          medical_reports?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      medical_info: {
        Row: {
          blood_group: string | null
          chronic_conditions: string | null
          created_at: string | null
          current_medications: string | null
          family_medical_history: string | null
          id: string
          known_allergies: string | null
          past_surgeries: string | null
          updated_at: string | null
          user_id: string | null
          vaccination_records: string | null
        }
        Insert: {
          blood_group?: string | null
          chronic_conditions?: string | null
          created_at?: string | null
          current_medications?: string | null
          family_medical_history?: string | null
          id?: string
          known_allergies?: string | null
          past_surgeries?: string | null
          updated_at?: string | null
          user_id?: string | null
          vaccination_records?: string | null
        }
        Update: {
          blood_group?: string | null
          chronic_conditions?: string | null
          created_at?: string | null
          current_medications?: string | null
          family_medical_history?: string | null
          id?: string
          known_allergies?: string | null
          past_surgeries?: string | null
          updated_at?: string | null
          user_id?: string | null
          vaccination_records?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          chat_history: Json | null
          created_at: string
          date_of_birth: string | null
          email: string | null
          frequent_symptoms: Json | null
          gender: string | null
          health_goals: Json | null
          id: string
          mood_tracking: Json | null
          name: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          chat_history?: Json | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          frequent_symptoms?: Json | null
          gender?: string | null
          health_goals?: Json | null
          id: string
          mood_tracking?: Json | null
          name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          chat_history?: Json | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          frequent_symptoms?: Json | null
          gender?: string | null
          health_goals?: Json | null
          id?: string
          mood_tracking?: Json | null
          name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reminders_preferences: {
        Row: {
          appointment_reminders: boolean | null
          created_at: string | null
          email_notifications: boolean | null
          id: string
          language_preference: string | null
          medication_reminders: boolean | null
          preferred_chat_time: string | null
          push_notifications: boolean | null
          sms_notifications: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          appointment_reminders?: boolean | null
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          language_preference?: string | null
          medication_reminders?: boolean | null
          preferred_chat_time?: string | null
          push_notifications?: boolean | null
          sms_notifications?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          appointment_reminders?: boolean | null
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          language_preference?: string | null
          medication_reminders?: boolean | null
          preferred_chat_time?: string | null
          push_notifications?: boolean | null
          sms_notifications?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
