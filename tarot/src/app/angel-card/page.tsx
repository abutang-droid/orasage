'use client'
import React from 'react'
import { useState } from 'react'

interface AngelCardData {
  cardId: string
  cardName: string
  cardNameEn: string
  element: string
  color: string
  symbol: string
  affirmation: string
  message: string
  guidance: string
  keywords: string[]
}

// 元素配色
const elementConfig: Record<string, { bg: string; border: string; light: string; icon: string }> = {
  fire:  { bg: '#FFF4EE', border: '#E8783A', light: '#FDE8D8', icon: '🔥' },
  water: { bg: '#EEF4FF', border: '#5B7FA6', light: '#D8E8F8', icon: '💧' },
  earth: { bg: '#EEFAF4', border: '#6BAF8D', light: '#D8F0E8', icon: '🌿' },
  air:   { bg: '#F8F4FF', border: '#9B8E82', light: '#EDE8E0', icon: '🌬️' },
  light: { bg: '#FFFDF0', border: '#D4A853', light: '#FFF0C8', icon: '✨' },
}

// 天使牌 SVG 图案组件
function AngelCardSVG({ symbol, color, size = 200 }: { symbol: string; color: string; size?: number }) {
  const s = size
  const cx = s / 2
  const cy = s / 2

  const patterns: Record<string, React.ReactElement> = {
    sword_shield: (
      <g>
        {/* 背景光晕 */}
        <circle cx={cx} cy={cy} r={s*0.42} fill={color} opacity="0.12"/>
        {/* 盾牌 */}
        <path d={`M${cx} ${cy-s*0.32} L${cx+s*0.22} ${cy-s*0.18} L${cx+s*0.22} ${cy+s*0.05} Q${cx+s*0.22} ${cy+s*0.28} ${cx} ${cy+s*0.35} Q${cx-s*0.22} ${cy+s*0.28} ${cx-s*0.22} ${cy+s*0.05} L${cx-s*0.22} ${cy-s*0.18} Z`}
          fill="none" stroke={color} strokeWidth={s*0.025} opacity="0.8"/>
        {/* 剑 */}
        <line x1={cx} y1={cy-s*0.38} x2={cx} y2={cy+s*0.22} stroke={color} strokeWidth={s*0.02} strokeLinecap="round"/>
        <line x1={cx-s*0.12} y1={cy-s*0.05} x2={cx+s*0.12} y2={cy-s*0.05} stroke={color} strokeWidth={s*0.018} strokeLinecap="round"/>
        {/* 星光 */}
        {[0,60,120,180,240,300].map((a,i) => (
          <circle key={i} cx={cx + Math.cos(a*Math.PI/180)*s*0.35} cy={cy + Math.sin(a*Math.PI/180)*s*0.35} r={s*0.018} fill={color} opacity="0.6"/>
        ))}
      </g>
    ),
    trumpet_lily: (
      <g>
        <circle cx={cx} cy={cy} r={s*0.42} fill={color} opacity="0.1"/>
        {/* 百合花 */}
        {[0,72,144,216,288].map((a,i) => (
          <ellipse key={i}
            cx={cx + Math.cos((a-90)*Math.PI/180)*s*0.2}
            cy={cy + Math.sin((a-90)*Math.PI/180)*s*0.2}
            rx={s*0.08} ry={s*0.18}
            fill={color} opacity="0.35"
            transform={`rotate(${a}, ${cx + Math.cos((a-90)*Math.PI/180)*s*0.2}, ${cy + Math.sin((a-90)*Math.PI/180)*s*0.2})`}
          />
        ))}
        {/* 号角 */}
        <path d={`M${cx-s*0.06} ${cy+s*0.05} Q${cx} ${cy-s*0.25} ${cx+s*0.06} ${cy+s*0.05}`}
          fill="none" stroke={color} strokeWidth={s*0.022} opacity="0.9"/>
        <ellipse cx={cx} cy={cy+s*0.08} rx={s*0.1} ry={s*0.04} fill={color} opacity="0.5"/>
        <circle cx={cx} cy={cy} r={s*0.06} fill={color} opacity="0.8"/>
      </g>
    ),
    healing_staff: (
      <g>
        <circle cx={cx} cy={cy} r={s*0.42} fill={color} opacity="0.1"/>
        {/* 权杖 */}
        <line x1={cx} y1={cy-s*0.38} x2={cx} y2={cy+s*0.38} stroke={color} strokeWidth={s*0.022} strokeLinecap="round"/>
        {/* 蛇缠绕 */}
        <path d={`M${cx+s*0.06} ${cy-s*0.28} Q${cx+s*0.16} ${cy-s*0.18} ${cx-s*0.06} ${cy-s*0.08} Q${cx-s*0.16} ${cy+s*0.02} ${cx+s*0.06} ${cy+s*0.12} Q${cx+s*0.16} ${cy+s*0.22} ${cx-s*0.06} ${cy+s*0.32}`}
          fill="none" stroke={color} strokeWidth={s*0.018} opacity="0.7" strokeLinecap="round"/>
        {/* 顶部星形 */}
        <polygon points={`${cx},${cy-s*0.42} ${cx+s*0.05},${cy-s*0.32} ${cx+s*0.15},${cy-s*0.32} ${cx+s*0.07},${cy-s*0.25} ${cx+s*0.1},${cy-s*0.15} ${cx},${cy-s*0.21} ${cx-s*0.1},${cy-s*0.15} ${cx-s*0.07},${cy-s*0.25} ${cx-s*0.15},${cy-s*0.32} ${cx-s*0.05},${cy-s*0.32}`}
          fill={color} opacity="0.8"/>
      </g>
    ),
    flame_wisdom: (
      <g>
        <circle cx={cx} cy={cy} r={s*0.42} fill={color} opacity="0.1"/>
        {/* 火焰 */}
        <path d={`M${cx} ${cy+s*0.35} Q${cx-s*0.15} ${cy+s*0.1} ${cx-s*0.08} ${cy-s*0.05} Q${cx-s*0.18} ${cy-s*0.2} ${cx} ${cy-s*0.38} Q${cx+s*0.18} ${cy-s*0.2} ${cx+s*0.08} ${cy-s*0.05} Q${cx+s*0.15} ${cy+s*0.1} ${cx} ${cy+s*0.35}`}
          fill={color} opacity="0.4"/>
        <path d={`M${cx} ${cy+s*0.2} Q${cx-s*0.08} ${cy+s*0.05} ${cx-s*0.04} ${cy-s*0.1} Q${cx} ${cy-s*0.25} ${cx+s*0.04} ${cy-s*0.1} Q${cx+s*0.08} ${cy+s*0.05} ${cx} ${cy+s*0.2}`}
          fill={color} opacity="0.7"/>
        {/* 眼睛（智慧之眼） */}
        <ellipse cx={cx} cy={cy+s*0.08} rx={s*0.1} ry={s*0.06} fill="none" stroke={color} strokeWidth={s*0.02} opacity="0.9"/>
        <circle cx={cx} cy={cy+s*0.08} r={s*0.03} fill={color} opacity="0.9"/>
      </g>
    ),
    heart_rose: (
      <g>
        <circle cx={cx} cy={cy} r={s*0.42} fill={color} opacity="0.1"/>
        {/* 心形 */}
        <path d={`M${cx} ${cy+s*0.28} Q${cx-s*0.3} ${cy+s*0.05} ${cx-s*0.3} ${cy-s*0.1} A${s*0.15} ${s*0.15} 0 0 1 ${cx} ${cy-s*0.05} A${s*0.15} ${s*0.15} 0 0 1 ${cx+s*0.3} ${cy-s*0.1} Q${cx+s*0.3} ${cy+s*0.05} ${cx} ${cy+s*0.28}`}
          fill={color} opacity="0.35"/>
        {/* 玫瑰花瓣 */}
        {[0,45,90,135,180,225,270,315].map((a,i) => (
          <ellipse key={i}
            cx={cx + Math.cos(a*Math.PI/180)*s*0.12}
            cy={cy + Math.sin(a*Math.PI/180)*s*0.12}
            rx={s*0.07} ry={s*0.04}
            fill={color} opacity="0.5"
            transform={`rotate(${a+90}, ${cx + Math.cos(a*Math.PI/180)*s*0.12}, ${cy + Math.sin(a*Math.PI/180)*s*0.12})`}
          />
        ))}
        <circle cx={cx} cy={cy} r={s*0.05} fill={color} opacity="0.9"/>
      </g>
    ),
    default: (
      <g>
        <circle cx={cx} cy={cy} r={s*0.42} fill={color} opacity="0.12"/>
        {/* 六芒星 */}
        <polygon points={`${cx},${cy-s*0.35} ${cx+s*0.3},${cy+s*0.17} ${cx-s*0.3},${cy+s*0.17}`}
          fill="none" stroke={color} strokeWidth={s*0.02} opacity="0.7"/>
        <polygon points={`${cx},${cy+s*0.35} ${cx+s*0.3},${cy-s*0.17} ${cx-s*0.3},${cy-s*0.17}`}
          fill="none" stroke={color} strokeWidth={s*0.02} opacity="0.7"/>
        <circle cx={cx} cy={cy} r={s*0.08} fill={color} opacity="0.8"/>
        {[0,60,120,180,240,300].map((a,i) => (
          <circle key={i} cx={cx + Math.cos(a*Math.PI/180)*s*0.26} cy={cy + Math.sin(a*Math.PI/180)*s*0.26}
            r={s*0.025} fill={color} opacity="0.6"/>
        ))}
      </g>
    )
  }

  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} xmlns="http://www.w3.org/2000/svg">
      {patterns[symbol] || patterns.default}
    </svg>
  )
}

