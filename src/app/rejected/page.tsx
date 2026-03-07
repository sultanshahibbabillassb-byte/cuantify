'use client'
export default function RejectedPage() {
  return (
    <div style={{minHeight:'100vh',background:'#0a0a0f',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Plus Jakarta Sans, sans-serif'}}>
      <div style={{textAlign:'center',padding:'48px',background:'#111118',borderRadius:'24px',border:'1px solid #ffffff0d',maxWidth:'480px'}}>
        <div style={{fontSize:'48px',marginBottom:'24px'}}>🚫</div>
        <h1 style={{color:'#eeeef5',fontSize:'24px',fontWeight:'700',marginBottom:'12px',fontFamily:'Space Grotesk, sans-serif'}}>
          Akses Ditolak
        </h1>
        <p style={{color:'#9090b8',lineHeight:'1.6',marginBottom:'32px'}}>
          Maaf, request akses lo tidak disetujui. Hubungi Sultan langsung kalau ada pertanyaan.
        </p>
      </div>
    </div>
  )
}
