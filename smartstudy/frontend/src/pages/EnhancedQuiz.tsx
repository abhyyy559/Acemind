import React, { useState, useEffect, useRef } from "react";
import { ApiError } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import { MultiStepLoader } from "@/components/ui/multi-step-loader";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  difficulty: string;
}

interface QuizData {
  id: string;
  questions: Question[];
  topic: string;
  difficulty: string;
  metadata?: {
    total_questions: number;
    content_analyzed: {
      word_count: number;
      character_count: number;
      estimated_reading_time: number;
    };
    generation_method: string;
    estimated_completion_time: number;
  };
}

interface QuizResult {
  score: number;
  totalQuestions: number;
  percentage: number;
  answers: { [questionId: string]: string };
  timeSpent: number;
  detailedResults: {
    questionId: string;
    question: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    explanation?: string;
  }[];
}

const EnhancedQuiz: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"generate" | "take" | "results">(
    "generate"
  );
  const [inputMethod, setInputMethod] = useState<"text" | "pdf" | "url">("text");
  const [textInput, setTextInput] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [topic, setTopic] = useState("");
  const [numQuestions, setNumQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium"
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<QuizData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{
    [questionId: string]: string;
  }>({});
  const [quizStartTime, setQuizStartTime] = useState<number>(0);
  const [quizResults, setQuizResults] = useState<QuizResult | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [quizHistory, setQuizHistory] = useState<QuizResult[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Loading states for multi-step loader
  const loadingStates = [
    { text: "Analyzing your content..." },
    { text: "Extracting key concepts..." },
    { text: "Generating intelligent questions..." },
    { text: "Creating answer options..." },
    { text: "Validating question quality..." },
    { text: "Finalizing your quiz..." },
  ];

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTab === "take" && quizStartTime > 0) {
      interval = setInterval(() => {
        setTimeElapsed(Math.floor((Date.now() - quizStartTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTab, quizStartTime]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only handle shortcuts when taking quiz
      if (activeTab !== 'take' || !generatedQuiz) return;

      // Prevent shortcuts when typing in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const currentQuestion = generatedQuiz.questions[currentQuestionIndex];
      
      switch(e.key) {
        case ' ': // Space = Next question
          e.preventDefault();
          handleNextQuestion();
          break;
        case 'Enter': // Enter = Submit quiz
          if (currentQuestionIndex === generatedQuiz.questions.length - 1) {
            e.preventDefault();
            handleSubmitQuiz();
          }
          break;
        case '1':
        case '2':
        case '3':
        case '4':
          // Number keys = Select option
          e.preventDefault();
          const optionIndex = parseInt(e.key) - 1;
          if (currentQuestion && optionIndex < currentQuestion.options.length) {
            handleAnswerSelect(currentQuestion.id, currentQuestion.options[optionIndex]);
          }
          break;
        case 'ArrowLeft': // Previous question
          e.preventDefault();
          handlePreviousQuestion();
          break;
        case 'ArrowRight': // Next question
          e.preventDefault();
          handleNextQuestion();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [activeTab, generatedQuiz, currentQuestionIndex]);

  // Load quiz history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('quizHistory');
    if (savedHistory) {
      setQuizHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save quiz result to history
  const saveToHistory = (result: QuizResult) => {
    const newHistory = [
      {
        ...result,
        topic: generatedQuiz?.topic || 'Quiz',
        date: new Date().toISOString(),
      },
      ...quizHistory
    ].slice(0, 10); // Keep only last 10
    
    setQuizHistory(newHistory);
    localStorage.setItem('quizHistory', JSON.stringify(newHistory));
  };

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
      setError(null);
    } else {
      setError(
        new ApiError("Please select a valid PDF file", "VALIDATION_ERROR")
      );
    }
  };

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleGenerateQuiz = async () => {
    setError(null);
    setGeneratedQuiz(null);
    setIsGenerating(true);

    try {
      let content = "";

      // Handle URL input
      if (inputMethod === "url" && urlInput.trim()) {
        const formData = new FormData();
        formData.append("url", urlInput);
        if (topic) formData.append("topic", topic);
        formData.append("num_questions", numQuestions.toString());

        const response = await fetch(
          "http://localhost:4000/quiz/v2/generate-from-url-fast",
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error(`URL processing failed: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success && data.questions) {
          const quizData: QuizData = {
            id: `quiz-${Date.now()}`,
            questions: data.questions.map((q: any, index: number) => ({
              id: q.id || `q${index + 1}`,
              question: q.question,
              options: q.options,
              correctAnswer: q.correctAnswer || q.options[0],
              explanation: q.explanation,
              difficulty: q.difficulty || difficulty,
            })),
            topic: data.topic || topic || "URL Quiz",
            difficulty: data.difficulty || difficulty,
            metadata: data.metadata,
          };

          setGeneratedQuiz(quizData);
          setActiveTab("take");
          setCurrentQuestionIndex(0);
          setUserAnswers({});
          setQuizStartTime(Date.now());
          return;
        } else {
          throw new Error("Invalid URL response format");
        }
      }

      if (inputMethod === "text") {
        content = textInput;
      } else if (selectedFile) {
        // For PDF, we'll send the file to the backend
        const formData = new FormData();
        formData.append("file", selectedFile);
        if (topic) formData.append("topic", topic);
        formData.append("difficulty", difficulty);
        formData.append("num_questions", numQuestions.toString());

        const response = await fetch(
          "http://localhost:4000/quiz/v2/generate-from-pdf-fast",
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error(`PDF processing failed: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success && data.questions) {
          const quizData: QuizData = {
            id: `quiz-${Date.now()}`,
            questions: data.questions.map((q: any, index: number) => ({
              id: q.id || `q${index + 1}`,
              question: q.question,
              options: q.options,
              correctAnswer: q.correctAnswer || q.options[0],
              explanation: q.explanation,
              difficulty: q.difficulty || difficulty,
            })),
            topic: data.topic || topic || "PDF Quiz",
            difficulty: data.difficulty || difficulty,
            metadata: data.metadata,
          };

          setGeneratedQuiz(quizData);
          setActiveTab("take");
          setCurrentQuestionIndex(0);
          setUserAnswers({});
          setQuizStartTime(Date.now());
          return;
        } else {
          throw new Error("Invalid PDF response format");
        }
      }

      // For text input, use the fast V2 endpoint
      const response = await fetch(
        "http://localhost:4000/quiz/v2/generate-fast",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content,
            topic: topic || "Study Material",
            num_questions: numQuestions,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.questions) {
        const quizData: QuizData = {
          id: `quiz-${Date.now()}`,
          questions: data.questions.map((q: any, index: number) => ({
            id: q.id || `q${index + 1}`,
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer || q.options[0],
            explanation: q.explanation,
            difficulty: q.difficulty || difficulty,
          })),
          topic: data.topic || topic || "Generated Quiz",
          difficulty: data.difficulty || difficulty,
          metadata: data.metadata,
        };

        setGeneratedQuiz(quizData);
        setActiveTab("take");
        setCurrentQuestionIndex(0);
        setUserAnswers({});
        setQuizStartTime(Date.now());
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Quiz generation error:", err);
      setError(
        new ApiError(
          err instanceof Error ? err.message : "Failed to generate quiz",
          "GENERATION_ERROR"
        )
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const canGenerate = () => {
    if (inputMethod === "text") {
      return textInput.trim().length >= 50;
    } else {
      return selectedFile !== null;
    }
  };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
    setShowExplanation(false);
  };

  const downloadReport = () => {
    if (!quizResults || !generatedQuiz) return;
    
    // Dynamically import the PDF generator
    import('../utils/pdfGenerator').then(({ generateQuizReportPDF }) => {
      generateQuizReportPDF(quizResults, generatedQuiz);
    });
  };

  const handleNextQuestion = () => {
    if (
      generatedQuiz &&
      currentQuestionIndex < generatedQuiz.questions.length - 1
    ) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setShowExplanation(false);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setShowExplanation(false);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!generatedQuiz) return;

    setIsSubmitting(true);
    const timeSpent = Math.round((Date.now() - quizStartTime) / 1000);
    let score = 0;
    const detailedResults: QuizResult["detailedResults"] = [];

    generatedQuiz.questions.forEach((question) => {
      const userAnswer = userAnswers[question.id] || "";
      const isCorrect = userAnswer === question.correctAnswer;

      if (isCorrect) {
        score++;
      }

      detailedResults.push({
        questionId: question.id,
        question: question.question,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation,
      });
    });

    const result: QuizResult = {
      score,
      totalQuestions: generatedQuiz.questions.length,
      percentage: Math.round((score / generatedQuiz.questions.length) * 100),
      answers: userAnswers,
      timeSpent,
      detailedResults,
    };

    // Simulate API call delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setQuizResults(result);
    saveToHistory(result); // Save to history
    setActiveTab("results");
    setIsSubmitting(false);
  };

  const resetQuiz = () => {
    setGeneratedQuiz(null);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setQuizResults(null);
    setTimeElapsed(0);
    setQuizStartTime(0);
    setActiveTab("generate");
    setShowExplanation(false);
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600 dark:text-green-400";
    if (percentage >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreEmoji = (percentage: number) => {
    // Removed emojis for cleaner UI
    return "";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.504 1.132a1 1 0 01.992 0l1.75 1a1 1 0 11-.992 1.736L10 3.152l-1.254.716a1 1 0 11-.992-1.736l1.75-1zM5.618 4.504a1 1 0 01-.372 1.364L5.016 6l.23.132a1 1 0 11-.992 1.736L3 7.723V8a1 1 0 01-2 0V6a.996.996 0 01.52-.878l1.734-.99a1 1 0 011.364.372zm8.764 0a1 1 0 011.364-.372l1.734.99A.996.996 0 0118 6v2a1 1 0 11-2 0v-.277l-1.254.145a1 1 0 11-.992-1.736L14.984 6l-.23-.132a1 1 0 01-.372-1.364zm-7 4a1 1 0 011.364-.372L10 8.848l1.254-.716a1 1 0 11.992 1.736L11 10.723V12a1 1 0 11-2 0v-1.277l-1.246-.855a1 1 0 01-.372-1.364zM3 11a1 1 0 011 1v1.277l1.246.855a1 1 0 11-.992 1.736l-1.75-1A1 1 0 012 14v-2a1 1 0 011-1zm14 0a1 1 0 011 1v2a1 1 0 01-.504.868l-1.75 1a1 1 0 11-.992-1.736L16 13.277V12a1 1 0 011-1zm-9.618 5.504a1 1 0 011.364-.372l.254.145V16a1 1 0 112 0v.277l.254-.145a1 1 0 11.992 1.736l-1.735.992a.995.995 0 01-1.022 0l-1.735-.992a1 1 0 01-.372-1.364z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            AI Quiz Generator
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Transform your study materials into personalized quizzes with AI
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white dark:bg-gray-800 p-1 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab("generate")}
              className={`px-6 py-3 rounded-lg font-semibold text-sm ${
                activeTab === "generate"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              Generate Quiz
            </button>
            <button
              onClick={() => setActiveTab("take")}
              disabled={!generatedQuiz}
              className={`px-6 py-3 rounded-lg font-semibold text-sm ${
                activeTab === "take" && generatedQuiz
                  ? "bg-green-600 text-white shadow-md"
                  : generatedQuiz
                  ? "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                  : "text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50"
              }`}
            >
              Take Quiz
            </button>
            <button
              onClick={() => setActiveTab("results")}
              disabled={!quizResults}
              className={`px-6 py-3 rounded-lg font-semibold text-sm ${
                activeTab === "results" && quizResults
                  ? "bg-teal-600 text-white shadow-md"
                  : quizResults
                  ? "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                  : "text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50"
              }`}
            >
              Results
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-4xl mx-auto mb-8">
            <ErrorMessage
              error={error}
              onRetry={() => setError(null)}
              className="rounded-2xl"
            />
          </div>
        )}

        {/* Generate Quiz Tab */}
        {activeTab === "generate" && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Create Your Quiz
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Upload content and let AI generate personalized questions
                </p>
              </div>

              {/* Topic Input */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Quiz Topic (Optional)
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Machine Learning Basics, Photosynthesis, World War II..."
                  className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700"
                />
              </div>

              {/* Difficulty Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Difficulty Level
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    {
                      value: "easy",
                      label: "Easy",
                      color: "green",
                    },
                    {
                      value: "medium",
                      label: "Medium",
                      color: "blue",
                    },
                    { value: "hard", label: "Hard", color: "red" },
                  ].map(({ value, label, color }) => (
                    <button
                      key={value}
                      onClick={() => setDifficulty(value as any)}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                        difficulty === value
                          ? color === "green"
                            ? "bg-green-600 text-white"
                            : color === "blue"
                            ? "bg-blue-600 text-white"
                            : "bg-red-600 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Method Toggle */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Choose Input Method
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => {
                      setInputMethod("text");
                      setSelectedFile(null);
                      setUrlInput("");
                      setError(null);
                    }}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      inputMethod === "text"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    Text Input
                  </button>
                  <button
                    onClick={() => {
                      setInputMethod("pdf");
                      setTextInput("");
                      setUrlInput("");
                      setError(null);
                    }}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      inputMethod === "pdf"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    PDF Upload
                  </button>
                  <button
                    onClick={() => {
                      setInputMethod("url");
                      setTextInput("");
                      setSelectedFile(null);
                      setError(null);
                    }}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      inputMethod === "url"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    URL Input
                  </button>
                </div>
              </div>

              {/* Text Input */}
              {inputMethod === "text" && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Study Content
                  </label>
                  <div className="relative">
                    <textarea
                      value={textInput}
                      onChange={(e) => {
                        const text = e.target.value;
                        setTextInput(text);
                        // Auto-calculate questions: 1 question per ~100 words, min 5, max 20
                        const wordCount = text.trim().split(/\s+/).length;
                        const suggested = Math.min(20, Math.max(5, Math.floor(wordCount / 100)));
                        setNumQuestions(suggested);
                      }}
                      placeholder="Paste your study material here... The more detailed content you provide, the better questions AI can generate. Include definitions, examples, processes, and key concepts."
                      className="w-full h-64 p-8 border-2 border-gray-200 dark:border-gray-600 rounded-2xl resize-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 text-lg leading-relaxed bg-white dark:bg-gray-700 shadow-inner"
                    />
                    <div className="absolute bottom-6 right-6 flex items-center space-x-4">
                      <div
                        className={`px-3 py-1 rounded-lg text-sm font-medium ${
                          textInput.length >= 50
                            ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {textInput.length} / 50 minimum
                      </div>
                      <div
                        className={`w-3 h-3 rounded-full ${
                          textInput.length >= 50
                            ? "bg-green-400"
                            : "bg-gray-300 dark:bg-gray-600"
                        }`}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              {/* PDF Upload */}
              {inputMethod === "pdf" && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Upload PDF Document
                  </label>
                  <div
                    className={`border-2 border-dashed rounded-3xl p-16 text-center transition-all duration-300 ${
                      dragActive
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : selectedFile
                        ? "border-green-400 bg-green-50 dark:bg-green-900/20"
                        : "border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    {selectedFile ? (
                      <div className="text-center">
                        <div className="w-24 h-24 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                          <svg
                            className="w-12 h-12 text-green-500 dark:text-green-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <p className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-3">
                          {selectedFile.name}
                        </p>
                        <p className="text-lg text-gray-500 dark:text-gray-400 mb-6">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB •
                          Ready to process
                        </p>
                        <button
                          onClick={() => setSelectedFile(null)}
                          className="px-6 py-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-xl hover:bg-red-200 dark:hover:bg-red-800 transition-all duration-300 font-bold transform hover:scale-105"
                        >
                          Remove File
                        </button>
                      </div>
                    ) : (
                      <div className="text-gray-500 dark:text-gray-400">
                        <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
                          <svg
                            className="w-12 h-12 text-blue-500 dark:text-blue-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                        </div>
                        <p className="text-3xl font-bold text-gray-700 dark:text-gray-300 mb-4">
                          Drag and drop your PDF here
                        </p>
                        <p className="text-xl text-gray-500 dark:text-gray-400 mb-8">
                          or click to browse files
                        </p>
                        <label className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold cursor-pointer hover:bg-blue-700 transition-all">
                          <svg
                            className="w-5 h-5 mr-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Choose PDF File
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf"
                            className="hidden"
                            onChange={handleFileInputChange}
                          />
                        </label>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-4">
                          PDF files only, max 10MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* URL Input */}
              {inputMethod === "url" && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Enter Web URL
                  </label>
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://example.com/article"
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-lg"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    📰 Supports: Articles, Wikipedia, Documentation, Blog posts
                  </p>
                </div>
              )}

              {/* Number of Questions */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Number of Questions: {numQuestions}
                </label>
                <input
                  type="range"
                  min="5"
                  max="20"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>5 (Quick)</span>
                  <span>10 (Balanced)</span>
                  <span>20 (Comprehensive)</span>
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerateQuiz}
                disabled={isGenerating || !canGenerate()}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                  isGenerating || !canGenerate()
                    ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {isGenerating ? (
                  <div className="flex items-center justify-center">
                    <LoadingSpinner
                      size="sm"
                      color="text-white"
                      className="mr-3"
                    />
                    <span>Generating Quiz with AI...</span>
                  </div>
                ) : (
                  "Generate AI-Powered Quiz"
                )}
              </button>

              {generatedQuiz?.metadata && (
                <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                  <h3 className="text-lg font-bold text-blue-800 dark:text-blue-300 mb-4">
                    Content Analysis Complete
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {generatedQuiz.metadata.content_analyzed.word_count}
                      </div>
                      <div className="text-blue-700 dark:text-blue-300">
                        Words
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {generatedQuiz.metadata.total_questions}
                      </div>
                      <div className="text-blue-700 dark:text-blue-300">
                        Questions
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {
                          generatedQuiz.metadata.content_analyzed
                            .estimated_reading_time
                        }
                        m
                      </div>
                      <div className="text-blue-700 dark:text-blue-300">
                        Read Time
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {Math.round(
                          generatedQuiz.metadata.estimated_completion_time
                        )}
                        m
                      </div>
                      <div className="text-blue-700 dark:text-blue-300">
                        Quiz Time
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Take Quiz Tab */}
        {activeTab === "take" && generatedQuiz && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              {/* Quiz Header with Timer */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {generatedQuiz.topic}
                  </h2>
                  <div className="flex items-center gap-3 bg-blue-600 px-5 py-2 rounded-lg shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <div className="text-2xl font-bold text-white">
                      {formatTime(timeElapsed)}
                    </div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${((currentQuestionIndex + 1) / generatedQuiz.questions.length) * 100}%`,
                    }}
                  ></div>
                </div>
                
                {/* Question Navigation */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {generatedQuiz.questions.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                        index === currentQuestionIndex
                          ? 'bg-blue-600 text-white shadow-lg scale-110'
                          : userAnswers[generatedQuiz.questions[index].id]
                          ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-2 border-green-500'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
                
                <div className="flex items-center justify-between">
                  <p className="text-lg text-gray-600 dark:text-gray-300">
                    Question {currentQuestionIndex + 1} of {generatedQuiz.questions.length}
                  </p>
                  <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">1-4</kbd>
                    <span>Select</span>
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">Space</kbd>
                    <span>Next</span>
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">←→</kbd>
                    <span>Navigate</span>
                  </div>
                </div>
              </div>

              {/* Current Question */}
              {generatedQuiz.questions[currentQuestionIndex] && (
                <div className="mb-10">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-8 rounded-2xl mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white leading-relaxed">
                      {generatedQuiz.questions[currentQuestionIndex].question}
                    </h3>
                  </div>

                  {/* Answer Options */}
                  <div className="space-y-4">
                    {generatedQuiz.questions[currentQuestionIndex].options.map(
                      (option, index) => {
                        const questionId =
                          generatedQuiz.questions[currentQuestionIndex].id;
                        const isSelected = userAnswers[questionId] === option;
                        const optionLabel = String.fromCharCode(65 + index);

                        return (
                          <button
                            key={index}
                            onClick={() =>
                              handleAnswerSelect(questionId, option)
                            }
                            className={`w-full p-6 text-left rounded-2xl border-2 transition-all duration-300 transform hover:scale-[1.02] ${
                              isSelected
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-lg"
                                : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-700 hover:shadow-md"
                            }`}
                          >
                            <div className="flex items-center space-x-6">
                              <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                                  isSelected
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
                                }`}
                              >
                                {optionLabel}
                              </div>
                              <span className="text-xl text-gray-900 dark:text-white flex-1">
                                {option}
                              </span>
                            </div>
                          </button>
                        );
                      }
                    )}
                  </div>

                  {/* Show Explanation Button */}
                  {userAnswers[
                    generatedQuiz.questions[currentQuestionIndex].id
                  ] &&
                    generatedQuiz.questions[currentQuestionIndex]
                      .explanation && (
                      <div className="mt-6">
                        <button
                          onClick={() => setShowExplanation(!showExplanation)}
                          className="px-6 py-3 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-xl hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-all duration-300 font-medium"
                        >
                          {showExplanation ? "Hide" : "Show"} Explanation
                        </button>
                        {showExplanation && (
                          <div className="mt-4 p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl border-l-4 border-yellow-400">
                            <p className="text-yellow-800 dark:text-yellow-200 text-lg">
                              {
                                generatedQuiz.questions[currentQuestionIndex]
                                  .explanation
                              }
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between">
                <button
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform ${
                    currentQuestionIndex === 0
                      ? "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105"
                  }`}
                >
                  ← Previous
                </button>

                <div className="text-center">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Answered: {Object.keys(userAnswers).length} /{" "}
                    {generatedQuiz.questions.length}
                  </div>
                  <div className="flex space-x-2">
                    {generatedQuiz.questions.map((_, index) => (
                      <div
                        key={index}
                        className={`w-3 h-3 rounded-full ${
                          userAnswers[generatedQuiz.questions[index].id]
                            ? "bg-green-400"
                            : index === currentQuestionIndex
                            ? "bg-blue-400"
                            : "bg-gray-300 dark:bg-gray-600"
                        }`}
                      ></div>
                    ))}
                  </div>
                </div>

                {currentQuestionIndex < generatedQuiz.questions.length - 1 ? (
                  <button
                    onClick={handleNextQuestion}
                    className="px-8 py-4 bg-blue-500 text-white rounded-2xl font-bold text-lg hover:bg-blue-600 transition-all duration-300 transform hover:scale-105"
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={
                      isSubmitting || Object.keys(userAnswers).length === 0
                    }
                    className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform ${
                      isSubmitting || Object.keys(userAnswers).length === 0
                        ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 shadow-lg"
                    }`}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <LoadingSpinner
                          size="sm"
                          color="text-white"
                          className="mr-2"
                        />
                        Submitting...
                      </div>
                    ) : (
                      "Submit Quiz 🎯"
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Results Tab */}
        {activeTab === "results" && quizResults && generatedQuiz && (
          <div className="max-w-5xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              {/* Results Header */}
              <div className="text-center mb-12">
                <div className="text-8xl mb-6">
                  {getScoreEmoji(quizResults.percentage)}
                </div>
                <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
                  Quiz Complete!
                </h2>
                <div
                  className={`text-6xl font-bold mb-4 ${getScoreColor(
                    quizResults.percentage
                  )}`}
                >
                  {quizResults.percentage}%
                </div>
                <p className="text-2xl text-gray-600 dark:text-gray-300">
                  You scored {quizResults.score} out of{" "}
                  {quizResults.totalQuestions} questions correctly
                </p>
                <p className="text-lg text-gray-500 dark:text-gray-400 mt-2">
                  Time taken: {formatTime(quizResults.timeSpent)}
                </p>
                
                {/* Download Button */}
                <button
                  onClick={downloadReport}
                  className="mt-6 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  📥 Download Report
                </button>
              </div>

              {/* Performance Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-2xl text-center">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                    {quizResults.score}
                  </div>
                  <div className="text-green-700 dark:text-green-300 font-medium">
                    Correct Answers
                  </div>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-2xl text-center">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {formatTime(quizResults.timeSpent)}
                  </div>
                  <div className="text-blue-700 dark:text-blue-300 font-medium">
                    Total Time
                  </div>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-2xl text-center">
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                    {Math.round(
                      quizResults.timeSpent / quizResults.totalQuestions
                    )}
                    s
                  </div>
                  <div className="text-purple-700 dark:text-purple-300 font-medium">
                    Avg per Question
                  </div>
                </div>
              </div>

              {/* Detailed Results */}
              <div className="mb-12">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Detailed Results
                </h3>
                <div className="space-y-6">
                  {quizResults.detailedResults.map((result, index) => (
                    <div
                      key={result.questionId}
                      className={`p-6 rounded-2xl border-2 ${
                        result.isCorrect
                          ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                          : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex-1">
                          {index + 1}. {result.question}
                        </h4>
                        <div
                          className={`px-4 py-2 rounded-full text-sm font-bold ${
                            result.isCorrect
                              ? "bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200"
                              : "bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200"
                          }`}
                        >
                          {result.isCorrect ? "✓ Correct" : "✗ Incorrect"}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            Your answer:{" "}
                          </span>
                          <span
                            className={
                              result.isCorrect
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }
                          >
                            {result.userAnswer || "No answer selected"}
                          </span>
                        </div>
                        {!result.isCorrect && (
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              Correct answer:{" "}
                            </span>
                            <span className="text-green-600 dark:text-green-400">
                              {result.correctAnswer}
                            </span>
                          </div>
                        )}
                        {result.explanation && (
                          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                            <span className="font-medium text-blue-800 dark:text-blue-300">
                              Explanation:{" "}
                            </span>
                            <span className="text-blue-700 dark:text-blue-200">
                              {result.explanation}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={resetQuiz}
                  className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <span className="mr-2">🔄</span>
                  Create New Quiz
                </button>
                <button
                  onClick={() => setActiveTab("take")}
                  className="px-8 py-4 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <span className="mr-2">🔁</span>
                  Retake Quiz
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedQuiz;



