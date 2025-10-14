import type { NextApiRequest, NextApiResponse } from "next";
import Anthropic from "@anthropic-ai/sdk";
import { SessionType } from "@/types/chat";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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

const buildSystemPrompt = (
  type: SessionType,
  currentExchange: number,
  maxExchanges: number,
  currentStep: number,
  mustClose: boolean
): string => {
  const basePrompt = `You are a wise mentor guiding a transformation conversation.

YOUR MISSION:
Guide user through 3 steps to find clarity, insight, and direction.

STEP 1 - PRESENCE (exchanges 1-2):
Goal: User names their feeling or situation
- Ask how they feel or what happened
- If needed, deepen: "Tell me more" or "What's behind this?"
- Listen and help them articulate their current state

STEP 2 - INSIGHT (exchanges 3-4):
Goal: User recognizes what's essential
- Reflect the essence: "I hear [X]. Is that it?"
- Use their exact words when reflecting
- If user clarifies, reflect their new words
- Help them see the core truth

STEP 3 - ACTION (exchanges 5-6):
Goal: User identifies smallest next step
- Ask: "What does this want from you?" or "What's the smallest step?"
- When step identified, close warmly with this format:
  "[Affirmation]. Hold this: [insight + action]. [Direction]."
- Then on a new line write: [COMPLETE]

YOUR STYLE:
- Clear, simple, understanding, encouraging
- Use user's exact words when reflecting
- Short responses (2-4 sentences max)
- Never robotic or AI-like
- Never explain this structure to user
- Conversation should feel natural and organic
- Respond in user's language (if Finnish, respond in Finnish)

CONVERSATION FLOW:
- After 2 exchanges in a step, naturally transition to next step
- Keep responses concise and focused
- Even if no perfect clarity, close with best available insight
- Always end Step 3 with [COMPLETE] tag`;

  // Add current context
  let contextPrompt = `\n\n=== CURRENT SESSION CONTEXT ===
Session type: ${type}
Current exchange: ${currentExchange}/${maxExchanges}
Current step: ${currentStep}/3
Must close now: ${mustClose ? "YES" : "no"}`;

  // Add step-specific instructions
  if (currentStep === 1 && !mustClose) {
    contextPrompt += `\n\n=== STEP 1 INSTRUCTIONS ===
You are in the PRESENCE step.
- Ask about their feeling (morning) or what happened (evening/free)
- Keep it simple and open
- If this is exchange 2 in this step, prepare to transition to Step 2 in next response
- Max 3 sentences`;
  } else if (currentStep === 2 && !mustClose) {
    contextPrompt += `\n\n=== STEP 2 INSTRUCTIONS ===
You are in the INSIGHT step.
- Reflect what you've heard in their exact words
- Ask: "Is that it?" or similar confirmation
- Help them see the essence
- If this is exchange 2 in this step, prepare to move to Step 3 in next response
- Max 3 sentences`;
  } else if (currentStep === 3 || mustClose) {
    contextPrompt += `\n\n=== STEP 3 INSTRUCTIONS - MUST CLOSE ===
You are in the ACTION step. This is the FINAL response.

MANDATORY FORMAT:
1. Brief affirmation (1 sentence)
2. Summary: "Hold this: [their insight + the action/direction]"  
3. Encouraging close (1 sentence)
4. New line with: [COMPLETE]

Example:
"You've found it. Hold this: you need space to breathe, and one hour this week is yours. Let that be enough.

[COMPLETE]"

CRITICAL: You MUST include [COMPLETE] on its own line.
Maximum 4 sentences before [COMPLETE].
DO NOT ask new questions.
DO NOT invite continuation.
JUST: affirm → summarize → close → [COMPLETE]`;
  }

  return basePrompt + contextPrompt;
};

interface MessagePayload {
  role: "user" | "assistant";
  content: string;
}

interface RequestBody {
  messages: MessagePayload[];
  sessionType: SessionType;
  currentExchange: number;
  maxExchanges: number;
  currentStep: number;
  exchangesInCurrentStep: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      messages,
      sessionType,
      currentExchange,
      maxExchanges,
      currentStep,
    } = req.body as RequestBody;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    if (!sessionType) {
      return res.status(400).json({ error: "Session type is required" });
    }

    // Determine if we must force close
    const mustClose = currentExchange >= maxExchanges;

    // Build dynamic system prompt
    const systemPrompt = buildSystemPrompt(
      sessionType,
      currentExchange,
      maxExchanges,
      currentStep,
      mustClose
    );

    // Call Claude API
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 512,
      system: systemPrompt,
      messages: messages,
    });

    const aiMessage = response.content[0];
    if (aiMessage.type === "text") {
      let messageText = aiMessage.text;
      
      // Force add [COMPLETE] if we're at max exchanges and AI forgot
      if (mustClose && !messageText.includes("[COMPLETE]")) {
        messageText += "\n\n[COMPLETE]";
        console.warn("Had to force add [COMPLETE] tag");
      }
      
      return res.status(200).json({ message: messageText });
    }

    return res.status(500).json({ error: "Unexpected response format" });
  } catch (error) {
    console.error("Error calling Claude API:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to get AI response",
    });
  }
}
