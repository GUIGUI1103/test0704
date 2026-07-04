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
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const link = `${origin}/share?token=${token}`

    // 降级复制方案：优先用 Clipboard API，失败则用传统方法
    const doCopy = () => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(link).then(() => {
          setCopiedToken(token)
          setTimeout(() => setCopiedToken(''), 2000)
        }).catch(() => fallbackCopy(link))
      } else {
        fallbackCopy(link)
      }
    }

    const fallbackCopy = (text: string) => {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      try {
        document.execCommand('copy')
        setCopiedToken(token)
        setTimeout(() => setCopiedToken(''), 2000)
      } catch {
        alert('复制失败，请手动复制下方链接')
      }
      document.body.removeChild(ta)
    }

    doCopy()
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
                      copyLink(token)
                    }}
                    className="flex-1 py-2 rounded-lg text-xs bg-green-50 text-green-600 active:scale-[0.98] transition-all"
                  >
                    生成链接
                  </button>
                  <button
                    onClick={() => deleteQuiz(quiz.id)}
                    className="px-3 py-2 rounded-lg text-xs bg-red-50 text-red-400 active:scale-[0.98] transition-all"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
            {quizzes.length === 0 && (
              <div className="text-center py-12 text-gray-400 text-sm">暂无测评，点击上方按钮创建</div>
            )}
          </div>
        )}

        {/* ====== JSON 导入 ====== */}
        {activeTab === 'import' && (
          <div className="bg-white rounded-xl p-4 border border-gray-100 space-y-4">
            <h2 className="text-sm font-medium text-gray-700">导入 JSON 格式测评</h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              请粘贴符合以下格式的 JSON：
            </p>
            <pre className="bg-gray-50 rounded-lg p-3 text-[10px] text-gray-500 overflow-x-auto leading-relaxed">
{`{
  "title": "测评标题",
  "description": "描述",
  "estimatedTime": "3分钟",
  "questions": [
    {
      "text": "题目内容",
      "options": [
        { "text": "选项A", "score": 1 },
        { "text": "选项B", "score": 2 }
      ]
    }
  ],
  "results": [
    {
      "title": "结果标题",
      "description": "结果解释",
      "minScore": 0,
      "maxScore": 10
    }
  ]
}`}
            </pre>
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder="在此粘贴 JSON..."
              className="w-full h-64 px-4 py-3 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-primary-400 transition-colors resize-none font-mono"
            />
            {jsonError && (
              <div className="p-3 bg-red-50 rounded-lg text-xs text-red-500">{jsonError}</div>
            )}
            <button
              onClick={handleImportJson}
              className="w-full py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-sm active:scale-[0.98] transition-all"
            >
              确认导入
            </button>
          </div>
        )}

        {/* ====== 分享链接管理 ====== */}
        {activeTab === 'tokens' && (
          <div className="space-y-3">
            {tokens.length === 0 && (
              <div className="text-center py-12 text-gray-400 text-sm">暂无分享链接，在「问卷管理」中点击「生成链接」创建</div>
            )}
            {tokens.slice().reverse().map((t) => (
              <div key={t.id} className={`bg-white rounded-xl p-4 border ${t.used ? 'border-gray-100 opacity-50' : 'border-green-100'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${t.used ? 'bg-gray-100 text-gray-400' : 'bg-green-50 text-green-600'}`}>
                    {t.used ? '已使用' : '未使用'}
                  </span>
                  <span className="text-[10px] text-gray-300">{new Date(t.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-gray-500 mb-1 truncate">
                  对应测评：{quizzes.find((q) => q.id === t.quizId)?.title || '已删除'}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <code className="flex-1 bg-gray-50 rounded-lg px-3 py-2 text-[10px] text-gray-400 truncate font-mono">
                    {typeof window !== 'undefined' ? `${window.location.origin}/share?token=${t.token}` : ''}
                  </code>
                  {!t.used && (
                    <button
                      onClick={() => copyLink(t.token)}
                      className="px-3 py-2 rounded-lg text-xs bg-primary-50 text-primary-600 active:scale-[0.98] transition-all whitespace-nowrap"
                    >
                      {copiedToken === t.token ? '已复制' : '复制'}
                    </button>
                  )}
                  <button
                    onClick={() => deleteToken(t.id)}
                    className="px-3 py-2 rounded-lg text-xs bg-red-50 text-red-400 active:scale-[0.98] transition-all"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ====== 编辑问卷 ====== */}
        {activeTab === 'edit' && (
          <div className="space-y-4 pb-20">
            {/* 基本信息 */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 space-y-3">
              <h3 className="text-sm font-medium text-gray-700">基本信息</h3>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">测评标题</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="如：你的焦虑指数有多高"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">简介描述</label>
                <input
                  type="text"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="简短描述测评内容"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">预计用时</label>
                <input
                  type="text"
                  value={formTime}
                  onChange={(e) => setFormTime(e.target.value)}
                  placeholder="如：3分钟"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-400 transition-colors"
                />
              </div>
            </div>

            {/* 题目 */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700">题目设置</h3>
                <span className="text-xs text-gray-400">{formQuestions.length} 题</span>
              </div>
              {formQuestions.map((q, qIdx) => (
                <div key={q.id} className="space-y-2 pb-4 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-primary-500">Q{qIdx + 1}</span>
                    <input
                      type="text"
                      value={q.text}
                      onChange={(e) => updateQuestion(qIdx, 'text', e.target.value)}
                      placeholder="输入题目内容"
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary-400 transition-colors"
                    />
                    {formQuestions.length > 1 && (
                      <button
                        onClick={() => removeQuestion(qIdx)}
                        className="text-xs text-red-400 px-2"
                      >
                        删除
                      </button>
                    )}
                  </div>
                  <div className="pl-6 space-y-2">
                    {q.options.map((opt, oIdx) => (
                      <div key={opt.id} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) => updateOption(qIdx, oIdx, 'text', e.target.value)}
                          placeholder={`选项 ${oIdx + 1}`}
                          className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-primary-400 transition-colors"
                        />
                        <input
                          type="number"
                          value={opt.score}
                          onChange={(e) => updateOption(qIdx, oIdx, 'score', parseInt(e.target.value) || 0)}
                          placeholder="分值"
                          className="w-16 px-3 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-primary-400 transition-colors text-center"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button
                onClick={addQuestion}
                className="w-full py-2 rounded-lg text-xs bg-gray-50 text-gray-500 border border-dashed border-gray-200 active:scale-[0.98] transition-all"
              >
                + 添加题目
              </button>
            </div>

            {/* 结果映射 */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700">结果映射</h3>
                <span className="text-xs text-gray-400">{formResults.length} 个结果</span>
              </div>
              {formResults.map((r, rIdx) => (
                <div key={r.id} className="space-y-2 pb-4 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-primary-500">R{rIdx + 1}</span>
                    <input
                      type="text"
                      value={r.title}
                      onChange={(e) => updateResult(rIdx, 'title', e.target.value)}
                      placeholder="结果标题，如：轻度焦虑"
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary-400 transition-colors"
                    />
                    {formResults.length > 1 && (
                      <button
                        onClick={() => removeResult(rIdx)}
                        className="text-xs text-red-400 px-2"
                      >
                        删除
                      </button>
                    )}
                  </div>
                  <textarea
                    value={r.description}
                    onChange={(e) => updateResult(rIdx, 'description', e.target.value)}
                    placeholder="结果详细解释..."
                    className="w-full pl-6 px-3 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-primary-400 transition-colors resize-none h-16"
                  />
                  <div className="pl-6 flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-400">最低分</span>
                      <input
                        type="number"
                        value={r.minScore}
                        onChange={(e) => updateResult(rIdx, 'minScore', parseInt(e.target.value) || 0)}
                        className="w-14 px-2 py-1.5 rounded-lg border border-gray-200 text-xs text-center focus:outline-none focus:border-primary-400 transition-colors"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-400">最高分</span>
                      <input
                        type="number"
                        value={r.maxScore}
                        onChange={(e) => updateResult(rIdx, 'maxScore', parseInt(e.target.value) || 0)}
                        className="w-14 px-2 py-1.5 rounded-lg border border-gray-200 text-xs text-center focus:outline-none focus:border-primary-400 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={addResult}
                className="w-full py-2 rounded-lg text-xs bg-gray-50 text-gray-500 border border-dashed border-gray-200 active:scale-[0.98] transition-all"
              >
                + 添加结果
              </button>
            </div>

            {/* 保存按钮 */}
            <button
              onClick={saveQuiz}
              className="w-full py-3.5 rounded-xl text-sm font-medium bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-sm active:scale-[0.98] transition-all sticky bottom-4"
            >
              {editingQuiz ? '保存修改' : '创建测评'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
