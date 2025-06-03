# AttackForge

**LLM Adversarial Testing Platform** - Interactive adversarial testing of LLMs with human-in-the-loop editing capabilities.

AttackForge is a full-stack monorepo application designed for AI safety researchers to conduct systematic adversarial testing of Large Language Models. It enables step-by-step conversations between different models with human oversight and editing capabilities at each step.

## ✨ Features

- **🎯 Model-Agnostic**: Works with any OpenAI-compatible API endpoint
- **🔄 Step-by-Step Flow**: Red Teamer → Target → Judge (optional) with human approval at each step
- **✏️ Inline Editing**: Edit any message before proceeding to the next step
- **🔒 Client-Side Security**: All API keys stored locally, never sent to our servers
- **🔧 Simple Setup**: One model configuration serves all roles with custom system prompts
- **💾 Session Management**: Save, load, and export conversation sessions
- **📊 Export Options**: JSON and Markdown export formats
- **🎨 Modern UI**: Built with Next.js 15 and shadcn/ui components

## 🏗️ Architecture

```
AttackForge/
├── apps/
│   ├── web/                 # Next.js 15 frontend (TypeScript)
│   └── api/                 # FastAPI backend (Python 3.12+)
├── packages/
│   └── shared/              # Shared TypeScript types and schemas
├── package.json             # Root workspace configuration
├── turbo.json              # Turborepo build pipeline
└── README.md
```

### Tech Stack

**Frontend:**
- Next.js 15 with App Router
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Zustand for state management
- React Hook Form + Zod validation

**Backend:**
- FastAPI
- Pydantic v2 for validation
- httpx for API requests
- JSON file storage (simple and effective)

**Shared:**
- TypeScript types
- Zod schemas for validation

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ and Yarn 1.22+
- Python 3.12+
- API keys for LLM providers (OpenRouter, OpenAI, etc.)

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd AttackForge
   yarn install
   ```

2. **Build the shared package:**
   ```bash
   yarn build
   ```

3. **Install Python dependencies:**
   ```bash
   cd apps/api
   pip install -r requirements.txt
   cd ../..
   ```

### Development

1. **Start both frontend and backend:**
   ```bash
   yarn dev
   ```

   This will start:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:8000

2. **Or start individually:**
   ```bash
   # Frontend only
   cd apps/web && yarn dev
   
   # Backend only
   cd apps/api && yarn dev
   ```

## 📖 Usage Guide

### 1. Configure a Model

You only need one model configuration to get started:

1. Click "Models" in the top navigation
2. Click "Add Model" to create a new configuration
3. Fill in the required fields:
   - **Name**: Friendly name for the model
   - **API URL**: OpenAI-compatible endpoint (e.g., `https://openrouter.ai/api/v1/chat/completions`)
   - **Model**: Model identifier (e.g., `openai/gpt-4`)
   - **API Key**: Your API key for authentication
   - **System Prompt**: Optional default system prompt

4. Use "Test Connection" to verify the configuration works

### 2. Create a Session

1. Click "New Session" to create an adversarial testing session
2. Give your session a descriptive name
3. Select your model configuration
4. Customize system prompts for each role:
   - **Red Teamer Prompt**: Instructions for generating adversarial prompts
   - **Target Prompt**: Instructions for the model being tested
   - **Judge Prompt**: Optional instructions for safety evaluation
5. Choose whether to include the judge role

### 3. Conduct Testing

1. Click "Generate" to start the conversation
2. Review the generated message and either:
   - **Accept & Continue**: Use the message as-is and proceed
   - **Edit**: Modify the message before proceeding
   - **Reject & Regenerate**: Generate a new message
3. Continue the conversation flow: Red Teamer → Target → Judge (if configured)
4. Export results when complete

### 4. Manage Sessions

- **View**: Browse all sessions on the dashboard
- **Load**: Resume any previous session
- **Export**: Download conversations in JSON or Markdown format
- **Delete**: Remove sessions you no longer need

## 🛡️ Security & Privacy

- **🔐 API Keys**: Stored locally in browser storage, never transmitted to AttackForge servers
- **💻 Local Data**: Sessions stored locally in browser, with optional backend sync
- **🌐 CORS**: Backend configured for local development (update for production)
- **⚠️ Production**: Review CORS settings and add authentication before deploying

## 🔧 Configuration

### Environment Variables

Create `.env.local` files as needed:

**Frontend (`apps/web/.env.local`):**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Backend (`apps/api/.env`):**
```env
# Add any environment-specific configurations here
```

### API Providers

AttackForge works with any OpenAI-compatible API:

- **OpenRouter**: `https://openrouter.ai/api/v1/chat/completions`
- **OpenAI**: `https://api.openai.com/v1/chat/completions`
- **Local APIs**: Any local deployment following OpenAI format
- **Other Providers**: Anthropic, Cohere, etc. (via compatibility layers)

## 🛠️ Development

### Build Commands

```bash
# Development
yarn dev          # Start all services
yarn build        # Build all packages
yarn type-check   # Type checking
yarn lint         # Linting

# Individual packages
cd apps/web && yarn dev      # Frontend only
cd apps/api && yarn dev      # Backend only
cd packages/shared && yarn build  # Shared package
```

### Project Structure

```
apps/web/src/
├── app/                    # Next.js App Router pages
├── components/             # React components
│   ├── ui/                # shadcn/ui components
│   ├── conversation-view.tsx
│   ├── model-config-dialog.tsx
│   └── session-setup-dialog.tsx
├── stores/                # Zustand stores
├── lib/                   # Utilities and API client
└── ...

apps/api/app/
├── main.py                # FastAPI app with all routes
├── models.py              # Pydantic models
├── storage.py             # JSON file storage
├── client.py              # httpx API client
└── ...

packages/shared/src/
├── types.ts               # TypeScript interfaces
├── schemas.ts             # Zod validation schemas
└── index.ts               # Package exports
```

## 🚀 Deployment

### Frontend (Vercel/Netlify)

1. Build the project: `yarn build`
2. Deploy the `apps/web` directory
3. Set environment variables for API URL

### Backend (Railway/Heroku/VPS)

1. Deploy the `apps/api` directory
2. Install Python dependencies: `pip install -r requirements.txt`
3. Start with: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Full Stack (Docker)

Create Dockerfile for each service or use docker-compose for local development.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Documentation**: [Coming Soon]
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)

## ⚠️ Disclaimer

AttackForge is designed for research and security testing purposes. Users are responsible for complying with all applicable laws and the terms of service of the AI providers they use. Always conduct testing ethically and responsibly.

---

**Built with ❤️ for AI Safety Research**
