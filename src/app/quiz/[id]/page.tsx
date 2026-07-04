'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Quiz, getQuizzes, calculateResult } from '@/lib/types'

export default function QuizPage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [mounted, setMounted] = useState(false)
  const [direction, setDirection] = useState<'next' | 'prev'>('next')

  useEffect(() => {
    setMounted(true)
    const quizzes = getQuizzes()
    const found = quizzes.find((q) => q.id === id)
    if (found) {
      setQuiz(found)
    }
  }, [id])

  if (!mounted || !quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-50">
        <div className="text-primary-400 text-sm">加载中...</div>
      </div>
    )
  }

  const question = quiz.questions[currentIndex]
  const progress = ((currentIndex + 1) / quiz.questions.length) * 100
  const isLastQuestion = currentIndex === quiz.questions.length - 1
  const hasAnswer = !!answers[question.id]

  const handleSelectOption = (optionId: string) => {
    setAnswers((prev) => ({ ...prev, [question.id]: optionId }))
  }

  const handleNext = () => {
    if (!hasAnswer) return
    if (isLastQuestion) {
      // 提交
      const result = calculateResult(quiz, answers)
      const resultData = JSON.stringify(result)
      router.push(`/result?id=${id}&data=${encodeURIComponent(resultData)}`)
      return
    }
    setDirection('next')
    setCurrentIndex((prev) => prev + 1)
  }

  const handlePrev = () => {
    if (currentIndex === 0) return
    setDirection('prev')
    setCurrentIndex((prev) => prev - 1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex flex-col">
      {/* 顶部进度区域 */}
      <div className="px-6 pt-8 pb-4">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => router.push('/')}
            className="text-primary-400 text-sm hover:text-primary-600 transition-colors"
          >
            ← 返回
          </button>
          <span className="text-xs text-gray-400">
            {currentIndex + 1} / {quiz.questions.length}
          </span>
        </div>
        {/* 进度条 */}
        <div className="w-full h-2 bg-primary-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full progress-bar transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 题目区域 */}
      <div className="flex-1 px-6 flex flex-col justify-center">
        <div
          key={question.id}
          className={`fade-in-up ${
            direction === 'next' ? '' : 'fade-in-up-reverse'
          }`}
        >
          {/* 题目方框 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-primary-100 mb-8">
            <p className="text-base text-gray-700 leading-relaxed text-center">
              {question.text}
            </p>
          </div>

          {/* 选项 */}
          <div className="space-y-3">
            {question.options.map((option) => {
              const isSelected = answers[question.id] === option.id
              return (
                <button
                  key={option.id}
                  onClick={() => handleSelectOption(option.id)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50 scale-[1.02] option-selected shadow-sm'
                      : 'border-gray-100 bg-white hover:border-primary-200 hover:bg-primary-50/50 active:scale-[0.98]'
                  }`}
                >
                  <span
                    className={`text-sm ${
                      isSelected ? 'text-primary-700 font-medium' : 'text-gray-600'
                    }`}
                  >
                    {option.text}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* 底部按钮 */}
      <div className="px-6 pb-8 pt-4 flex gap-3">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={`flex-1 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 ${
            currentIndex === 0
              ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
              : 'bg-white border border-primary-200 text-primary-600 active:scale-[0.98]'
          }`}
        >
          上一题
        </button>
        <button
          onClick={handleNext}
          disabled={!hasAnswer}
          className={`flex-1 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 ${
            hasAnswer
              ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-sm active:scale-[0.98]'
              : 'bg-primary-100 text-primary-300 cursor-not-allowed'
          }`}
        >
          {isLastQuestion ? '查看结果' : '下一题'}
        </button>
      </div>
    </div>
  )
}
