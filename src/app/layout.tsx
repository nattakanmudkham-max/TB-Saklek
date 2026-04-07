import type { Metadata } from "next";
import { Sarabun } from "next/font/google";
import "./globals.css";
import NavSidebar from "@/components/NavSidebar";

const sarabun = Sarabun({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['thai', 'latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: "TB-Saklek | ระบบทะเบียนวัณโรคสากเหล็ก",
  description: "ระบบบันทึกข้อมูลวัณโรค โรงพยาบาลสากเหล็ก",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={sarabun.className}>
      <body style={{ margin: 0, background: '#f1f5f9' }}>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <NavSidebar />
          <main style={{ flex: 1, marginLeft: 260, minHeight: '100vh', background: '#f1f5f9' }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
