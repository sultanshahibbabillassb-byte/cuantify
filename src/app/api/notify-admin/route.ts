import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  const { email, name } = await request.json()

  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: 'sultanshahibbabilla.ssb@gmail.com',
    subject: '🔔 Ada user baru minta akses Cuantify!',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0a0a0f;color:#eeeef5;border-radius:16px">
        <h2 style="color:#c8ff00;margin-bottom:8px">Ada request akses baru!</h2>
        <p style="color:#9090b8;margin-bottom:24px">Seseorang baru aja daftar ke Cuantify dan butuh approval lo.</p>
        <div style="background:#1c1c2e;padding:20px;border-radius:12px;margin-bottom:24px">
          <p style="margin:0 0 8px 0"><strong style="color:#9090b8">Nama:</strong> <span style="color:#eeeef5">${name || '(tidak ada)'}</span></p>
          <p style="margin:0"><strong style="color:#9090b8">Email:</strong> <span style="color:#eeeef5">${email}</span></p>
        </div>
        <a href="https://cuantify-rich.vercel.app/admin" style="display:inline-block;background:#c8ff00;color:#0a0a0f;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700">Buka Halaman Admin →</a>
      </div>
    `
  })

  return NextResponse.json({ ok: true })
}
