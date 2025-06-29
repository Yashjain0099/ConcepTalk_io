
"use client"
import ReactMarkdown from "react-markdown";
import { useState, useEffect, useRef } from "react"
import { Mic, Send, Play, Home, MessageCircle, Brain, Volume2, User, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import * as THREE from 'three'

type Page = "dashboard" | "doubt" | "quiz" | "voice" | "profile"

interface ChatMessage {
  role: 'user' | 'model'
  text: string
}

interface QuizQuestion {
  question: string
  options: string[]
  correct: string
  explanation?: string
}

// Three.js Scene Component
const ThreeScene = () => {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const frameRef = useRef<number>(0)

  useEffect(() => {
    if (!mountRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf0f8ff)
    
    const camera = new THREE.PerspectiveCamera(75, 400 / 300, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(400, 300)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    
    mountRef.current.appendChild(renderer.domElement)
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
    scene.add(ambientLight)
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(10, 10, 5)
    directionalLight.castShadow = true
    scene.add(directionalLight)
    
    // Create animated geometry
    const geometry = new THREE.BoxGeometry(2, 2, 2)
    const material = new THREE.MeshLambertMaterial({ color: 0x00ff88 })
    const cube = new THREE.Mesh(geometry, material)
    cube.castShadow = true
    scene.add(cube)
    
    // Ground plane
    const planeGeometry = new THREE.PlaneGeometry(10, 10)
    const planeMaterial = new THREE.MeshLambertMaterial({ color: 0x999999 })
    const plane = new THREE.Mesh(planeGeometry, planeMaterial)
    plane.rotation.x = -Math.PI / 2
    plane.position.y = -2
    plane.receiveShadow = true
    scene.add(plane)
    
    camera.position.z = 5
    
    // Animation loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate)
      
      cube.rotation.x += 0.01
      cube.rotation.y += 0.01
      
      renderer.render(scene, camera)
    }
    
    animate()
    
    // Store refs
    sceneRef.current = scene
    rendererRef.current = renderer
    
    // Cleanup
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [])

  return <div ref={mountRef} className="w-full h-64 flex justify-center items-center bg-gray-100 rounded-lg" />
}

const SYSTEM_PROMPT: ChatMessage = {
  role: 'user',
   text: `
You are an expert AI-powered academic revision tutor named "ConcepTalk", specialized in providing **concise, high-impact explanations** of B.Tech engineering concepts. Your core mission is to enable students to **quickly revise and solidify their understanding** of fundamental topics.

**Your core responsibilities and guidelines are as follows:**

1.  **Audience & Purpose:**
  * **Audience:** B.Tech students seeking a rapid, clear, and accurate revision of core engineering concepts.
  * **Purpose:** To provide essential information for quick grasp, not exhaustive detail. Every word counts for clarity and brevity.

2.  **Output Format (Strict Adherence Required):**
  * Use the exact heading structure provided below.
  * Each section should be concise and to the point.

  - Use Markdown headings (###) for each section title (e.g., ### 1. Introduction).
- Use numbered or bulleted lists only when listing items, not for section titles.
- Do NOT use asterisks for section titles or formatting except for lists.
- Each section should be concise and to the point.

Here's the required output structure (use these as Markdown headings):

### 1. Introduction
[A brief, 1-2 sentence definition or overview of the concept.]

### 2. Core Concept Explained
...

### 3. Key Aspects/Types (If Applicable)
...

### 4. Real-World Example
...

### 5. Why it's Important (Key Takeaway)
...
3.  **Content Guidelines:**
  * **Brevity is King:** Aim for maximum information density in minimal words.
  * **Clarity:** Even when brief, explanations must be perfectly clear and easy to understand.
  * **Technical Accuracy:** Do not compromise on correctness.
  * **No Rambling:** Avoid anecdotes, extensive background, or non-essential details.
  * **No External Links or Diagrams (Directly):** Do not provide external links. If a diagram is crucial, *very briefly mention* what it *would* show (e.g., "Think of a graph showing..."), but do not describe it in detail as this is for quick text-based revision.
  * **Mathematical Notation:** Use sparingly and only for core equations if essential, ensuring immediate plain-text explanation.

**Confidence Level:** 10/10 - This system prompt is precisely tailored to generate concise, highly scannable, and accurate revision content for B.Tech students, strictly adhering to the requested heading format.

**Initial User Query Expectation:**
The user will provide a specific B.Tech concept or short question.
*Example User Query:* "Explain 'Polymorphism' in OOP for revision."

**Your response to the user's concept/question will directly follow these concise guidelines."**

`
};
export default function ConcepTalkApp() {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => [SYSTEM_PROMPT]);
  const [currentPage, setCurrentPage] = useState<Page>("dashboard")
  const [currentInput, setCurrentInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [lastAIResponseText, setLastAIResponseText] = useState<string>('')
  const [doubtText, setDoubtText] = useState("")
  const [followUpText, setFollowUpText] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [vivaQuestion, setVivaQuestion] = useState("")
  const [showQuiz, setShowQuiz] = useState(false)
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([])
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: number]: string}>({})
  const [quizFeedback, setQuizFeedback] = useState<{[key: number]: boolean | null}>({})
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // System prompt


  const recentActivity = [
    { type: "doubt", content: "Explained binary trees", time: "2 hours ago" },
    { type: "quiz", content: "Data Structures Quiz - 85%", time: "1 day ago" },
    { type: "viva", content: "Operating Systems Practice", time: "2 days ago" },
  ]

  // Handle doubt submission
 const handleAskDoubt = async () => {
  console.log("Ask AI clicked", doubtText);
  if (!doubtText.trim()) return
  setErrorMessage(null)
  setIsLoading(true)

  const newUserMessage: ChatMessage = { role: 'user', text: doubtText }
  const updatedHistory = [...chatHistory, newUserMessage]

  setChatHistory(updatedHistory)
  setDoubtText('')

  await sendToAI(updatedHistory)
}
  const sendToAI = async (historyToSend: ChatMessage[]) => {
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatHistory: historyToSend }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get response from AI')
      }

      const data = await response.json()
      const aiResponseText = data.text

      const newAIResponse: ChatMessage = { role: 'model', text: aiResponseText }
      setChatHistory(prev => [...prev, newAIResponse])
      setLastAIResponseText(aiResponseText)
      setShowQuiz(false)

    } catch (error: any) {
      console.error('Error asking AI:', error)
      setErrorMessage(error.message || 'An unexpected error occurred while fetching AI response.')
    } finally {
      setIsLoading(false)
      setDoubtText('')
    }
  }


