'use client'

import { useEffect, useState } from 'react'
import { Quiz, getQuizzes, saveQuizzes } from '@/lib/types'
import { sampleQuiz } from '@/lib/sample-data'

export default function HomePage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    let existing = getQuizzes()
    if (existing.length === 0) {
      // 首次使用，初始化示例数据
      saveQuizzes([sampleQuiz])
      existing = [sampleQuiz]
    }
    setQuizzes(existing)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex flex-col items-center justify-center px-6">
      {/* 问候语 */}
      <div className="fade-in-up text-center mb-12">
        <p className="text-2xl text-primary-600 font-light mb-2">Hi~ 👋</p>
        <p className="text-sm text-gray-400">来了解一下真实的自己吧</p>
      </div>

      {/* 测评列表 */}
      <div className="w-full max-w-sm space-y-4">
        {quizzes.map((quiz, index) => (
          <a
            key={quiz.id}
            href={`/quiz/${quiz.id}`}
            className="fade-in-up block"
            style={{ animationDelay: `${0.2 + index * 0.1}s`, opacity: 0 }}
          >
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-primary-100 
                          hover:shadow-md hover:border-primary-300 transition-all duration-300
                          active:scale-[0.98] cursor-pointer">
              <h2 className="text-lg font-semibold text-primary-700 text-center mb-3">
                {quiz.title}
              </h2>
              <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                <span>📝 {quiz.questionCount}题</span>
                <span>⏱️ 约{quiz.estimatedTime}</span>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* 底部装饰 */}
      <div className="mt-16 text-center">
        <p className="text-xs text-gray-300">心灵测评 · 了解自己</p>
      </div>
    </div>
  )
}
