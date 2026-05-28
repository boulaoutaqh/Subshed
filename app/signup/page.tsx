import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function SignupPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect('/dashboard');
  
  return (
    <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh',background:'#0a0a0a'}}>
      <div style={{background:'#1a1a1a',padding:'40px',borderRadius:'12px',textAlign:'center'}}>
        <h1 style={{color:'white',marginBottom:'20px'}}>Create Account</h1>
        <a href="/api/auth/signin/google" style={{background:'#4CAF50',color:'white',padding:'12px 30px',borderRadius:'8px',textDecoration:'none',fontSize:'16px'}}>
          Continue with Google
        </a>
      </div>
    </div>
  );
}