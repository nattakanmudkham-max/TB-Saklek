'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/', label: 'หน้าหลัก', icon: '🏠' },
  { href: '/patients', label: 'ทะเบียนผู้ป่วย TB', icon: '🫁' },
  { href: '/staff-screening', label: 'คัดกรองเจ้าหน้าที่', icon: '👤' },
  { href: '/contacts', label: 'ผู้สัมผัสร่วมบ้าน', icon: '👥' },
  { href: '/ltbi', label: 'วัณโรคระยะแฝง', icon: '🧪' },
  { href: '/appointments', label: 'ตารางนัดรับยา', icon: '📅' },
]

export default function NavSidebar() {
  const pathname = usePathname()

  return (
    <aside style={{
      width: 260,
      background: 'linear-gradient(180deg, #1a3357 0%, #1e3a5f 100%)',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      top: 0,
      left: 0,
      height: '100vh',
      zIndex: 10,
      boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44,
            background: 'rgba(255,255,255,0.15)',
            borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22,
            backdropFilter: 'blur(8px)',
          }}>🏥</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 17, letterSpacing: 0.3 }}>TB-Saklek</div>
            <div style={{ fontSize: 11, color: '#93c5fd', marginTop: 2, fontWeight: 400 }}>โรงพยาบาลสากเหล็ก</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 12px', overflowY: 'auto' }}>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: 1, padding: '8px 8px 6px', textTransform: 'uppercase' }}>
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
                gap: 10,
                padding: '9px 12px',
                borderRadius: 10,
                marginBottom: 2,
                fontSize: 14,
                color: isActive ? '#fff' : 'rgba(255,255,255,0.75)',
                textDecoration: 'none',
                fontWeight: isActive ? 600 : 400,
                background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                borderLeft: isActive ? '3px solid #60a5fa' : '3px solid transparent',
                transition: 'all 0.15s ease',
              }}
              className="nav-link"
            >
              <span style={{ fontSize: 16, minWidth: 20, textAlign: 'center' }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {isActive && (
                <span style={{
                  width: 6, height: 6,
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
        padding: '14px 20px',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        fontSize: 11,
        color: 'rgba(255,255,255,0.45)',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}>
        <span>📆</span>
        <span>ปีงบประมาณ 2568</span>
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