// Fixed handleGenerateQuiz function to reset state properly
 // Fixed handleGenerateQuiz function to reset state properly
  const handleGenerateQuiz = async () => {
    if (!lastAIResponseText.trim()) {
      setErrorMessage("Please ask a question first to get an AI explanation before generating a quiz.")
      return
    }
    
    setErrorMessage(null)
    setIsLoading(true)
    setCurrentPage("quiz")
    setShowQuiz(true)
    
    // Reset all quiz-related state
    setQuizQuestions([])
    setSelectedAnswers({})
    setQuizFeedback({})

    try {
      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: lastAIResponseText }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate quiz')
      }

      const data = await response.json()
      setQuizQuestions(data.quiz)

    } catch (error: any) {
      console.error('Error generating quiz:', error)
      setErrorMessage(error.message || 'An error occurred while generating the quiz.')
      setShowQuiz(false)
    } finally {
      setIsLoading(false)
    }
  }

const handleSubmitQuiz = () => {
    const newFeedback: {[key: number]: boolean} = {}
    
    quizQuestions.forEach((q, index) => {
      const userAnswer = selectedAnswers[index]
      if (userAnswer) {
        // Check if the selected option starts with the correct answer letter
        const isCorrect = userAnswer.startsWith(q.correct + '.')
        newFeedback[index] = isCorrect
      } else {
        newFeedback[index] = false
      }
    })
    
    setQuizFeedback(newFeedback)
  }
 // Place this at the top level of your component
const [omniActive, setOmniActive] = useState(false);

