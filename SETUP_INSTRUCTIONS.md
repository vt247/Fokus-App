# Setup Instructions

## Important: Add Your Claude API Key

Before running the app, you need to add your Claude API key.

### Steps:

1. **Get your API key**:
   - Go to: https://console.anthropic.com/
   - Sign in or create an account
   - Navigate to API Keys
   - Create a new key or copy an existing one

2. **Create `.env.local` file**:
   - In the root directory of this project, create a file named `.env.local`
   - Add the following line:
   ```
   ANTHROPIC_API_KEY=your_actual_api_key_here
   ```
   - Replace `your_actual_api_key_here` with your real API key

3. **Run the app**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   - Navigate to http://localhost:3000
   - Start writing and chatting with your AI mentor!

## Troubleshooting

If you get an error about missing API key:
- Make sure `.env.local` exists in the root directory
- Check that the file contains `ANTHROPIC_API_KEY=...`
- Restart the dev server after adding the key

If you get API errors:
- Verify your API key is valid
- Check you have credits in your Anthropic account
- Look at the terminal for detailed error messages


