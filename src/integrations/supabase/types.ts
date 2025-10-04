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
      organization_features: {
        Row: {
          created_at: string | null
          custom_limit: number | null
          enabled_by: string | null
          feature_key: string
          id: string
          is_enabled: boolean | null
          notes: string | null
          organization_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          custom_limit?: number | null
          enabled_by?: string | null
          feature_key: string
          id?: string
          is_enabled?: boolean | null
          notes?: string | null
          organization_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          custom_limit?: number | null
          enabled_by?: string | null
          feature_key?: string
          id?: string
          is_enabled?: boolean | null
          notes?: string | null
          organization_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_features_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_subscriptions: {
        Row: {
          cancelled_at: string | null
          created_at: string | null
          current_period_end: string
          current_period_start: string
          id: string
          organization_id: string
          plan_id: string
          status: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at: string | null
          updated_at: string | null
        }
        Insert: {
          cancelled_at?: string | null
          created_at?: string | null
          current_period_end?: string
          current_period_start?: string
          id?: string
          organization_id: string
          plan_id: string
          status?: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Update: {
          cancelled_at?: string | null
          created_at?: string | null
          current_period_end?: string
          current_period_start?: string
          id?: string
          organization_id?: string
          plan_id?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_usage_summary: {
        Row: {
          ai_tokens_remaining: number | null
          email_credits_remaining: number | null
          id: string
          last_updated: string | null
          organization_id: string
          period_end: string
          period_start: string
          storage_bytes_remaining: number | null
          total_ai_tokens: number | null
          total_email_credits: number | null
          total_storage_bytes: number | null
        }
        Insert: {
          ai_tokens_remaining?: number | null
          email_credits_remaining?: number | null
          id?: string
          last_updated?: string | null
          organization_id: string
          period_end: string
          period_start: string
          storage_bytes_remaining?: number | null
          total_ai_tokens?: number | null
          total_email_credits?: number | null
          total_storage_bytes?: number | null
        }
        Update: {
          ai_tokens_remaining?: number | null
          email_credits_remaining?: number | null
          id?: string
          last_updated?: string | null
          organization_id?: string
          period_end?: string
          period_start?: string
          storage_bytes_remaining?: number | null
          total_ai_tokens?: number | null
          total_email_credits?: number | null
          total_storage_bytes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_usage_summary_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          billing_email: string | null
          brand_name: string | null
          careers_banner_url: string | null
          careers_tagline: string | null
          company_description: string | null
          created_at: string | null
          current_subscription_id: string | null
          custom_css: string | null
          custom_domain: string | null
          custom_footer_code: string | null
          custom_header_code: string | null
          domain_verified: boolean | null
          id: string
          logo_url: string | null
          name: string
          payment_method_id: string | null
          primary_color: string | null
          schema_name: string
          secondary_color: string | null
          show_location: boolean | null
          show_team_size: boolean | null
          social_links: Json | null
          subdomain: string | null
          updated_at: string | null
        }
        Insert: {
          billing_email?: string | null
          brand_name?: string | null
          careers_banner_url?: string | null
          careers_tagline?: string | null
          company_description?: string | null
          created_at?: string | null
          current_subscription_id?: string | null
          custom_css?: string | null
          custom_domain?: string | null
          custom_footer_code?: string | null
          custom_header_code?: string | null
          domain_verified?: boolean | null
          id?: string
          logo_url?: string | null
          name: string
          payment_method_id?: string | null
          primary_color?: string | null
          schema_name: string
          secondary_color?: string | null
          show_location?: boolean | null
          show_team_size?: boolean | null
          social_links?: Json | null
          subdomain?: string | null
          updated_at?: string | null
        }
        Update: {
          billing_email?: string | null
          brand_name?: string | null
          careers_banner_url?: string | null
          careers_tagline?: string | null
          company_description?: string | null
          created_at?: string | null
          current_subscription_id?: string | null
          custom_css?: string | null
          custom_domain?: string | null
          custom_footer_code?: string | null
          custom_header_code?: string | null
          domain_verified?: boolean | null
          id?: string
          logo_url?: string | null
          name?: string
          payment_method_id?: string | null
          primary_color?: string | null
          schema_name?: string
          secondary_color?: string | null
          show_location?: boolean | null
          show_team_size?: boolean | null
          social_links?: Json | null
          subdomain?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_current_subscription_id_fkey"
            columns: ["current_subscription_id"]
            isOneToOne: false
            referencedRelation: "organization_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          action: string
          created_at: string | null
          description: string | null
          id: string
          resource: string
        }
        Insert: {
          action: string
          created_at?: string | null
          description?: string | null
          id?: string
          resource: string
        }
        Update: {
          action?: string
          created_at?: string | null
          description?: string | null
          id?: string
          resource?: string
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          created_at: string | null
          custom_css: string | null
          custom_footer_code: string | null
          custom_header_code: string | null
          favicon_url: string | null
          id: string
          login_page_subtitle: string | null
          login_page_title: string | null
          platform_logo_url: string | null
          platform_name: string | null
          primary_color: string | null
          secondary_color: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          custom_css?: string | null
          custom_footer_code?: string | null
          custom_header_code?: string | null
          favicon_url?: string | null
          id?: string
          login_page_subtitle?: string | null
          login_page_title?: string | null
          platform_logo_url?: string | null
          platform_name?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          custom_css?: string | null
          custom_footer_code?: string | null
          custom_header_code?: string | null
          favicon_url?: string | null
          id?: string
          login_page_subtitle?: string | null
          login_page_title?: string | null
          platform_logo_url?: string | null
          platform_name?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string | null
          updated_by?: string | null
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
      role_permissions: {
        Row: {
          created_at: string | null
          id: string
          permission_id: string | null
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string | null
          id?: string
          permission_id?: string | null
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string | null
          id?: string
          permission_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      sso_configurations: {
        Row: {
          auto_provision: boolean | null
          certificate: string | null
          client_id: string | null
          client_secret: string | null
          configured_by: string | null
          created_at: string | null
          default_role: string | null
          force_sso: boolean | null
          id: string
          is_enabled: boolean | null
          issuer_url: string | null
          metadata_xml: string | null
          organization_id: string | null
          provider: string
          sso_url: string | null
          updated_at: string | null
        }
        Insert: {
          auto_provision?: boolean | null
          certificate?: string | null
          client_id?: string | null
          client_secret?: string | null
          configured_by?: string | null
          created_at?: string | null
          default_role?: string | null
          force_sso?: boolean | null
          id?: string
          is_enabled?: boolean | null
          issuer_url?: string | null
          metadata_xml?: string | null
          organization_id?: string | null
          provider: string
          sso_url?: string | null
          updated_at?: string | null
        }
        Update: {
          auto_provision?: boolean | null
          certificate?: string | null
          client_id?: string | null
          client_secret?: string | null
          configured_by?: string | null
          created_at?: string | null
          default_role?: string | null
          force_sso?: boolean | null
          id?: string
          is_enabled?: boolean | null
          issuer_url?: string | null
          metadata_xml?: string | null
          organization_id?: string | null
          provider?: string
          sso_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sso_configurations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      sso_sessions: {
        Row: {
          created_at: string | null
          expires_at: string | null
          external_id: string | null
          id: string
          organization_id: string | null
          provider: string
          session_token: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          external_id?: string | null
          id?: string
          organization_id?: string | null
          provider: string
          session_token?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          external_id?: string | null
          id?: string
          organization_id?: string | null
          provider?: string
          session_token?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sso_sessions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          ai_tokens_monthly: number
          candidates_limit: number
          created_at: string | null
          email_credits_monthly: number
          features: Json | null
          id: string
          is_active: boolean | null
          is_custom: boolean | null
          jobs_limit: number
          name: string
          organization_id: string | null
          price_monthly: number
          price_yearly: number
          storage_gb: number
          team_members_limit: number
          updated_at: string | null
        }
        Insert: {
          ai_tokens_monthly: number
          candidates_limit: number
          created_at?: string | null
          email_credits_monthly: number
          features?: Json | null
          id?: string
          is_active?: boolean | null
          is_custom?: boolean | null
          jobs_limit: number
          name: string
          organization_id?: string | null
          price_monthly: number
          price_yearly: number
          storage_gb: number
          team_members_limit: number
          updated_at?: string | null
        }
        Update: {
          ai_tokens_monthly?: number
          candidates_limit?: number
          created_at?: string | null
          email_credits_monthly?: number
          features?: Json | null
          id?: string
          is_active?: boolean | null
          is_custom?: boolean | null
          jobs_limit?: number
          name?: string
          organization_id?: string | null
          price_monthly?: number
          price_yearly?: number
          storage_gb?: number
          team_members_limit?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscription_plans_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_tracking: {
        Row: {
          bytes_used: number | null
          created_at: string | null
          credits_used: number | null
          id: string
          metadata: Json | null
          organization_id: string
          tokens_used: number | null
          usage_type: Database["public"]["Enums"]["usage_type"]
          user_id: string | null
        }
        Insert: {
          bytes_used?: number | null
          created_at?: string | null
          credits_used?: number | null
          id?: string
          metadata?: Json | null
          organization_id: string
          tokens_used?: number | null
          usage_type: Database["public"]["Enums"]["usage_type"]
          user_id?: string | null
        }
        Update: {
          bytes_used?: number | null
          created_at?: string | null
          credits_used?: number | null
          id?: string
          metadata?: Json | null
          organization_id?: string
          tokens_used?: number | null
          usage_type?: Database["public"]["Enums"]["usage_type"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_tracking_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_permission_overrides: {
        Row: {
          created_at: string | null
          granted_by: string | null
          id: string
          is_granted: boolean
          organization_id: string | null
          permission_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          granted_by?: string | null
          id?: string
          is_granted?: boolean
          organization_id?: string | null
          permission_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          granted_by?: string | null
          id?: string
          is_granted?: boolean
          organization_id?: string | null
          permission_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_permission_overrides_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_permission_overrides_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
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
      add_assignments_to_org_candidates: {
        Args: { _schema_name: string }
        Returns: undefined
      }
      add_comments_to_org_schema: {
        Args: { _schema_name: string }
        Returns: undefined
      }
      add_email_templates_to_org_schema: {
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
      add_notifications_to_org_schema: {
        Args: { _schema_name: string }
        Returns: undefined
      }
      add_offer_templates_to_org_schema: {
        Args: { _schema_name: string }
        Returns: undefined
      }
      add_onboarding_to_org_schema: {
        Args: { _schema_name: string }
        Returns: undefined
      }
      add_ratings_to_org_schema: {
        Args: { _schema_name: string }
        Returns: undefined
      }
      add_saved_searches_to_org_schema: {
        Args: { _schema_name: string }
        Returns: undefined
      }
      assign_candidate: {
        Args: { _assigned_to: string; _candidate_id: string; _user_id: string }
        Returns: undefined
      }
      assign_user_role: {
        Args: {
          _assigner_id: string
          _role: Database["public"]["Enums"]["app_role"]
          _target_user_id: string
        }
        Returns: undefined
      }
      check_usage_limit: {
        Args: {
          _amount: number
          _org_id: string
          _usage_type: Database["public"]["Enums"]["usage_type"]
        }
        Returns: Json
      }
      create_candidate_comment: {
        Args: {
          _candidate_id: string
          _content: string
          _is_internal?: boolean
          _user_id: string
        }
        Returns: string
      }
      create_candidate_rating: {
        Args: {
          _candidate_id: string
          _category: string
          _feedback?: string
          _rating: number
          _user_id: string
        }
        Returns: string
      }
      create_custom_plan: {
        Args: {
          _ai_tokens_monthly: number
          _candidates_limit: number
          _email_credits_monthly: number
          _features?: Json
          _jobs_limit: number
          _name: string
          _organization_id: string
          _price_monthly: number
          _price_yearly: number
          _storage_gb: number
          _team_members_limit: number
        }
        Returns: string
      }
      create_email_template: {
        Args: {
          _content: string
          _name: string
          _subject: string
          _template_type: string
          _user_id: string
          _variables?: string[]
        }
        Returns: string
      }
      create_notification: {
        Args: {
          _message: string
          _related_id?: string
          _related_type?: string
          _target_user_id: string
          _title: string
          _type: string
          _user_id: string
        }
        Returns: string
      }
      create_offer: {
        Args: {
          _application_id: string
          _benefits?: string[]
          _candidate_id: string
          _job_id: string
          _job_title: string
          _offer_letter_content: string
          _required_approval_levels?: number
          _salary_amount: number
          _salary_currency?: string
          _start_date: string
          _user_id: string
        }
        Returns: string
      }
      create_onboarding_process: {
        Args: {
          _assigned_buddy_id?: string
          _assigned_manager_id?: string
          _candidate_id: string
          _start_date: string
          _template_id: string
          _user_id: string
        }
        Returns: string
      }
      create_org_application: {
        Args: {
          _candidate_id: string
          _job_id: string
          _notes?: string
          _user_id: string
        }
        Returns: string
      }
      create_org_candidate: {
        Args: {
          _current_company?: string
          _current_position?: string
          _email: string
          _experience_years?: number
          _full_name: string
          _linkedin_url?: string
          _phone?: string
          _resume_url?: string
          _skills?: string[]
          _user_id: string
        }
        Returns: string
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
      create_saved_search: {
        Args: {
          _filters: Json
          _name: string
          _search_type?: string
          _user_id: string
        }
        Returns: string
      }
      delete_email_template: {
        Args: { _template_id: string; _user_id: string }
        Returns: undefined
      }
      delete_org_interview: {
        Args: { _interview_id: string; _user_id: string }
        Returns: undefined
      }
      delete_org_job: {
        Args: { _job_id: string; _user_id: string }
        Returns: undefined
      }
      delete_saved_search: {
        Args: { _search_id: string; _user_id: string }
        Returns: undefined
      }
      get_all_organizations: {
        Args: Record<PropertyKey, never>
        Returns: {
          brand_name: string
          created_at: string
          current_subscription_id: string
          custom_footer_code: string
          custom_header_code: string
          id: string
          logo_url: string
          name: string
          plan_name: string
          plan_price: number
          primary_color: string
          schema_name: string
          secondary_color: string
        }[]
      }
      get_available_plans: {
        Args: Record<PropertyKey, never>
        Returns: {
          ai_tokens_monthly: number
          candidates_limit: number
          created_at: string | null
          email_credits_monthly: number
          features: Json | null
          id: string
          is_active: boolean | null
          is_custom: boolean | null
          jobs_limit: number
          name: string
          organization_id: string | null
          price_monthly: number
          price_yearly: number
          storage_gb: number
          team_members_limit: number
          updated_at: string | null
        }[]
      }
      get_candidate_comments: {
        Args: { _candidate_id: string; _user_id: string }
        Returns: {
          author_id: string
          candidate_id: string
          content: string
          created_at: string
          id: string
          is_internal: boolean
          updated_at: string
        }[]
      }
      get_candidate_ratings: {
        Args: { _candidate_id: string; _user_id: string }
        Returns: {
          candidate_id: string
          category: string
          created_at: string
          feedback: string
          id: string
          rating: number
          reviewer_id: string
          updated_at: string
        }[]
      }
      get_offers: {
        Args: { _candidate_id?: string; _status?: string; _user_id: string }
        Returns: {
          accepted_at: string
          application_id: string
          approval_level: number
          benefits: string[]
          candidate_id: string
          created_at: string
          department: string
          expires_at: string
          id: string
          job_id: string
          job_title: string
          offer_letter_content: string
          required_approval_levels: number
          salary_amount: number
          salary_currency: string
          sent_at: string
          start_date: string
          status: string
        }[]
      }
      get_onboarding_documents: {
        Args: { _onboarding_id: string; _user_id: string }
        Returns: {
          created_at: string
          document_name: string
          document_type: string
          file_url: string
          id: string
          is_required: boolean
          onboarding_id: string
          review_notes: string
          reviewed_at: string
          reviewed_by: string
          status: string
          submitted_at: string
          updated_at: string
        }[]
      }
      get_onboarding_processes: {
        Args: { _candidate_id?: string; _user_id: string }
        Returns: {
          actual_end_date: string
          assigned_buddy_id: string
          assigned_manager_id: string
          candidate_id: string
          created_at: string
          created_by: string
          expected_end_date: string
          id: string
          notes: string
          progress_percentage: number
          start_date: string
          status: string
          template_id: string
          updated_at: string
        }[]
      }
      get_onboarding_tasks: {
        Args: { _onboarding_id: string; _user_id: string }
        Returns: {
          assigned_to: string
          completed_at: string
          created_at: string
          description: string
          due_date: string
          id: string
          is_required: boolean
          onboarding_id: string
          order_index: number
          status: string
          task_type: string
          template_id: string
          title: string
          updated_at: string
        }[]
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
          assigned_to: string
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
          assigned_to: string
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
      get_org_email_templates: {
        Args: { _user_id: string }
        Returns: {
          content: string
          created_at: string
          created_by: string
          id: string
          name: string
          subject: string
          template_type: string
          updated_at: string
          variables: string[]
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
      get_org_team_members: {
        Args: { _user_id: string }
        Returns: {
          avatar_url: string
          created_at: string
          display_name: string
          email: string
          roles: string[]
          user_id: string
        }[]
      }
      get_organization_by_subdomain: {
        Args: { _subdomain: string }
        Returns: {
          brand_name: string
          id: string
          logo_url: string
          name: string
          primary_color: string
          schema_name: string
          secondary_color: string
          subdomain: string
        }[]
      }
      get_organization_features: {
        Args: { _organization_id: string }
        Returns: {
          created_at: string
          custom_limit: number
          enabled_by: string
          feature_key: string
          id: string
          is_enabled: boolean
          notes: string
          organization_id: string
          updated_at: string
        }[]
      }
      get_organization_usage: {
        Args: { _org_id: string; _period_end?: string; _period_start?: string }
        Returns: {
          count: number
          total_bytes: number
          total_credits: number
          total_tokens: number
          usage_type: Database["public"]["Enums"]["usage_type"]
        }[]
      }
      get_platform_settings: {
        Args: Record<PropertyKey, never>
        Returns: {
          custom_css: string
          custom_footer_code: string
          custom_header_code: string
          favicon_url: string
          id: string
          login_page_subtitle: string
          login_page_title: string
          platform_logo_url: string
          platform_name: string
          primary_color: string
          secondary_color: string
          updated_at: string
        }[]
      }
      get_public_job: {
        Args: { _job_id: string }
        Returns: {
          brand_name: string
          careers_banner_url: string
          careers_tagline: string
          company_description: string
          created_at: string
          custom_css: string
          department: string
          description: string
          employment_type: string
          id: string
          location: string
          logo_url: string
          organization_id: string
          organization_name: string
          organization_schema: string
          primary_color: string
          requirements: string
          secondary_color: string
          show_location: boolean
          show_team_size: boolean
          social_links: Json
          status: string
          title: string
        }[]
      }
      get_public_jobs: {
        Args: { _org_schema?: string }
        Returns: {
          brand_name: string
          careers_banner_url: string
          careers_tagline: string
          company_description: string
          created_at: string
          custom_css: string
          department: string
          description: string
          employment_type: string
          id: string
          location: string
          logo_url: string
          organization_id: string
          organization_name: string
          primary_color: string
          requirements: string
          secondary_color: string
          show_location: boolean
          show_team_size: boolean
          social_links: Json
          status: string
          title: string
        }[]
      }
      get_saved_searches: {
        Args: { _search_type?: string; _user_id: string }
        Returns: {
          created_at: string
          filters: Json
          id: string
          name: string
          search_type: string
          updated_at: string
          user_id: string
        }[]
      }
      get_usage_summary: {
        Args: { _org_id: string }
        Returns: {
          ai_tokens_limit: number
          ai_tokens_remaining: number
          ai_tokens_used: number
          email_credits_limit: number
          email_credits_remaining: number
          email_credits_used: number
          period_end: string
          period_start: string
          storage_bytes_limit: number
          storage_bytes_remaining: number
          storage_bytes_used: number
        }[]
      }
      get_user_notifications: {
        Args: { _limit?: number; _unread_only?: boolean; _user_id: string }
        Returns: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          related_id: string
          related_type: string
          title: string
          type: string
          user_id: string
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
      get_user_permissions: {
        Args: { _user_id: string }
        Returns: {
          action: string
          description: string
          resource: string
          source: string
        }[]
      }
      has_permission: {
        Args: { _action: string; _resource: string; _user_id: string }
        Returns: boolean
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
      is_subdomain_available: {
        Args: { _subdomain: string }
        Returns: boolean
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
      mark_all_notifications_read: {
        Args: { _user_id: string }
        Returns: undefined
      }
      mark_notification_read: {
        Args: { _notification_id: string; _user_id: string }
        Returns: undefined
      }
      record_usage: {
        Args: {
          _bytes?: number
          _credits?: number
          _metadata?: Json
          _org_id: string
          _tokens?: number
          _usage_type: Database["public"]["Enums"]["usage_type"]
          _user_id: string
        }
        Returns: string
      }
      remove_org_member: {
        Args: { _remover_id: string; _target_user_id: string }
        Returns: undefined
      }
      remove_user_role: {
        Args: {
          _remover_id: string
          _role: Database["public"]["Enums"]["app_role"]
          _target_user_id: string
        }
        Returns: undefined
      }
      submit_public_application: {
        Args: {
          _cover_letter?: string
          _current_company?: string
          _current_position?: string
          _email: string
          _experience_years?: number
          _full_name: string
          _job_id: string
          _linkedin_url?: string
          _org_schema: string
          _phone: string
          _resume_url?: string
          _skills?: string[]
        }
        Returns: string
      }
      toggle_organization_feature: {
        Args: {
          _custom_limit?: number
          _feature_key: string
          _is_enabled: boolean
          _notes?: string
          _organization_id: string
        }
        Returns: string
      }
      update_email_template: {
        Args: {
          _content: string
          _name: string
          _subject: string
          _template_id: string
          _template_type: string
          _user_id: string
          _variables?: string[]
        }
        Returns: undefined
      }
      update_offer_status: {
        Args: {
          _new_status: string
          _notes?: string
          _offer_id: string
          _user_id: string
        }
        Returns: undefined
      }
      update_org_application_stage: {
        Args: { _application_id: string; _new_stage: string; _user_id: string }
        Returns: undefined
      }
      update_org_candidate_stage: {
        Args: { _candidate_id: string; _new_stage: string; _user_id: string }
        Returns: undefined
      }
      update_org_interview: {
        Args: {
          _duration_minutes: number
          _interview_id: string
          _interview_type: string
          _interviewer_notes?: string
          _location?: string
          _meeting_link?: string
          _scheduled_at: string
          _status?: string
          _user_id: string
        }
        Returns: undefined
      }
      update_organization_subdomain: {
        Args: { _org_id: string; _subdomain: string }
        Returns: undefined
      }
      update_task_status: {
        Args: { _new_status: string; _task_id: string; _user_id: string }
        Returns: undefined
      }
      upgrade_subscription: {
        Args: { _new_plan_id: string; _org_id: string }
        Returns: string
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
      subscription_status: "active" | "cancelled" | "expired" | "trial"
      usage_type:
        | "ai_parse_resume"
        | "ai_generate_job_desc"
        | "ai_match_candidates"
        | "email_send"
        | "email_bulk_send"
        | "storage_upload"
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
      subscription_status: ["active", "cancelled", "expired", "trial"],
      usage_type: [
        "ai_parse_resume",
        "ai_generate_job_desc",
        "ai_match_candidates",
        "email_send",
        "email_bulk_send",
        "storage_upload",
      ],
    },
  },
} as const
