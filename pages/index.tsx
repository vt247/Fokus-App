import { useEffect, useState } from "react";
import Head from "next/head";
import ChatContainer from "@/components/ChatContainer";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import SessionTypeSelector from "@/components/SessionTypeSelector";
import FocusLevels from "@/components/FocusLevels";
import { Message, Session, SessionType, FocusLevels as FocusLevelsType } from "@/types/chat";
import {
  generateMessageId,
  createNewSession,
  getCurrentSession,
  saveCurrentSession,
  completeCurrentSession,
  clearCurrentSession,
  getFocusLevels,
  updateFocusLevel,
} from "@/lib/storage";

const getSessionOpeningPrompt = (type: SessionType): string => {
  switch (type) {
    case "morning":
      return "Good morning. How do you feel today?";
    case "evening":
      return "Day is ending. What happened today?";
    case "free":
      return "Tell me what's on your mind.";
  }
};

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [focusTrigger, setFocusTrigger] = useState(0);
  const [focusLevels, setFocusLevels] = useState<FocusLevelsType | null>(null);

  // Load current session and focus levels on mount
  useEffect(() => {
    const current = getCurrentSession();
    setSession(current);
    
    const levels = getFocusLevels();
    setFocusLevels(levels);
  }, []);

  // Trigger focus after AI responds
  useEffect(() => {
    if (!isLoading && session && session.messages.length > 0) {
      setFocusTrigger((prev) => prev + 1);
    }
  }, [isLoading, session?.messages.length]);

  const handleSelectSessionType = (type: SessionType) => {
    const newSession = createNewSession(type);
    setSession(newSession);
    saveCurrentSession(newSession);
  };

  const handleStartNewSession = () => {
    if (session && !session.completed) {
      // Complete current session before starting new one
      completeCurrentSession();
    } else {
      clearCurrentSession();
    }
    setSession(null);
  };

  const handleUpdateFocusLevel = (
    key: keyof Omit<FocusLevelsType, "lastUpdated">,
    value: string
  ) => {
    updateFocusLevel(key, value);
    const updated = getFocusLevels();
    setFocusLevels(updated);
  };

  const calculateSessionState = (currentSession: Session) => {
    const totalMessages = currentSession.messages.length;
    const userMessages = currentSession.messages.filter((m) => m.role === "user");
    const totalExchanges = userMessages.length;

    // Calculate current step (2 exchanges per step)
    let currentStep: 1 | 2 | 3 = 1;
    if (totalExchanges >= 5) currentStep = 3;
    else if (totalExchanges >= 3) currentStep = 2;

    // Calculate exchanges in current step
    let exchangesInCurrentStep = totalExchanges % 2;
    if (exchangesInCurrentStep === 0 && totalExchanges > 0) {
      exchangesInCurrentStep = 2;
    }

    return {
      totalExchanges,
      currentStep,
      exchangesInCurrentStep,
    };
  };

  const handleSendMessage = async (content: string) => {
    if (!session) return;

    // Create user message
    const userMessage: Message = {
      id: generateMessageId(),
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    };

    // Calculate new state
    const state = calculateSessionState(session);
    const newTotalExchanges = state.totalExchanges + 1;

    // Calculate step transitions (every 2 exchanges)
    let newStep = state.currentStep;
    let newExchangesInStep = state.exchangesInCurrentStep + 1;

    if (newExchangesInStep > 2) {
      newStep = Math.min(newStep + 1, 3) as 1 | 2 | 3;
      newExchangesInStep = 1;
    }

    // Update session with user message
    const updatedSession: Session = {
      ...session,
      messages: [...session.messages, userMessage],
      totalExchanges: newTotalExchanges,
      currentStep: newStep,
      exchangesInCurrentStep: newExchangesInStep,
    };

    setSession(updatedSession);
    saveCurrentSession(updatedSession);
    setIsLoading(true);

    try {
      // Prepare conversation history
      const conversationMessages = updatedSession.messages.map((msg) => ({
        role: msg.role === "ai" ? ("assistant" as const) : ("user" as const),
        content: msg.content,
      }));

      // Call API with session context
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: conversationMessages,
          sessionType: session.type,
          currentExchange: newTotalExchanges,
          maxExchanges: session.maxExchanges,
          currentStep: newStep,
          exchangesInCurrentStep: newExchangesInStep,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      let aiMessageContent = data.message;
      let sessionCompleted = false;

      // Check for [COMPLETE] tag
      if (aiMessageContent.includes("[COMPLETE]")) {
        sessionCompleted = true;
        // Remove [COMPLETE] from displayed message
        aiMessageContent = aiMessageContent.replace(/\[COMPLETE\]/g, "").trim();
      }

      // Create AI message
      const aiMessage: Message = {
        id: generateMessageId(),
        role: "ai",
        content: aiMessageContent,
        timestamp: new Date().toISOString(),
      };

      // Update session with AI message
      const finalSession: Session = {
        ...updatedSession,
        messages: [...updatedSession.messages, aiMessage],
        completed: sessionCompleted,
      };

      setSession(finalSession);
      saveCurrentSession(finalSession);

      // If completed, save to history
      if (sessionCompleted) {
        completeCurrentSession();
      }
    } catch (error) {
      console.error("Error sending message:", error);

      // Show error message
      const errorMessage: Message = {
        id: generateMessageId(),
        role: "ai",
        content:
          "I'm sorry, I'm having trouble connecting right now. Please try again.",
        timestamp: new Date().toISOString(),
      };

      const errorSession: Session = {
        ...updatedSession,
        messages: [...updatedSession.messages, errorMessage],
      };

      setSession(errorSession);
      saveCurrentSession(errorSession);
    } finally {
      setIsLoading(false);
    }
  };

  // Show session type selector if no active session
  if (!session) {
    return (
      <>
        <Head>
          <title>Fokus</title>
          <meta name="description" content="Find clarity through reflection" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <SessionTypeSelector onSelectType={handleSelectSessionType} />
      </>
    );
  }

  // Show chat interface with active session
  return (
    <>
      <Head>
        <title>Fokus - {session.type.charAt(0).toUpperCase() + session.type.slice(1)} Session</title>
        <meta name="description" content="Find clarity through reflection" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col h-screen bg-background">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white">
          <div className="max-w-4xl mx-auto px-8 py-6 flex justify-between items-center">
            <div className="flex items-center gap-6">
              <div>
                <h1 className="text-2xl font-semibold text-primary">Fokus</h1>
                <p className="text-sm text-secondary mt-1">
                  {session.type.charAt(0).toUpperCase() + session.type.slice(1)}{" "}
                  Session · Step {session.currentStep}/3
                </p>
              </div>
              <div className="text-xs text-secondary">
                {session.totalExchanges}/{session.maxExchanges} exchanges
              </div>
            </div>
            <button
              onClick={handleStartNewSession}
              className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-accent transition-colors font-medium"
            >
              New Session
            </button>
          </div>
        </header>

        {/* Focus Levels */}
        {focusLevels && (
          <FocusLevels levels={focusLevels} onUpdate={handleUpdateFocusLevel} />
        )}

        {/* Chat Container */}
        <ChatContainer>
          {session.messages.length === 0 ? (
            <div className="text-center text-secondary mt-20">
              <p className="text-2xl mb-4">
                {session.type === "morning" && "🌅"}
                {session.type === "evening" && "🌙"}
                {session.type === "free" && "💭"}
              </p>
              <p className="text-lg mb-2">
                {getSessionOpeningPrompt(session.type)}
              </p>
              <p className="text-sm mt-4 text-xs">
                This session will complete in maximum {session.maxExchanges}{" "}
                exchanges
              </p>
            </div>
          ) : (
            session.messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))
          )}
          {isLoading && <div className="text-secondary italic">Thinking...</div>}
          {session.completed && !isLoading && (
            <div className="text-center mt-8 p-8 bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-primary shadow-lg">
              <div className="text-4xl mb-3">✨</div>
              <p className="text-xl font-semibold text-primary mb-2">
                Transformation Complete
              </p>
              <p className="text-sm text-secondary mb-6 max-w-md mx-auto">
                You've moved through presence, insight, and action. This
                reflection has reached its natural end.
              </p>
              <button
                onClick={handleStartNewSession}
                className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-accent transition-colors font-medium shadow-sm"
              >
                Start New Session
              </button>
            </div>
          )}
        </ChatContainer>

        {/* Input */}
        <ChatInput
          onSend={handleSendMessage}
          disabled={isLoading || session.completed}
          focusTrigger={focusTrigger}
        />
      </main>
    </>
  );
}
