import { NextRequest, NextResponse } from 'next/server'

const g = globalThis as any
if (!g.__tokens__) {
  g.__tokens__ = []
}

export async function GET() {
  return NextResponse.json(g.__tokens__)
}

export async function POST(request: NextRequest) {
  const data = await request.json()
  g.__tokens__ = data
  return NextResponse.json({ success: true })
}
