# Fokus App

An AI-powered journaling and reflection app that helps entrepreneurs and decision-makers find clarity and focus through daily writing and conversations with Claude AI.

## Features

**Feature 1 - Structured Transformation Sessions** ✓
- 3 session types: Morning Check-in, Evening Reflection, Free Conversation
- 3-step transformation process: Presence → Insight → Action
- Guaranteed completion in 6 exchanges (morning/evening) or 12 (free)
- Session tracking with automatic step transitions
- AI mentor powered by Claude (Anthropic)
- Conversation history saved in LocalStorage
- Clean, minimal UI with Tailwind CSS

**Feature 3 - Focus Levels** ✓
- 6 time-horizon focus levels: North Star → Year → 3 Months → Month → Week → Today
- Compact display at top of page (collapsible/expandable)
- Click to edit any focus level
- Persists in LocalStorage
- Helps maintain clarity across different time horizons
- AI can reference your focuses during sessions

## Tech Stack

- **Next.js 14** - React framework with Pages Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Anthropic SDK** - Claude AI integration
- **LocalStorage** - Data persistence

## Setup

1. **Install dependencies** (already done):
   ```bash
   npm install
   ```

2. **Add your Claude API key**:
   
   Create a file called `.env.local` in the root directory and add:
   ```
   ANTHROPIC_API_KEY=your_api_key_here
   ```
   
   Get your API key from: https://console.anthropic.com/

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
/components
  ChatContainer.tsx   - Chat wrapper with auto-scroll
  ChatInput.tsx       - Input field and send button
  ChatMessage.tsx     - Individual message display

/lib
  storage.ts          - LocalStorage utilities

/pages
  _app.tsx           - App wrapper
  index.tsx          - Main chat interface
  /api
    chat.ts          - Claude API endpoint

/types
  chat.ts            - TypeScript types

/styles
  globals.css        - Global styles and Tailwind imports
```

## Usage

1. Start writing in the input field
2. Press Enter or click Send
3. Claude AI responds as a wise mentor
4. Conversation persists in your browser's LocalStorage

## AI Behavior

The AI acts as:
- A wise mentor and best friend
- A reflective listener (not a problem solver)
- Someone who asks deep questions
- A guide helping you find clarity

Responses are:
- Concise and thoughtful
- In the language you write (Finnish/English/etc.)
- Never robotic or AI-like
- Focused on presence and small concrete steps

## Next Features (Planned)

- Feature 2: Session Types (Morning/Evening/Free)
- Feature 3: Focus Levels (North Star → Today)
- Feature 4: AI Pattern Recognition
- Feature 5: Weekly & Monthly Reviews
- Feature 6: Project Portfolio
- Feature 7: Floor (Daily Routines)
- Feature 8: Social Post Creation
- Feature 9: Free Time Tracking

## Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Notes

- Data is stored locally in your browser
- Clear your LocalStorage to reset conversations
- API key is never exposed to the frontend
- Desktop-first design (mobile coming later)


