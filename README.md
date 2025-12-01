# DevProfile AI

[![Nuxt](https://img.shields.io/badge/Nuxt-4.0-00DC82?logo=nuxt&labelColor=020420)](https://nuxt.com)
[![Nuxt UI](https://img.shields.io/badge/Nuxt%20UI-4.0-00DC82?logo=nuxt&labelColor=020420)](https://ui.nuxt.com)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?logo=supabase&labelColor=1C1C1C)](https://supabase.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**AI-powered developer portfolio platform** that analyzes GitHub repositories to showcase real skills with **trust and transparency**.

> 🎯 **Mission**: Bridge the gap between developers and employers with fact-based, AI-verified portfolios.

---

## 🌟 Features

### For Developers
- **📊 AI Repository Analysis** - Automatically analyze your GitHub projects
- **🎯 Key Achievements Extraction** - AI identifies your real accomplishments
- **📝 Resume-Ready Content** - HR-friendly bullet points using X-Y-Z formula
- **💬 Interview Preparation** - Get potential interview questions based on your projects
- **👥 Dual-View Public Profile** - HR View & Tech Manager View

### AI Analysis Includes
- Project scale classification (Micro → Enterprise)
- Technical stack detection (frameworks, libraries, patterns)
- Code quality assessment
- Business impact highlights
- Soft skills indicators
- Team context (Solo/Team, contribution %)

### Multi-Language Support
Supports analysis of projects in:
- **JavaScript/TypeScript** (Node.js, Vue, React, etc.)
- **PHP** (Laravel, Symfony)
- **Python** (Django, FastAPI, Flask)
- **Go, Rust, Java, Ruby, C#, Swift, C/C++, Dart, Elixir**

---

## 🖼️ Screenshots

### Public Profile - HR View
![HR View](docs/screenshots/hr-view.png)

### Public Profile - Tech View
![Tech View](docs/screenshots/tech-view.png)

### Repository Analysis
![Analysis](docs/screenshots/analysis.png)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm 8+
- Supabase account
- OpenAI API key (or Anthropic/Gemini)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/DevProfile-AI.git
cd DevProfile-AI

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env
```

### Environment Setup

Edit `.env` with your credentials:

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_key

# AI Provider (choose one)
AI_PROVIDER=openai
OPENAI_API_KEY=sk-your-api-key
OPENAI_MODEL=gpt-4o

# Alternative providers
# AI_PROVIDER=anthropic
# ANTHROPIC_API_KEY=sk-ant-...
# AI_PROVIDER=gemini
# GEMINI_API_KEY=...
```

### Database Setup

1. Create a new Supabase project
2. Go to SQL Editor and run migrations:

```bash
# Run in order:
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_profile_views.sql
```

3. Enable GitHub OAuth in Supabase:
   - Go to Authentication → Providers → GitHub
   - Add your GitHub OAuth App credentials

### Development

```bash
# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
DevProfile-AI/
├── app/
│   ├── components/          # Vue components
│   ├── composables/         # Vue composables
│   │   ├── useAuth.ts       # Authentication
│   │   ├── useGitHub.ts     # GitHub API
│   │   ├── useRepositories.ts
│   │   └── useAnalysis.ts
│   ├── pages/
│   │   ├── index.vue        # Landing page
│   │   ├── [username].vue   # Public profile (HR/Tech views)
│   │   ├── auth/            # Login, callback
│   │   └── developer/       # Dashboard, repositories, resume
│   ├── middleware/
│   │   └── auth.global.ts   # Route protection
│   └── types/               # TypeScript definitions
│
├── server/
│   ├── api/
│   │   ├── analyze/         # Analysis endpoints
│   │   └── profile/         # Public profile API
│   ├── services/
│   │   ├── AIConfigService.ts
│   │   └── ProjectAnalysisLLMService.ts
│   ├── prompts/
│   │   └── PROJECT_ANALYSIS_PROMPT.md
│   ├── schemas/
│   │   └── projectAnalysisSchemas.ts
│   └── utils/
│       └── githubService.ts
│
├── supabase/
│   └── migrations/          # Database schema
│
└── .claude/                 # Development docs
    ├── TZ.md               # Technical specification
    └── PROGRESS.md         # Development progress
```

---

## 🔧 Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Nuxt 4 + Vue 3 | SSR, SPA, Routing |
| **UI** | Nuxt UI 4 + Tailwind CSS | Components, Styling |
| **Database** | Supabase (PostgreSQL) | Data, Auth, RLS |
| **AI/LLM** | OpenAI / Anthropic / Gemini | Code Analysis |
| **API** | Nuxt Server API | Backend Logic |
| **Auth** | Supabase Auth + GitHub OAuth | User Authentication |

---

## 📊 API Endpoints

### Analysis
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/analyze/estimate` | Get cost estimation |
| POST | `/api/analyze/[id]` | Start analysis |
| GET | `/api/analyze/[id]` | Get analysis result |

### Public Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profile/[username]` | Get public profile |
| GET | `/api/profile/[username]?view=hr` | HR-focused data |
| GET | `/api/profile/[username]?view=tech` | Tech-focused data |

---

## 🎨 Public Profile Views

### HR View
Designed for recruiters and non-technical managers:
- Professional summary
- Key strengths (soft skills)
- Business impact achievements
- Growth indicators
- Reliability score

### Tech View
Designed for technical managers and CTOs:
- Technical skills (languages, frameworks, patterns)
- Architecture decisions
- Code quality assessment
- Best practices followed
- Interview topics

---

## 🔒 Security

- **Row Level Security (RLS)** - Users can only access their own data
- **GitHub OAuth** - Secure authentication via Supabase
- **No secrets in code** - All credentials in environment variables
- **HTTPS only** - Secure communication

---

## 🚀 Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/DevProfile-AI)

1. Connect your GitHub repository
2. Add environment variables
3. Deploy!

### Other Platforms
- Netlify
- Railway
- Docker (coming soon)

---

## 📝 Development Roadmap

### ✅ Completed
- [x] Project setup (Nuxt 4, Nuxt UI 4)
- [x] Authentication (Magic Link, GitHub OAuth)
- [x] Repository management & import
- [x] AI-powered repository analysis
- [x] Public profile with HR/Tech views
- [x] Multi-language project support
- [x] Interview topics generation

### 🚧 In Progress
- [ ] Resume Builder with AI
- [ ] PDF export
- [ ] Profile customization

### 📋 Planned
- [ ] Credit system & payments
- [ ] Company profiles
- [ ] Job matching
- [ ] Analytics dashboard

---

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) first.

```bash
# Fork the repository
# Create your feature branch
git checkout -b feature/amazing-feature

# Commit your changes
git commit -m 'Add amazing feature'

# Push to the branch
git push origin feature/amazing-feature

# Open a Pull Request
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Nuxt](https://nuxt.com) - The Intuitive Vue Framework
- [Nuxt UI](https://ui.nuxt.com) - Beautiful UI components
- [Supabase](https://supabase.com) - The Open Source Firebase Alternative
- [OpenAI](https://openai.com) - AI/LLM provider

---

## 📬 Contact

- **Issues**: [GitHub Issues](https://github.com/your-username/DevProfile-AI/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/DevProfile-AI/discussions)

---

<p align="center">
  Made with ❤️ for developers who want to showcase their real skills
</p>
