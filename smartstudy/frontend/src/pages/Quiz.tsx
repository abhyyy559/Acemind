import React, { useState } from "react";
import { ApiError } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: string;
}

interface QuizData {
  id: string;
  questions: Question[];
  topic: string;
  difficulty: string;
}

interface QuizResult {
  score: number;
  totalQuestions: number;
  percentage: number;
  answers: { [questionId: string]: string };
  timeSpent: number;
}

const Quiz: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"generate" | "take" | "results">(
    "generate"
  );
  const [inputMethod, setInputMethod] = useState<"text" | "pdf">("text");
  const [textInput, setTextInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [topic, setTopic] = useState("");
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
      setError(null);
    } else {
      setError(
        new ApiError("Please select a valid PDF file", "VALIDATION_ERROR")
      );
    }
  };

  const handleGenerateQuiz = async () => {
    setError(null);
    setGeneratedQuiz(null);
    setIsGenerating(true);

    try {
      // Use DeepSeek API directly to generate questions
      const content = inputMethod === "text" ? textInput : "PDF content"; // TODO: Extract PDF text
      const prompt = `
You are an expert educational content creator. Generate 5 multiple-choice questions based on the following content.

Content: "${content}"
Topic: ${topic || "General"}
Difficulty: ${difficulty}

Requirements:
1. Create questions that test understanding, not just memorization
2. Each question should have 4 options (A, B, C, D)
3. Provide clear explanations for correct answers
4. Questions should be directly related to the provided content
5. Vary question types (definition, application, analysis)

Format your response as a JSON array with this structure:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A",
    "explanation": "Detailed explanation of why this is correct",
    "difficulty": "${difficulty}"
  }
]

Ensure the JSON is valid and complete.`;

      // Call DeepSeek API
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://acemind.onrender.com'}/quiz/generate-deepseek`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          content,
          topic: topic || "General",
          difficulty,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      // Parse the generated questions
      const questions: Question[] = data.questions.map(
        (q: any, index: number) => ({
          id: `q${index + 1}`,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          difficulty: q.difficulty || difficulty,
        })
      );

      const quizData: QuizData = {
        id: `quiz-${Date.now()}`,
        questions,
        topic: topic || "Generated Quiz",
        difficulty,
      };

      setGeneratedQuiz(quizData);
      setActiveTab("take");
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setQuizStartTime(Date.now());
    } catch (err) {
      console.error("Quiz generation error:", err);
      
      // Fallback: Generate basic questions from content
      console.log('Using fallback quiz generation...');
      const content = inputMethod === "text" ? textInput : "PDF content";
      const fallbackQuestions: Question[] = generateFallbackQuestions(content, topic || 'General', difficulty);
      
      const quizData: QuizData = {
        id: `quiz-${Date.now()}`,
        questions: fallbackQuestions,
        topic: topic || 'Generated Quiz (Offline Mode)',
        difficulty,
      };

      setGeneratedQuiz(quizData);
      setActiveTab("take");
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setQuizStartTime(Date.now());
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
  };

  const handleNextQuestion = () => {
    if (
      generatedQuiz &&
      currentQuestionIndex < generatedQuiz.questions.length - 1
    ) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmitQuiz = () => {
    if (!generatedQuiz) return;

    const timeSpent = Math.round((Date.now() - quizStartTime) / 1000);
    let score = 0;

    generatedQuiz.questions.forEach((question) => {
      if (userAnswers[question.id] === question.correctAnswer) {
        score++;
      }
    });

    const result: QuizResult = {
      score,
      totalQuestions: generatedQuiz.questions.length,
      percentage: Math.round((score / generatedQuiz.questions.length) * 100),
      answers: userAnswers,
      timeSpent,
    };

    setQuizResults(result);
    setActiveTab("results");
  };

  const resetQuiz = () => {
    setGeneratedQuiz(null);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setQuizResults(null);
    setActiveTab("generate");
  };

  // Fallback question generation when API is not available
  const generateFallbackQuestions = (content: string, topic: string, difficulty: string): Question[] => {
    const words = content.toLowerCase().split(/\s+/);
    const keyTerms = [...new Set(words.filter(word => word.length > 5))].slice(0, 5);
    
    return [
      {
        id: '1',
        question: `What is the main topic discussed in the content about ${topic}?`,
        options: [
          `The primary focus is on ${keyTerms[0] || 'key concepts'}`,
          'Secondary supporting information',
          'Background context only',
          'Unrelated information'
        ],
        correctAnswer: `The primary focus is on ${keyTerms[0] || 'key concepts'}`,
        explanation: 'This represents the main theme identified in the provided content.',
        difficulty
      },
      {
        id: '2',
        question: `Which concept appears most frequently in the material?`,
        options: [
          keyTerms[1] || 'Important concept',
          'Minor detail',
          'Example only',
          'Irrelevant information'
        ],
        correctAnswer: keyTerms[1] || 'Important concept',
        explanation: 'This concept appears frequently and is central to understanding the material.',
        difficulty
      },
      {
        id: '3',
        question: `Based on the content, what would be the best study approach?`,
        options: [
          'Focus on understanding key concepts and their relationships',
          'Memorize all details without understanding',
          'Skip difficult parts',
          'Only read once quickly'
        ],
        correctAnswer: 'Focus on understanding key concepts and their relationships',
        explanation: 'Understanding concepts and their relationships leads to better retention and application.',
        difficulty
      },
      {
        id: '4',
        question: `What type of learning material was provided?`,
        options: [
          'Educational study content',
          'Entertainment material',
          'News article',
          'Advertisement'
        ],
        correctAnswer: 'Educational study content',
        explanation: 'The content was provided as educational study material for learning purposes.',
        difficulty
      },
      {
        id: '5',
        question: `How can you best apply knowledge from this ${topic} content?`,
        options: [
          'Practice with examples and relate to real-world scenarios',
          'Just memorize the facts',
          'Ignore practical applications',
          'Only focus on theoretical aspects'
        ],
        correctAnswer: 'Practice with examples and relate to real-world scenarios',
        explanation: 'Applying knowledge through practice and real-world connections enhances learning and retention.',
        difficulty
      }
    ];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-600 dark:bg-indigo-500 rounded-3xl mb-6 shadow-2xl">
          <span className="text-4xl">🧠</span>
        </div>
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
          AI Quiz Generator
        </h1>
        <p className="text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
          Transform your study materials into personalized quizzes using
          DeepSeek AI
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab("generate")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
              activeTab === "generate"
                ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-lg"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            📝 Generate Quiz
          </button>
          <button
            onClick={() => setActiveTab("take")}
            disabled={!generatedQuiz}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
              activeTab === "take" && generatedQuiz
                ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-lg"
                : generatedQuiz
                ? "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                : "text-gray-400 dark:text-gray-600 cursor-not-allowed"
            }`}
          >
            🎯 Take Quiz
          </button>
          <button
            onClick={() => setActiveTab("results")}
            disabled={!quizResults}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
              activeTab === "results" && quizResults
                ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-lg"
                : quizResults
                ? "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                : "text-gray-400 dark:text-gray-600 cursor-not-allowed"
            }`}
          >
            📊 Results
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <ErrorMessage
          error={error}
          onRetry={() => setError(null)}
          className="mb-8"
        />
      )}

      {/* Generate Quiz Tab */}
      {activeTab === "generate" && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-10 shadow-2xl">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 flex items-center">
              <span className="w-10 h-10 bg-blue-600 dark:bg-blue-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <span className="text-white text-lg">✨</span>
              </span>
              Generate Your Quiz
            </h2>

            {/* Topic Input */}
            <div className="mb-8">
              <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Quiz Topic (Optional)
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Biology Chapter 5, Photosynthesis, etc."
                className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 text-lg bg-white dark:bg-gray-700"
              />
            </div>

            {/* Difficulty Selection */}
            <div className="mb-8">
              <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Difficulty Level
              </label>
              <div className="flex gap-3 p-2 bg-gray-100 dark:bg-gray-700 rounded-2xl">
                <button
                  onClick={() => setDifficulty("easy")}
                  className={`flex-1 px-6 py-3 rounded-xl font-semibold text-lg transition-all duration-200 ${
                    difficulty === "easy"
                      ? "bg-white dark:bg-gray-600 text-green-600 dark:text-green-400 shadow-lg"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  😊 Easy
                </button>
                <button
                  onClick={() => setDifficulty("medium")}
                  className={`flex-1 px-6 py-3 rounded-xl font-semibold text-lg transition-all duration-200 ${
                    difficulty === "medium"
                      ? "bg-white dark:bg-gray-600 text-yellow-600 dark:text-yellow-400 shadow-lg"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  😐 Medium
                </button>
                <button
                  onClick={() => setDifficulty("hard")}
                  className={`flex-1 px-6 py-3 rounded-xl font-semibold text-lg transition-all duration-200 ${
                    difficulty === "hard"
                      ? "bg-white dark:bg-gray-600 text-red-600 dark:text-red-400 shadow-lg"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  😰 Hard
                </button>
              </div>
            </div>

            {/* Input Method Toggle */}
            <div className="mb-10">
              <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-6">
                Choose Input Method
              </label>
              <div className="flex gap-3 p-2 bg-gray-100 dark:bg-gray-700 rounded-2xl">
                <button
                  onClick={() => {
                    setInputMethod("text");
                    setSelectedFile(null);
                    setError(null);
                  }}
                  className={`flex-1 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
                    inputMethod === "text"
                      ? "bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-lg"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  📝 Text Input
                </button>
                <button
                  onClick={() => {
                    setInputMethod("pdf");
                    setTextInput("");
                    setError(null);
                  }}
                  className={`flex-1 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
                    inputMethod === "pdf"
                      ? "bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-lg"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  📄 PDF Upload
                </button>
              </div>
            </div>

            {/* Text Input */}
            {inputMethod === "text" && (
              <div className="mb-10">
                <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  Study Content
                </label>
                <div className="relative">
                  <textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Paste your study material here... For example: 'Photosynthesis is the process by which plants convert sunlight, carbon dioxide, and water into glucose and oxygen...'"
                    className="w-full h-56 p-6 border-2 border-gray-200 dark:border-gray-600 rounded-2xl resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 text-lg leading-relaxed bg-white dark:bg-gray-700"
                  />
                  <div className="absolute bottom-4 right-4 text-sm text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-700 px-2 py-1 rounded-lg">
                    {textInput.length} / 50 minimum
                  </div>
                </div>
                <div className="flex items-center mt-4">
                  <div
                    className={`w-4 h-4 rounded-full mr-3 ${
                      textInput.length >= 50
                        ? "bg-green-400"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  ></div>
                  <p
                    className={`text-lg ${
                      textInput.length >= 50
                        ? "text-green-600 dark:text-green-400"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {textInput.length >= 50
                      ? "Ready to generate!"
                      : "Need at least 50 characters"}
                  </p>
                </div>
              </div>
            )}

            {/* PDF Upload */}
            {inputMethod === "pdf" && (
              <div className="mb-10">
                <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  Upload PDF Document
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-16 text-center hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors duration-200">
                  {selectedFile ? (
                    <div className="text-center">
                      <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <svg
                          className="w-10 h-10 text-green-500 dark:text-green-400"
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
                      <p className="text-2xl font-medium text-gray-700 dark:text-gray-300 mb-3">
                        {selectedFile.name}
                      </p>
                      <p className="text-lg text-gray-500 dark:text-gray-400 mb-6">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <button
                        onClick={() => setSelectedFile(null)}
                        className="px-6 py-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-xl hover:bg-red-200 dark:hover:bg-red-800 transition-colors duration-200 font-medium"
                      >
                        Remove File
                      </button>
                    </div>
                  ) : (
                    <div className="text-gray-500 dark:text-gray-400">
                      <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <svg
                          className="w-10 h-10 text-indigo-500 dark:text-indigo-400"
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
                      <p className="text-2xl font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Drag and drop your PDF here
                      </p>
                      <p className="text-lg text-gray-500 dark:text-gray-400 mb-6">
                        or click to browse
                      </p>
                      <label className="inline-flex items-center px-6 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl text-lg text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200">
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
                        PDF files only, max 10MB
                        <input
                          type="file"
                          accept=".pdf"
                          className="hidden"
                          onChange={handleFileSelect}
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={handleGenerateQuiz}
              disabled={isGenerating || !canGenerate()}
              className={`w-full py-5 px-8 rounded-2xl font-bold text-xl transition-all duration-200 ${
                isGenerating || !canGenerate()
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                  : "bg-green-600 dark:bg-green-500 text-white hover:bg-green-700 dark:hover:bg-green-600 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1"
              }`}
            >
              {isGenerating ? (
                <div className="flex items-center justify-center">
                  <LoadingSpinner
                    size="sm"
                    color="text-white"
                    className="mr-4"
                  />
                  Generating Quiz with DeepSeek AI...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <span className="mr-3 text-2xl">🚀</span>
                  Generate AI Quiz
                </div>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Take Quiz Tab */}
      {activeTab === "take" && generatedQuiz && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-10 shadow-2xl">
            {/* Quiz Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {generatedQuiz.topic}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  Question {currentQuestionIndex + 1} of{" "}
                  {generatedQuiz.questions.length}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Difficulty: {generatedQuiz.difficulty}
                </div>
                <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 w-32">
                  <div
                    className="bg-indigo-600 dark:bg-indigo-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        ((currentQuestionIndex + 1) /
                          generatedQuiz.questions.length) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Current Question */}
            {generatedQuiz.questions[currentQuestionIndex] && (
              <div className="mb-8">
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                  {generatedQuiz.questions[currentQuestionIndex].question}
                </h3>

                {/* Answer Options */}
                <div className="space-y-4">
                  {generatedQuiz.questions[currentQuestionIndex].options.map(
                    (option, index) => {
                      const questionId =
                        generatedQuiz.questions[currentQuestionIndex].id;
                      const isSelected = userAnswers[questionId] === option;
                      const optionLabel = String.fromCharCode(65 + index); // A, B, C, D

                      return (
                        <button
                          key={index}
                          onClick={() => handleAnswerSelect(questionId, option)}
                          className={`w-full p-4 text-left rounded-2xl border-2 transition-all duration-200 ${
                            isSelected
                              ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300"
                              : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-700"
                          }`}
                        >
                          <div className="flex items-center space-x-4">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                                isSelected
                                  ? "bg-indigo-500 text-white"
                                  : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
                              }`}
                            >
                              {optionLabel}
                            </div>
                            <span className="text-lg text-gray-900 dark:text-white">
                              {option}
                            </span>
                          </div>
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  currentQuestionIndex === 0
                    ? "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                ← Previous
              </button>

              <div className="flex space-x-4">
                {currentQuestionIndex < generatedQuiz.questions.length - 1 ? (
                  <button
                    onClick={handleNextQuestion}
                    disabled={
                      !userAnswers[
                        generatedQuiz.questions[currentQuestionIndex].id
                      ]
                    }
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                      !userAnswers[
                        generatedQuiz.questions[currentQuestionIndex].id
                      ]
                        ? "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                        : "bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-600"
                    }`}
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={
                      Object.keys(userAnswers).length !==
                      generatedQuiz.questions.length
                    }
                    className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 ${
                      Object.keys(userAnswers).length !==
                      generatedQuiz.questions.length
                        ? "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                        : "bg-green-600 dark:bg-green-500 text-white hover:bg-green-700 dark:hover:bg-green-600 shadow-lg"
                    }`}
                  >
                    🎯 Submit Quiz
                  </button>
                )}
              </div>
            </div>

            {/* Question Overview */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Question Overview
              </h4>
              <div className="flex flex-wrap gap-2">
                {generatedQuiz.questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`w-10 h-10 rounded-lg font-semibold transition-all duration-200 ${
                      index === currentQuestionIndex
                        ? "bg-indigo-600 text-white"
                        : userAnswers[generatedQuiz.questions[index].id]
                        ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Tab - Enhanced Design */}
      {activeTab === "results" && quizResults && generatedQuiz && (
        <div className="max-w-6xl mx-auto">
          {/* Celebration Banner */}
          <div className={`relative overflow-hidden rounded-3xl mb-8 ${
            quizResults.percentage >= 80
              ? "bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500"
              : quizResults.percentage >= 60
              ? "bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500"
              : "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"
          }`}>
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <div className="relative px-8 py-12 text-center text-white">
              <div className="inline-block animate-bounce mb-4">
                <div className="text-7xl">
                  {quizResults.percentage >= 80
                    ? "🏆"
                    : quizResults.percentage >= 60
                    ? "🎯"
                    : "💪"}
                </div>
              </div>
              <h1 className="text-5xl font-bold mb-4 drop-shadow-lg">
                {quizResults.percentage >= 80
                  ? "Outstanding Performance!"
                  : quizResults.percentage >= 60
                  ? "Great Job!"
                  : "Keep Going!"}
              </h1>
              <p className="text-2xl opacity-90">
                {quizResults.percentage >= 80
                  ? "You've mastered this topic! 🌟"
                  : quizResults.percentage >= 60
                  ? "You're on the right track! 🚀"
                  : "Practice makes perfect! 📚"}
              </p>
            </div>
          </div>

          {/* Main Results Card */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl mb-8">
            {/* Score Circle */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <svg className="transform -rotate-90" width="200" height="200">
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-gray-200 dark:text-gray-700"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 90}`}
                    strokeDashoffset={`${2 * Math.PI * 90 * (1 - quizResults.percentage / 100)}`}
                    className={`transition-all duration-1000 ${
                      quizResults.percentage >= 80
                        ? "text-green-500"
                        : quizResults.percentage >= 60
                        ? "text-yellow-500"
                        : "text-blue-500"
                    }`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className={`text-5xl font-bold ${
                      quizResults.percentage >= 80
                        ? "text-green-600 dark:text-green-400"
                        : quizResults.percentage >= 60
                        ? "text-yellow-600 dark:text-yellow-400"
                        : "text-blue-600 dark:text-blue-400"
                    }`}>
                      {quizResults.percentage}%
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                      Score
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-2xl border-2 border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">✅</span>
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {quizResults.score}
                  </span>
                </div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Correct Answers
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 p-6 rounded-2xl border-2 border-red-200 dark:border-red-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">❌</span>
                  <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {quizResults.totalQuestions - quizResults.score}
                  </span>
                </div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Incorrect Answers
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-2xl border-2 border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">⏱️</span>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {Math.floor(quizResults.timeSpent / 60)}:{(quizResults.timeSpent % 60).toString().padStart(2, "0")}
                  </span>
                </div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Time Taken
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-2xl border-2 border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">📊</span>
                  <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {Math.round((quizResults.timeSpent / quizResults.totalQuestions))}s
                  </span>
                </div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Avg per Question
                </div>
              </div>
            </div>

            {/* Performance Insights */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800 mb-8">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <span className="text-2xl mr-2">💡</span>
                Performance Insights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">
                    {quizResults.percentage >= 80 ? "🌟" : quizResults.percentage >= 60 ? "⭐" : "💫"}
                  </span>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {quizResults.percentage >= 80
                        ? "Excellent Understanding"
                        : quizResults.percentage >= 60
                        ? "Good Grasp"
                        : "Needs More Practice"}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {quizResults.percentage >= 80
                        ? "You've demonstrated mastery of this topic"
                        : quizResults.percentage >= 60
                        ? "You understand most concepts well"
                        : "Review the material and try again"}
                    </div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      Accuracy Rate
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {quizResults.score} out of {quizResults.totalQuestions} questions correct
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Question Review */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <span className="text-3xl mr-3">📝</span>
                Detailed Review
              </h3>
              <div className="space-y-6">
                {generatedQuiz.questions.map((question, index) => {
                  const userAnswer = quizResults.answers[question.id];
                  const isCorrect = userAnswer === question.correctAnswer;

                  return (
                    <div
                      key={question.id}
                      className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-300 hover:shadow-xl ${
                        isCorrect
                          ? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-300 dark:border-green-700"
                          : "bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-300 dark:border-red-700"
                      }`}
                    >
                      {/* Status Badge */}
                      <div className={`absolute top-0 right-0 px-4 py-2 rounded-bl-2xl text-white font-bold ${
                        isCorrect ? "bg-green-500" : "bg-red-500"
                      }`}>
                        {isCorrect ? "✓ CORRECT" : "✗ INCORRECT"}
                      </div>

                      <div className="p-6 pt-12">
                        {/* Question */}
                        <div className="flex items-start mb-6">
                          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4 ${
                            isCorrect ? "bg-green-500" : "bg-red-500"
                          }`}>
                            {index + 1}
                          </div>
                          <h4 className="font-bold text-gray-900 dark:text-white text-xl leading-relaxed">
                            {question.question}
                          </h4>
                        </div>

                        {/* Answers */}
                        <div className="space-y-4 mb-6">
                          {/* User's Answer */}
                          <div className={`p-4 rounded-xl border-2 ${
                            isCorrect
                              ? "bg-green-100 dark:bg-green-900/30 border-green-400 dark:border-green-600"
                              : "bg-red-100 dark:bg-red-900/30 border-red-400 dark:border-red-600"
                          }`}>
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
                                  Your Answer:
                                </div>
                                <div className={`font-semibold text-lg ${
                                  isCorrect
                                    ? "text-green-800 dark:text-green-200"
                                    : "text-red-800 dark:text-red-200"
                                }`}>
                                  {userAnswer || "No answer provided"}
                                </div>
                              </div>
                              <span className="text-3xl">
                                {isCorrect ? "✅" : "❌"}
                              </span>
                            </div>
                          </div>

                          {/* Correct Answer (if wrong) */}
                          {!isCorrect && (
                            <div className="p-4 rounded-xl border-2 bg-green-100 dark:bg-green-900/30 border-green-400 dark:border-green-600">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
                                    Correct Answer:
                                  </div>
                                  <div className="font-semibold text-lg text-green-800 dark:text-green-200">
                                    {question.correctAnswer}
                                  </div>
                                </div>
                                <span className="text-3xl">💡</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Explanation */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-5 rounded-xl border-2 border-blue-200 dark:border-blue-800">
                          <div className="flex items-start">
                            <span className="text-2xl mr-3">📚</span>
                            <div>
                              <div className="font-bold text-blue-900 dark:text-blue-200 mb-2">
                                Explanation:
                              </div>
                              <div className="text-blue-800 dark:text-blue-300 leading-relaxed">
                                {question.explanation}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            <button
              onClick={resetQuiz}
              className="group relative px-8 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-bold text-lg shadow-2xl hover:shadow-3xl transform hover:-translate-y-1"
            >
              <span className="flex items-center justify-center">
                <span className="text-2xl mr-3 group-hover:rotate-180 transition-transform duration-500">🔄</span>
                Retake Quiz
              </span>
            </button>
            <button
              onClick={() => setActiveTab("generate")}
              className="group px-8 py-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600 rounded-2xl hover:border-indigo-500 dark:hover:border-indigo-400 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <span className="flex items-center justify-center">
                <span className="text-2xl mr-3 group-hover:scale-110 transition-transform duration-300">📝</span>
                Generate New Quiz
              </span>
            </button>
            <button
              onClick={() => window.print()}
              className="group px-8 py-5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-bold text-lg shadow-2xl hover:shadow-3xl transform hover:-translate-y-1"
            >
              <span className="flex items-center justify-center">
                <span className="text-2xl mr-3 group-hover:scale-110 transition-transform duration-300">🖨️</span>
                Print Results
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Quiz;
