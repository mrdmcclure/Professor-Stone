
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  groundingLinks?: GroundingLink[];
}

export interface GroundingLink {
  title: string;
  url: string;
}

export interface SpecimenCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
}
