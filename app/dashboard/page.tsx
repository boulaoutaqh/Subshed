'use client';
import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter }           from 'next/navigation';

interface Sub {
  id:string; serviceName:string; serviceIcon:string;
  amount:number; status:string; cancelUrl:string;
}

export default function Dashboard() {
  const { status } = useSession();
  const router     = useRouter();
  const [subs,     setSubs]     = useState<Sub[]>([]);
  const [total,    setTotal]    = useState(0);
  const [scanning, setScanning] = useState(false);
  const [loading,  setLoading]  = useState(true);
  const [toast,    setToast]    = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated')   load();
    if (window.location.search.includes('success=true')) {
      showToast('🎉 Welcome to Pro! All features unlocked.');
      window.history.replaceState({}, '', '/dashboard');
    }
  }, [status]);

  async function load() {
    setLoading(true);
    const res  = await fetch('/api/subscriptions');
    const data = await res.json();
    setSubs(data.subscriptions || []);
    setTotal(data.monthlyTotal  || 0);
    setLoading(false);
  }

  async function scan() {
    setScanning(true);
    showToast('🔍 Scanning your inbox...');
    const res  = await fetch('/api/scan', { method: 'POST' });
    const data = await res.json();
    if (data.subscriptions) {
      setSubs(data.subscriptions);
      setTotal(data.subscriptions.filter((s:Sub)=>s.status==='active').reduce((a:number,s:Sub)=>a+s.amount,0));
      showToast(`✅ Found ${data.found} subscription${data.found!==1?'s':''}!`);
    } else {
      showToast('❌ ' + (data.error || 'Scan failed'));
    }
    setScanning(false);
  }

  async function cancel(id:string, name:string, amount:number) {
    if (!confirm(`Cancel ${name}? ($${amount}/month)`)) return;
    await fetch('/api/subscriptions', {
      method:'PATCH', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ id, status:'cancelled' }),
    });
    setSubs(prev => prev.map(s => s.id===id ? {...s,status:'cancelled'} : s));
    showToast(`✂️ ${name} cancelled — saving $${amount.toFixed(2)}/month!`);
  }

  async function upgrade() {
    const res  = await fetch('/api/lemonsqueezy/checkout', { method:'POST' });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else showToast('❌ ' + data.error);
  }

  function showToast(msg:string) {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  }

  if (status === 'loading' || loading) {
    return (
      <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:'2rem',marginBottom:12}}>🛡️</div>
          <div style={{color:'#16C761',fontWeight:700}}>Loading Subshed…</div>
        </div>
      </div>
    );
  }

  const active    = subs.filter(s => s.status === 'active');
  const cancelled = subs.filter(s => s.status === 'cancelled');

  return (
    <div style={{minHeight:'100vh'}}>
      {/* Toast */}
      {toast && (
        <div style={{position:'fixed',bottom:24,right:24,zIndex:999,background:'#0D1117',border:'1px solid #16C761',borderRadius:12,padding:'14px 20px',fontWeight:600,fontSize:'0.88rem',boxShadow:'0 8px 24px rgba(0,0,0,0.5)',maxWidth:340}}>
          {toast}
        </div>
      )}

      {/* Header */}
      <header style={{height:60,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 24px',borderBottom:'1px solid rgba(255,255,255,0.07)',background:'#0D1117',position:'sticky',top:0,zIndex:10}}>
        <div style={{fontWeight:800,fontSize:'1.1rem',letterSpacing:'-0.02em'}}>
          🛡 Sub<span style={{color:'#16C761'}}>shed</span>
        </div>
        <div style={{display:'flex',gap:10,alignItems:'center'}}>
          <button onClick={scan} disabled={scanning}
            style={{background:'#16C761',color:'#000',border:'none',borderRadius:8,padding:'8px 18px',fontWeight:700,fontSize:'0.85rem',opacity:scanning?0.7:1,transition:'all 0.2s'}}>
            {scanning ? '⟳ Scanning…' : '⟳ Scan Now'}
          </button>
          <button onClick={() => signOut({ callbackUrl:'/login' })}
            style={{background:'transparent',color:'#6B7280',border:'1px solid rgba(255,255,255,0.07)',borderRadius:8,padding:'8px 14px',fontSize:'0.85rem'}}>
            Sign Out
          </button>
        </div>
      </header>

      <main style={{padding:'24px',maxWidth:860,margin:'0 auto'}}>

        {/* Stats row */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:20}}>
          {[
            {label:'Monthly Total',   value:`$${total.toFixed(2)}`,    color:'#FF4D4D'},
            {label:'Active',          value:active.length,              color:'#F5A623'},
            {label:'Cancelled',       value:cancelled.length,           color:'#16C761'},
          ].map(k => (
            <div key={k.label} style={{background:'#0D1117',border:'1px solid rgba(255,255,255,0.07)',borderRadius:14,padding:'20px 22px'}}>
              <div style={{fontSize:'0.7rem',color:'#6B7280',textTransform:'uppercase',letterSpacing:'0.08em',fontWeight:700,marginBottom:8}}>
                {k.label}
              </div>
              <div style={{fontFamily:'monospace',fontSize:'1.9rem',color:k.color,letterSpacing:'-0.03em'}}>
                {k.value}
              </div>
            </div>
          ))}
        </div>

        {/* Upgrade banner */}
        <div style={{background:'rgba(22,199,97,0.07)',border:'1px solid rgba(22,199,97,0.2)',borderRadius:14,padding:'16px 20px',marginBottom:20,display:'flex',justifyContent:'space-between',alignItems:'center',gap:16,flexWrap:'wrap'}}>
          <div>
            <div style={{fontWeight:700,marginBottom:3}}>✦ Upgrade to Pro</div>
            <div style={{fontSize:'0.8rem',color:'#6B7280'}}>Unlimited scans + 7-day free trial — $4.99/month</div>
          </div>
          <button onClick={upgrade}
            style={{background:'#16C761',color:'#000',border:'none',borderRadius:10,padding:'10px 22px',fontWeight:700,fontSize:'0.88rem',whiteSpace:'nowrap'}}>
            Get Pro →
          </button>
        </div>

        {/* Subscriptions list */}
        <div style={{background:'#0D1117',border:'1px solid rgba(255,255,255,0.07)',borderRadius:14,overflow:'hidden'}}>
          <div style={{padding:'14px 20px',borderBottom:'1px solid rgba(255,255,255,0.07)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{fontWeight:700}}>Your Subscriptions</span>
            <span style={{fontSize:'0.75rem',color:'#6B7280'}}>{subs.length} found</span>
          </div>

          {subs.length === 0 ? (
            <div style={{padding:'60px 24px',textAlign:'center',color:'#6B7280'}}>
              <div style={{fontSize:'3rem',marginBottom:10}}>🔍</div>
              <div style={{fontWeight:600,marginBottom:6}}>No subscriptions yet</div>
              <div style={{fontSize:'0.82rem'}}>Click "Scan Now" to find all your subscriptions</div>
            </div>
          ) : subs.map((s,i) => (
            <div key={s.id} style={{display:'grid',gridTemplateColumns:'40px 1fr 90px 110px',alignItems:'center',gap:14,padding:'14px 20px',borderBottom:i<subs.length-1?'1px solid rgba(255,255,255,0.04)':'none',opacity:s.status==='cancelled'?0.4:1,transition:'background 0.2s'}}>
              <div style={{width:36,height:36,borderRadius:10,background:'rgba(255,255,255,0.05)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>
                {s.serviceIcon || '📋'}
              </div>
              <div>
                <div style={{fontWeight:700,fontSize:'0.92rem'}}>{s.serviceName}</div>
                {s.cancelUrl && s.status==='active' && (
                  <a href={s.cancelUrl} target="_blank" rel="noreferrer"
                    style={{fontSize:'0.68rem',color:'#6B7280',textDecoration:'underline'}}>
                    Cancel page ↗
                  </a>
                )}
              </div>
              <div style={{fontFamily:'monospace',fontSize:'0.9rem',color:s.status==='cancelled'?'#16C761':'#FF4D4D',textDecoration:s.status==='cancelled'?'line-through':'none'}}>
                ${s.amount.toFixed(2)}/mo
              </div>
              <div style={{display:'flex',justifyContent:'flex-end'}}>
                {s.status === 'cancelled' ? (
                  <span style={{fontSize:'0.72rem',color:'#16C761',fontWeight:700}}>✓ Cancelled</span>
                ) : (
                  <button onClick={() => cancel(s.id, s.serviceName, s.amount)}
                    style={{background:'rgba(255,77,77,0.1)',color:'#FF4D4D',border:'1px solid rgba(255,77,77,0.2)',borderRadius:7,padding:'6px 14px',fontSize:'0.75rem',fontWeight:700}}>
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}
