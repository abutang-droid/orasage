'use client'
import { useState } from 'react'
import { useDreamCopy } from '@/lib/i18n/feature-copy'

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

export default function DreamPage() {
  const copy = useDreamCopy()
  const [step, setStep] = useState<'input' | 'analyzing' | 'result'>('input')
  const [dreamContent, setDreamContent] = useState('')
  const [selectedEmotion, setSelectedEmotion] = useState('')
  const [result, setResult] = useState<DreamResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  async function analyzeDream() {
    if (dreamContent.trim().length < 5) {
      setError(copy.minLength)
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
        setError(data.error || copy.parseFailed)
        setStep('input')
      }
    } catch (e) {
      setError(copy.networkError)
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

  const emotionCfg =
    copy.emotions.find((e) => e.id === (result?.emotion || selectedEmotion)) || copy.emotions[4]

  return (
    <div style={{ minHeight: '100vh', background: '#F8F6F1', paddingBottom: '80px' }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #EDE8E0', padding: '20px 20px 16px' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '22px' }}>🌙</span>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#1A1A1A', margin: 0 }}>{copy.title}</h1>
              <p style={{ fontSize: '12px', color: '#8B7355', margin: 0 }}>{copy.subtitle}</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '20px' }}>
        {step === 'input' && (
          <div>
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
                  {copy.introTitle}
                </h3>
                <p style={{ fontSize: '13px', color: '#5A4A6A', lineHeight: '1.6', margin: 0 }}>
                  {copy.introBody}
                </p>
              </div>
            </div>

            <div style={{
              background: '#fff',
              border: '1px solid #EDE8E0',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '16px',
            }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#1A1A1A', display: 'block', marginBottom: '12px' }}>
                {copy.describeLabel}
              </label>
              <textarea
                value={dreamContent}
                onChange={e => { setDreamContent(e.target.value); setError('') }}
                placeholder={copy.placeholder}
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
                {copy.charCount(dreamContent.length)}
              </p>
            </div>

            <div style={{
              background: '#fff',
              border: '1px solid #EDE8E0',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '16px',
            }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#1A1A1A', display: 'block', marginBottom: '12px' }}>
                {copy.emotionLabel}
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {copy.emotions.map(e => (
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

            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '12px', color: '#8B7355', marginBottom: '10px', fontWeight: '500' }}>
                {copy.examplesLabel}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {copy.examples.map((dream, i) => (
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
              {copy.analyze}
            </button>
          </div>
        )}

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
              {copy.analyzingTitle}
            </p>
            <p style={{ fontSize: '13px', color: '#B8A898', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
              {copy.analyzingHint}
            </p>
          </div>
        )}

        {step === 'result' && result && (
          <div>
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
                <p style={{ fontSize: '12px', color: '#8B7355', margin: '0 0 4px' }}>{copy.emotionResult}</p>
                <p style={{ fontSize: '16px', fontWeight: '700', color: '#1A1A1A', margin: 0 }}>
                  {emotionCfg.emoji} {copy.emotionLabelFor(result.emotion)}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '12px', color: '#8B7355', margin: '0 0 4px' }}>{copy.symbolsCount}</p>
                <p style={{ fontSize: '16px', fontWeight: '700', color: '#C9954A', margin: 0 }}>
                  {copy.symbolsUnit(result.symbols.length)}
                </p>
              </div>
            </div>

            {result.symbols.length > 0 && (
              <div style={{
                background: '#fff',
                border: '1px solid #EDE8E0',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '14px',
              }}>
                <p style={{ fontSize: '13px', color: '#8B7355', fontWeight: '600', margin: '0 0 14px' }}>
                  {copy.symbolsTitle}
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

            <div style={{
              background: 'linear-gradient(135deg, #F0EDF8 0%, #EAE6F5 100%)',
              border: '1px solid #C8B8E8',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '14px',
            }}>
              <p style={{ fontSize: '13px', color: '#7E6FA8', fontWeight: '600', margin: '0 0 12px' }}>
                {copy.synthesisTitle}
              </p>
              <p style={{ fontSize: '14px', color: '#3A3A4A', lineHeight: '1.8', margin: 0 }}>
                {result.interpretation}
              </p>
            </div>

            <div style={{
              background: '#fff',
              border: '1px solid #EDE8E0',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '14px',
            }}>
              <p style={{ fontSize: '13px', color: '#8B7355', fontWeight: '600', margin: '0 0 12px' }}>
                {copy.subconsciousTitle}
              </p>
              <p style={{ fontSize: '14px', color: '#3A3A3A', lineHeight: '1.8', margin: 0 }}>
                {result.subconscious}
              </p>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #EEFAF4 0%, #E4F5EC 100%)',
              border: '1px solid #B8E0CC',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '20px',
            }}>
              <p style={{ fontSize: '13px', color: '#5A9A78', fontWeight: '600', margin: '0 0 12px' }}>
                {copy.suggestionTitle}
              </p>
              <p style={{ fontSize: '14px', color: '#2A5A3A', lineHeight: '1.8', margin: 0 }}>
                {result.suggestion}
              </p>
            </div>

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
                {copy.newDream}
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
                {copy.viewHistory}
              </button>
            </div>

            <div style={{
              background: '#F8F6F1',
              border: '1px solid #EDE8E0',
              borderRadius: '12px',
              padding: '14px 16px',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: '11px', color: '#B8A898', margin: 0, lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                {copy.disclaimer}
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
