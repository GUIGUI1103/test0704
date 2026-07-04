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

// 服务器端 API 存储
export async function getQuizzes(): Promise<Quiz[]> {
  try {
    const res = await fetch('/api/quizzes', { cache: 'no-store' })
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

export async function saveQuizzes(quizzes: Quiz[]): Promise<void> {
  try {
    await fetch('/api/quizzes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quizzes),
    })
  } catch {}
}

export async function getShareTokens(): Promise<ShareToken[]> {
  try {
    const res = await fetch('/api/tokens', { cache: 'no-store' })
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

export async function saveShareTokens(tokens: ShareToken[]): Promise<void> {
  try {
    await fetch('/api/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tokens),
    })
  } catch {}
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
