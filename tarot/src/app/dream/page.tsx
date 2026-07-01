'use client'
import { useState } from 'react'

interface DreamSymbol {
  keyword: string
  meaning: string
  element: string
  positive: string
  negative: string
}

interface DreamResult {
  id?: string
  emotion: string
  symbols: DreamSymbol[]
  interpretation: string
  subconscious: string
  suggestion: string
}

const EMOTIONS = [
  { id: '平静', label: '平静', emoji: '😌', color: '#5B7FA6' },
  { id: '喜悦', label: '喜悦', emoji: '😊', color: '#F5C842' },
  { id: '焦虑', label: '焦虑', emoji: '😰', color: '#E8783A' },
  { id: '悲伤', label: '悲伤', emoji: '😢', color: '#7E9BAF' },
  { id: '困惑', label: '困惑', emoji: '😕', color: '#9B8E82' },
]

const EXAMPLE_DREAMS = [
  '我梦见自己在飞翔，飞过一片广阔的大海，感觉非常自由...',
  '我梦见一条大蛇追着我跑，我很害怕，拼命逃跑...',
  '我梦见自己在一个陌生的房子里迷路，找不到出口...',
  '我梦见和已故的亲人在一起，他们看起来很平静...',
]

export default function DreamPage() {
  const [step, setStep] = useState<'input' | 'analyzing' | 'result'>('input')
  const [dreamContent, setDreamContent] = useState('')
  const [selectedEmotion, setSelectedEmotion] = useState('')
  const [result, setResult] = useState<DreamResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  async function analyzeDream() {
    if (dreamContent.trim().length < 5) {
      setError('请至少描述5个字的梦境内容')
      return
    }
    setError('')
    setLoading(true)
    setStep('analyzing')

    try {
      const res = await fetch('/api/dream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dreamContent, emotion: selectedEmotion }),
      })
      const data = await res.json()
      if (data.interpretation) {
        setResult(data)
        setTimeout(() => setStep('result'), 1500)
      } else {
        setError(data.error || '解析失败，请重试')
        setStep('input')
      }
    } catch (e) {
      setError('网络错误，请重试')
      setStep('input')
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setStep('input')
    setResult(null)
    setDreamContent('')
    setSelectedEmotion('')
    setSaved(false)
    setError('')
  }

  const emotionCfg = EMOTIONS.find(e => e.id === (result?.emotion || selectedEmotion)) || EMOTIONS[4]

  return (
    <div style={{ minHeight: '100vh', background: '#F8F6F1', paddingBottom: '80px' }}>
      {/* 页面标题 */}
      <div style={{ background: '#fff', borderBottom: '1px solid #EDE8E0', padding: '20px 20px 16px' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '22px' }}>🌙</span>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#1A1A1A', margin: 0 }}>梦境解析</h1>
              <p style={{ fontSize: '12px', color: '#8B7355', margin: 0 }}>Dream Interpretation · 潜意识探索</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '20px' }}>

        {/* 输入页 */}
        {step === 'input' && (
          <div>
            {/* 说明卡 */}
            <div style={{
              background: 'linear-gradient(135deg, #F0EDF8 0%, #E8E4F5 100%)',
              border: '1px solid #C8B8E8',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '20px',
              display: 'flex',
              gap: '14px',
              alignItems: 'flex-start',
            }}>
              <span style={{ fontSize: '32px', flexShrink: 0 }}>🌌</span>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1A1A1A', margin: '0 0 6px' }}>
                  梦境是潜意识的语言
                </h3>
                <p style={{ fontSize: '13px', color: '#5A4A6A', lineHeight: '1.6', margin: 0 }}>
                  每一个梦境都包含着你内心深处的信息。通过解析梦境中的符号，
                  我们可以了解你的潜意识正在处理什么，以及它想告诉你什么。
                </p>
              </div>
            </div>

            {/* 梦境描述输入 */}
            <div style={{
              background: '#fff',
              border: '1px solid #EDE8E0',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '16px',
            }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#1A1A1A', display: 'block', marginBottom: '12px' }}>
                🌙 描述你的梦境
              </label>
              <textarea
                value={dreamContent}
                onChange={e => { setDreamContent(e.target.value); setError('') }}
                placeholder="尽量详细地描述你梦见了什么...&#10;&#10;例如：梦见了什么人、什么地方、发生了什么事、有什么感受..."
                style={{
                  width: '100%',
                  minHeight: '140px',
                  border: `1.5px solid ${error ? '#E87070' : '#EDE8E0'}`,
                  borderRadius: '12px',
                  padding: '14px',
                  fontSize: '14px',
                  color: '#1A1A1A',
                  background: '#FAFAF8',
                  resize: 'none',
                  outline: 'none',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                  lineHeight: '1.7',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = '#C9954A'}
                onBlur={e => e.target.style.borderColor = error ? '#E87070' : '#EDE8E0'}
              />
              {error && <p style={{ fontSize: '12px', color: '#E87070', margin: '6px 0 0' }}>{error}</p>}
              <p style={{ fontSize: '12px', color: '#B8A898', margin: '8px 0 0', textAlign: 'right' }}>
                {dreamContent.length} 字
              </p>
            </div>

            {/* 情绪选择 */}
            <div style={{
              background: '#fff',
              border: '1px solid #EDE8E0',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '16px',
            }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#1A1A1A', display: 'block', marginBottom: '12px' }}>
                💭 梦中的情绪感受（可选）
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {EMOTIONS.map(e => (
                  <button
                    key={e.id}
                    onClick={() => setSelectedEmotion(selectedEmotion === e.id ? '' : e.id)}
                    style={{
                      background: selectedEmotion === e.id ? e.color : '#F8F6F1',
                      color: selectedEmotion === e.id ? '#fff' : '#5A4A3A',
                      border: `1.5px solid ${selectedEmotion === e.id ? e.color : '#EDE8E0'}`,
                      borderRadius: '50px',
                      padding: '8px 16px',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s',
                    }}
                  >
                    <span>{e.emoji}</span>
                    <span>{e.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 示例梦境 */}
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '12px', color: '#8B7355', marginBottom: '10px', fontWeight: '500' }}>
                💡 示例梦境（点击填入）：
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {EXAMPLE_DREAMS.map((dream, i) => (
                  <button
                    key={i}
                    onClick={() => setDreamContent(dream)}
                    style={{
                      background: '#fff',
                      border: '1px solid #EDE8E0',
                      borderRadius: '10px',
                      padding: '10px 14px',
                      fontSize: '12px',
                      color: '#5A4A3A',
                      cursor: 'pointer',
                      textAlign: 'left',
                      lineHeight: '1.5',
                    }}
                  >
                    {dream}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={analyzeDream}
              disabled={dreamContent.trim().length < 5}
              style={{
                width: '100%',
                background: dreamContent.trim().length >= 5
                  ? 'linear-gradient(135deg, #7E6FA8, #9882C0)'
                  : '#E8E4F0',
                color: dreamContent.trim().length >= 5 ? '#fff' : '#B8B0C8',
                border: 'none',
                borderRadius: '50px',
                padding: '16px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: dreamContent.trim().length >= 5 ? 'pointer' : 'not-allowed',
                boxShadow: dreamContent.trim().length >= 5 ? '0 4px 16px rgba(126,111,168,0.35)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              🔮 解析我的梦境
            </button>
          </div>
        )}

        {/* 解析中动画 */}
        {step === 'analyzing' && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{
              width: '100px',
              height: '100px',
              margin: '0 auto 24px',
              background: 'linear-gradient(135deg, #7E6FA8, #9882C0)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px',
              boxShadow: '0 8px 32px rgba(126,111,168,0.4)',
              animation: 'spin 3s linear infinite',
            }}>
              🌙
            </div>
            <p style={{ fontSize: '16px', color: '#7E6FA8', fontWeight: '600', marginBottom: '8px' }}>
              正在解析你的梦境...
            </p>
            <p style={{ fontSize: '13px', color: '#B8A898', lineHeight: '1.6' }}>
              潜意识的语言正在被翻译<br/>请稍候片刻
            </p>
          </div>
        )}

        {/* 解析结果 */}
        {step === 'result' && result && (
          <div>
            {/* 情绪标签 */}
            <div style={{
              background: '#fff',
              border: '1px solid #EDE8E0',
              borderRadius: '16px',
              padding: '16px 20px',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <p style={{ fontSize: '12px', color: '#8B7355', margin: '0 0 4px' }}>梦境情绪</p>
                <p style={{ fontSize: '16px', fontWeight: '700', color: '#1A1A1A', margin: 0 }}>
                  {emotionCfg.emoji} {result.emotion}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '12px', color: '#8B7355', margin: '0 0 4px' }}>识别符号</p>
                <p style={{ fontSize: '16px', fontWeight: '700', color: '#C9954A', margin: 0 }}>
                  {result.symbols.length} 个
                </p>
              </div>
            </div>

            {/* 梦境符号 */}
            {result.symbols.length > 0 && (
              <div style={{
                background: '#fff',
                border: '1px solid #EDE8E0',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '14px',
              }}>
                <p style={{ fontSize: '13px', color: '#8B7355', fontWeight: '600', margin: '0 0 14px' }}>
                  🔍 梦境符号解析
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {result.symbols.map((sym, i) => (
                    <div key={i} style={{
                      background: '#F8F6F1',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      borderLeft: '3px solid #C9954A',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '15px', fontWeight: '700', color: '#1A1A1A' }}>「{sym.keyword}」</span>
                        <span style={{
                          background: '#FFF4E8',
                          color: '#C9954A',
                          border: '1px solid #E8D5B8',
                          borderRadius: '20px',
                          padding: '2px 10px',
                          fontSize: '11px',
                          fontWeight: '500',
                        }}>
                          {sym.element}
                        </span>
                      </div>
                      <p style={{ fontSize: '13px', color: '#5A4A3A', margin: '0 0 6px' }}>{sym.meaning}</p>
                      <div style={{ display: 'flex', gap: '8px', fontSize: '11px' }}>
                        <span style={{ color: '#6BAF8D' }}>✓ {sym.positive}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 综合解析 */}
            <div style={{
              background: 'linear-gradient(135deg, #F0EDF8 0%, #EAE6F5 100%)',
              border: '1px solid #C8B8E8',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '14px',
            }}>
              <p style={{ fontSize: '13px', color: '#7E6FA8', fontWeight: '600', margin: '0 0 12px' }}>
                🔮 梦境综合解析
              </p>
              <p style={{ fontSize: '14px', color: '#3A3A4A', lineHeight: '1.8', margin: 0 }}>
                {result.interpretation}
              </p>
            </div>

            {/* 潜意识信息 */}
            <div style={{
              background: '#fff',
              border: '1px solid #EDE8E0',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '14px',
            }}>
              <p style={{ fontSize: '13px', color: '#8B7355', fontWeight: '600', margin: '0 0 12px' }}>
                💭 潜意识的信息
              </p>
              <p style={{ fontSize: '14px', color: '#3A3A3A', lineHeight: '1.8', margin: 0 }}>
                {result.subconscious}
              </p>
            </div>

            {/* 行动建议 */}
            <div style={{
              background: 'linear-gradient(135deg, #EEFAF4 0%, #E4F5EC 100%)',
              border: '1px solid #B8E0CC',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '20px',
            }}>
              <p style={{ fontSize: '13px', color: '#5A9A78', fontWeight: '600', margin: '0 0 12px' }}>
                🌱 行动建议
              </p>
              <p style={{ fontSize: '14px', color: '#2A5A3A', lineHeight: '1.8', margin: 0 }}>
                {result.suggestion}
              </p>
            </div>

            {/* 操作按钮 */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
              <button
                onClick={reset}
                style={{
                  flex: 1,
                  background: '#fff',
                  color: '#7E6FA8',
                  border: '1px solid #C8B8E8',
                  borderRadius: '50px',
                  padding: '14px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                🌙 解析新梦境
              </button>
              <button
                onClick={() => window.location.href = '/history?tab=dream'}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #7E6FA8, #9882C0)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '50px',
                  padding: '14px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(126,111,168,0.35)',
                }}
              >
                📖 查看历史
              </button>
            </div>

            {/* 免责声明 */}
            <div style={{
              background: '#F8F6F1',
              border: '1px solid #EDE8E0',
              borderRadius: '12px',
              padding: '14px 16px',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: '11px', color: '#B8A898', margin: 0, lineHeight: '1.6' }}>
                梦境解析基于荣格心理学和符号学理论，<br/>
                仅供参考，不构成心理诊断或医疗建议。
              </p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
