// 数据类型定义
export interface QuizOption {
  id: string
  text: string
  score: number // 该选项的分值
}

export interface QuizQuestion {
  id: string
  text: string
  options: QuizOption[]
}

export interface QuizResult {
  id: string
  title: string       // 结果关键词/一句话
  description: string  // 结果解释
  minScore: number    // 最低分数阈值
  maxScore: number    // 最高分数阈值
}

export interface Quiz {
  id: string
  title: string
  description: string
  questionCount: number
  estimatedTime: string  // 预计答题时间
  questions: QuizQuestion[]
  results: QuizResult[]
  createdAt: string
}

export interface ShareToken {
  id: string
  quizId: string
  token: string
  used: boolean
  createdAt: string
}

// 管理员配置
export const ADMIN_CONFIG = {
  username: 'admin',
  passwordHash: 'admin123', // MVP简单版，生产环境应使用bcrypt等加密
}

// 生成唯一ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

// 生成分享token
export function generateToken(): string {
  return Math.random().toString(36).substr(2, 16)
}

// localStorage 操作
export function getQuizzes(): Quiz[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem('mindquiz_quizzes')
  return data ? JSON.parse(data) : []
}

export function saveQuizzes(quizzes: Quiz[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('mindquiz_quizzes', JSON.stringify(quizzes))
}

export function getShareTokens(): ShareToken[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem('mindquiz_tokens')
  return data ? JSON.parse(data) : []
}

export function saveShareTokens(tokens: ShareToken[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('mindquiz_tokens', JSON.stringify(tokens))
}

// 计算测评结果
export function calculateResult(quiz: Quiz, answers: Record<string, string>): QuizResult {
  let totalScore = 0
  quiz.questions.forEach((q) => {
    const selectedOptionId = answers[q.id]
    const option = q.options.find((o) => o.id === selectedOptionId)
    if (option) {
      totalScore += option.score
    }
  })
  
  const result = quiz.results.find(
    (r) => totalScore >= r.minScore && totalScore <= r.maxScore
  )
  return result || quiz.results[quiz.results.length - 1]
}
