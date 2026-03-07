'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '../lib/supabase'
import { Transaction, Category } from '../lib/types'

const COLORS = {
  bg: '#0a0a0f', surface: '#111118', surface2: '#1c1c2e',
  border: '#ffffff0d', border2: '#ffffff16',
  text: '#eeeef5', text2: '#9090b8', text3: '#50506e',
  accent: '#c8ff00', income: '#05df8a', expense: '#ff4d6d', invest: '#4c6ef5'
}

const DEFAULT_CATEGORIES: Record<string, { subs: string[] }> = {
  'Active Income': { subs: ['Gaji Pokok', 'Lembur', 'Bonus / Insentif'] },
  'Non-Active Income': { subs: ['THR', 'Piutang Balik', 'Dana Lain di Luar Kerja'] },
  'Fixed Cost': { subs: ['Kos', 'Subscription', 'Sampah Kos'] },
  'Living Cost': { subs: ['Makan / Minum', 'Laundry', 'Kuota Internet', 'Bensin', 'Service Motor', 'E-Money Convert', 'Admin Bank / E-Wallet'] },
  'Lifestyle Cost': { subs: ['Nongkrong', 'Shopping', 'Liburan'] },
  'Social & Support': { subs: ['Uang Dipinjam Teman', 'Transfer ke Saudara'] },
  'Investment': { subs: ['—'] },
}

const TYPE_CATEGORIES: Record<string, string[]> = {
  INCOME: ['Active Income', 'Non-Active Income'],
  EXPENSE: ['Fixed Cost', 'Living Cost', 'Lifestyle Cost', 'Social & Support'],
  INVESTMENT: ['Investment'],
}

function formatRp(n: number) {
  return 'Rp ' + n.toLocaleString('id-ID')
}

function getPeriod(payDay: number, offset = 0) {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const day = now.getDate()
  let startMonth = day >= payDay ? month : month - 1
  startMonth += offset
  const startYear = year + Math.floor(startMonth / 12)
  const normStart = ((startMonth % 12) + 12) % 12
  const endMonth = normStart + 1
  const endYear = startYear + (endMonth > 11 ? 1 : 0)
  const start = new Date(startYear, normStart, payDay)
  const end = new Date(endYear, endMonth % 12, payDay - 1)
  return { start, end }
}

function formatDate(d: Date) {
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatDateInput(d: Date) {
  return d.toISOString().split('T')[0]
}

function BarChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '120px', padding: '8px 0' }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <div style={{ fontSize: '10px', color: COLORS.text2, fontFamily: 'JetBrains Mono' }}>
            {d.value > 0 ? (d.value / 1000000).toFixed(1) + 'jt' : ''}
          </div>
          <div style={{
            width: '100%', background: d.color + '33',
            borderRadius: '4px 4px 0 0', position: 'relative',
            height: `${Math.max((d.value / max) * 80, d.value > 0 ? 4 : 0)}px`,
            border: `1px solid ${d.color}40`, borderBottom: 'none',
            transition: 'height 0.3s ease'
          }}>
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              height: '3px', background: d.color, borderRadius: '2px 2px 0 0'
            }} />
          </div>
          <div style={{ fontSize: '9px', color: COLORS.text3, textAlign: 'center', fontFamily: 'JetBrains Mono', lineHeight: 1.2 }}>
            {d.label.length > 8 ? d.label.slice(0, 7) + '…' : d.label}
          </div>
        </div>
      ))}
    </div>
  )
}

