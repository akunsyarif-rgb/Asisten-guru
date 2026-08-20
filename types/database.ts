/**
 * Minimal hand-written Supabase row types, matching
 * supabase/migrations/0001_init.sql. Regenerate with the Supabase CLI
 * (`supabase gen types typescript`) once a live project exists; this file
 * keeps the app compiling until then.
 *
 * Shape follows @supabase/postgrest-js's GenericTable/GenericSchema
 * contract (Row/Insert/Update/Relationships per table; Tables/Views/
 * Functions per schema) so the typed client resolves correctly instead of
 * falling back to `never`.
 */
type Table<Row, Insert, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      profiles: Table<
        {
          id: string;
          full_name: string | null;
          school_name: string | null;
          default_subject: string | null;
          default_phase: string | null;
          preferences: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        },
        {
          id: string;
          full_name?: string | null;
          school_name?: string | null;
          default_subject?: string | null;
          default_phase?: string | null;
          preferences?: Record<string, unknown>;
        }
      >;
      documents: Table<
        {
          id: string;
          owner_id: string;
          module_id: string;
          title: string;
          status: "draft" | "completed" | "archived";
          content: Record<string, unknown>;
          context: Record<string, unknown>;
          template_id: string | null;
          generation_job_id: string | null;
          archived_at: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          owner_id: string;
          module_id: string;
          title?: string;
          status?: "draft" | "completed" | "archived";
          content?: Record<string, unknown>;
          context?: Record<string, unknown>;
          template_id?: string | null;
          generation_job_id?: string | null;
          archived_at?: string | null;
        }
      >;
      document_versions: Table<
        {
          id: string;
          document_id: string;
          owner_id: string;
          version: number;
          content: Record<string, unknown>;
          label: string | null;
          created_at: string;
        },
        {
          document_id: string;
          owner_id: string;
          version: number;
          content: Record<string, unknown>;
          label?: string | null;
        }
      >;
      generation_jobs: Table<
        {
          id: string;
          owner_id: string;
          status: string;
          wizard_input: Record<string, unknown>;
          context: Record<string, unknown>;
          preset: string | null;
          error_message: string | null;
          created_at: string;
          updated_at: string;
          expires_at: string;
        },
        {
          owner_id: string;
          status?: string;
          wizard_input: Record<string, unknown>;
          context: Record<string, unknown>;
          preset?: string | null;
          error_message?: string | null;
        }
      >;
      generation_items: Table<
        {
          id: string;
          job_id: string;
          owner_id: string;
          module_id: string;
          document_id: string | null;
          status: string;
          depends_on: string[];
          attempt: number;
          error_message: string | null;
          warning_message: string | null;
          started_at: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          job_id: string;
          owner_id: string;
          module_id: string;
          document_id?: string | null;
          status?: string;
          depends_on?: string[];
          attempt?: number;
          error_message?: string | null;
          warning_message?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
        }
      >;
      templates: Table<
        {
          id: string;
          owner_id: string;
          module_id: string;
          name: string;
          description: string | null;
          structure: Record<string, unknown>;
          is_shared: boolean;
          created_at: string;
          updated_at: string;
        },
        {
          owner_id: string;
          module_id: string;
          name: string;
          description?: string | null;
          structure?: Record<string, unknown>;
          is_shared?: boolean;
        }
      >;
      prompt_versions: Table<
        {
          id: string;
          module_id: string;
          version: number;
          system_rules: string;
          task_prompt: string;
          output_schema: Record<string, unknown>;
          is_active: boolean;
          created_at: string;
        },
        {
          module_id: string;
          version: number;
          system_rules: string;
          task_prompt: string;
          output_schema: Record<string, unknown>;
          is_active?: boolean;
        }
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
