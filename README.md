# 🧠 MindEase: AI-Powered Mental Wellness App (MVP)

MindEase is a lightweight, AI-assisted mobile and web application designed to help users track and improve their mental wellness. The app enables users to record daily thoughts and moods through text and photo journal entries. Using AI-powered sentiment analysis and mood tracking, the system generates personalized activity and self-care suggestions, such as guided meditations and CBT (Cognitive Behavioral Therapy) exercises based on initial user preferences gathered via a survey.

The MVP focuses strictly on essential features: user authentication, journal and mood tracking with basic sentiment analysis, AI-generated weekly mood summaries, and activity suggestions. Advanced features like real-time chatbot therapy, social features, or professional therapist integration are excluded to ensure the product is achievable within 5 weeks by a team of 4 developers.

---

## 📱 Core Features

### 🔐 Sign Up & Onboarding
- Multi-step sign-up process:
  - **Step 1: Personal Info** – name, birthdate, sex, gender
  - **Step 2: Lifestyle & Interests** – hobbies, activity level 
- Data stored in user profile via **Supabase Auth**

### ➕ Create Entry
- **Mood Logging** via emoji/slider (1–5 scale)
- **Text journal entry**
- **Optional image upload** via Supabase Storage

### 🏡 Dashboard
- Today's mood snapshot
- **AI-recommended actions** based on trends and survey data
- **Line graph**: this week's actual mood + AI mood prediction
- AI-generated tips and curated video recommendations

### 🤖 AI Insights
- Weekly patterns of **mood, energy, stress**
- Personalized AI-generated insights
- **Bar graph** showing monthly mood trends
- AI-generated **wellness strategies** (rule-based)

### 📘 Logbook
- List of all past entries (journal + mood)
- **Filters**: by keyword, mood rating, or date range

### ⚙️ Settings

---

## 💡 How It Works

1. User signs up and fills out an onboarding survey.
2. Daily mood + journal entries are submitted.
3. The AI (powered by **Gemini**, deployed via API) analyzes journal text and classifies the sentiment (positive, neutral, negative).
4. AI suggestions and insights are generated based on:
   - Sentiment patterns
   - Initial survey results
   - Behavioral trends

All data is securely stored using **Supabase** infrastructure.

---

## 🧰 Tech Stack

| Layer       | Tech/Tool                     | Purpose                                      |
|-------------|-------------------------------|----------------------------------------------|
| Frontend    | React + Tailwind CSS          | Responsive UI for web and mobile             |
| Backend     | Next.js API Routes            | RESTful backend endpoints                    |
| Database    | Supabase (PostgreSQL)         | User profiles, journal entries, survey data  |
| Authentication | Supabase Auth             | User sign-up/login and session handling      |
| AI/ML       | Gemini via REST API           | Sentiment analysis of journal entries        |
| Cloud       | Supabase Edge Functions       | Serverless backend + API hosting             |
| Storage     | Supabase Storage              | Upload and access journal images             |

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

4. **Environment Variables:**
   ```bash
   cd backend
   touch .env.local
   ```
   Inside .env.local
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://vueayjtgnwoxzkbnkxdx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1ZWF5anRnbndveHprYm5reGR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3Njg0MTAsImV4cCI6MjA2NjM0NDQxMH0.qjqzNIkfpTp6JyRd60C7sEoLzz0Kw6t8Te1j8kGr0VE
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1ZWF5anRnbndveHprYm5reGR4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDc2ODQxMCwiZXhwIjoyMDY2MzQ0NDEwfQ.X0gOmstcLhDYNhhLaX58VLIRM2tnaKJ_T-Y2_n0Qz38
   ```
6. **AI Service:**
   ```bash
   cd backend
   cd scripts
   pip install -r requirements.txt

---

# 🚫 Out of Scope for MVP
- Real-time chatbot therapist
- Photo-based mood prediction
- Push notifications
- Therapist directory or emergency support
- Community/social features

---

## 👩‍💻 Contributors

| Name       | Role                      |
|------------|---------------------------|
| Ruelan     | Frontend Lead             |
| Rondez     | Backend/API Lead          |
| Estiola    | AI/ML Developer           |
| Montebon   | Database & Cloud Engineer |
| Ando       | QA & Integration Engineer |

---

# 📄 License
This project is for educational and academic demonstration purposes only.