export default function AngelCardPage() {
  const [step, setStep] = useState<'intro' | 'intention' | 'drawing' | 'result'>('intro')
  const [intention, setIntention] = useState('')
  const [card, setCard] = useState<AngelCardData | null>(null)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const elementCfg = card ? (elementConfig[card.element] || elementConfig.light) : elementConfig.light

  async function drawCard() {
    setLoading(true)
    setStep('drawing')
    try {
      const params = intention ? `?intention=${encodeURIComponent(intention)}` : ''
      const res = await fetch(`/api/angel-card${params}`)
      const data = await res.json()
      if (data.cardId) {
        setCard(data)
        setTimeout(() => setStep('result'), 1200)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function saveRecord() {
    if (!card || saved) return
    try {
      await fetch('/api/angel-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId: card.cardId, intention }),
      })
      setSaved(true)
    } catch (e) { console.error(e) }
  }

  function reset() {
    setStep('intro')
    setCard(null)
    setIntention('')
    setSaved(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8F6F1', paddingBottom: '80px' }}>
      {/* 页面标题 */}
      <div style={{ background: '#fff', borderBottom: '1px solid #EDE8E0', padding: '20px 20px 16px' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '22px' }}>👼</span>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#1A1A1A', margin: 0 }}>天使牌</h1>
              <p style={{ fontSize: '12px', color: '#8B7355', margin: 0 }}>Angel Cards · 神圣指引</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '20px' }}>

        {/* 介绍页 */}
        {step === 'intro' && (
          <div>
            {/* 天使牌介绍卡 */}
            <div style={{
              background: 'linear-gradient(135deg, #FFF8F0 0%, #FFF4E8 100%)',
              border: '1px solid #E8D5B8',
              borderRadius: '16px',
              padding: '28px 24px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '52px', marginBottom: '12px' }}>🌟</div>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1A1A1A', marginBottom: '10px' }}>
                天使牌指引
              </h2>
              <p style={{ fontSize: '14px', color: '#5A4A3A', lineHeight: '1.7', marginBottom: '0' }}>
                天使牌来自西方神秘学传统，每一张牌都承载着天使的讯息与智慧。
                无论你正在经历什么，天使都在你身旁，等待为你指引方向。
              </p>
            </div>

            {/* 功能说明 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
              {[
                { icon: '💫', title: '44张天使牌', desc: '大天使 · 守护天使 · 元素天使' },
                { icon: '🙏', title: '意图占卜', desc: '带着问题，获得专属指引' },
                { icon: '✨', title: '正念肯定语', desc: '每日一句，滋养内心力量' },
                { icon: '📖', title: '行动指引', desc: '具体建议，落地实践' },
              ].map((item, i) => (
                <div key={i} style={{
                  background: '#fff',
                  border: '1px solid #EDE8E0',
                  borderRadius: '12px',
                  padding: '14px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '6px' }}>{item.icon}</div>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#1A1A1A', marginBottom: '4px' }}>{item.title}</div>
                  <div style={{ fontSize: '11px', color: '#8B7355' }}>{item.desc}</div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setStep('intention')}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #C9954A, #D4A853)',
                color: '#fff',
                border: 'none',
                borderRadius: '50px',
                padding: '16px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(201,149,74,0.35)',
              }}
            >
              ✨ 开始天使牌占卜
            </button>
          </div>
        )}

        {/* 意图设定页 */}
        {step === 'intention' && (
          <div>
            <div style={{
              background: '#fff',
              border: '1px solid #EDE8E0',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '20px'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1A1A1A', marginBottom: '8px', textAlign: 'center' }}>
                🙏 设定你的意图
              </h2>
              <p style={{ fontSize: '13px', color: '#8B7355', textAlign: 'center', marginBottom: '20px', lineHeight: '1.6' }}>
                在抽卡之前，你可以在心中设定一个意图或问题，<br/>天使会为你带来最适合的指引。
              </p>

              <textarea
                value={intention}
                onChange={e => setIntention(e.target.value)}
                placeholder="例如：我在感情上需要什么指引？&#10;或者：我的事业下一步该怎么走？&#10;&#10;也可以留空，接受天使的随机指引。"
                style={{
                  width: '100%',
                  minHeight: '120px',
                  border: '1.5px solid #EDE8E0',
                  borderRadius: '12px',
                  padding: '14px',
                  fontSize: '14px',
                  color: '#1A1A1A',
                  background: '#FAFAF8',
                  resize: 'none',
                  outline: 'none',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                  lineHeight: '1.6',
                }}
              />

              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <button
                  onClick={() => setStep('intro')}
                  style={{
                    flex: 1,
                    background: '#F8F6F1',
                    color: '#8B7355',
                    border: '1px solid #EDE8E0',
                    borderRadius: '50px',
                    padding: '14px',
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  返回
                </button>
                <button
                  onClick={drawCard}
                  style={{
                    flex: 2,
                    background: 'linear-gradient(135deg, #C9954A, #D4A853)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '50px',
                    padding: '14px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(201,149,74,0.35)',
                  }}
                >
                  🌟 抽取天使牌
                </button>
              </div>
            </div>

            {/* 快捷意图 */}
            <div style={{ marginBottom: '8px' }}>
              <p style={{ fontSize: '12px', color: '#8B7355', marginBottom: '10px' }}>快捷意图：</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {['感情指引', '事业方向', '健康提示', '财运建议', '今日指引', '内心成长'].map(q => (
                  <button
                    key={q}
                    onClick={() => setIntention(q)}
                    style={{
                      background: intention === q ? '#C9954A' : '#fff',
                      color: intention === q ? '#fff' : '#8B7355',
                      border: `1px solid ${intention === q ? '#C9954A' : '#EDE8E0'}`,
                      borderRadius: '20px',
                      padding: '6px 14px',
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 抽卡动画页 */}
        {step === 'drawing' && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{
              width: '120px',
              height: '180px',
              margin: '0 auto 24px',
              background: 'linear-gradient(135deg, #C9954A, #D4A853)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px',
              boxShadow: '0 8px 32px rgba(201,149,74,0.4)',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}>
              ✨
            </div>
            <p style={{ fontSize: '16px', color: '#8B7355', fontWeight: '500' }}>天使正在为你选择...</p>
            <p style={{ fontSize: '13px', color: '#B8A898' }}>请保持内心平静，感受天使的存在</p>
          </div>
        )}

        {/* 结果页 */}
        {step === 'result' && card && (
          <div>
            {/* 天使牌卡片 */}
            <div style={{
              background: '#fff',
              border: `2px solid ${elementCfg.border}`,
              borderRadius: '20px',
              overflow: 'hidden',
              marginBottom: '16px',
              boxShadow: `0 8px 32px ${elementCfg.border}30`,
            }}>
              {/* 卡片头部 */}
              <div style={{
                background: `linear-gradient(135deg, ${elementCfg.bg}, ${elementCfg.light})`,
                padding: '28px 24px',
                textAlign: 'center',
                borderBottom: `1px solid ${elementCfg.border}30`,
              }}>
                <div style={{ marginBottom: '12px' }}>
                  <AngelCardSVG symbol={card.symbol} color={card.color} size={160} />
                </div>
                <div style={{ fontSize: '13px', color: elementCfg.border, fontWeight: '500', marginBottom: '4px' }}>
                  {elementCfg.icon} {card.element === 'fire' ? '火元素' : card.element === 'water' ? '水元素' : card.element === 'earth' ? '土元素' : card.element === 'air' ? '风元素' : '光元素'}
                </div>
                <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#1A1A1A', margin: '0 0 4px' }}>
                  {card.cardName}
                </h2>
                <p style={{ fontSize: '13px', color: '#8B7355', margin: 0, fontStyle: 'italic' }}>
                  {card.cardNameEn}
                </p>
              </div>

              {/* 正念肯定语 */}
              <div style={{
                background: `${elementCfg.bg}`,
                padding: '16px 24px',
                borderBottom: `1px solid ${elementCfg.border}20`,
                textAlign: 'center',
              }}>
                <p style={{ fontSize: '13px', color: elementCfg.border, fontWeight: '600', margin: '0 0 6px' }}>
                  ✨ 今日肯定语
                </p>
                <p style={{ fontSize: '15px', color: '#1A1A1A', fontWeight: '500', margin: 0, lineHeight: '1.6', fontStyle: 'italic' }}>
                  「{card.affirmation}」
                </p>
              </div>

              {/* 天使讯息 */}
              <div style={{ padding: '20px 24px', borderBottom: `1px solid #EDE8E0` }}>
                <p style={{ fontSize: '13px', color: '#8B7355', fontWeight: '600', margin: '0 0 10px' }}>
                  💌 天使的讯息
                </p>
                <p style={{ fontSize: '14px', color: '#3A3A3A', lineHeight: '1.8', margin: 0 }}>
                  {card.message}
                </p>
              </div>

              {/* 行动指引 */}
              <div style={{ padding: '20px 24px', borderBottom: `1px solid #EDE8E0` }}>
                <p style={{ fontSize: '13px', color: '#8B7355', fontWeight: '600', margin: '0 0 10px' }}>
                  🌱 行动指引
                </p>
                <p style={{ fontSize: '14px', color: '#3A3A3A', lineHeight: '1.8', margin: 0 }}>
                  {card.guidance}
                </p>
              </div>

              {/* 关键词 */}
              <div style={{ padding: '16px 24px' }}>
                <p style={{ fontSize: '13px', color: '#8B7355', fontWeight: '600', margin: '0 0 10px' }}>
                  🏷️ 关键词
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {card.keywords.map((kw, i) => (
                    <span key={i} style={{
                      background: elementCfg.bg,
                      color: elementCfg.border,
                      border: `1px solid ${elementCfg.border}40`,
                      borderRadius: '20px',
                      padding: '4px 12px',
                      fontSize: '12px',
                      fontWeight: '500',
                    }}>
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
              <button
                onClick={() => { saveRecord() }}
                disabled={saved}
                style={{
                  flex: 1,
                  background: saved ? '#F0EDE8' : '#fff',
                  color: saved ? '#8B7355' : '#C9954A',
                  border: `1px solid ${saved ? '#EDE8E0' : '#C9954A'}`,
                  borderRadius: '50px',
                  padding: '14px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: saved ? 'default' : 'pointer',
                }}
              >
                {saved ? '✅ 已保存' : '💾 保存记录'}
              </button>
              <button
                onClick={reset}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #C9954A, #D4A853)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '50px',
                  padding: '14px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(201,149,74,0.35)',
                }}
              >
                🔄 再次占卜
              </button>
            </div>

            {/* 提示 */}
            <div style={{
              background: '#FFF8F0',
              border: '1px solid #E8D5B8',
              borderRadius: '12px',
              padding: '14px 16px',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: '12px', color: '#8B7355', margin: 0, lineHeight: '1.6' }}>
                💡 天使牌的指引是一种内在智慧的镜子，<br/>最终的选择和行动权永远在你自己手中。
              </p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.85; }
        }
      `}</style>
    </div>
  )
}
