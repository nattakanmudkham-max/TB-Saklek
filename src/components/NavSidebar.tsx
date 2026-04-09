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

function DoctorIconNav({ active }: { active: boolean }) {
  const color = active ? '#93c5fd' : 'rgba(255,255,255,0.75)'
  const fill = active ? 'rgba(147,197,253,0.3)' : 'rgba(255,255,255,0.1)'
  return (
    <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="10" r="6" fill={fill} stroke={color} strokeWidth="2"/>
      <path d="M9 36 C9 26 31 26 31 36" fill={fill} stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <path d="M14 22 C13 26 13 30 17 31" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M26 22 C27 26 27 30 23 31" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M17 31 C17 34 23 34 23 31" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/>
      <circle cx="20" cy="34" r="2.5" fill={color}/>
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
  { href: '/',               label: 'หน้าหลัก',          icon: '🏥',      useLung: false, useCalendar: false, useDoctor: false },
  { href: '/patients',       label: 'ทะเบียนผู้ป่วย TB',  icon: null,      useLung: true,  useCalendar: false, useDoctor: false },
  { href: '/staff-screening',label: 'คัดกรองเจ้าหน้าที่', icon: null,      useLung: false, useCalendar: false, useDoctor: true  },
  { href: '/contacts',       label: 'ผู้สัมผัสร่วมบ้าน',  icon: '👨‍👩‍👧‍👦',  useLung: false, useCalendar: false, useDoctor: false },
  { href: '/ltbi',           label: 'วัณโรคระยะแฝง',      icon: '🔬',      useLung: false, useCalendar: false, useDoctor: false },
  { href: '/appointments',   label: 'ตารางนัดรับยา',      icon: null,      useLung: false, useCalendar: true,  useDoctor: false },
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
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 120, height: 120, flexShrink: 0 }}>
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="bg2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0d1b3e"/>
                  <stop offset="100%" stopColor="#0a2540"/>
                </linearGradient>
                <linearGradient id="cyan1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8"/>
                  <stop offset="100%" stopColor="#818cf8"/>
                </linearGradient>
                <linearGradient id="cyan2" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#67e8f9"/>
                  <stop offset="100%" stopColor="#38bdf8"/>
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="blur"/>
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>

              {/* Base circle */}
              <circle cx="60" cy="60" r="59" fill="url(#bg2)"/>

              {/* Outer arc ring */}
              <circle cx="60" cy="60" r="55" fill="none" stroke="url(#cyan1)" strokeWidth="1" strokeDasharray="6 3" opacity="0.4"/>

              {/* Rotating arc accents */}
              <path d="M 60 10 A 50 50 0 0 1 107 77" stroke="url(#cyan1)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" filter="url(#glow)"/>
              <path d="M 13 77 A 50 50 0 0 1 38 17" stroke="url(#cyan2)" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5"/>

              {/* Hexagon center shape */}
              <polygon points="60,28 78,38 78,58 60,68 42,58 42,38" fill="none" stroke="url(#cyan1)" strokeWidth="1.5" opacity="0.6"/>

              {/* Medical cross — modern flat */}
              <rect x="53" y="38" width="14" height="30" rx="4" fill="url(#cyan1)" opacity="0.15"/>
              <rect x="45" y="46" width="30" height="14" rx="4" fill="url(#cyan1)" opacity="0.15"/>
              <rect x="55" y="36" width="10" height="34" rx="3" fill="url(#cyan1)" filter="url(#glow)"/>
              <rect x="43" y="48" width="34" height="10" rx="3" fill="url(#cyan1)" filter="url(#glow)"/>

              {/* Center dot */}
              <circle cx="60" cy="53" r="5" fill="#0d1b3e"/>
              <circle cx="60" cy="53" r="3" fill="url(#cyan2)" filter="url(#glow)"/>

              {/* Bottom label */}
              <rect x="18" y="78" width="84" height="26" rx="9" fill="url(#cyan1)" opacity="0.12"/>
              <text x="60" y="89" textAnchor="middle" fill="url(#cyan1)" fontSize="9" fontWeight="800" letterSpacing="2.5" fontFamily="system-ui, sans-serif">SAKLEK</text>
              <text x="60" y="100" textAnchor="middle" fill="rgba(148,197,253,0.7)" fontSize="7" fontWeight="500" letterSpacing="3.5" fontFamily="system-ui, sans-serif">HOSPITAL</text>

              {/* Corner dots accent */}
              <circle cx="60" cy="14" r="2.5" fill="#38bdf8" opacity="0.8" filter="url(#glow)"/>
              <circle cx="14" cy="82" r="1.5" fill="#818cf8" opacity="0.6"/>
              <circle cx="106" cy="82" r="1.5" fill="#818cf8" opacity="0.6"/>
            </svg>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 800, fontSize: 22, letterSpacing: 0.3, lineHeight: 1.2 }}>TB-Saklek</div>
            <div style={{ fontSize: 13, color: '#93c5fd', marginTop: 3, fontWeight: 500 }}>โรงพยาบาลสากเหล็ก</div>
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
                gap: 14,
                padding: '13px 16px',
                borderRadius: 12,
                marginBottom: 6,
                fontSize: 18,
                color: isActive ? '#fff' : 'rgba(255,255,255,0.75)',
                textDecoration: 'none',
                fontWeight: isActive ? 700 : 400,
                background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                borderLeft: isActive ? '3px solid #60a5fa' : '3px solid transparent',
                transition: 'all 0.15s ease',
              }}
              className="nav-link"
            >
              <span style={{ fontSize: 24, minWidth: 30, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.useLung
                  ? <LungIconNav active={isActive} />
                  : item.useCalendar
                  ? <CalendarIconNav active={isActive} />
                  : item.useDoctor
                  ? <DoctorIconNav active={isActive} />
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
