import { Message, Session, SessionType, FocusLevels } from "@/types/chat";

const CURRENT_SESSION_KEY = "fokus_current_session";
const SESSIONS_HISTORY_KEY = "fokus_sessions_history";
const FOCUS_LEVELS_KEY = "fokus_focus_levels";

export const generateMessageId = (): string => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const createNewSession = (type: SessionType): Session => {
  const maxExchanges = type === "free" ? 12 : 6;
  
  return {
    id: generateSessionId(),
    type,
    createdAt: new Date().toISOString(),
    messages: [],
    totalExchanges: 0,
    currentStep: 1,
    exchangesInCurrentStep: 0,
    maxExchanges,
    completed: false,
  };
};

export const getCurrentSession = (): Session | null => {
  if (typeof window === "undefined") return null;
  
  const stored = localStorage.getItem(CURRENT_SESSION_KEY);
  if (!stored) return null;
  
  try {
    return JSON.parse(stored);
  } catch (error) {
    console.error("Error parsing current session:", error);
    return null;
  }
};

export const saveCurrentSession = (session: Session): void => {
  if (typeof window === "undefined") return;
  
  localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(session));
};

export const completeCurrentSession = (): void => {
  if (typeof window === "undefined") return;
  
  const session = getCurrentSession();
  if (!session) return;
  
  // Mark as completed
  session.completed = true;
  
  // Save to history
  const history = getSessionsHistory();
  history.push(session);
  localStorage.setItem(SESSIONS_HISTORY_KEY, JSON.stringify(history));
  
  // Clear current session
  localStorage.removeItem(CURRENT_SESSION_KEY);
};

export const getSessionsHistory = (): Session[] => {
  if (typeof window === "undefined") return [];
  
  const stored = localStorage.getItem(SESSIONS_HISTORY_KEY);
  if (!stored) return [];
  
  try {
    return JSON.parse(stored);
  } catch (error) {
    console.error("Error parsing sessions history:", error);
    return [];
  }
};

export const clearCurrentSession = (): void => {
  if (typeof window === "undefined") return;
  
  localStorage.removeItem(CURRENT_SESSION_KEY);
};

// Legacy support - will be removed
export const getMessages = (): Message[] => {
  const session = getCurrentSession();
  return session ? session.messages : [];
};

export const clearMessages = (): void => {
  clearCurrentSession();
};

// Focus Levels
export const getDefaultFocusLevels = (): FocusLevels => {
  return {
    northStar: "",
    year: "",
    threeMonths: "",
    month: "",
    week: "",
    today: "",
    lastUpdated: new Date().toISOString(),
  };
};

export const getFocusLevels = (): FocusLevels => {
  if (typeof window === "undefined") return getDefaultFocusLevels();
  
  const stored = localStorage.getItem(FOCUS_LEVELS_KEY);
  if (!stored) return getDefaultFocusLevels();
  
  try {
    return JSON.parse(stored);
  } catch (error) {
    console.error("Error parsing focus levels:", error);
    return getDefaultFocusLevels();
  }
};

export const saveFocusLevels = (levels: FocusLevels): void => {
  if (typeof window === "undefined") return;
  
  const updated = {
    ...levels,
    lastUpdated: new Date().toISOString(),
  };
  
  localStorage.setItem(FOCUS_LEVELS_KEY, JSON.stringify(updated));
};

export const updateFocusLevel = (
  key: keyof Omit<FocusLevels, "lastUpdated">,
  value: string
): void => {
  const levels = getFocusLevels();
  levels[key] = value;
  saveFocusLevels(levels);
};


