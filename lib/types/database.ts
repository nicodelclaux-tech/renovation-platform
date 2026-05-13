export interface Project {
  id: string;
  user_id: string;
  name: string;
  style_bible: StyleBible;
  created_at: string;
  updated_at: string;
}

export interface StyleBible {
  project_style?: string;
  inspirations?: string[];
  materials?: string[];
  mood?: string[];
  avoid?: string[];
}

export interface Room {
  id: string;
  project_id: string;
  name: string;
  floor?: string;
  wing?: string;
  fixed_architecture: string;
  design_brief: string;
  created_at: string;
}

export interface Generation {
  id: string;
  room_id: string;
  prompt: string;
  master_prompt?: string;
  image_url?: string;
  status: 'pending' | 'generating' | 'completed' | 'failed' | 'approved';
  metadata: Record<string, any>;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export type Database = {
  public: {
    Tables: {
      projects: { Row: Project; Insert: Omit<Project, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<Project, 'id'>> };
      rooms: { Row: Room; Insert: Omit<Room, 'id' | 'created_at'>; Update: Partial<Omit<Room, 'id'>> };
      generations: { Row: Generation; Insert: Omit<Generation, 'id' | 'created_at'>; Update: Partial<Omit<Generation, 'id'>> };
      chat_messages: { Row: ChatMessage; Insert: Omit<ChatMessage, 'id' | 'created_at'>; Update: Partial<Omit<ChatMessage, 'id'>> };
    };
  };
};
