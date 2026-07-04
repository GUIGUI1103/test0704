import { NextRequest, NextResponse } from 'next/server'
import { sampleQuiz } from '@/lib/sample-data'

const g = globalThis as any
if (!g.__quizzes__) {
  g.__quizzes__ = [{ ...sampleQuiz }]
}

export async function GET() {
  return NextResponse.json(g.__quizzes__)
}

export async function POST(request: NextRequest) {
  const data = await request.json()
  g.__quizzes__ = data
  return NextResponse.json({ success: true })
}
