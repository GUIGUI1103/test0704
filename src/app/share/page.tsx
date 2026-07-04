'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Quiz, getQuizzes, getShareTokens, saveShareTokens } from '@/lib/types'
import { Suspense } from 'react'

function SharePageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const token = searchParams.get('token')
    if (!token) {
      setError('无效的链接')
      return
    }

    // 验证token
    const tokens = getShareTokens()
    const found = tokens.find((t) => t.token === token && !t.used)
    if (!found) {
      setError('该链接已失效或不存在')
      return
    }

    // 标记token为已使用
    const updated = tokens.map((t) =>
      t.token === token ? { ...t, used: true } : t
    )
    saveShareTokens(updated)

    // 获取对应的测评
    const quizzes = getQuizzes()
    const quizData = quizzes.find((q) => q.id === found.quizId)
    if (quizData) {
      setQuiz(quizData)
    } else {
      setError('测评不存在')
    }
  }, [searchParams])

  if (!mounted) return null

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex flex-col items-center justify-center px-6">
        <div className="text-center">
          <p className="text-4xl mb-4">😔</p>
          <p className="text-primary-600 font-medium mb-2">{error}</p>
          <p className="text-xs text-gray-400 mb-8">请联系分享者获取新的链接</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-primary-500 to-primary-600 text-white"
          >
            返回首页
          </button>
        </div>
      </div>
    )
  }

  if (!quiz) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex flex-col items-center justify-center px-6">
      <div className="fade-in-up text-center mb-12">
        <p className="text-2xl text-primary-600 font-light mb-2">Hi~ 👋</p>
        <p className="text-sm text-gray-400">你收到了一份专属测评</p>
      </div>

      <div className="fade-in-up fade-in-up-delay-1 w-full max-w-sm">
        <a href={`/quiz/${quiz.id}`}>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-primary-100 
                        hover:shadow-md hover:border-primary-300 transition-all duration-300
                        active:scale-[0.98] cursor-pointer">
            <h2 className="text-lg font-semibold text-primary-700 text-center mb-3">
              {quiz.title}
            </h2>
            <p className="text-xs text-gray-400 text-center mb-4">{quiz.description}</p>
            <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
              <span>📝 {quiz.questionCount}题</span>
              <span>⏱️ 约{quiz.estimatedTime}</span>
            </div>
          </div>
        </a>
      </div>

      <div className="mt-16 text-center">
        <p className="text-xs text-gray-300">心灵测评 · 了解自己</p>
      </div>
    </div>
  )
}

export default function SharePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-primary-50">
        <div className="text-primary-400 text-sm">加载中...</div>
      </div>
    }>
      <SharePageContent />
    </Suspense>
  )
}
