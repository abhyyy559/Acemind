# SmartStudy - AI Study Companion

A full-stack application designed to help students study more effectively with AI assistance.

## Project Structure

```
smartStudy/
├─ frontend/                # Next.js + TS frontend
│  ├─ public/
│  ├─ src/
│  │  ├─ pages/
│  │  ├─ components/
│  │  ├─ features/
│  │  └─ styles/
│  ├─ package.json
│  └─ tsconfig.json
├─ backend/                 # NestJS backend
│  ├─ src/
│  │  ├─ main.ts
│  │  ├─ app.module.ts
│  │  ├─ modules/
│  │  │  ├─ auth/
│  │  │  ├─ users/
│  │  │  └─ notes/
│  ├─ package.json
│  └─ tsconfig.json
└─ .github/
   └─ workflows/ci.yml
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (local installation)

### Development

1. Clone the repository
2. Start the backend:
   ```
   cd backend
   npm install
   npm run start:dev
   ```
3. Start the frontend:
   ```
   cd frontend
   npm install
   npm run dev
   ```

### Database Setup

Install and run MongoDB locally:

1. Download and install MongoDB from the [official website](https://www.mongodb.com/try/download/community)
2. Start the MongoDB service
3. Create a database named `smartstudy`

## Features

- User authentication and authorization
- Note taking and organization
- AI-powered study assistance
- Focus mode with visual aids

## License

MIT