function DonutChart({ income, expense, invest }: { income: number; expense: number; invest: number }) {
  const total = income + expense + invest || 1
  const iP = (income / total) * 100
  const eP = (expense / total) * 100
  const vP = (invest / total) * 100
  const r = 40, cx = 60, cy = 60, circumference = 2 * Math.PI * r
  let offset = 0
  const segments = [
    { pct: iP, color: COLORS.income },
    { pct: eP, color: COLORS.expense },
    { pct: vP, color: COLORS.invest },
  ]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <svg width="100" height="100" viewBox="0 0 120 120">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={COLORS.surface2} strokeWidth="18" />
        {segments.map((s, i) => {
          const dashArray = `${(s.pct / 100) * circumference} ${circumference}`
          const el = (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none"
              stroke={s.color} strokeWidth="18"
              strokeDasharray={dashArray}
              strokeDashoffset={-offset * circumference / 100 + circumference / 4}
              style={{ transform: 'rotate(-90deg)', transformOrigin: '60px 60px' }}
            />
          )
          offset += s.pct
          return el
        })}
        <text x={cx} y={cy - 4} textAnchor="middle" fill={COLORS.text} fontSize="11" fontFamily="Space Grotesk" fontWeight="700">
          {((income - expense) / 1000000).toFixed(1)}jt
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill={COLORS.text3} fontSize="8" fontFamily="JetBrains Mono">
          cashflow
        </text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {[
          { label: 'Income', value: income, color: COLORS.income },
          { label: 'Expense', value: expense, color: COLORS.expense },
          { label: 'Invest', value: invest, color: COLORS.invest },
        ].map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '2px', background: s.color, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '9px', color: COLORS.text3, fontFamily: 'JetBrains Mono' }}>{s.label}</div>
              <div style={{ fontSize: '11px', color: COLORS.text, fontWeight: '600', fontFamily: 'Space Grotesk' }}>
                {formatRp(s.value)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [periodOffset, setPeriodOffset] = useState(0)
  const [payDay] = useState(25)
  const [showModal, setShowModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transaksi'>('dashboard')
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    date: formatDateInput(new Date()),
    type: 'EXPENSE' as 'INCOME' | 'EXPENSE' | 'INVESTMENT',
    main_category: 'Lifestyle Cost',
    sub_category: '',
    amount: '',
    notes: '',
  })

  const period = getPeriod(payDay, periodOffset)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { window.location.href = '/'; return }
      setUser(data.user)
      const createdAt = new Date(data.user.created_at)
      const now = new Date()
      const diffMinutes = (now.getTime() - createdAt.getTime()) / 60000
      if (diffMinutes < 2) {
        fetch("/api/notify-admin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: data.user.email, name: data.user.user_metadata?.full_name })
        })
      }
    })
  }, [])

  const loadTransactions = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', formatDateInput(period.start))
      .lte('date', formatDateInput(period.end))
      .order('date', { ascending: false })
    setTransactions(data || [])
    setLoading(false)
  }, [user, periodOffset])

  useEffect(() => { loadTransactions() }, [loadTransactions])

  async function handleAddTransaction() {
    if (!user || !form.amount) return
    await supabase.from('transactions').insert({
      user_id: user.id,
      date: form.date,
      type: form.type,
      main_category: form.main_category,
      sub_category: form.sub_category || null,
      amount: parseInt(form.amount.replace(/\D/g, '')),
      notes: form.notes || null,
    })
    setShowModal(false)
    setForm({ date: formatDateInput(new Date()), type: 'EXPENSE', main_category: 'Lifestyle Cost', sub_category: '', amount: '', notes: '' })
    loadTransactions()
  }

  async function handleDelete(id: string) {
    await supabase.from('transactions').delete().eq('id', id)
    loadTransactions()
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const income = transactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0)
  const expense = transactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0)
  const invest = transactions.filter(t => t.type === 'INVESTMENT').reduce((s, t) => s + t.amount, 0)
  const cashflow = income - expense
  const savingRate = income > 0 ? ((income - expense) / income * 100) : 0

  const expenseByCategory: Record<string, number> = {}
  transactions.filter(t => t.type === 'EXPENSE').forEach(t => {
    expenseByCategory[t.main_category] = (expenseByCategory[t.main_category] || 0) + t.amount
  })
  const barData = Object.entries(expenseByCategory).map(([label, value]) => ({
    label, value, color: COLORS.expense
  }))

  const typeColor = { INCOME: COLORS.income, EXPENSE: COLORS.expense, INVESTMENT: COLORS.invest }
  const typeLabel = { INCOME: 'Income', EXPENSE: 'Expense', INVESTMENT: 'Invest' }

  const inputStyle = {
    padding: '10px 12px', borderRadius: '8px',
    border: `1px solid ${COLORS.border2}`, background: COLORS.bg,
    fontSize: '14px', outline: 'none', fontFamily: 'Plus Jakarta Sans, sans-serif',
    color: COLORS.text, width: '100%', boxSizing: 'border-box' as const
  }
  const labelStyle = { fontSize: '12px', color: COLORS.text2, marginBottom: '4px', fontFamily: 'JetBrains Mono, monospace' }

  const periodLabel = `${formatDate(period.start)} — ${formatDate(period.end)}`

  return (
    <div style={{ minHeight: '100vh', background: COLORS.bg, color: COLORS.text, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* TOPBAR */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: COLORS.bg + 'ee', backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${COLORS.border}`,
        padding: '0 16px', height: '52px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '18px', fontWeight: '700', flexShrink: 0 }}>
          Cuan<span style={{ color: COLORS.accent }}>tify</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <div style={{
            fontSize: '11px', color: COLORS.text3, fontFamily: 'JetBrains Mono, monospace',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px'
          }}>
            {user?.email?.split('@')[0]}
          </div>
          <button onClick={handleLogout} style={{
            background: 'transparent', border: `1px solid ${COLORS.border2}`,
            color: COLORS.text3, padding: '4px 10px', borderRadius: '6px',
            fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0
          }}>Logout</button>
        </div>
      </div>

      {/* NAV + PERIOD BAR */}
      <div style={{
        padding: '10px 16px', borderBottom: `1px solid ${COLORS.border}`,
        display: 'flex', flexDirection: 'column', gap: '10px'
      }}>
        {/* Tab + Period dalam 1 baris */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
            {(['dashboard', 'transaksi'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600',
                cursor: 'pointer', fontFamily: 'inherit', border: 'none',
                background: activeTab === tab ? COLORS.accent : COLORS.surface2,
                color: activeTab === tab ? '#0a0a0f' : COLORS.text2,
              }}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</button>
            ))}
          </div>
          {/* Period navigator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button onClick={() => setPeriodOffset(p => p - 1)} style={{
              background: COLORS.surface2, border: `1px solid ${COLORS.border2}`,
              color: COLORS.text, width: '26px', height: '26px', borderRadius: '6px',
              cursor: 'pointer', fontSize: '14px', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>‹</button>
            <div style={{
              fontSize: '11px', color: COLORS.text2, fontFamily: 'JetBrains Mono, monospace',
              textAlign: 'center', whiteSpace: 'nowrap'
            }}>
              {periodLabel}
            </div>
            <button onClick={() => setPeriodOffset(p => p + 1)} disabled={periodOffset >= 0} style={{
              background: COLORS.surface2, border: `1px solid ${COLORS.border2}`,
              color: periodOffset >= 0 ? COLORS.text3 : COLORS.text,
              width: '26px', height: '26px', borderRadius: '6px',
              cursor: periodOffset >= 0 ? 'not-allowed' : 'pointer', fontSize: '14px', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>›</button>
          </div>
        </div>
      </div>

      <div style={{ padding: '12px 16px', maxWidth: '900px', margin: '0 auto', paddingBottom: '80px' }}>

        {activeTab === 'dashboard' && (
          <div>
            {/* SUMMARY CARDS — 2 kolom di mobile */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '12px' }}>
              {[
                { label: 'INCOME', value: income, color: COLORS.income, sub: `${transactions.filter(t => t.type === 'INCOME').length} transaksi` },
                { label: 'EXPENSE', value: expense, color: COLORS.expense, sub: `${transactions.filter(t => t.type === 'EXPENSE').length} transaksi` },
                { label: 'INVEST', value: invest, color: COLORS.invest, sub: `${transactions.filter(t => t.type === 'INVESTMENT').length} transaksi` },
                { label: 'CASHFLOW', value: cashflow, color: cashflow >= 0 ? COLORS.income : COLORS.expense, sub: 'income - expense' },
                { label: 'SAVING RATE', value: null, color: savingRate >= 20 ? COLORS.income : COLORS.expense, sub: 'target > 20%', rate: savingRate },
              ].map((card, i) => (
                <div key={i} style={{
                  background: COLORS.surface, border: `1px solid ${COLORS.border}`,
                  borderRadius: '10px', padding: '12px',
                  borderTop: `2px solid ${card.color}40`,
                  gridColumn: i === 4 ? 'span 2' : 'span 1'
                }}>
                  <div style={{ fontSize: '8px', color: COLORS.text3, fontFamily: 'JetBrains Mono, monospace', marginBottom: '6px', letterSpacing: '1px' }}>
                    {card.label}
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: '700', fontFamily: 'Space Grotesk, sans-serif', color: card.color, marginBottom: '2px' }}>
                    {card.rate !== undefined ? `${card.rate.toFixed(1)}%` : formatRp(card.value!)}
                  </div>
                  <div style={{ fontSize: '10px', color: COLORS.text3 }}>{card.sub}</div>
                </div>
              ))}
            </div>

            {/* CHARTS — stack vertikal di mobile */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
              <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '9px', color: COLORS.text3, fontFamily: 'JetBrains Mono, monospace', marginBottom: '8px', letterSpacing: '1px' }}>EXPENSE PER KATEGORI</div>
                {barData.length > 0 ? <BarChart data={barData} /> : (
                  <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.text3, fontSize: '13px' }}>
                    Belum ada expense
                  </div>
                )}
              </div>
              <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '9px', color: COLORS.text3, fontFamily: 'JetBrains Mono, monospace', marginBottom: '8px', letterSpacing: '1px' }}>DISTRIBUSI</div>
                <DonutChart income={income} expense={expense} invest={invest} />
              </div>
            </div>

            {/* RECENT TRANSACTIONS */}
            <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: '10px', padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ fontSize: '9px', color: COLORS.text3, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '1px' }}>TRANSAKSI TERBARU</div>
                <button onClick={() => setActiveTab('transaksi')} style={{
                  background: 'transparent', border: 'none', color: COLORS.accent,
                  fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit'
                }}>Lihat semua →</button>
              </div>
              {transactions.slice(0, 5).map(tx => (
                <div key={tx.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 0', borderBottom: `1px solid ${COLORS.border}`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    <div style={{
                      width: '7px', height: '7px', borderRadius: '50%',
                      background: typeColor[tx.type], flexShrink: 0
                    }} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.main_category}</div>
                      <div style={{ fontSize: '10px', color: COLORS.text3 }}>
                        {tx.sub_category && `${tx.sub_category} · `}{tx.date}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '700', fontFamily: 'Space Grotesk, sans-serif', color: typeColor[tx.type], flexShrink: 0, marginLeft: '8px' }}>
                    {tx.type === 'INCOME' ? '+' : '-'}{formatRp(tx.amount)}
                  </div>
                </div>
              ))}
              {transactions.length === 0 && !loading && (
                <div style={{ textAlign: 'center', padding: '24px', color: COLORS.text3, fontSize: '13px' }}>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>💸</div>
                  Belum ada transaksi di periode ini
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'transaksi' && (
          <div>
            {transactions.map(tx => (
              <div key={tx.id} style={{
                background: COLORS.surface, border: `1px solid ${COLORS.border}`,
                borderRadius: '10px', padding: '12px', marginBottom: '8px',
                borderLeft: `3px solid ${typeColor[tx.type]}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: '9px', fontFamily: 'JetBrains Mono, monospace',
                        background: typeColor[tx.type] + '22', color: typeColor[tx.type],
                        padding: '2px 6px', borderRadius: '4px', border: `1px solid ${typeColor[tx.type]}40`,
                        flexShrink: 0
                      }}>{typeLabel[tx.type]}</span>
                      <span style={{ fontSize: '13px', fontWeight: '600' }}>{tx.main_category}</span>
                    </div>
                    {tx.sub_category && <div style={{ fontSize: '11px', color: COLORS.text3, marginBottom: '2px' }}>📂 {tx.sub_category}</div>}
                    {tx.notes && (
                      <div style={{
                        fontSize: '11px', color: COLORS.text2, background: COLORS.surface2,
                        padding: '4px 8px', borderRadius: '6px', marginBottom: '4px',
                        borderLeft: `2px solid ${COLORS.border2}`
                      }}>📝 {tx.notes}</div>
                    )}
                    <div style={{ fontSize: '10px', color: COLORS.text3 }}>📅 {tx.date}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', marginLeft: '8px', flexShrink: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', fontFamily: 'Space Grotesk, sans-serif', color: typeColor[tx.type] }}>
                      {tx.type === 'INCOME' ? '+' : '-'}{formatRp(tx.amount)}
                    </div>
                    <button onClick={() => handleDelete(tx.id)} style={{
                      background: 'transparent', border: `1px solid ${COLORS.border2}`,
                      color: COLORS.text3, padding: '3px 8px', borderRadius: '5px',
                      fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit'
                    }}>Hapus</button>
                  </div>
                </div>
              </div>
            ))}
            {transactions.length === 0 && !loading && (
              <div style={{ textAlign: 'center', padding: '48px', color: COLORS.text3 }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>💸</div>
                <div style={{ fontSize: '14px' }}>Belum ada transaksi di periode ini</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* FAB */}
      <button onClick={() => setShowModal(true)} style={{
        position: 'fixed', bottom: '20px', right: '20px',
        width: '52px', height: '52px', borderRadius: '50%',
        background: COLORS.accent, border: 'none',
        fontSize: '24px', cursor: 'pointer',
        boxShadow: `0 4px 20px ${COLORS.accent}40`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 99
      }}>+</button>

      {/* MODAL */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: '#0a0a0f80',
          backdropFilter: 'blur(4px)', zIndex: 200,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center'
        }} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={{
            background: COLORS.surface, borderRadius: '20px 20px 0 0',
            padding: '20px 16px', width: '100%', maxWidth: '500px',
            border: `1px solid ${COLORS.border2}`, borderBottom: 'none',
            maxHeight: '92vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '16px', fontWeight: '700' }}>Tambah Transaksi</div>
              <button onClick={() => setShowModal(false)} style={{
                background: COLORS.surface2, border: 'none', color: COLORS.text2,
                width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', fontSize: '16px'
              }}>×</button>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <div style={labelStyle}>Tipe</div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {(['INCOME', 'EXPENSE', 'INVESTMENT'] as const).map(t => (
                  <button key={t} onClick={() => setForm(f => ({
                    ...f, type: t,
                    main_category: TYPE_CATEGORIES[t][0],
                    sub_category: ''
                  }))} style={{
                    flex: 1, padding: '8px 4px', borderRadius: '8px', fontSize: '11px',
                    fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', border: 'none',
                    background: form.type === t ? typeColor[t] : COLORS.surface2,
                    color: form.type === t ? '#0a0a0f' : COLORS.text2,
                  }}>{typeLabel[t]}</button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <div style={labelStyle}>Tanggal</div>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={inputStyle} />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <div style={labelStyle}>Kategori</div>
              <select value={form.main_category} onChange={e => setForm(f => ({ ...f, main_category: e.target.value, sub_category: '' }))} style={inputStyle}>
                {TYPE_CATEGORIES[form.type].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {DEFAULT_CATEGORIES[form.main_category] && (
              <div style={{ marginBottom: '14px' }}>
                <div style={labelStyle}>Sub Kategori</div>
                <select value={form.sub_category} onChange={e => setForm(f => ({ ...f, sub_category: e.target.value }))} style={inputStyle}>
                  <option value="">— Pilih sub kategori —</option>
                  {DEFAULT_CATEGORIES[form.main_category].subs.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}

            <div style={{ marginBottom: '14px' }}>
              <div style={labelStyle}>Jumlah (Rp)</div>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={form.amount}
                onChange={e => {
                  const raw = e.target.value.replace(/\D/g, '')
                  setForm(f => ({ ...f, amount: raw ? parseInt(raw).toLocaleString('id-ID') : '' }))
                }}
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={labelStyle}>Catatan (opsional)</div>
              <input type="text" placeholder="Tambah catatan..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={inputStyle} />
            </div>

            <button onClick={handleAddTransaction} style={{
              width: '100%', padding: '13px', borderRadius: '10px',
              border: 'none', background: COLORS.accent, color: '#0a0a0f',
              fontSize: '14px', fontWeight: '700', cursor: 'pointer',
              fontFamily: 'Space Grotesk, sans-serif'
            }}>Simpan Transaksi</button>
          </div>
        </div>
      )}
    </div>
  )
}
