'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ADMIN_CONFIG } from '@/lib/types'

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // 已登录则跳转
    if (typeof window !== 'undefined') {
      const auth = localStorage.getItem('mindquiz_auth')
      if (auth === 'true') {
        router.push('/admin/dashboard')
      }
    }
  }, [router])

  const handleLogin = () => {
    if (username === ADMIN_CONFIG.username && password === ADMIN_CONFIG.passwordHash) {
      localStorage.setItem('mindquiz_auth', 'true')
      router.push('/admin/dashboard')
    } else {
      setError('用户名或密码错误')
    }
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex flex-col items-center justify-center px-6">
      <div className="fade-in-up w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold text-primary-700 mb-1">管理后台</h1>
          <p className="text-xs text-gray-400">请输入管理员账号密码</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-primary-100">
          {error && (
            <div className="mb-4 p-3 bg-red-50 rounded-lg text-xs text-red-500 text-center">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">用户名</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入用户名"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-400 transition-colors"
              />
            </div>
            <button
              onClick={handleLogin}
              className="w-full py-3.5 rounded-xl text-sm font-medium bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-sm active:scale-[0.98] transition-all"
            >
              登录
            </button>
          </div>
        </div>

        <div className="mt-4 text-center">
          <a href="/" className="text-xs text-primary-400 hover:text-primary-600 transition-colors">
            ← 返回首页
          </a>
        </div>
      </div>
    </div>
  )
}
