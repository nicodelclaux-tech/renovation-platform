export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface StyleBible {
  project_style?: string;
  inspirations?: string[];
  materials?: string[];
  mood?: string[];
  avoid?: string[];
}

export type Database = {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          style_bible: StyleBible | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          style_bible?: StyleBible | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          style_bible?: StyleBible | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      rooms: {
        Row: {
          id: string;
          project_id: string;
          name: string;
          floor: string | null;
          wing: string | null;
          fixed_architecture: string | null;
          design_brief: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          name: string;
          floor?: string | null;
          wing?: string | null;
          fixed_architecture?: string | null;
          design_brief?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          name?: string;
          floor?: string | null;
          wing?: string | null;
          fixed_architecture?: string | null;
          design_brief?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      generations: {
        Row: {
          id: string;
          room_id: string;
          prompt: string;
          master_prompt: string | null;
          image_url: string | null;
          status: 'pending' | 'generating' | 'completed' | 'failed' | 'approved';
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          prompt: string;
          master_prompt?: string | null;
          image_url?: string | null;
          status?: 'pending' | 'generating' | 'completed' | 'failed' | 'approved';
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          prompt?: string;
          master_prompt?: string | null;
          image_url?: string | null;
          status?: 'pending' | 'generating' | 'completed' | 'failed' | 'approved';
          metadata?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
      chat_messages: {
        Row: {
          id: string;
          room_id: string;
          role: 'user' | 'assistant' | 'system';
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          role: 'user' | 'assistant' | 'system';
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          role?: 'user' | 'assistant' | 'system';
          content?: string;
          created_at?: string;
        };
        Relationships: [];
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
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Project = Database['public']['Tables']['projects']['Row'];
export type Room = Database['public']['Tables']['rooms']['Row'];
export type Generation = Database['public']['Tables']['generations']['Row'];
export type ChatMessage = Database['public']['Tables']['chat_messages']['Row'];
