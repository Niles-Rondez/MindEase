# MindEase
MindEase is a lightweight, AI-assisted mobile and web application designed to help users track and improve their mental wellness. The app enables users to record daily thoughts and moods through text and photo journal entries. Using AI-powered sentiment analysis and mood tracking, the system generates personalized activity and self-care suggestions, such as guided meditations and CBT (Cognitive Behavioral Therapy) exercises based on initial user preferences gathered via a survey.

The MVP will focus strictly on essential features: user authentication, journal and mood tracking with basic sentiment analysis, AI-generated weekly mood summaries, and activity suggestions. Advanced features like real-time chatbot therapy, social features, or professional therapist integration are excluded to ensure the product is achievable within 5 weeks by a team of 4 developers.

## 📱 Core Features

### 🔐 Sign Up & Onboarding
- Multi-step sign-up flow:
  - **Step 1: Personal Info** – name, age, sex, gender
  - **Step 2: Lifestyle & Interests** – activity level, hobbies
- Stored securely in user profile via **Supabase Auth**

### ➕ Create Entry
- **Mood Logging** via emoji/scale slider
- **Thoughts** via text journal
- **Optional image upload**
- Entries sent to backend and analyzed by AI

### 🏡 Dashboard
- Today's mood snapshot and 7-day mood graph
- **AI-recommended actions** based on mood & preferences
- **AI tips** and static video suggestions (CBT, meditation)

### 🤖 AI Insights
- Mood, energy, and stress trend graphs
- Weekly insights & patterns (e.g., “Lows on Mondays”)
- Monthly bar graph of emotional trends
- AI-generated wellness strategies based on behavior

### 📘 Logbook
- History of mood/journal entries
- Filter by:
  - Keyword (text search)
  - Mood rating
  - Date range

### ⚙️ Settings

---

## 💡 How It Works

- Users record daily journals and mood logs.
- **AI model** (TensorFlow via API) analyzes sentiment (positive, neutral, negative).
- The system maps mood trends with **survey results** to generate tailored **CBT/meditation suggestions**.
- Everything is stored and secured in **Supabase** (auth, storage, database).

---

## 🧰 Tech Stack

| Layer       | Tech/Tool                     | Purpose                                      |
|-------------|-------------------------------|----------------------------------------------|
| Frontend    | React + Tailwind CSS          | UI/UX, mood/journal input forms              |
| Backend     | Java Spring Boot              | API for handling logs, onboarding, etc.      |
| Database    | Supabase (PostgreSQL)         | Store user profiles, journal entries         |
| Auth        | Supabase Auth                 | Secure login/session management              |
| AI/ML       | Python + TensorFlow (API)     | Sentiment analysis of journal entries        |
| Cloud       | AWS EC2 / Supabase Edge       | Backend & AI API hosting                     |
| Storage     | Supabase Storage              | Store uploaded journal images                |

---

## 🚀 Installation Guide (Dev Mode)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Niles-Rondez/MindEase.git
   cd mindease
   
2. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   
3. **Backend:**
   ```bash
   cd backend
   npm install
   npm run dev
5. **AI Service:**
   ```bash
   cd backend
   cd scripts
   pip install -r requirements.txt
