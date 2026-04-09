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
                <radialGradient id="bgGrad" cx="50%" cy="40%" r="60%">
                  <stop offset="0%" stopColor="#1e3a5f"/>
                  <stop offset="100%" stopColor="#0f2240"/>
                </radialGradient>
                <radialGradient id="goldGrad" cx="50%" cy="0%" r="100%">
                  <stop offset="0%" stopColor="#f5d97a"/>
                  <stop offset="100%" stopColor="#b8862a"/>
                </radialGradient>
              </defs>
              {/* Outer ring */}
              <circle cx="60" cy="60" r="59" fill="url(#bgGrad)" stroke="url(#goldGrad)" strokeWidth="2.5"/>
              {/* Inner decorative ring */}
              <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(205,158,60,0.3)" strokeWidth="1"/>
              {/* Laurel left */}
              <g stroke="#c9a84c" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.85">
                <path d="M28 75 Q22 68 25 60"/>
                <path d="M25 60 Q19 53 23 45"/>
                <ellipse cx="24" cy="72" rx="5" ry="3" transform="rotate(-40 24 72)" fill="#c9a84c" stroke="none" opacity="0.7"/>
                <ellipse cx="21" cy="61" rx="5" ry="3" transform="rotate(-50 21 61)" fill="#c9a84c" stroke="none" opacity="0.7"/>
                <ellipse cx="20" cy="50" rx="5" ry="3" transform="rotate(-60 20 50)" fill="#c9a84c" stroke="none" opacity="0.6"/>
                <ellipse cx="22" cy="40" rx="5" ry="3" transform="rotate(-55 22 40)" fill="#c9a84c" stroke="none" opacity="0.6"/>
              </g>
              {/* Laurel right */}
              <g stroke="#c9a84c" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.85">
                <path d="M92 75 Q98 68 95 60"/>
                <path d="M95 60 Q101 53 97 45"/>
                <ellipse cx="96" cy="72" rx="5" ry="3" transform="rotate(40 96 72)" fill="#c9a84c" stroke="none" opacity="0.7"/>
                <ellipse cx="99" cy="61" rx="5" ry="3" transform="rotate(50 99 61)" fill="#c9a84c" stroke="none" opacity="0.7"/>
                <ellipse cx="100" cy="50" rx="5" ry="3" transform="rotate(60 100 50)" fill="#c9a84c" stroke="none" opacity="0.6"/>
                <ellipse cx="98" cy="40" rx="5" ry="3" transform="rotate(55 98 40)" fill="#c9a84c" stroke="none" opacity="0.6"/>
              </g>
              {/* Tree trunk */}
              <rect x="57" y="68" width="6" height="14" rx="2" fill="#c9a84c" opacity="0.9"/>
              {/* Tree canopy layers */}
              <polygon points="60,22 48,42 72,42" fill="#c9a84c" opacity="0.95"/>
              <polygon points="60,32 45,55 75,55" fill="#b8862a" opacity="0.85"/>
              <polygon points="60,44 43,65 77,65" fill="#c9a84c" opacity="0.9"/>
              {/* Medical cross on trunk */}
              <rect x="55.5" y="73" width="9" height="3" rx="1" fill="#0f2240"/>
              <rect x="58.5" y="70.5" width="3" height="8" rx="1" fill="#0f2240"/>
              {/* Bottom text arc background */}
              <path d="M 25 88 Q 60 105 95 88" stroke="url(#goldGrad)" strokeWidth="1" fill="none" opacity="0.5"/>
              {/* SL initials small */}
              <text x="60" y="100" textAnchor="middle" fill="#f5d97a" fontSize="9" fontWeight="700" fontFamily="serif" letterSpacing="3">SAK LEK</text>
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
