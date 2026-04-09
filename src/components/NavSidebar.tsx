'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/',               label: 'หน้าหลัก',          icon: '🏥' },
  { href: '/patients',       label: 'ทะเบียนผู้ป่วย TB',  icon: '🫁' },
  { href: '/staff-screening',label: 'คัดกรองเจ้าหน้าที่', icon: '👨‍⚕️' },
  { href: '/contacts',       label: 'ผู้สัมผัสร่วมบ้าน',  icon: '👨‍👩‍👧‍👦' },
  { href: '/ltbi',           label: 'วัณโรคระยะแฝง',      icon: '🔬' },
  { href: '/appointments',   label: 'ตารางนัดรับยา',      icon: '💊' },
]

export default function NavSidebar() {
  const pathname = usePathname()

  return (
    <aside style={{
      width: 300,
      background: 'linear-gradient(180deg, #0f2444 0%, #1a3a6e 100%)',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      top: 0,
      left: 0,
      height: '100vh',
      zIndex: 10,
      boxShadow: '4px 0 32px rgba(0,0,0,0.2)',
    }}>
      {/* Logo */}
      <div style={{ padding: '28px 24px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 54, height: 54,
            background: 'rgba(255,255,255,0.15)',
            border: '1.5px solid rgba(255,255,255,0.2)',
            borderRadius: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26,
            flexShrink: 0,
          }}>🏥</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 26, letterSpacing: 0.3, lineHeight: 1.2 }}>TB-Saklek</div>
            <div style={{ fontSize: 14, color: '#93c5fd', marginTop: 3, fontWeight: 500 }}>โรงพยาบาลสากเหล็ก</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 14px', overflowY: 'auto' }}>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 700, letterSpacing: 1.5, padding: '8px 10px 10px', textTransform: 'uppercase' }}>
          เมนูหลัก
        </div>
        {navItems.map((item) => {
          const isActive = item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 13,
                padding: '11px 14px',
                borderRadius: 12,
                marginBottom: 4,
                fontSize: 16,
                color: isActive ? '#fff' : 'rgba(255,255,255,0.75)',
                textDecoration: 'none',
                fontWeight: isActive ? 700 : 400,
                background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                borderLeft: isActive ? '3px solid #60a5fa' : '3px solid transparent',
                transition: 'all 0.15s ease',
              }}
              className="nav-link"
            >
              <span style={{ fontSize: 20, minWidth: 26, textAlign: 'center' }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {isActive && (
                <span style={{
                  width: 7, height: 7,
                  background: '#60a5fa',
                  borderRadius: '50%',
                  flexShrink: 0,
                }} />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '18px 22px',
        borderTop: '1px solid rgba(255,255,255,0.15)',
        fontSize: 15,
        lineHeight: 1.7,
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: 'rgba(0,0,0,0.15)',
      }}>
        <span style={{ fontSize: 22, flexShrink: 0 }}>🏥</span>
        <span style={{ fontWeight: 500 }}>กลุ่มงานปฐมภูมิและองค์รวม<br />โรงพยาบาลสากเหล็ก</span>
      </div>

      <style>{`
        .nav-link:hover {
          background: rgba(255,255,255,0.1) !important;
          color: #fff !important;
        }
      `}</style>
    </aside>
  )
}
