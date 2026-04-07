import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "TB-Saklek | ระบบทะเบียนวัณโรคสากเหล็ก",
  description: "ระบบบันทึกข้อมูลวัณโรค โรงพยาบาลสากเหล็ก",
};

const navItems = [
  { href: "/", label: "หน้าหลัก", icon: "🏠" },
  { href: "/patients", label: "ทะเบียนผู้ป่วย TB", icon: "🫁" },
  { href: "/staff-screening", label: "คัดกรองเจ้าหน้าที่", icon: "👤" },
  { href: "/contacts", label: "ผู้สัมผัสร่วมบ้าน", icon: "👥" },
  { href: "/ltbi", label: "วัณโรคระยะแฝง", icon: "🧪" },
  { href: "/appointments", label: "ตารางนัดรับยา", icon: "📅" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body style={{ margin: 0, fontFamily: 'Sarabun, sans-serif' }}>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <aside style={{ width: 256, background: '#1e3a5f', color: 'white', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 10 }}>
            <div style={{ padding: '16px', borderBottom: '1px solid #2d4f7c' }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>🏥 TB-Saklek</div>
              <div style={{ fontSize: 12, color: '#93c5fd', marginTop: 4 }}>โรงพยาบาลสากเหล็ก</div>
            </div>
            <nav style={{ flex: 1, padding: 12 }}>
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8, marginBottom: 4, fontSize: 14, color: 'white', textDecoration: 'none' }}
                  className="nav-link">
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
            <div style={{ padding: 16, fontSize: 12, color: '#60a5fa', borderTop: '1px solid #2d4f7c' }}>
              ปีงบประมาณ 2568
            </div>
          </aside>
          <main style={{ flex: 1, marginLeft: 256, minHeight: '100vh', background: '#f9fafb' }}>
            {children}
          </main>
        </div>
        <style>{`.nav-link:hover { background: rgba(255,255,255,0.1); }`}</style>
      </body>
    </html>
  );
}
