<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# LeetTrack Pro

A modern, feature-rich LeetCode problem tracker with AI assistance, progress tracking, and cloud synchronization.

## ✨ Features

- 📊 **Dashboard Analytics** - Visualize your progress with interactive charts
- 🏢 **Company-Specific Problems** - Browse problems by company and time period
- ✅ **Progress Tracking** - Track your solving status (Todo, Solving, Solved, Revise)
- 🤖 **AI Assistant** - Get hints and explanations powered by Google Gemini
- 🔐 **Authentication** - Secure sign-in with Supabase (email/password)
- ☁️ **Cloud Sync** - Your progress syncs across all devices
- 💾 **Offline Support** - Works offline with localStorage fallback
- 🎨 **Modern UI** - Beautiful dark theme with smooth animations

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- A Supabase account (free tier works great!)

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Supabase:**
   
   Follow the detailed guide in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) to:
   - Create a Supabase project
   - Set up the database tables
   - Configure authentication
   - Get your API keys

3. **Configure environment variables:**
   
   Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

4. **Run the app:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   
   Navigate to `http://localhost:5173`

## 🔧 Configuration

### Gemini API Key (Optional)

To use the AI assistant feature:

1. Get a free API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click the Settings icon in the app
3. Enter your API key
4. Start asking questions about problems!

### Guest Mode

You can use the app without signing in:
- Click "Continue as Guest" on the login screen
- Your progress will be saved locally in your browser
- Sign in later to sync your progress to the cloud

## 📱 Usage

### Tracking Problems

1. **Select a Company** - Click on any company in the sidebar
2. **Choose Time Period** - Select "All", "6 months", "1 year", etc.
3. **Update Status** - Click the status dropdown for any problem
4. **Add Notes** - Click the remark field to add personal notes

### Using the AI Assistant

1. Click the "Ask AI" button next to any problem
2. Ask questions like:
   - "Give me a hint"
   - "Explain the approach"
   - "What's the optimal solution?"
3. Get instant AI-powered responses

### Viewing Analytics

1. Click "Dashboard" in the top navigation
2. See your progress breakdown by status
3. View statistics and completion rates

## 🏗️ Tech Stack

- **Frontend:** React 19 + TypeScript
- **Build Tool:** Vite
- **Backend:** Supabase (PostgreSQL + Auth)
- **AI:** Google Gemini API
- **Charts:** Recharts
- **Icons:** Lucide React
- **Styling:** Tailwind CSS (custom config)

## 📂 Project Structure

```
leetcode-problems/
├── components/          # React components
│   ├── Auth.tsx        # Authentication UI
│   ├── CompanySidebar.tsx
│   ├── Dashboard.tsx
│   ├── GeminiPanel.tsx
│   ├── Layout.tsx
│   ├── ProblemTable.tsx
│   └── SettingsModal.tsx
├── services/           # Business logic
│   ├── authService.ts      # Authentication
│   ├── geminiService.ts    # AI integration
│   ├── githubService.ts    # Fetch problems
│   ├── storageService.ts   # Progress storage
│   └── supabaseClient.ts   # Supabase config
├── App.tsx            # Main app component
├── types.ts           # TypeScript types
└── SUPABASE_SETUP.md  # Setup guide
```

## 🔒 Security

- **Row Level Security (RLS)** - Users can only access their own data
- **PKCE Flow** - Enhanced security for authentication
- **Environment Variables** - API keys never exposed in code
- **Secure Sessions** - Automatic token refresh

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- Problem data from [LeetCode Company-wise Problems](https://github.com/hxu296/leetcode-company-wise-problems-2022)
- Powered by [Supabase](https://supabase.com)
- AI by [Google Gemini](https://ai.google.dev)

## 📞 Support

If you encounter any issues:
1. Check [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for setup help
2. Review the troubleshooting section
3. Open an issue on GitHub

---

**Happy Coding! 🚀**
