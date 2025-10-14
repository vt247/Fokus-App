import { Message } from "@/types/chat";

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`mb-8 ${
        isUser ? "text-right" : "text-left"
      }`}
    >
      <div
        className={`inline-block max-w-3xl text-left ${
          isUser
            ? "bg-primary text-white px-6 py-4 rounded-2xl"
            : "text-foreground"
        }`}
      >
        <div className="whitespace-pre-wrap leading-relaxed">
          {message.content}
        </div>
      </div>
      <div className="text-xs text-secondary mt-2">
        {new Date(message.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
    </div>
  );
}


