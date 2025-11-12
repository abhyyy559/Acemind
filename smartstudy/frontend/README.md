# 🎓 SmartStudy - React Frontend

A beautiful, modern study platform built with React, Vite, and Tailwind CSS.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation & Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Start development server:**
```bash
npm run dev
```

3. **Open your browser:**
Go to `http://localhost:3000`

## 🎯 Features

### ✨ **Modern UI/UX**
- **Glassmorphism Design** - Beautiful frosted glass effects
- **Gradient Backgrounds** - Stunning color schemes throughout
- **Smooth Animations** - Hover effects and transitions
- **Fully Responsive** - Perfect on all devices

### 🧭 **Complete Navigation**
- 🏠 **Dashboard** - Overview with stats and quick actions
- 📅 **Study Planner** - Interactive calendar and task management
- 🧠 **AI Quiz Generator** - Create quizzes from study materials
- 🎯 **Focus Room** - Immersive study environment
- 📝 **Smart Notes** - Organize and search notes
- 📊 **Analytics** - Performance tracking and insights

### 🔗 **Backend Integration**
- **API Ready** - Connects to NestJS backend on port 4000
- **Quiz Generation** - Real API calls to generate quizzes
- **Error Handling** - Graceful error management
- **Loading States** - Smooth user feedback

## 🛠️ Tech Stack

- **React 18** - Modern React with hooks
- **Vite** - Lightning fast build tool
- **TypeScript** - Type safety and better DX
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing

## 📁 Project Structure

```
smartstudy-react/
├── src/
│   ├── components/
│   │   └── Layout.tsx          # Main layout with navigation
│   ├── pages/
│   │   ├── Home.tsx           # Dashboard homepage
│   │   ├── Quiz.tsx           # AI Quiz Generator
│   │   ├── Planner.tsx        # Study Planner
│   │   ├── Focus.tsx          # Focus Room
│   │   ├── Notes.tsx          # Smart Notes
│   │   └── Analytics.tsx      # Analytics Dashboard
│   ├── App.tsx                # Main app component
│   ├── main.tsx              # App entry point
│   └── index.css             # Global styles
├── index.html                # HTML template
├── package.json              # Dependencies
├── tailwind.config.js        # Tailwind configuration
├── vite.config.ts           # Vite configuration
└── README.md                # This file
```

## 🎨 Design System

### **Color Palette**
- **Primary**: Indigo to Purple gradients
- **Secondary**: Blue to Cyan gradients  
- **Success**: Green to Emerald gradients
- **Warning**: Yellow to Orange gradients
- **Accent**: Purple to Pink gradients

### **Components**
- **Cards**: Glassmorphism with subtle shadows
- **Buttons**: Gradient backgrounds with hover effects
- **Forms**: Clean inputs with focus states
- **Navigation**: Active states and smooth transitions

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🌟 Key Features Implemented

### **Homepage Dashboard**
- Real-time clock and date display
- Study statistics cards
- Feature navigation cards with hover effects
- Responsive grid layout

### **AI Quiz Generator**
- Text input with character validation
- PDF upload interface (UI ready)
- Real-time API integration
- Success/error feedback
- Sample quiz preview

### **Study Planner**
- Interactive calendar
- Task management with checkboxes
- Progress tracking
- Subject organization
- Quick action buttons

### **Smart Notes**
- Search and filter functionality
- Category organization
- Tag system
- Responsive card layout

### **Analytics Dashboard**
- Performance statistics
- Visual progress bars
- Weekly study hours chart
- Achievement system

### **Focus Room**
- Ambient sound controls
- Pomodoro timer
- Immersive design

## 🔗 Backend Connection

The frontend is configured to connect to your NestJS backend:

- **Backend URL**: `http://localhost:4000`
- **Quiz API**: `/quiz/generate` endpoint
- **Error Handling**: Graceful fallbacks for connection issues

## 🎉 What's Working

✅ **Full Navigation** - All pages connected and working  
✅ **Responsive Design** - Perfect on all screen sizes  
✅ **Interactive Elements** - Buttons, forms, animations  
✅ **API Integration** - Quiz generation with backend  
✅ **Modern Styling** - Beautiful glassmorphism UI  
✅ **Type Safety** - Full TypeScript support  

## 🚀 Next Steps

1. **Start the backend server** (port 4000)
2. **Run the React app** (`npm run dev`)
3. **Test the quiz generation** feature
4. **Explore all the pages** and features

**Your SmartStudy React app is ready to go! 🎓✨**