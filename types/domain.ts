export type Project = {
  id: string;
  name: string;
  address?: string;
  styleBible: StyleBible;
  createdAt: string;
};

export type StyleBible = {
  projectStyle: string;
  inspirations: string[];
  materials: string[];
  mood: string[];
  avoid: string[];
};

export type Room = {
  id: string;
  projectId: string;
  name: string;
  floor?: string;
  roomType: string;
  fixedArchitecture: string;
  roomStyleBrief: string;
  negativeConstraints: string;
};

export type Generation = {
  id: string;
  roomId: string;
  parentGenerationId?: string;
  prompt: string;
  model: string;
  imageUrl: string;
  approved: boolean;
  notes?: string;
  createdAt: string;
};
