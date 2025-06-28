"use client"

import { useState } from "react"
import { Mic, Send, Play, Home, MessageCircle, Brain, Volume2, User, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

type Page = "dashboard" | "doubt" | "quiz" | "voice" | "profile"

interface QuizQuestion {
  id: number
  question: string
  options: string[]
  correct: number
  explanation: string
}

export default function ConcepTalkApp() {
  const [currentPage, setCurrentPage] = useState<Page>("dashboard")
  const [doubtText, setDoubtText] = useState("")
  const [aiResponse, setAiResponse] = useState("")
  const [followUpText, setFollowUpText] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [vivaQuestion, setVivaQuestion] = useState("")
  const [showQuiz, setShowQuiz] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState("")
  const [showAnswer, setShowAnswer] = useState(false)
  const [quizScore, setQuizScore] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const sampleQuizQuestions: QuizQuestion[] = [
    {
      id: 1,
      question: "What is the time complexity of binary search?",
      options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
      correct: 1,
      explanation:
        "Binary search divides the search space in half with each comparison, resulting in O(log n) time complexity.",
    },
    {
      id: 2,
      question: "Which data structure uses LIFO principle?",
      options: ["Queue", "Stack", "Array", "Linked List"],
      correct: 1,
      explanation:
        "Stack follows Last In First Out (LIFO) principle where the last element added is the first one to be removed.",
    },
    {
      id: 3,
      question: "What does CPU stand for?",
      options: ["Central Processing Unit", "Computer Processing Unit", "Central Program Unit", "Computer Program Unit"],
      correct: 0,
      explanation:
        "CPU stands for Central Processing Unit, which is the main component that executes instructions in a computer.",
    },
  ]

  const recentActivity = [
    { type: "doubt", content: "Explained binary trees", time: "2 hours ago" },
    { type: "quiz", content: "Data Structures Quiz - 85%", time: "1 day ago" },
    { type: "viva", content: "Operating Systems Practice", time: "2 days ago" },
  ]

  const handleAskDoubt = () => {
    if (!doubtText.trim()) return

    // Simulate AI response
    setAiResponse(`Great question! Let me explain this concept step by step:

${
  doubtText.includes("binary")
    ? "Binary search is an efficient algorithm for finding an item from a sorted list. It works by repeatedly dividing the search interval in half. If the value is less than the item in the middle of the interval, it narrows the interval to the lower half. Otherwise, it narrows it to the upper half. The search continues until the value is found or the interval is empty."
    : "This is a fundamental concept in computer science. The key points to understand are: 1) The underlying principles, 2) How it works in practice, 3) When to apply it, and 4) Its advantages and limitations."
}

Would you like me to explain any specific part in more detail?`)
  }

  const handleFollowUp = () => {
    if (!followUpText.trim()) return

    setAiResponse(
      (prev) =>
        prev +
        `\n\n**Follow-up Answer:**\nThat's an excellent follow-up question! ${followUpText.includes("example") ? "Here's a practical example to illustrate the concept..." : "Let me clarify that point further..."}`,
    )
    setFollowUpText("")
  }

  const startVivaPractice = () => {
    const questions = [
      "Explain the difference between stack and heap memory allocation.",
      "What are the advantages of object-oriented programming?",
      "How does a compiler differ from an interpreter?",
      "Explain the concept of polymorphism with an example.",
    ]
    setVivaQuestion(questions[Math.floor(Math.random() * questions.length)])
  }

  const handleRecording = () => {
    setIsRecording(!isRecording)
    if (!isRecording) {
      // Simulate recording
      setTimeout(() => {
        setTranscript(
          "Stack memory is used for static memory allocation where variables are allocated at compile time, while heap memory is used for dynamic memory allocation where variables are allocated at runtime...",
        )
        setIsRecording(false)
      }, 3000)
    }
  }

  const startQuiz = () => {
    setShowQuiz(true)
    setCurrentQuestionIndex(0)
    setQuizScore(0)
    setSelectedAnswer("")
    setShowAnswer(false)
  }

  const handleAnswerSubmit = () => {
    const currentQuestion = sampleQuizQuestions[currentQuestionIndex]
    const isCorrect = Number.parseInt(selectedAnswer) === currentQuestion.correct

    if (isCorrect) {
      setQuizScore((prev) => prev + 1)
    }

    setShowAnswer(true)
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < sampleQuizQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
      setSelectedAnswer("")
      setShowAnswer(false)
    } else {
      // Quiz completed
      setShowQuiz(false)
      alert(`Quiz completed! Your score: ${quizScore}/${sampleQuizQuestions.length}`)
    }
  }

  const NavigationBar = () => (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Brain className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">ConcepTalk</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => setCurrentPage("dashboard")}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                currentPage === "dashboard" ? "text-blue-600 bg-blue-50" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </button>
            <button
              onClick={() => setCurrentPage("doubt")}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                currentPage === "doubt" ? "text-blue-600 bg-blue-50" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Ask Doubt
            </button>
            <button
              onClick={() => setCurrentPage("quiz")}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                currentPage === "quiz" ? "text-blue-600 bg-blue-50" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Brain className="h-4 w-4 mr-2" />
              Quiz
            </button>
            <button
              onClick={() => setCurrentPage("voice")}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                currentPage === "voice" ? "text-blue-600 bg-blue-50" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Volume2 className="h-4 w-4 mr-2" />
              Voice Practice
            </button>
            <button
              onClick={() => setCurrentPage("profile")}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                currentPage === "profile" ? "text-blue-600 bg-blue-50" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <User className="h-4 w-4 mr-2" />
              Profile
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-500 hover:text-gray-700">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {[
              { key: "dashboard", label: "Dashboard", icon: Home },
              { key: "doubt", label: "Ask Doubt", icon: MessageCircle },
              { key: "quiz", label: "Quiz", icon: Brain },
              { key: "voice", label: "Voice Practice", icon: Volume2 },
              { key: "profile", label: "Profile", icon: User },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => {
                  setCurrentPage(key as Page)
                  setMobileMenuOpen(false)
                }}
                className={`flex items-center w-full px-3 py-2 rounded-md text-base font-medium ${
                  currentPage === key ? "text-blue-600 bg-blue-50" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  )

  const DashboardPage = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, future engineer! 🚀</h1>
        <p className="text-gray-600">Ready to master your B.Tech concepts today?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer border-blue-200"
          onClick={() => setCurrentPage("doubt")}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageCircle className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="ml-3 text-lg">Ask a Doubt</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>Get instant AI-powered explanations for any technical concept</CardDescription>
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer border-teal-200"
          onClick={() => setCurrentPage("quiz")}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center">
              <div className="p-2 bg-teal-100 rounded-lg">
                <Brain className="h-6 w-6 text-teal-600" />
              </div>
              <CardTitle className="ml-3 text-lg">Take a Quiz</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>Test your understanding with adaptive quizzes</CardDescription>
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer border-purple-200"
          onClick={() => setCurrentPage("voice")}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Volume2 className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="ml-3 text-lg">Start Viva Practice</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>Practice verbal explanations with AI mock interviews</CardDescription>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div
                    className={`p-2 rounded-full ${
                      activity.type === "doubt"
                        ? "bg-blue-100"
                        : activity.type === "quiz"
                          ? "bg-teal-100"
                          : "bg-purple-100"
                    }`}
                  >
                    {activity.type === "doubt" && <MessageCircle className="h-4 w-4 text-blue-600" />}
                    {activity.type === "quiz" && <Brain className="h-4 w-4 text-teal-600" />}
                    {activity.type === "viva" && <Volume2 className="h-4 w-4 text-purple-600" />}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">{activity.content}</p>
                    <p className="text-sm text-gray-500">{activity.time}</p>
                  </div>
                </div>
                <Badge variant="secondary">{activity.type}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const DoubtSolverPage = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Doubt Solver</h1>
        <p className="text-gray-600">Ask any technical question and get detailed explanations</p>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="relative">
              <Textarea
                placeholder="Type your technical doubt..."
                value={doubtText}
                onChange={(e) => setDoubtText(e.target.value)}
                className="min-h-[120px] pr-12 text-base"
              />
              <button className="absolute right-3 top-3 p-2 text-gray-400 hover:text-gray-600">
                <Mic className="h-5 w-5" />
              </button>
            </div>
            <Button onClick={handleAskDoubt} className="w-full bg-blue-600 hover:bg-blue-700">
              <Send className="h-4 w-4 mr-2" />
              Ask AI
            </Button>
          </div>
        </CardContent>
      </Card>

      {aiResponse && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Brain className="h-5 w-5 mr-2 text-blue-600" />
              AI Response
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="text-gray-800 whitespace-pre-line">{aiResponse}</p>
            </div>

            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask a follow-up question..."
                  value={followUpText}
                  onChange={(e) => setFollowUpText(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleFollowUp} variant="outline">
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              <Button onClick={startQuiz} className="w-full bg-teal-600 hover:bg-teal-700">
                Test My Understanding
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const QuizPage = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Practice</h1>
        <p className="text-gray-600">Test your knowledge with interactive quizzes</p>
      </div>

      {!showQuiz ? (
        <Card>
          <CardHeader>
            <CardTitle>Ready to test your knowledge?</CardTitle>
            <CardDescription>Take a quick quiz to assess your understanding</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={startQuiz} className="w-full bg-teal-600 hover:bg-teal-700">
              Start Quiz
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>
                Question {currentQuestionIndex + 1} of {sampleQuizQuestions.length}
              </CardTitle>
              <Badge variant="outline">
                Score: {quizScore}/{sampleQuizQuestions.length}
              </Badge>
            </div>
            <Progress value={(currentQuestionIndex / sampleQuizQuestions.length) * 100} className="mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <h3 className="text-lg font-medium">{sampleQuizQuestions[currentQuestionIndex].question}</h3>

              <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
                {sampleQuizQuestions[currentQuestionIndex].options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              {!showAnswer ? (
                <Button onClick={handleAnswerSubmit} disabled={!selectedAnswer} className="w-full">
                  Submit Answer
                </Button>
              ) : (
                <div className="space-y-4">
                  <div
                    className={`p-4 rounded-lg ${
                      Number.parseInt(selectedAnswer) === sampleQuizQuestions[currentQuestionIndex].correct
                        ? "bg-green-50 border border-green-200"
                        : "bg-red-50 border border-red-200"
                    }`}
                  >
                    <p
                      className={`font-medium ${
                        Number.parseInt(selectedAnswer) === sampleQuizQuestions[currentQuestionIndex].correct
                          ? "text-green-800"
                          : "text-red-800"
                      }`}
                    >
                      {Number.parseInt(selectedAnswer) === sampleQuizQuestions[currentQuestionIndex].correct
                        ? "✓ Correct!"
                        : "✗ Incorrect"}
                    </p>
                    <p className="text-gray-700 mt-2">{sampleQuizQuestions[currentQuestionIndex].explanation}</p>
                  </div>

                  <Button onClick={nextQuestion} className="w-full">
                    {currentQuestionIndex < sampleQuizQuestions.length - 1 ? "Next Question" : "Finish Quiz"}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const VoicePracticePage = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mock Viva Mode</h1>
        <p className="text-gray-600">Practice explaining concepts verbally with AI feedback</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Viva Practice Session</CardTitle>
            <CardDescription>Click start to begin your mock viva practice</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={startVivaPractice} className="w-full bg-purple-600 hover:bg-purple-700">
              <Play className="h-4 w-4 mr-2" />
              Start Viva Practice
            </Button>
          </CardContent>
        </Card>

        {vivaQuestion && (
          <Card>
            <CardHeader>
              <CardTitle>Viva Question</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-purple-50 p-4 rounded-lg mb-6">
                <p className="text-lg font-medium text-purple-900">{vivaQuestion}</p>
              </div>

              <div className="text-center mb-6">
                <Button
                  onClick={handleRecording}
                  className={`w-32 h-32 rounded-full ${
                    isRecording ? "bg-red-500 hover:bg-red-600 animate-pulse" : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  <Mic className="h-8 w-8" />
                </Button>
                <p className="mt-4 text-gray-600">
                  {isRecording ? "Recording... Click to stop" : "Click to start recording your answer"}
                </p>
              </div>

              {transcript && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Your Response</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <p className="text-gray-800">{transcript}</p>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h4 className="font-medium text-green-800 mb-2">AI Feedback:</h4>
                      <p className="text-green-700">
                        Great explanation! You covered the key concepts well. Consider adding more specific examples to
                        strengthen your answer. Your understanding of the fundamental principles is clear.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )

  const ProfilePage = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
        <p className="text-gray-600">Track your learning progress and achievements</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Learning Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Questions Asked</span>
                <Badge>127</Badge>
              </div>
              <div className="flex justify-between">
                <span>Quizzes Completed</span>
                <Badge>23</Badge>
              </div>
              <div className="flex justify-between">
                <span>Viva Sessions</span>
                <Badge>15</Badge>
              </div>
              <div className="flex justify-between">
                <span>Average Quiz Score</span>
                <Badge variant="secondary">82%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl mr-3">🏆</div>
                <div>
                  <p className="font-medium">Quiz Master</p>
                  <p className="text-sm text-gray-600">Completed 20+ quizzes</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl mr-3">🎯</div>
                <div>
                  <p className="font-medium">Curious Learner</p>
                  <p className="text-sm text-gray-600">Asked 100+ questions</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl mr-3">🎤</div>
                <div>
                  <p className="font-medium">Viva Champion</p>
                  <p className="text-sm text-gray-600">Completed 10+ viva sessions</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar />

      {currentPage === "dashboard" && <DashboardPage />}
      {currentPage === "doubt" && <DoubtSolverPage />}
      {currentPage === "quiz" && <QuizPage />}
      {currentPage === "voice" && <VoicePracticePage />}
      {currentPage === "profile" && <ProfilePage />}
    </div>
  )
}
