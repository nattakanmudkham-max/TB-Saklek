import Link from "next/link";

const modules = [
  {
    href: "/patients",
    icon: "🫁",
    title: "ทะเบียนผู้ป่วย TB",
    desc: "บันทึก ค้นหา และติดตามผู้ป่วยวัณโรค แยกตามปีงบประมาณ",
    accent: "#dc2626",
    bg: "#fef2f2",
    border: "#fecaca",
  },
  {
    href: "/staff-screening",
    icon: "👤",
    title: "คัดกรองเจ้าหน้าที่",
    desc: "ทะเบียนคัดกรองวัณโรคเจ้าหน้าที่โรงพยาบาลสากเหล็ก",
    accent: "#2563eb",
    bg: "#eff6ff",
    border: "#bfdbfe",
  },
  {
    href: "/contacts",
    icon: "👥",
    title: "ผู้สัมผัสร่วมบ้าน",
    desc: "ทะเบียนผู้สัมผัส/ใกล้ชิดผู้ป่วย ผล CXR / GeneXpert / IGRA",
    accent: "#d97706",
    bg: "#fffbeb",
    border: "#fde68a",
  },
  {
    href: "/ltbi",
    icon: "🧪",
    title: "วัณโรคระยะแฝง (LTBI)",
    desc: "ทะเบียนรักษาผู้ที่ IGRA ผิดปกติ บันทึกวันเริ่มรักษา",
    accent: "#7c3aed",
    bg: "#f5f3ff",
    border: "#ddd6fe",
  },
  {
    href: "/appointments",
    icon: "📅",
    title: "ตารางนัดรับยา",
    desc: "บันทึกวันนัดรับยา สูตรยา และปริมาณยาแต่ละเดือน",
    accent: "#059669",
    bg: "#f0fdf4",
    border: "#bbf7d0",
  },
];

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9' }}>
      {/* Hero header */}
      <div style={{
        background: 'linear-gradient(135deg, #1a3357 0%, #1e4a7a 100%)',
        padding: '48px 40px 40px',
        color: 'white',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
          <div style={{
            width: 56, height: 56,
            background: 'rgba(255,255,255,0.15)',
            borderRadius: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28,
            flexShrink: 0,
          }}>🏥</div>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: 0.3 }}>
              ระบบทะเบียนวัณโรค
            </h1>
            <p style={{ color: '#93c5fd', margin: '6px 0 0', fontSize: 15 }}>
              โรงพยาบาลสากเหล็ก · อำเภอสากเหล็ก จังหวัดพิจิตร
            </p>
          </div>
        </div>

        {/* Quick stats */}
        <div style={{ display: 'flex', gap: 16, marginTop: 32, flexWrap: 'wrap' }}>
          {[
            { label: 'โมดูลทั้งหมด', value: '5', icon: '📦' },
            { label: 'ปีงบประมาณ', value: '2568', icon: '📆' },
            { label: 'โรงพยาบาล', value: 'สากเหล็ก', icon: '🏥' },
          ].map(s => (
            <div key={s.label} style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 12,
              padding: '12px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              backdropFilter: 'blur(8px)',
            }}>
              <span style={{ fontSize: 18 }}>{s.icon}</span>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: '#bfdbfe', marginTop: 1 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Module grid */}
      <div style={{ padding: '32px 40px' }}>
        <h2 style={{ fontSize: 13, fontWeight: 600, color: '#64748b', letterSpacing: 1, textTransform: 'uppercase', margin: '0 0 16px' }}>
          โมดูลระบบ
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16,
        }}>
          {modules.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              style={{
                display: 'block',
                background: '#fff',
                borderRadius: 16,
                border: `1px solid #e2e8f0`,
                padding: '24px',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                position: 'relative',
                overflow: 'hidden',
              }}
              className="module-card"
            >
              {/* Accent top bar */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0,
                height: 3, background: m.accent, borderRadius: '16px 16px 0 0',
              }} />
              <div style={{
                width: 48, height: 48,
                background: m.bg,
                border: `1px solid ${m.border}`,
                borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24,
                marginBottom: 14,
              }}>{m.icon}</div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', margin: '0 0 6px' }}>{m.title}</h2>
              <p style={{ fontSize: 13, color: '#64748b', margin: 0, lineHeight: 1.6 }}>{m.desc}</p>
              <div style={{
                marginTop: 16,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 12,
                fontWeight: 600,
                color: m.accent,
              }}>
                เปิดโมดูล →
              </div>
            </Link>
          ))}
        </div>
      </div>

      <style>{`
        .module-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.1) !important;
          border-color: #cbd5e1 !important;
        }
      `}</style>
    </div>
  );
}
