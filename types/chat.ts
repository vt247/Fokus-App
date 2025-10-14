export type SessionType = "morning" | "evening" | "free";

export interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: string;
}

export interface Session {
  id: string;
  type: SessionType;
  createdAt: string;
  messages: Message[];
  totalExchanges: number;
  currentStep: 1 | 2 | 3;
  exchangesInCurrentStep: number;
  maxExchanges: number;
  completed: boolean;
}

export interface ChatResponse {
  message: string;
  error?: string;
}

export interface FocusLevels {
  northStar: string;
  year: string;
  threeMonths: string;
  month: string;
  week: string;
  today: string;
  lastUpdated: string;
}


