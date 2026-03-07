'use client'
export default function WaitingPage() {
  return (
    <div style={{minHeight:'100vh',background:'#0a0a0f',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Plus Jakarta Sans, sans-serif'}}>
      <div style={{textAlign:'center',padding:'48px',background:'#111118',borderRadius:'24px',border:'1px solid #ffffff0d',maxWidth:'480px'}}>
        <div style={{fontSize:'48px',marginBottom:'24px'}}>⏳</div>
        <h1 style={{color:'#eeeef5',fontSize:'24px',fontWeight:'700',marginBottom:'12px',fontFamily:'Space Grotesk, sans-serif'}}>
          Menunggu Approval
        </h1>
        <p style={{color:'#9090b8',lineHeight:'1.6',marginBottom:'32px'}}>
          Akun lo sudah terdaftar! Sultan lagi review request lo. Biasanya diapprove dalam 1x24 jam. Tenang aja ya 😊
        </p>
        <div style={{background:'#1c1c2e',borderRadius:'12px',padding:'16px',border:'1px solid #ffffff16'}}>
          <p style={{color:'#50506e',fontSize:'14px',margin:'0'}}>Kalau udah lama belum diapprove, hubungi Sultan langsung.</p>
        </div>
      </div>
    </div>
  )
}
