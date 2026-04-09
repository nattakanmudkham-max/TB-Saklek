import Link from "next/link";

function LungIcon({ size = 36, color = "#dc2626", fill = "#fca5a5" }: { size?: number; color?: string; fill?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Trachea */}
      <path d="M20 4 L20 14" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
      {/* Left bronchus */}
      <path d="M20 14 L13 19" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      {/* Right bronchus */}
      <path d="M20 14 L27 19" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      {/* Left lung */}
      <path d="M13 19 C6 19 4 23 4 27 C4 32 7.5 37 12 37 C14.5 37 16.5 35 16.5 32 L16.5 19 Z" fill={fill} stroke={color} strokeWidth="1.8" strokeLinejoin="round"/>
      {/* Right lung */}
      <path d="M27 19 C34 19 36 23 36 27 C36 32 32.5 37 28 37 C25.5 37 23.5 35 23.5 32 L23.5 19 Z" fill={fill} stroke={color} strokeWidth="1.8" strokeLinejoin="round"/>
    </svg>
  )
}

const modules = [
  {
    href: "/patients",
    icon: null as null,
    useLung: true,
    title: "ทะเบียนผู้ป่วย TB",
    desc: "บันทึก ค้นหา และติดตามผู้ป่วยวัณโรค แยกตามปีงบประมาณ",
    accent: "#dc2626",
    bg: "#fef2f2",
    border: "#fecaca",
    label: "ผู้ป่วย TB",
  },
  {
    href: "/staff-screening",
    icon: "👨‍⚕️",
    useLung: false,
    title: "คัดกรองเจ้าหน้าที่",
    desc: "ทะเบียนคัดกรองวัณโรคเจ้าหน้าที่โรงพยาบาลสากเหล็ก",
    accent: "#2563eb",
    bg: "#eff6ff",
    border: "#bfdbfe",
    label: "เจ้าหน้าที่",
  },
  {
    href: "/contacts",
    icon: "👨‍👩‍👧‍👦",
    useLung: false,
    title: "ผู้สัมผัสร่วมบ้าน",
    desc: "ทะเบียนผู้สัมผัส/ใกล้ชิดผู้ป่วย ผล CXR / GeneXpert / IGRA",
    accent: "#d97706",
    bg: "#fffbeb",
    border: "#fde68a",
    label: "ผู้สัมผัส",
  },
  {
    href: "/ltbi",
    icon: "🔬",
    useLung: false,
    title: "วัณโรคระยะแฝง (LTBI)",
    desc: "ทะเบียนรักษาผู้ที่ IGRA ผิดปกติ บันทึกวันเริ่มรักษา",
    accent: "#7c3aed",
    bg: "#f5f3ff",
    border: "#ddd6fe",
    label: "LTBI",
  },
  {
    href: "/appointments",
    icon: "💊",
    useLung: false,
    title: "ตารางนัดรับยา",
    desc: "บันทึกวันนัดรับยา สูตรยา และปริมาณยาแต่ละเดือน",
    accent: "#059669",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    label: "นัดรับยา",
  },
];

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(170deg, #f0f4ff 0%, #f8fafc 50%, #f1f5f9 100%)' }}>

      {/* ── Hero ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0f2444 0%, #1a3a6e 60%, #1e4a8a 100%)',
        padding: '56px 48px 64px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, right: 120, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 20, right: 200, width: 120, height: 120, borderRadius: '50%', background: 'rgba(96,165,250,0.08)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
            <div style={{
              width: 72, height: 72,
              background: 'rgba(255,255,255,0.12)',
              border: '1.5px solid rgba(255,255,255,0.2)',
              borderRadius: 20,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 36, flexShrink: 0,
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            }}>🏥</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#93c5fd', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>
                ระบบสารสนเทศวัณโรค
              </div>
              <h1 style={{ fontSize: 42, fontWeight: 800, margin: 0, color: '#ffffff', letterSpacing: -0.5, lineHeight: 1.15 }}>
                ระบบทะเบียนวัณโรค
              </h1>
              <p style={{ color: '#93c5fd', margin: '10px 0 0', fontSize: 17, fontWeight: 400, letterSpacing: 0.2 }}>
                โรงพยาบาลสากเหล็ก · อำเภอสากเหล็ก · จังหวัดพิจิตร
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Module Grid ── */}
      <div style={{ padding: '44px 48px 60px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: 24,
        }}>
          {modules.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              style={{ textDecoration: 'none', display: 'block' }}
              className="module-card-wrap"
            >
              <div style={{
                background: '#ffffff',
                borderRadius: 20,
                border: '1px solid #e8edf5',
                padding: '32px 30px 28px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                position: 'relative',
                overflow: 'hidden',
                height: '100%',
                boxSizing: 'border-box',
                transition: 'all 0.25s ease',
              }}
              className="module-card"
              >
                {/* Left accent bar */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, bottom: 0,
                  width: 5, background: `linear-gradient(180deg, ${m.accent}, ${m.accent}88)`,
                  borderRadius: '20px 0 0 20px',
                }} />

                {/* Badge */}
                <div style={{
                  position: 'absolute', top: 20, right: 20,
                  background: m.bg, border: `1px solid ${m.border}`,
                  borderRadius: 20, padding: '3px 12px',
                  fontSize: 11, fontWeight: 700, color: m.accent, letterSpacing: 0.5,
                }}>{m.label}</div>

                {/* Icon */}
                <div style={{
                  width: 68, height: 68,
                  background: m.bg,
                  border: `2px solid ${m.border}`,
                  borderRadius: 18,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 32,
                  marginBottom: 20,
                  boxShadow: `0 4px 14px ${m.accent}20`,
                }}>
                  {m.useLung
                    ? <LungIcon size={38} color={m.accent} fill={m.border} />
                    : m.icon
                  }
                </div>

                {/* Text */}
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: '0 0 10px', lineHeight: 1.3 }}>{m.title}</h2>
                <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 24px', lineHeight: 1.7 }}>{m.desc}</p>

                {/* CTA */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  fontSize: 14, fontWeight: 700, color: m.accent,
                  background: m.bg, border: `1px solid ${m.border}`,
                  borderRadius: 10, padding: '9px 18px',
                }}>
                  เปิดโมดูล <span style={{ fontSize: 16 }}>→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer note */}
        <div style={{ marginTop: 48, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
          ระบบทะเบียนวัณโรค · โรงพยาบาลสากเหล็ก · พัฒนาเพื่อการดูแลผู้ป่วยวัณโรค
        </div>
      </div>

      <style>{`
        .module-card-wrap:hover .module-card {
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.12) !important;
        }
      `}</style>
    </div>
  );
}
