import { SessionType } from "@/types/chat";

interface SessionTypeSelectorProps {
  onSelectType: (type: SessionType) => void;
}

export default function SessionTypeSelector({ onSelectType }: SessionTypeSelectorProps) {
  const sessionTypes = [
    {
      type: "morning" as SessionType,
      title: "Morning Check-in",
      description: "How do you feel today? What does this day want from you?",
      emoji: "🌅",
    },
    {
      type: "evening" as SessionType,
      title: "Evening Reflection",
      description: "What happened today? What resonated? What did you learn?",
      emoji: "🌙",
    },
    {
      type: "free" as SessionType,
      title: "Free Conversation",
      description: "Tell me what's on your mind. Talk as long as you need.",
      emoji: "💭",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-8">
      <div className="max-w-2xl w-full">
        <h2 className="text-3xl font-semibold text-primary text-center mb-3">
          Start a New Session
        </h2>
        <p className="text-secondary text-center mb-12">
          Choose how you'd like to reflect today
        </p>

        <div className="space-y-4">
          {sessionTypes.map((session) => (
            <button
              key={session.type}
              onClick={() => onSelectType(session.type)}
              className="w-full text-left p-6 bg-white border border-gray-200 rounded-xl hover:border-primary hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">{session.emoji}</div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-primary group-hover:text-accent mb-1">
                    {session.title}
                  </h3>
                  <p className="text-sm text-secondary">
                    {session.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <p className="text-xs text-secondary text-center mt-8">
          Morning & Evening sessions complete in 6 exchanges maximum.
          <br />
          Free conversations can go up to 12 exchanges.
        </p>
      </div>
    </div>
  );
}



