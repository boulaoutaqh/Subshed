export default function ContactPage() {
  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#0a0a0a'}}>
      <div style={{background:'#1a1a1a',padding:'40px',borderRadius:'12px',maxWidth:'500px',width:'100%',margin:'20px'}}>
        <h1 style={{color:'white',marginBottom:'8px',fontSize:'1.5rem'}}>Contact Us</h1>
        <p style={{color:'#6B7280',marginBottom:'30px',fontSize:'0.9rem'}}>We usually reply within 24 hours.</p>
        
        <div style={{marginBottom:'16px'}}>
          <label style={{color:'#9CA3AF',fontSize:'0.85rem',display:'block',marginBottom:'6px'}}>Email</label>
          <input type="email" placeholder="your@email.com" 
            style={{width:'100%',padding:'10px 14px',background:'#0D1117',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'8px',color:'white',fontSize:'0.9rem',boxSizing:'border-box'}}/>
        </div>

        <div style={{marginBottom:'16px'}}>
          <label style={{color:'#9CA3AF',fontSize:'0.85rem',display:'block',marginBottom:'6px'}}>Subject</label>
          <input type="text" placeholder="How can we help?" 
            style={{width:'100%',padding:'10px 14px',background:'#0D1117',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'8px',color:'white',fontSize:'0.9rem',boxSizing:'border-box'}}/>
        </div>

        <div style={{marginBottom:'24px'}}>
          <label style={{color:'#9CA3AF',fontSize:'0.85rem',display:'block',marginBottom:'6px'}}>Message</label>
          <textarea placeholder="Your message..." rows={5}
            style={{width:'100%',padding:'10px 14px',background:'#0D1117',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'8px',color:'white',fontSize:'0.9rem',boxSizing:'border-box',resize:'none'}}/>
        </div>

        <a href="mailto:boulaoutaqh@gmail.com" 
          style={{display:'block',background:'#16C761',color:'#000',padding:'12px',borderRadius:'8px',textAlign:'center',textDecoration:'none',fontWeight:'700',fontSize:'0.95rem'}}>
          Send Message
        </a>
      </div>
    </div>
  );
}