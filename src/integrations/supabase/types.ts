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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      organizations: {
        Row: {
          brand_name: string | null
          created_at: string | null
          id: string
          logo_url: string | null
          name: string
          primary_color: string | null
          schema_name: string
          secondary_color: string | null
          updated_at: string | null
        }
        Insert: {
          brand_name?: string | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name: string
          primary_color?: string | null
          schema_name: string
          secondary_color?: string | null
          updated_at?: string | null
        }
        Update: {
          brand_name?: string | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          primary_color?: string | null
          schema_name?: string
          secondary_color?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          email: string | null
          id: string
          organization_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          organization_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          organization_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          organization_id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          organization_id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_activities_to_org_schema: {
        Args: { _schema_name: string }
        Returns: undefined
      }
      add_interviews_to_org_schema: {
        Args: { _schema_name: string }
        Returns: undefined
      }
      add_notes_to_org_schema: {
        Args: { _schema_name: string }
        Returns: undefined
      }
      create_org_interview: {
        Args: {
          _application_id: string
          _duration_minutes: number
          _interview_type: string
          _location?: string
          _meeting_link?: string
          _scheduled_at: string
          _user_id: string
        }
        Returns: string
      }
      create_org_note: {
        Args: { _candidate_id: string; _content: string; _user_id: string }
        Returns: string
      }
      create_organization_schema: {
        Args: { _org_id: string; _schema_name: string }
        Returns: undefined
      }
      delete_org_job: {
        Args: { _job_id: string; _user_id: string }
        Returns: undefined
      }
      get_org_activities: {
        Args: { _candidate_id?: string; _job_id?: string; _user_id: string }
        Returns: {
          activity_type: string
          candidate_id: string
          created_at: string
          description: string
          id: string
          job_id: string
          metadata: Json
          user_id: string
        }[]
      }
      get_org_applications: {
        Args: { _candidate_id?: string; _job_id?: string; _user_id: string }
        Returns: {
          applied_at: string
          candidate_id: string
          id: string
          job_id: string
          notes: string
          stage: string
          status: string
          updated_at: string
        }[]
      }
      get_org_candidate: {
        Args: { _candidate_id: string; _user_id: string }
        Returns: {
          created_at: string
          current_company: string
          current_position: string
          email: string
          experience_years: number
          full_name: string
          id: string
          linkedin_url: string
          phone: string
          resume_url: string
          skills: string[]
          stage: string
          status: string
          updated_at: string
        }[]
      }
      get_org_candidates: {
        Args: { _user_id: string }
        Returns: {
          created_at: string
          current_company: string
          current_position: string
          email: string
          experience_years: number
          full_name: string
          id: string
          linkedin_url: string
          phone: string
          resume_url: string
          skills: string[]
          stage: string
          status: string
          updated_at: string
        }[]
      }
      get_org_interviews: {
        Args: { _application_id?: string; _user_id: string }
        Returns: {
          application_id: string
          created_at: string
          duration_minutes: number
          id: string
          interview_type: string
          interviewer_notes: string
          location: string
          meeting_link: string
          scheduled_at: string
          status: string
          updated_at: string
        }[]
      }
      get_org_job: {
        Args: { _job_id: string; _user_id: string }
        Returns: {
          created_at: string
          created_by: string
          department: string
          description: string
          employment_type: string
          id: string
          location: string
          requirements: string
          status: string
          title: string
          updated_at: string
        }[]
      }
      get_org_jobs: {
        Args: { _user_id: string }
        Returns: {
          created_at: string
          created_by: string
          department: string
          description: string
          employment_type: string
          id: string
          location: string
          requirements: string
          status: string
          title: string
          updated_at: string
        }[]
      }
      get_org_notes: {
        Args: { _candidate_id: string; _user_id: string }
        Returns: {
          author_id: string
          candidate_id: string
          content: string
          created_at: string
          id: string
          updated_at: string
        }[]
      }
      get_user_org_schema: {
        Args: { _user_id: string }
        Returns: string
      }
      get_user_organization_id: {
        Args: { user_uuid: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      insert_organization_job: {
        Args: {
          _department: string
          _description: string
          _employment_type: string
          _location: string
          _requirements: string
          _title: string
        }
        Returns: string
      }
      log_org_activity: {
        Args: {
          _activity_type: string
          _candidate_id?: string
          _description: string
          _job_id?: string
          _metadata?: Json
          _user_id: string
        }
        Returns: string
      }
      update_org_application_stage: {
        Args: { _application_id: string; _new_stage: string; _user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role:
        | "owner"
        | "admin"
        | "recruiter"
        | "hiring_manager"
        | "viewer"
        | "super_admin"
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
    Enums: {
      app_role: [
        "owner",
        "admin",
        "recruiter",
        "hiring_manager",
        "viewer",
        "super_admin",
      ],
    },
  },
} as const
