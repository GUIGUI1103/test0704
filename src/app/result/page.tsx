'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { QuizResult, getQuizzes } from '@/lib/types'
import { Suspense } from 'react'

function ResultContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [result, setResult] = useState<QuizResult | null>(null)
  const [quizTitle, setQuizTitle] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const data = searchParams.get('data')
    const quizId = searchParams.get('id')
    if (data) {
      try {
        const parsed = JSON.parse(decodeURIComponent(data)) as QuizResult
        setResult(parsed)
      } catch {
        // ignore
      }
    }
    if (quizId) {
      const quizzes = getQuizzes()
      const quiz = quizzes.find((q) => q.id === quizId)
      if (quiz) setQuizTitle(quiz.title)
    }
  }, [searchParams])

  if (!mounted || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-50">
        <div className="text-primary-400 text-sm">加载中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex flex-col items-center px-6 py-12">
      {/* 结果标题 */}
      <div className="fade-in-up text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <span className="text-3xl">✨</span>
        </div>
        <h1 className="text-2xl font-bold text-primary-700 mb-2">{result.title}</h1>
        <p className="text-xs text-gray-400">{quizTitle} · 测评结果</p>
      </div>

      {/* 结果解释 */}
      <div className="fade-in-up fade-in-up-delay-1 w-full max-w-sm">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-primary-100">
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
            {result.description}
          </p>
        </div>
      </div>

      {/* 温馨提示 */}
      <div className="fade-in-up fade-in-up-delay-2 w-full max-w-sm mt-4">
        <div className="bg-primary-50 rounded-2xl p-5 border border-primary-100">
          <p className="text-xs text-primary-600 leading-relaxed">
            💡 温馨提示：本测评仅供参考，不构成专业心理诊断。如有需要，请咨询专业心理咨询师。
          </p>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="fade-in-up fade-in-up-delay-3 w-full max-w-sm mt-8 space-y-3">
        <button
          onClick={() => router.push('/')}
          className="w-full py-3.5 rounded-xl text-sm font-medium bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-sm active:scale-[0.98] transition-all"
        >
          返回首页
        </button>
        <button
          onClick={() => router.back()}
          className="w-full py-3.5 rounded-xl text-sm font-medium bg-white border border-primary-200 text-primary-600 active:scale-[0.98] transition-all"
        >
          重新测评
        </button>
      </div>
    </div>
  )
}

export default function ResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-primary-50">
        <div className="text-primary-400 text-sm">加载中...</div>
      </div>
    }>
      <ResultContent />
    </Suspense>
  )
}
