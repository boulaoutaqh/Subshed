'use client';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  return (
    <main style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
      <div style={{background:'#0D1117',border:'1px solid rgba(255,255,255,0.07)',borderRadius:20,padding:'48px 40px',maxWidth:400,width:'100%',textAlign:'center'}}>
        <div style={{fontSize:'2.5rem',marginBottom:12}}>🛡️</div>
        <h1 style={{fontSize:'1.8rem',fontWeight:800,marginBottom:8,letterSpacing:'-0.03em'}}>
          Sub<span style={{color:'#16C761'}}>shed</span>
        </h1>
        <p style={{color:'#6B7280',fontSize:'0.88rem',lineHeight:1.6,marginBottom:28}}>
          Find and cancel forgotten subscriptions<br/>through your email — no bank required.
        </p>
        <button
          onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
          style={{width:'100%',padding:'14px',background:'#16C761',color:'#000',border:'none',borderRadius:10,fontSize:'1rem',fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',gap:10}}>
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.5 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.1-4z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.8 13.5-4.8l-6.2-5.2C29.3 35.6 26.8 36 24 36c-5.2 0-9.6-3.5-11.2-8.2l-6.6 5C9.8 39.7 16.4 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.5-2.6 4.6-4.8 6l6.2 5.2C40.5 35.6 44 30.3 44 24c0-1.3-.1-2.7-.4-4z"/>
          </svg>
          Continue with Google
        </button>
        <p style={{marginTop:14,fontSize:'0.72rem',color:'#4B5563',lineHeight:1.6}}>
          🔒 Read-only Gmail access · No bank account · No credit card
        </p>
      </div>
    </main>
  );
}
