import { useState, KeyboardEvent, useRef, useEffect } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  focusTrigger?: number;
}

export default function ChatInput({ onSend, disabled = false, focusTrigger = 0 }: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Auto-focus when component becomes enabled (after AI responds)
  useEffect(() => {
    if (!disabled) {
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [disabled]);

  // Focus when trigger changes (parent tells us to focus)
  useEffect(() => {
    if (focusTrigger > 0 && !disabled) {
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [focusTrigger, disabled]);

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput("");
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white p-6">
      <div className="max-w-4xl mx-auto flex gap-4">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Write what's on your mind..."
          disabled={disabled}
          rows={3}
          autoFocus
          className="flex-1 resize-none rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <button
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          className="px-8 py-3 bg-primary text-white rounded-xl hover:bg-accent transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
        >
          Send
        </button>
      </div>
    </div>
  );
}

