import { Quiz } from './types'

// 示例测评：焦虑状态测评
export const sampleQuiz: Quiz = {
  id: 'sample-anxiety-001',
  title: '你的焦虑指数有多高？',
  description: '通过科学测评，了解你当前的焦虑状态',
  questionCount: 8,
  estimatedTime: '3分钟',
  createdAt: new Date().toISOString(),
  questions: [
    {
      id: 'q1',
      text: '最近两周，你是否经常感到紧张、焦虑或坐立不安？',
      options: [
        { id: 'q1a', text: '几乎没有', score: 1 },
        { id: 'q1b', text: '偶尔会有', score: 2 },
        { id: 'q1c', text: '经常如此', score: 3 },
        { id: 'q1d', text: '几乎每天如此', score: 4 },
      ],
    },
    {
      id: 'q2',
      text: '你是否难以停止或控制担忧？',
      options: [
        { id: 'q2a', text: '完全不会', score: 1 },
        { id: 'q2b', text: '偶尔会', score: 2 },
        { id: 'q2c', text: '经常难以控制', score: 3 },
        { id: 'q2d', text: '完全无法控制', score: 4 },
      ],
    },
    {
      id: 'q3',
      text: '你是否对各种各样的事情都过度担忧？',
      options: [
        { id: 'q3a', text: '不会', score: 1 },
        { id: 'q3b', text: '只对少数事情', score: 2 },
        { id: 'q3c', text: '对很多事情', score: 3 },
        { id: 'q3d', text: '几乎所有事情', score: 4 },
      ],
    },
    {
      id: 'q4',
      text: '你是否难以放松？',
      options: [
        { id: 'q4a', text: '很容易放松', score: 1 },
        { id: 'q4b', text: '有时可以放松', score: 2 },
        { id: 'q4c', text: '很难放松', score: 3 },
        { id: 'q4d', text: '完全无法放松', score: 4 },
      ],
    },
    {
      id: 'q5',
      text: '你是否因为太不安而无法静坐？',
      options: [
        { id: 'q5a', text: '不会', score: 1 },
        { id: 'q5b', text: '偶尔会', score: 2 },
        { id: 'q5c', text: '经常如此', score: 3 },
        { id: 'q5d', text: '几乎每天', score: 4 },
      ],
    },
    {
      id: 'q6',
      text: '你是否容易变得烦躁或易怒？',
      options: [
        { id: 'q6a', text: '很少', score: 1 },
        { id: 'q6b', text: '有时会', score: 2 },
        { id: 'q6c', text: '经常如此', score: 3 },
        { id: 'q6d', text: '总是如此', score: 4 },
      ],
    },
    {
      id: 'q7',
      text: '你是否感到好像将有可怕的事情发生？',
      options: [
        { id: 'q7a', text: '从不', score: 1 },
        { id: 'q7b', text: '很少', score: 2 },
        { id: 'q7c', text: '有时会', score: 3 },
        { id: 'q7d', text: '经常感到', score: 4 },
      ],
    },
    {
      id: 'q8',
      text: '你是否出现睡眠困难（入睡困难或易醒）？',
      options: [
        { id: 'q8a', text: '睡眠很好', score: 1 },
        { id: 'q8b', text: '偶尔失眠', score: 2 },
        { id: 'q8c', text: '经常失眠', score: 3 },
        { id: 'q8d', text: '严重失眠', score: 4 },
      ],
    },
  ],
  results: [
    {
      id: 'r1',
      title: '🌸 心态平和',
      description: '你目前的心理状态非常健康，焦虑水平很低。你能够很好地应对生活中的压力，保持内心的平静。继续保持这种良好的心态，适当运动和社交会让你的状态更好！',
      minScore: 8,
      maxScore: 14,
    },
    {
      id: 'r2',
      title: '🍃 轻度焦虑',
      description: '你存在一定程度的焦虑，但仍在正常范围内。这可能与你近期的生活变化或压力有关。建议尝试深呼吸、冥想等放松技巧，保持规律作息，必要时可以和信任的人聊聊。',
      minScore: 15,
      maxScore: 22,
    },
    {
      id: 'r3',
      title: '🍂 中度焦虑',
      description: '你的焦虑水平偏高，可能已经影响到了日常生活。建议你认真关注自己的心理状态，尝试规律运动、减少咖啡因摄入、练习正念冥想。如果持续感到不适，建议寻求专业心理咨询师的帮助。',
      minScore: 23,
      maxScore: 29,
    },
    {
      id: 'r4',
      title: '🍂 高度焦虑',
      description: '你的焦虑水平较高，可能正在经历较大的心理压力。请不要忽视这些信号，建议尽快寻求专业心理咨询师或医生的帮助。同时，保持规律作息、适当运动、与亲友保持联系，这些都是缓解焦虑的有效方式。记住，寻求帮助是勇敢的表现。',
      minScore: 30,
      maxScore: 32,
    },
  ],
}
