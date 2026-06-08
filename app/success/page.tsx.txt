'use client';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SuccessPage() {
  const { update } = useSession();
  const router = useRouter();

  useEffect(() => {
    async function refresh() {
      await update();
      router.push('/dashboard?success=true');
    }
    refresh();
  }, []);

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#070A0E'}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:'3rem',marginBottom:16}}>🎉</div>
        <div style={{color:'#16C761',fontWeight:700,fontSize:'1.2rem'}}>Payment successful!</div>
        <div style={{color:'#6B7280',marginTop:8}}>Redirecting to your dashboard...</div>
      </div>
    </div>
  );
}