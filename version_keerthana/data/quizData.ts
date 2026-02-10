export type QuestionType = "single" | "multi" | "scenario" | "code";

export type QuizQuestion = {
  id: string;
  type: QuestionType;
  question: string;
  codeSnippet?: string;
  scenario?: string;
  options: { id: string; text: string; isCorrect: boolean }[];
  explanation?: string;
  points: number;
};

export type QuizConfig = {
  id: string;
  assignmentId: string;
  title: string;
  course: string;
  module: string;
  questionCount: number;
  timeLimitMinutes: number;
  passingScore: number;
  attemptLimit: number;
  instructions: string[];
  questions: QuizQuestion[];
};

export type QuizAttempt = {
  id: string;
  quizId: string;
  attemptNumber: number;
  score: number;
  totalPoints: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  passed: boolean;
  startedAt: string;
  completedAt: string;
  durationSeconds: number;
  answers: Record<string, string[]>;
};

export const quizConfigs: Record<string, QuizConfig> = {
  "13": {
    id: "13",
    assignmentId: "13",
    title: "Module Quiz: REST API Concepts",
    course: "REST API Development",
    module: "API Fundamentals",
    questionCount: 5,
    timeLimitMinutes: 15,
    passingScore: 70,
    attemptLimit: 2,
    instructions: [
      "This quiz contains 5 questions covering REST API fundamentals.",
      "You have 15 minutes to complete the quiz.",
      "Each question must be answered before moving to the next.",
      "The quiz will auto-submit when time expires.",
      "You may navigate between questions using Previous and Next buttons.",
    ],
    questions: [
      {
        id: "q1",
        type: "single",
        question: "Which HTTP method is used to retrieve a resource without modifying it?",
        options: [
          { id: "a", text: "GET", isCorrect: true },
          { id: "b", text: "POST", isCorrect: false },
          { id: "c", text: "PUT", isCorrect: false },
          { id: "d", text: "DELETE", isCorrect: false },
        ],
        explanation: "GET is the standard HTTP method for retrieving data. It should not have any side effects.",
        points: 1,
      },
      {
        id: "q2",
        type: "single",
        question: "What does REST stand for?",
        options: [
          { id: "a", text: "Representational State Transfer", isCorrect: true },
          { id: "b", text: "Remote Execution State Transfer", isCorrect: false },
          { id: "c", text: "Resource Endpoint Service Technology", isCorrect: false },
          { id: "d", text: "Representational Service Transfer", isCorrect: false },
        ],
        explanation: "REST stands for Representational State Transfer, an architectural style for distributed systems.",
        points: 1,
      },
      {
        id: "q3",
        type: "multi",
        question: "Which of the following are valid HTTP status codes for success? (Select all that apply)",
        options: [
          { id: "a", text: "200 OK", isCorrect: true },
          { id: "b", text: "201 Created", isCorrect: true },
          { id: "c", text: "204 No Content", isCorrect: true },
          { id: "d", text: "301 Moved Permanently", isCorrect: false },
        ],
        explanation: "200, 201, and 204 indicate successful operations. 301 is a redirect status.",
        points: 2,
      },
      {
        id: "q4",
        type: "scenario",
        question: "A client sends a POST request to create a new user. The server successfully creates the user and returns the new resource. What is the most appropriate HTTP status code to return?",
        scenario: "Consider a user registration endpoint that creates a new user account.",
        options: [
          { id: "a", text: "200 OK", isCorrect: false },
          { id: "b", text: "201 Created", isCorrect: true },
          { id: "c", text: "204 No Content", isCorrect: false },
          { id: "d", text: "202 Accepted", isCorrect: false },
        ],
        explanation: "201 Created is the standard response for successful resource creation, especially when the response includes the new resource.",
        points: 2,
      },
      {
        id: "q5",
        type: "code",
        question: "What does the following code snippet represent?",
        codeSnippet: "app.get('/users/:id', (req, res) => {\n  const user = findUser(req.params.id);\n  res.json(user);\n});",
        options: [
          { id: "a", text: "A route that retrieves a user by ID", isCorrect: true },
          { id: "b", text: "A route that creates a new user", isCorrect: false },
          { id: "c", text: "A route that updates a user", isCorrect: false },
          { id: "d", text: "A route that deletes a user", isCorrect: false },
        ],
        explanation: "The GET method with :id parameter is used to retrieve a specific resource by its identifier.",
        points: 2,
      },
    ],
  },
};

export const quizAttemptHistory: Record<string, QuizAttempt[]> = {
  "13": [
    {
      id: "att1",
      quizId: "13",
      attemptNumber: 1,
      score: 75,
      totalPoints: 8,
      correctCount: 4,
      incorrectCount: 1,
      unansweredCount: 0,
      passed: true,
      startedAt: "2025-01-28T10:00:00Z",
      completedAt: "2025-01-28T10:12:00Z",
      durationSeconds: 720,
      answers: {
        q1: ["a"],
        q2: ["a"],
        q3: ["a", "b"],
        q4: ["a"],
        q5: ["a"],
      },
    },
  ],
};

export function getQuizConfig(assignmentId: string): QuizConfig | undefined {
  return quizConfigs[assignmentId];
}

export function getQuizAttempts(quizId: string): QuizAttempt[] {
  return quizAttemptHistory[quizId] ?? [];
}

export function getQuizAttemptById(
  quizId: string,
  attemptId: string
): QuizAttempt | undefined {
  const attempts = quizAttemptHistory[quizId] ?? [];
  return attempts.find((a) => a.id === attemptId);
}
