'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface Staff {
  id: string; fiscal_year: number; seq: number; hn: string
  full_name: string; department: string; cxr_date: string; cxr_result: string
}

const cxrColor = (v: string) => {
  if (v === 'ปกติ') return { bg: '#dcfce7', text: '#15803d' }
  if (v === 'ผิดปกติ') return { bg: '#fee2e2', text: '#b91c1c' }
  if (v === 'สงสัย TB') return { bg: '#fef9c3', text: '#854d0e' }
  return { bg: '#f1f5f9', text: '#475569' }
}

export default function StaffScreeningPage() {
  const [data, setData] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [year, setYear] = useState('2568')

  useEffect(() => { fetch() }, [year])

  async function fetch() {
    setLoading(true)
    let q = supabase.from('staff_screening').select('*').order('seq')
    if (year) q = q.eq('fiscal_year', parseInt(year))
    const { data } = await q
    setData(data || [])
    setLoading(false)
  }

  const filtered = data.filter(d =>
    d.full_name?.includes(search) || d.hn?.includes(search) || d.department?.includes(search)
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9' }}>
      {/* Page header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '20px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, background: '#dbeafe', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="13" r="7" fill="#bfdbfe" stroke="#2563eb" strokeWidth="2"/>
                <path d="M6 35 C6 26 34 26 34 35" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" fill="#bfdbfe"/>
                <rect x="28" y="22" width="10" height="3" rx="1.5" fill="#2563eb"/>
                <rect x="31.5" y="19" width="3" height="10" rx="1.5" fill="#2563eb"/>
              </svg>
            </div>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: 0 }}>คัดกรองวัณโรคเจ้าหน้าที่</h1>
              <p style={{ fontSize: 13, color: '#64748b', margin: '2px 0 0' }}>โรงพยาบาลสากเหล็ก</p>
            </div>
          </div>
          <Link href="/staff-screening/new" style={{
            background: '#2563eb', color: '#fff', padding: '9px 18px',
            borderRadius: 10, fontSize: 13, fontWeight: 600, textDecoration: 'none',
            boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
          }}>
            + เพิ่มรายการ
          </Link>
        </div>
      </div>

      <div style={{ padding: '24px 32px' }}>
        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 340 }}>
            <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#94a3b8' }}>🔍</span>
            <input
              placeholder="ค้นหาชื่อ / HN / แผนก"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', border: '1px solid #e2e8f0', borderRadius: 10,
                padding: '9px 12px 9px 34px', fontSize: 13, background: '#fff',
                outline: 'none', color: '#334155',
              }}
            />
          </div>
          <select
            value={year}
            onChange={e => setYear(e.target.value)}
            style={{
              border: '1px solid #e2e8f0', borderRadius: 10, padding: '9px 14px',
              fontSize: 13, background: '#fff', color: '#334155', outline: 'none', cursor: 'pointer',
            }}
          >
            {[2568, 2567, 2566].map(y => <option key={y} value={y}>ปีงบ {y}</option>)}
          </select>
          <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 4 }}>
            {filtered.length} รายการ
          </span>
        </div>

        {/* Table */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {['ลำดับ', 'HN', 'ชื่อ-สกุล', 'กลุ่มงาน/แผนก', 'วันที่ CXR', 'ผล CXR', ''].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '11px 14px',
                    fontSize: 11, fontWeight: 700, color: '#64748b',
                    letterSpacing: 0.5, textTransform: 'uppercase',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}>
                  ⏳ กำลังโหลด...
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>ไม่พบข้อมูล
                </td></tr>
              ) : filtered.map((d, i) => {
                const cc = cxrColor(d.cxr_result)
                return (
                  <tr key={d.id} style={{
                    borderBottom: '1px solid #f1f5f9',
                    background: i % 2 === 1 ? '#fafbfc' : '#fff',
                  }} className="table-row">
                    <td style={{ padding: '11px 14px', color: '#94a3b8', fontWeight: 600, fontSize: 12 }}>{d.seq}</td>
                    <td style={{ padding: '11px 14px', fontFamily: 'monospace', fontSize: 12, color: '#475569', fontWeight: 600, letterSpacing: 0.5 }}>
                      {String(Math.round(parseFloat(d.hn))).padStart(9, '0')}
                    </td>
                    <td style={{ padding: '11px 14px', fontWeight: 600, color: '#0f172a' }}>{d.full_name}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{
                        background: '#f0f4ff', color: '#3730a3',
                        padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                      }}>{d.department}</span>
                    </td>
                    <td style={{ padding: '11px 14px', color: '#475569' }}>{d.cxr_date}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{
                        background: cc.bg, color: cc.text,
                        padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                      }}>{d.cxr_result || '-'}</span>
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <Link href={`/staff-screening/${d.id}`} style={{
                        color: '#2563eb', fontSize: 12, fontWeight: 600,
                        textDecoration: 'none', padding: '4px 10px',
                        background: '#eff6ff', borderRadius: 6,
                      }}>แก้ไข</Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div style={{ padding: '10px 16px', fontSize: 12, color: '#94a3b8', borderTop: '1px solid #f1f5f9' }}>
            แสดง {filtered.length} จาก {data.length} รายการ
          </div>
        </div>
      </div>
      <style>{`.table-row:hover { background: #f0f7ff !important; }`}</style>
    </div>
  )
}