const injectOmnidimensionScript = () => {
  if (document.getElementById("omnidimension-web-widget")) {
    // Try to auto-click the widget launcher after a short delay
    setTimeout(() => {
      const launcher = document.querySelector('.YOUR-LAUNCHER-CLASS'); // Replace with actual class
      if (launcher) {
        (launcher as HTMLElement).click();
      }
    }, 1000);
    return;
  }
  const script = document.createElement("script");
  script.id = "omnidimension-web-widget";
  script.async = true;
  script.src = "https://backend.omnidim.io/web_widget.js?secret_key=0dcd957afab1a462907fa678d12dc474";
  script.onload = () => {
    setTimeout(() => {
      const launcher = document.querySelector('.YOUR-LAUNCHER-CLASS'); // Replace with actual class
      if (launcher) {
        (launcher as HTMLElement).click();
      }
    }, 1000);
  };
  document.body.appendChild(script);
};


  const startVivaPractice = () => {
  injectOmnidimensionScript();
  setOmniActive(true);
};

  const handleRecording = () => {
    setIsRecording(!isRecording)
    if (!isRecording) {
      setTimeout(() => {
        setTranscript(
          "Stack memory is used for static memory allocation where variables are allocated at compile time, while heap memory is used for dynamic memory allocation where variables are allocated at runtime..."
        )
        setIsRecording(false)
      }, 3000)
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

          <div className="hidden md:flex items-center space-x-8">
            {[
              { key: "dashboard", label: "Dashboard", icon: Home },
              { key: "doubt", label: "Ask Doubt", icon: MessageCircle },
              { key: "quiz", label: "Quiz", icon: Brain },
              { key: "voice", label: "Voice Practice", icon: Volume2 },
              { key: "profile", label: "Profile", icon: User },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setCurrentPage(key as Page)}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  currentPage === key ? "text-blue-600 bg-blue-50" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {label}
              </button>
            ))}
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-500 hover:text-gray-700">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

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
          <div className="mb-6">
            <ThreeScene />
          </div>

          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative text-sm mb-4" role="alert">
              {errorMessage}
            </div>
          )}

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
            <Button 
              onClick={handleAskDoubt} 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Ask AI
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Display chat history */}
      {chatHistory.length > 1 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Conversation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {chatHistory.slice(1).map((message, index) => (
                <div key={index} className={`p-4 rounded-lg ${
                  message.role === 'user' ? 'bg-blue-50 ml-8' : 'bg-gray-50 mr-8'
                }`}>
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${
                      message.role === 'user' ? 'bg-blue-200' : 'bg-gray-200'
                    }`}>
                      {message.role === 'user' ? (
                        <User className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Brain className="h-4 w-4 text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium mb-1">
                        {message.role === 'user' ? 'You' : 'AI Assistant'}
                      </p>
                      {/* Use ReactMarkdown for AI responses */}
                      {message.role === 'model' ? (
                       <div className="prose prose-sm">
                          <ReactMarkdown>{message.text}</ReactMarkdown>
                      </div>
                     ) : (
                      <p className="text-gray-800">{message.text}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {lastAIResponseText && (
        <Button
          onClick={handleGenerateQuiz}
          className="w-full mt-4 bg-teal-600 hover:bg-teal-700"
          disabled={isLoading}
        >
          Test My Understanding
        </Button>
      )}
    </div>
  )

const QuizPage = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Practice</h1>
        <p className="text-gray-600">Test your knowledge with interactive quizzes</p>
      </div>

      {showQuiz && quizQuestions.length > 0 ? (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>
                {Object.keys(quizFeedback).length > 0 ? (
                  <>Quiz Results: {Object.values(quizFeedback).filter(f => f === true).length}/{quizQuestions.length}</>
                ) : (
                  "Quiz in Progress"
                )}
              </CardTitle>
              <Badge variant="outline">
                Answered: {Object.keys(selectedAnswers).length}/{quizQuestions.length}
              </Badge>
            </div>
            {Object.keys(quizFeedback).length > 0 && (
              <Progress 
                value={(Object.values(quizFeedback).filter(f => f === true).length / quizQuestions.length) * 100} 
                className="mt-2" 
              />
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {quizQuestions.map((q, qIndex) => (
                <div key={qIndex} className="space-y-3 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-lg font-medium">Q{qIndex + 1}: {q.question}</h3>
                  
                  <div className="space-y-2">
                    {q.options.map((option, oIndex) => {
                      const optionKey = `q${qIndex}_option${oIndex}`;
                      const isSelected = selectedAnswers[qIndex] === option;
                      const isSubmitted = Object.keys(quizFeedback).length > 0;
                      const isCorrect = option.startsWith(q.correct + '.');
                      const isUserCorrect = quizFeedback[qIndex] === true;
                      
                      let optionClass = "flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors";
                      
                      if (isSubmitted) {
                        if (isSelected && isUserCorrect) {
                          optionClass += " bg-green-50 border-green-300";
                        } else if (isSelected && !isUserCorrect) {
                          optionClass += " bg-red-50 border-red-300";
                        } else if (isCorrect) {
                          optionClass += " bg-green-100 border-green-400";
                        } else {
                          optionClass += " bg-gray-50 border-gray-200";
                        }
                      } else {
                        if (isSelected) {
                          optionClass += " bg-blue-50 border-blue-300";
                        } else {
                          optionClass += " hover:bg-gray-50 border-gray-200";
                        }
                      }

                      return (
                        <div
                          key={optionKey}
                          className={optionClass}
                          onClick={() => {
                            if (!isSubmitted) {
                              setSelectedAnswers(prev => ({
                                ...prev,
                                [qIndex]: option
                              }));
                            }
                          }}
                        >
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            isSelected 
                              ? (isSubmitted 
                                  ? (isUserCorrect ? 'border-green-500 bg-green-500' : 'border-red-500 bg-red-500')
                                  : 'border-blue-500 bg-blue-500'
                                )
                              : 'border-gray-300'
                          }`}>
                            {isSelected && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                          
                          <span className="flex-1 text-sm">{option}</span>
                          
                          {isSubmitted && (
                            <>
                              {isSelected && isUserCorrect && (
                                <span className="text-green-600 font-medium">✓ Correct!</span>
                              )}
                              {isSelected && !isUserCorrect && (
                                <span className="text-red-600 font-medium">✗ Incorrect</span>
                              )}
                              {!isSelected && isCorrect && (
                                <span className="text-green-600 font-medium">✓ Correct Answer</span>
                              )}
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Show explanation after submission if available */}
                  {Object.keys(quizFeedback).length > 0 && q.explanation && q.explanation.trim() && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800">
                        <strong>Explanation:</strong> {q.explanation}
                      </p>
                    </div>
                  )}
                </div>
              ))}

              <div className="flex gap-4">
                {Object.keys(quizFeedback).length === 0 ? (
                  <Button
                    onClick={handleSubmitQuiz}
                    disabled={isLoading || Object.keys(selectedAnswers).length !== quizQuestions.length}
                    className="flex-1 bg-teal-600 hover:bg-teal-700"
                  >
                    {isLoading ? "Submitting..." : "Submit Quiz"}
                  </Button>
                ) : (
                  <>
                    <Button 
                      onClick={() => {
                        setShowQuiz(false);
                        setQuizQuestions([]);
                        setSelectedAnswers({});
                        setQuizFeedback({});
                        setCurrentPage("dashboard");
                      }} 
                      className="flex-1"
                      variant="outline"
                    >
                      Back to Dashboard
                    </Button>
                    <Button 
                      onClick={() => {
                        setSelectedAnswers({});
                        setQuizFeedback({});
                        handleGenerateQuiz();
                      }} 
                      className="flex-1 bg-teal-600 hover:bg-teal-700"
                    >
                      Try Another Quiz
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Ready to test your knowledge?</CardTitle>
            <CardDescription>
              {isLoading ? "Generating quiz questions..." : "Click to start a quiz based on your recent doubts!"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => handleGenerateQuiz()} 
              className="w-full bg-teal-600 hover:bg-teal-700" 
              disabled={isLoading || !lastAIResponseText}
            >
              {isLoading ? "Generating..." : "Start Quiz"}
            </Button>
            {!lastAIResponseText && (
              <p className="text-sm text-gray-500 mt-2 text-center">
                Ask a question first to generate a quiz
              </p>
            )}
            {isLoading && (
              <div className="flex items-center justify-center mt-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
              </div>
            )}
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
      {!omniActive ? (
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
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Omnidimension AI Agent Active</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-purple-700">
              The AI agent is now active in the bottom right corner. Start your viva practice there!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  </div>
);

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
