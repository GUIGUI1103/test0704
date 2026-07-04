'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Quiz, QuizQuestion, QuizOption, QuizResult,
  getQuizzes, saveQuizzes, getShareTokens, saveShareTokens,
  generateId, generateToken, ShareToken,
} from '@/lib/types'

export default function AdminDashboard() {
  const router = useRouter()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [tokens, setTokens] = useState<ShareToken[]>([])
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<'list' | 'edit' | 'tokens' | 'import'>('list')
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null)
  const [copiedToken, setCopiedToken] = useState('')

  // JSON 导入
  const [jsonText, setJsonText] = useState('')
  const [jsonError, setJsonError] = useState('')

  // 新建/编辑问卷表单
  const [formTitle, setFormTitle] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formTime, setFormTime] = useState('3分钟')
  const [formQuestions, setFormQuestions] = useState<QuizQuestion[]>([])
  const [formResults, setFormResults] = useState<QuizResult[]>([])

  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined') {
      const auth = localStorage.getItem('mindquiz_auth')
      if (auth !== 'true') {
        router.push('/admin')
        return
      }
      setQuizzes(getQuizzes())
      setTokens(getShareTokens())
    }
  }, [router])

  const refreshData = () => {
    setQuizzes(getQuizzes())
    setTokens(getShareTokens())
  }

  // ====== JSON 导入 ======
  const handleImportJson = () => {
    setJsonError('')
    if (!jsonText.trim()) {
      setJsonError('请输入 JSON 内容')
      return
    }
    try {
      const data = JSON.parse(jsonText.trim())

      // 验证必填字段
      if (!data.title || typeof data.title !== 'string') {
        setJsonError('缺少 title（测评标题）')
        return
      }
      if (!Array.isArray(data.questions) || data.questions.length === 0) {
        setJsonError('缺少 questions（题目数组）')
        return
      }
      if (!Array.isArray(data.results) || data.results.length === 0) {
        setJsonError('缺少 results（结果映射数组）')
        return
      }

      // 验证题目结构
      for (let i = 0; i < data.questions.length; i++) {
        const q = data.questions[i]
        if (!q.text || typeof q.text !== 'string') {
          setJsonError(`第 ${i + 1} 题缺少 text（题目内容）`)
          return
        }
        if (!Array.isArray(q.options) || q.options.length === 0) {
          setJsonError(`第 ${i + 1} 题缺少 options（选项数组）`)
          return
        }
        for (let j = 0; j < q.options.length; j++) {
          const opt = q.options[j]
          if (!opt.text || typeof opt.text !== 'string') {
            setJsonError(`第 ${i + 1} 题第 ${j + 1} 个选项缺少 text`)
            return
          }
          if (typeof opt.score !== 'number') {
            setJsonError(`第 ${i + 1} 题第 ${j + 1} 个选项缺少 score（分值，必须是数字）`)
            return
          }
        }
      }

      // 验证结果结构
      for (let i = 0; i < data.results.length; i++) {
        const r = data.results[i]
        if (!r.title || typeof r.title !== 'string') {
          setJsonError(`结果 ${i + 1} 缺少 title（结果标题）`)
          return
        }
        if (!r.description || typeof r.description !== 'string') {
          setJsonError(`结果 ${i + 1} 缺少 description（结果解释）`)
          return
        }
        if (typeof r.minScore !== 'number') {
          setJsonError(`结果 ${i + 1} 缺少 minScore（最低分，必须是数字）`)
          return
        }
        if (typeof r.maxScore !== 'number') {
          setJsonError(`结果 ${i + 1} 缺少 maxScore（最高分，必须是数字）`)
          return
        }
      }

      // 构建 Quiz 对象
      const importedQuestions: QuizQuestion[] = data.questions.map((q: any) => ({
        id: generateId(),
        text: q.text,
        options: q.options.map((opt: any) => ({
          id: generateId(),
          text: opt.text,
          score: opt.score,
        })),
      }))

      const importedResults: QuizResult[] = data.results.map((r: any) => ({
        id: generateId(),
        title: r.title,
        description: r.description,
        minScore: r.minScore,
        maxScore: r.maxScore,
      }))

      const newQuiz: Quiz = {
        id: generateId(),
        title: data.title.trim(),
        description: (data.description || '').trim(),
        questionCount: importedQuestions.length,
        estimatedTime: data.estimatedTime || '3分钟',
        questions: importedQuestions,
        results: importedResults,
        createdAt: new Date().toISOString(),
      }

      const updated = [...quizzes, newQuiz]
      saveQuizzes(updated)
      refreshData()
      setJsonText('')
      setActiveTab('list')
      alert('导入成功！')
    } catch (e) {
      setJsonError('JSON 格式错误，请检查语法')
    }
  }

  // ====== 问卷管理 ======
  const startCreate = () => {
    setEditingQuiz(null)
    setFormTitle('')
    setFormDesc('')
    setFormTime('3分钟')
    setFormQuestions([
      {
        id: generateId(),
        text: '',
        options: [
          { id: generateId(), text: '', score: 1 },
          { id: generateId(), text: '', score: 2 },
          { id: generateId(), text: '', score: 3 },
          { id: generateId(), text: '', score: 4 },
        ],
      },
    ])
    setFormResults([
      { id: generateId(), title: '', description: '', minScore: 0, maxScore: 10 },
    ])
    setActiveTab('edit')
  }

  const startEdit = (quiz: Quiz) => {
    setEditingQuiz(quiz)
    setFormTitle(quiz.title)
    setFormDesc(quiz.description)
    setFormTime(quiz.estimatedTime)
    setFormQuestions(JSON.parse(JSON.stringify(quiz.questions)))
    setFormResults(JSON.parse(JSON.stringify(quiz.results)))
    setActiveTab('edit')
  }

  const deleteQuiz = (id: string) => {
    if (!confirm('确定删除该测评？')) return
    const updated = quizzes.filter((q) => q.id !== id)
    saveQuizzes(updated)
    refreshData()
  }

  const addQuestion = () => {
    setFormQuestions([
      ...formQuestions,
      {
        id: generateId(),
        text: '',
        options: [
          { id: generateId(), text: '', score: 1 },
          { id: generateId(), text: '', score: 2 },
          { id: generateId(), text: '', score: 3 },
          { id: generateId(), text: '', score: 4 },
        ],
      },
    ])
  }

  const updateQuestion = (index: number, field: string, value: string) => {
    const updated = [...formQuestions]
    ;(updated[index] as any)[field] = value
    setFormQuestions(updated)
  }

  const updateOption = (qIndex: number, oIndex: number, field: keyof QuizOption, value: string | number) => {
    const updated = [...formQuestions]
    ;(updated[qIndex].options[oIndex] as any)[field] = value
    setFormQuestions(updated)
  }

  const removeQuestion = (index: number) => {
    setFormQuestions(formQuestions.filter((_, i) => i !== index))
  }

  const addResult = () => {
    const lastMax = formResults.length > 0 ? formResults[formResults.length - 1].maxScore + 1 : 0
    setFormResults([
      ...formResults,
      { id: generateId(), title: '', description: '', minScore: lastMax, maxScore: lastMax + 10 },
    ])
  }

  const updateResult = (index: number, field: keyof QuizResult, value: string | number) => {
    const updated = [...formResults]
    ;(updated[index] as any)[field] = value
    setFormResults(updated)
  }

  const removeResult = (index: number) => {
    setFormResults(formResults.filter((_, i) => i !== index))
  }

  const saveQuiz = () => {
    if (!formTitle.trim() || formQuestions.length === 0 || formResults.length === 0) {
      alert('请填写完整信息')
      return
    }
    // 检查题目和选项是否填写完整
    for (const q of formQuestions) {
      if (!q.text.trim()) { alert('请填写所有题目'); return }
      for (const o of q.options) {
        if (!o.text.trim()) { alert('请填写所有选项'); return }
      }
    }
    for (const r of formResults) {
      if (!r.title.trim() || !r.description.trim()) { alert('请填写所有结果'); return }
    }

    const quizData: Quiz = {
      id: editingQuiz?.id || generateId(),
      title: formTitle.trim(),
      description: formDesc.trim(),
      questionCount: formQuestions.length,
      estimatedTime: formTime,
      questions: formQuestions,
      results: formResults,
      createdAt: editingQuiz?.createdAt || new Date().toISOString(),
    }

    let updated: Quiz[]
    if (editingQuiz) {
      updated = quizzes.map((q) => (q.id === editingQuiz.id ? quizData : q))
    } else {
      updated = [...quizzes, quizData]
    }
    saveQuizzes(updated)
    refreshData()
    setActiveTab('list')
  }

  // ====== 分享链接 ======
  const generateShareLink = (quizId: string) => {
    const token = generateToken()
    const newToken: ShareToken = {
      id: generateId(),
      quizId,
      token,
      used: false,
      createdAt: new Date().toISOString(),
    }
    const updated = [...tokens, newToken]
    saveShareTokens(updated)
    refreshData()
    return token
  }

  const copyLink = (token: string) => {
    const link = `${window.location.origin}/share?token=${token}`
    navigator.clipboard.writeText(link)
    setCopiedToken(token)
    setTimeout(() => setCopiedToken(''), 2000)
  }

  const deleteToken = (id: string) => {
    const updated = tokens.filter((t) => t.id !== id)
    saveShareTokens(updated)
    refreshData()
  }

  const handleLogout = () => {
    localStorage.removeItem('mindquiz_auth')
    router.push('/admin')
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-sm font-bold text-primary-700">管理后台</h1>
        <div className="flex items-center gap-3">
          <a href="/" className="text-xs text-gray-400">首页</a>
          <button onClick={handleLogout} className="text-xs text-red-400">退出</button>
        </div>
      </div>

      <div className="px-4 py-4 max-w-lg mx-auto">
        {/* Tab 切换 */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'list'
                ? 'bg-primary-500 text-white'
                : 'bg-white text-gray-500 border border-gray-200'
            }`}
          >
            问卷管理
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'import'
                ? 'bg-primary-500 text-white'
                : 'bg-white text-gray-500 border border-gray-200'
            }`}
          >
            JSON导入
          </button>
          <button
            onClick={() => setActiveTab('tokens')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'tokens'
                ? 'bg-primary-500 text-white'
                : 'bg-white text-gray-500 border border-gray-200'
            }`}
          >
            分享链接
          </button>
          {(activeTab === 'edit' || activeTab === 'import') && (
            <button
              onClick={() => setActiveTab('list')}
              className="px-4 py-2 rounded-lg text-xs font-medium bg-white text-gray-500 border border-gray-200 transition-all"
            >
              ← 返回
            </button>
          )}
        </div>

        {/* ====== 问卷列表 ====== */}
        {activeTab === 'list' && (
          <div className="space-y-3">
            <button
              onClick={startCreate}
              className="w-full py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-sm active:scale-[0.98] transition-all"
            >
              + 新建测评
            </button>
            {quizzes.map((quiz) => (
              <div key={quiz.id} className="bg-white rounded-xl p-4 border border-gray-100">
                <h3 className="text-sm font-medium text-gray-700 mb-1">{quiz.title}</h3>
                <p className="text-xs text-gray-400 mb-3">{quiz.questionCount}题 · {quiz.estimatedTime}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(quiz)}
                    className="flex-1 py-2 rounded-lg text-xs bg-primary-50 text-primary-600 active:scale-[0.98] transition-all"
                  >
                    编辑配置
                  </button>
                  <button
                    onClick={() => {
                      const token = generateShareLink(quiz.id)
                      setActiveTab('tokens')
                      setTimeout(() => copyLink(token), 100)
                    }}
                    className="flex-1 py-2 rounded-lg text-xs bg-green-50 text-green-600 active:scale-[0.98] transition-all"
                  >
                    生成链接
                  </button>
                  <button
                    onClick={() => deleteQuiz(quiz.id)}
                    className="py-2 px-3 rounded-lg text-xs bg-red-50 text-red-500 active:scale-[0.98] transition-all"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ====== JSON 导入 ====== */}
        {activeTab === 'import' && (
          <div className="space-y-4 pb-20">
            <div className="bg-white rounded-xl p-4 border border-gray-100 space-y-3">
              <h3 className="text-sm font-medium text-gray-700">导入 JSON 测评</h3>
              <p className="text-xs text-gray-400">
                粘贴符合格式的 JSON，系统会自动创建测评。格式要求：title + questions（含 options）+ results。
              </p>
              <textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                placeholder={`示例格式：\n{\n  "title": "你的焦虑指数有多高？",\n  "description": "测评描述",\n  "estimatedTime": "3分钟",\n  "questions": [\n    {\n      "text": "题目内容",\n      "options": [\n        { "text": "选项A", "score": 1 },\n        { "text": "选项B", "score": 2 }\n      ]\n    }\n  ],\n  "results": [\n    {\n      "title": "🌸 心态平和",\n      "description": "结果解释...",\n      "minScore": 1,\n      "maxScore": 5\n    }\n  ]\n}`}
                rows={16}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs font-mono focus:outline-none focus:border-primary-400 resize-none"
              />
              {jsonError && (
                <div className="p-3 bg-red-50 rounded-lg text-xs text-red-500">
                  {jsonError}
                </div>
              )}
              <button
                onClick={handleImportJson}
                className="w-full py-3.5 rounded-xl text-sm font-medium bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-sm active:scale-[0.98] transition-all"
              >
                导入测评
              </button>
            </div>
          </div>
        )}

        {/* ====== 编辑问卷 ====== */}
        {activeTab === 'edit' && (
          <div className="space-y-4 pb-20">
            {/* 基本信息 */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 space-y-3">
              <h3 className="text-sm font-medium text-gray-700">基本信息（首页展示配置）</h3>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">首屏标题</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="如：你的焦虑指数有多高？"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary-400"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">测评描述</label>
                <input
                  type="text"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="测评副标题/描述"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary-400"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">预计答题时间</label>
                <input
                  type="text"
                  value={formTime}
                  onChange={(e) => setFormTime(e.target.value)}
                  placeholder="如：3分钟"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary-400"
                />
              </div>
            </div>

            {/* 题目列表 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700">题目（{formQuestions.length}题）</h3>
                <button
                  onClick={addQuestion}
                  className="text-xs text-primary-500 bg-primary-50 px-3 py-1.5 rounded-lg"
                >
                  + 添加题目
                </button>
              </div>
              {formQuestions.map((q, qIndex) => (
                <div key={q.id} className="bg-white rounded-xl p-4 border border-gray-100 space-y-3">
                  <div className="flex items-start justify-between">
                    <span className="text-xs text-primary-500 font-medium">第{qIndex + 1}题</span>
                    {formQuestions.length > 1 && (
                      <button
                        onClick={() => removeQuestion(qIndex)}
                        className="text-xs text-red-400"
                      >
                        删除
                      </button>
                    )}
                  </div>
                  <textarea
                    value={q.text}
                    onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
                    placeholder="题目内容"
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary-400 resize-none"
                  />
                  <div className="space-y-2">
                    {q.options.map((opt, oIndex) => (
                      <div key={opt.id} className="flex gap-2 items-center">
                        <span className="text-xs text-gray-400 w-4">{String.fromCharCode(65 + oIndex)}</span>
                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) => updateOption(qIndex, oIndex, 'text', e.target.value)}
                          placeholder={`选项${String.fromCharCode(65 + oIndex)}`}
                          className="flex-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-primary-400"
                        />
                        <input
                          type="number"
                          value={opt.score}
                          onChange={(e) => updateOption(qIndex, oIndex, 'score', parseInt(e.target.value) || 0)}
                          className="w-12 px-2 py-1.5 rounded-lg border border-gray-200 text-xs text-center focus:outline-none focus:border-primary-400"
                          title="分值"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* 结果配置 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700">结果映射（{formResults.length}个）</h3>
                <button
                  onClick={addResult}
                  className="text-xs text-primary-500 bg-primary-50 px-3 py-1.5 rounded-lg"
                >
                  + 添加结果
                </button>
              </div>
              {formResults.map((r, rIndex) => (
                <div key={r.id} className="bg-white rounded-xl p-4 border border-gray-100 space-y-2">
                  <div className="flex items-start justify-between">
                    <span className="text-xs text-primary-500 font-medium">结果{rIndex + 1}</span>
                    {formResults.length > 1 && (
                      <button onClick={() => removeResult(rIndex)} className="text-xs text-red-400">
                        删除
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={r.title}
                    onChange={(e) => updateResult(rIndex, 'title', e.target.value)}
                    placeholder="结果标题（如：🌸 心态平和）"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary-400"
                  />
                  <textarea
                    value={r.description}
                    onChange={(e) => updateResult(rIndex, 'description', e.target.value)}
                    placeholder="结果解释"
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary-400 resize-none"
                  />
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-xs text-gray-400">最低分</label>
                      <input
                        type="number"
                        value={r.minScore}
                        onChange={(e) => updateResult(rIndex, 'minScore', parseInt(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-primary-400"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-gray-400">最高分</label>
                      <input
                        type="number"
                        value={r.maxScore}
                        onChange={(e) => updateResult(rIndex, 'maxScore', parseInt(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-primary-400"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 保存按钮 */}
            <button
              onClick={saveQuiz}
              className="w-full py-3.5 rounded-xl text-sm font-medium bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-sm active:scale-[0.98] transition-all"
            >
              {editingQuiz ? '保存修改' : '创建测评'}
            </button>
          </div>
        )}

        {/* ====== 分享链接管理 ====== */}
        {activeTab === 'tokens' && (
          <div className="space-y-3">
            <div className="bg-primary-50 rounded-xl p-3 border border-primary-100">
              <p className="text-xs text-primary-600">
                💡 每个分享链接仅限一人使用，用户访问后自动失效。复制链接发送给用户即可。
              </p>
            </div>
            {tokens.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                暂无分享链接，请在问卷管理中生成
              </div>
            ) : (
              tokens.map((token) => {
                const quiz = quizzes.find((q) => q.id === token.quizId)
                return (
                  <div key={token.id} className="bg-white rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        {quiz?.title || '已删除的测评'}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        token.used
                          ? 'bg-gray-100 text-gray-400'
                          : 'bg-green-100 text-green-600'
                      }`}>
                        {token.used ? '已使用' : '有效'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2 truncate">
                        {window.location.origin}/share?token={token.token}
                      </code>
                      {!token.used && (
                        <>
                          <button
                            onClick={() => copyLink(token.token)}
                            className="px-3 py-2 rounded-lg text-xs bg-primary-50 text-primary-600 active:scale-[0.98] transition-all whitespace-nowrap"
                          >
                            {copiedToken === token.token ? '已复制 ✓' : '复制'}
                          </button>
                          <button
                            onClick={() => deleteToken(token.id)}
                            className="px-2 py-2 rounded-lg text-xs bg-red-50 text-red-400 active:scale-[0.98] transition-all"
                          >
                            ✕
                          </button>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-gray-300 mt-2">
                      创建于 {new Date(token.createdAt).toLocaleString('zh-CN')}
                    </p>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}
