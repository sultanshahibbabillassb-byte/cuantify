'use client'
import { useState } from 'react'
import { createClient } from './lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const supabase = createClient()

  async function handleEmailAuth() {
    setLoading(true)
    setMessage('')
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setMessage(error.message)
      else setMessage('Cek email lo untuk konfirmasi akun!')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage(error.message)
      else window.location.href = '/dashboard'
    }
    setLoading(false)
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` }
    })
  }

  return (
    <div style={{minHeight:'100vh',background:'#0a0a0f',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Plus Jakarta Sans',sans-serif",padding:'24px'}}>
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&family=Plus+Jakarta+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>
      <div style={{background:'#111118',borderRadius:'20px',padding:'40px',width:'100%',maxWidth:'400px',border:'1px solid #ffffff0d',boxShadow:'0 8px 60px #000000aa'}}>
        <div style={{textAlign:'center',marginBottom:'36px'}}>
          <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:'30px',fontWeight:'700',color:'#eeeef5'}}>Cuan<span style={{color:'#c8ff00'}}>tify</span></div>
          <div style={{fontSize:'13px',color:'#9090b8',marginTop:'6px'}}>{isSignUp?'buat akun baru':'selamat datang kembali'}</div>
        </div>
        <button onClick={handleGoogle} style={{width:'100%',padding:'12px',borderRadius:'10px',border:'1px solid #ffffff16',background:'#1c1c2e',display:'flex',alignItems:'center',justifyContent:'center',gap:'10px',fontSize:'14px',fontWeight:'600',color:'#eeeef5',cursor:'pointer',marginBottom:'20px',fontFamily:'inherit'}}>
          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-        <div style={{textAlign:'center',marginBottom:'36px'}}>
          <div style={{fontFamily:"8 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Lanjut d          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.   <div style={{flex:1,height:'1px',background:'#ffffff0d'}}/>
          <span style={{fontSize:'11px',color:'#50506e'}}>atau</span>
          <div style={{flex:1,height:'1px',background:'#ffffff0d'}}/>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:'10px',marginBottom:'14px'}}>
          <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} style={{padding:'12px 14px',borderRadius:'10px',border:'1px solid #ffffff0d',background:'#0a0a0f',fontSize:'14px',outline:'none',fontFamily:'inherit',color:'#eeeef5'}}/>
          <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleEmailAuth()} style={{padding:'12px 14px',borderRadius:'10px',border:'1px solid #ffffff0d',background:'#0a0a0f',fontSize:'14px',outline:'none',fontFamily:'inherit',color:'#eeeef5'}}/>
        </div>
        {message&&<div style={{padding:'10px 14px',borderRadius:'8px',fontSize:'13px',marginBottom:'12px',background:message.includes('Cek')?'#05df8a15':'#ff4d6d15',color:message.includes('Cek')?'#05df8a':'#ff4d6d',border:`1px solid ${message.includes('Cek')?'#05df8a30':'#ff4d6d30'}`}}>{message}</div>}
        <button onClick={handleEmailAuth} disabled={loading} style={{width:'100%',padding:'13px',borderRadius:'10px',border:'none',background:loading?'#c8ff0060':'#c8ff00',color:'#0a0a0f',fontSize:'14px',fontWeight:'700',cursor:loading?'not-allowed':'pointer',fontFamily:"'Space Grotesk',sans-serif"}}>
          {loading?'Loading...':isSignUp?'Daftar':'Masuk'}
                </div>
        {message&&<div style={{padding:'10px 14px',borderRadius:'8px',fontSize:'13px',marginBottom:'12px',background:message.includes('Cek')?'#05df8a15':'#ff4d6d15',color:message.includes('Cek')?'#05df8a':'#ff4d6d',border:`1px solid ${message.includes('Cek')?'#05df8a30':'#ff4d6d30'}`}}>{message}</div>}
        <butto    </div>
      </div>
    </div>
  )
}
EOFdffdvcd /Users/ruangguru/cuantify
git log --oneline -5
