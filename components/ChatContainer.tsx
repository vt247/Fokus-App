import { ReactNode, useEffect, useRef } from "react";

interface ChatContainerProps {
  children: ReactNode;
}

export default function ChatContainer({ children }: ChatContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [children]);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-8 py-12"
    >
      <div className="max-w-4xl mx-auto">
        {children}
      </div>
    </div>
  );
}


