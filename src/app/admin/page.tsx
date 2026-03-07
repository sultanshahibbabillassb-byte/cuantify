'use client'
import { useEffect, useState } from 'react'
import { createClient } from '../lib/supabase'

const ADMIN_EMAIL = 'sultanshahibbabilla.ssb@gmail.com'

type Profile = { id: string; email: string; full_name: string; status: string; created_at: string }

export default function AdminPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)
      if (user?.email === ADMIN_EMAIL) {
        const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
        setProfiles(data || [])
      }
      setLoading(false)
    }
    init()
  }, [])

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('profiles').update({ status }).eq('id', id)
    setProfiles(prev => prev.map(p => p.id === id ? { ...p, status } : p))
  }

  if (loading) return <div style={{minHeight:'100vh',background:'#0a0a0f',display:'flex',alignItems:'center',justifyContent:'center',color:'#9090b8',fontFamily:'Plus Jakarta Sans, sans-serif'}}>Loading...</div>
  if (!currentUser || currentUser.email !== ADMIN_EMAIL) return <div style={{minHeight:'100vh',background:'#0a0a0f',display:'flex',alignItems:'center',justifyContent:'center',color:'#ff4d6d',fontFamily:'Plus Jakarta Sans, sans-serif'}}>Akses ditolak.</div>

  const pending = profiles.filter(p => p.status === 'pending')
  const others = profiles.filter(p => p.status !== 'pending')

  const statusBadge = (status: string) => {
    const colors: any = { pending: '#c8ff00', approved: '#05df8a', rejected: '#ff4d6d' }
    return <span style={{background: colors[status]+'22', color: colors[status], padding:'4px 12px', borderRadius:'20px', fontSize:'12px', fontWeight:'600'}}>{status}</span>
  }

  const Row = ({ p }: { p: Profile }) => (
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 20px',background:'#1c1c2e',borderRadius:'12px',marginBottom:'8px',border:'1px solid #ffffff0d'}}>
      <div>
        <div style={{color:'#eeeef5',fontWeight:'600',marginBottom:'4px'}}>{p.full_name || '(no name)'}</div>
        <div style={{color:'#9090b8',fontSize:'14px'}}>{p.email}</div>
        <div style={{color:'#50506e',fontSize:'12px',marginTop:'4px'}}>{new Date(p.created_at).toLocaleDateString('id-ID', {day:'numeric',month:'long',year:'numeric'})}</div>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
        {statusBadge(p.status)}
        {p.status === 'pending' && (
          <>
            <button onClick={() => updateStatus(p.id, 'approved')} style={{background:'#05df8a22',color:'#05df8a',border:'1px solid #05df8a44',borderRadius:'8px',padding:'8px 16px',cursor:'pointer',fontWeight:'600',fontSize:'14px'}}>Approve</button>
            <button onClick={() => updateStatus(p.id, 'rejected')} style={{background:'#ff4d6d22',color:'#ff4d6d',border:'1px solid #ff4d6d44',borderRadius:'8px',padding:'8px 16px',cursor:'pointer',fontWeight:'600',fontSize:'14px'}}>Reject</button>
          </>
        )}
        {p.status !== 'pending' && (
          <button onClick={() => updateStatus(p.id, 'pending')} style={{background:'#ffffff0d',color:'#9090b8',border:'1px solid #ffffff16',borderRadius:'8px',padding:'8px 16px',cursor:'pointer',fontSize:'14px'}}>Reset</button>
        )}
      </div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#0a0a0f',fontFamily:'Plus Jakarta Sans, sans-serif',padding:'40px 24px'}}>
      <div style={{maxWidth:'720px',margin:'0 auto'}}>
        <h1 style={{color:'#eeeef5',fontSize:'28px',fontWeight:'700',marginBottom:'8px',fontFamily:'Space Grotesk, sans-serif'}}>
          <span style={{color:'#eeeef5'}}>Cuan</span><span style={{color:'#c8ff00'}}>tify</span> Admin
        </h1>
        <p style={{color:'#9090b8',marginBottom:'40px'}}>Kelola user yang minta akses</p>

        {pending.length > 0 && (
          <div style={{marginBottom:'32px'}}>
            <h2 style={{color:'#c8ff00',fontSize:'14px',fontWeight:'700',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'16px'}}>⏳ Menunggu Approval ({pending.length})</h2>
            {pending.map(p => <Row key={p.id} p={p} />)}
          </div>
        )}

        {pending.length === 0 && (
          <div style={{background:'#111118',borderRadius:'12px',padding:'24px',textAlign:'center',marginBottom:'32px',border:'1px solid #ffffff0d'}}>
            <p style={{color:'#50506e',margin:'0'}}>Tidak ada request pending ✅</p>
          </div>
        )}

        {others.length > 0 && (
          <div>
            <h2 style={{color:'#9090b8',fontSize:'14px',fontWeight:'700',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'16px'}}>Semua User ({others.length})</h2>
            {others.map(p => <Row key={p.id} p={p} />)}
          </div>
        )}
      </div>
    </div>
  )
}
