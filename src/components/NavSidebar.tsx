'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

function CalendarIconNav({ active }: { active: boolean }) {
  const color = active ? '#93c5fd' : 'rgba(255,255,255,0.75)'
  const fillColor = active ? 'rgba(147,197,253,0.3)' : 'rgba(255,255,255,0.1)'
  return (
    <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
      <rect x="4" y="9" width="32" height="28" rx="4" fill={fillColor} stroke={color} strokeWidth="2"/>
      <rect x="4" y="9" width="32" height="10" rx="4" fill={color} stroke={color} strokeWidth="2"/>
      <rect x="4" y="15" width="32" height="4" fill={color}/>
      <rect x="13" y="4" width="3" height="10" rx="1.5" fill={color}/>
      <rect x="24" y="4" width="3" height="10" rx="1.5" fill={color}/>
      <rect x="10" y="24" width="4" height="4" rx="1" fill={color} opacity="0.7"/>
      <rect x="18" y="24" width="4" height="4" rx="1" fill={color} opacity="0.7"/>
      <rect x="26" y="24" width="4" height="4" rx="1" fill={color} opacity="0.7"/>
      <rect x="10" y="30" width="4" height="4" rx="1" fill={color} opacity="0.7"/>
      <rect x="18" y="30" width="4" height="4" rx="1" fill={color} opacity="0.7"/>
    </svg>
  )
}

function LungIconNav({ active }: { active: boolean }) {
  const color = active ? '#93c5fd' : 'rgba(255,255,255,0.75)'
  return (
    <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
      <path d="M20 4 L20 14" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M20 14 L13 19" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <path d="M20 14 L27 19" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <path d="M13 19 C6 19 4 23 4 27 C4 32 7.5 37 12 37 C14.5 37 16.5 35 16.5 32 L16.5 19 Z" fill={active ? 'rgba(147,197,253,0.3)' : 'rgba(255,255,255,0.1)'} stroke={color} strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M27 19 C34 19 36 23 36 27 C36 32 32.5 37 28 37 C25.5 37 23.5 35 23.5 32 L23.5 19 Z" fill={active ? 'rgba(147,197,253,0.3)' : 'rgba(255,255,255,0.1)'} stroke={color} strokeWidth="1.8" strokeLinejoin="round"/>
    </svg>
  )
}

const navItems = [
  { href: '/',               label: 'หน้าหลัก',          icon: '🏥',      useLung: false, useCalendar: false },
  { href: '/patients',       label: 'ทะเบียนผู้ป่วย TB',  icon: null,      useLung: true,  useCalendar: false },
  { href: '/staff-screening',label: 'คัดกรองเจ้าหน้าที่', icon: '👨‍⚕️',    useLung: false, useCalendar: false },
  { href: '/contacts',       label: 'ผู้สัมผัสร่วมบ้าน',  icon: '👨‍👩‍👧‍👦',  useLung: false, useCalendar: false },
  { href: '/ltbi',           label: 'วัณโรคระยะแฝง',      icon: '🔬',      useLung: false, useCalendar: false },
  { href: '/appointments',   label: 'ตารางนัดรับยา',      icon: null,      useLung: false, useCalendar: true  },
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
              <span style={{ fontSize: 20, minWidth: 26, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.useLung
                  ? <LungIconNav active={isActive} />
                  : item.useCalendar
                  ? <CalendarIconNav active={isActive} />
                  : item.icon
                }
              </span>
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
