'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface Appt {
  id: string; fiscal_year: number; tb_no: string; hn: string; full_name: string
  treatment_start_date: string; treatment_end_date: string; regimen: string
  appt_m1: string; appt_m6: string; underlying_disease: string
}

export default function AppointmentsPage() {
  const [data, setData] = useState<Appt[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [year, setYear] = useState('2568')

  useEffect(() => { fetchData() }, [year])

  async function fetchData() {
    setLoading(true)
    let q = supabase.from('appointments').select('*').order('treatment_start_date', { ascending: false })
    if (year) q = q.eq('fiscal_year', parseInt(year))
    const { data } = await q
    setData(data || [])
    setLoading(false)
  }

  const filtered = data.filter(d =>
    d.full_name?.includes(search) || d.hn?.includes(search) || d.tb_no?.includes(search)
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9' }}>
      {/* Page header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '20px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 44, height: 44, background: '#dcfce7', borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
            }}>📅</div>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: 0 }}>ตารางนัดรับยาวัณโรค</h1>
              <p style={{ fontSize: 13, color: '#64748b', margin: '2px 0 0' }}>สูตรยา วันนัด และการติดตาม</p>
            </div>
          </div>
          <Link href="/appointments/new" style={{
            background: '#2563eb', color: '#fff', padding: '9px 18px',
            borderRadius: 10, fontSize: 13, fontWeight: 600, textDecoration: 'none',
            boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
          }}>
            + เพิ่มรายการ
          </Link>
        </div>
      </div>

      <div style={{ padding: '24px 32px' }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
            <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#94a3b8' }}>🔍</span>
            <input
              placeholder="ค้นหาชื่อ / HN / TB No."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', border: '1px solid #e2e8f0', borderRadius: 10,
                padding: '9px 12px 9px 34px', fontSize: 13, background: '#fff',
                outline: 'none', color: '#334155',
              }}
            />
          </div>
          <select value={year} onChange={e => setYear(e.target.value)} style={{
            border: '1px solid #e2e8f0', borderRadius: 10, padding: '9px 14px',
            fontSize: 13, background: '#fff', color: '#334155', outline: 'none', cursor: 'pointer',
          }}>
            {[2569, 2568, 2567, 2566].map(y => <option key={y} value={y}>ปีงบ {y}</option>)}
          </select>
          <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 4 }}>{filtered.length} รายการ</span>
        </div>

        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {['TB No.', 'HN', 'ชื่อ-สกุล', 'โรคประจำตัว', 'วันเริ่ม-สิ้นสุด', 'สูตรยา', ''].map(h => (
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
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}>⏳ กำลังโหลด...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>ไม่พบข้อมูล
                </td></tr>
              ) : filtered.map((d, i) => (
                <tr key={d.id} style={{
                  borderBottom: '1px solid #f1f5f9',
                  background: i % 2 === 1 ? '#fafbfc' : '#fff',
                }} className="table-row">
                  <td style={{ padding: '11px 14px', fontFamily: 'monospace', fontSize: 11, color: '#475569', fontWeight: 600 }}>
                    {d.tb_no ? String(Math.round(parseFloat(d.tb_no))) : '-'}
                  </td>
                  <td style={{ padding: '11px 14px', fontFamily: 'monospace', fontSize: 12, color: '#475569', fontWeight: 600, letterSpacing: 0.5 }}>
                    {d.hn ? String(Math.round(parseFloat(d.hn))).padStart(9, '0') : '-'}
                  </td>
                  <td style={{ padding: '11px 14px', fontWeight: 600, color: '#0f172a' }}>{d.full_name}</td>
                  <td style={{ padding: '11px 14px', color: '#64748b', fontSize: 12 }}>{d.underlying_disease || '-'}</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, color: '#475569' }}>
                    <span>{d.treatment_start_date}</span>
                    <span style={{ color: '#cbd5e1', margin: '0 6px' }}>→</span>
                    <span>{d.treatment_end_date || '?'}</span>
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <span style={{
                      background: '#dbeafe', color: '#1e40af',
                      padding: '3px 10px', borderRadius: 6, fontSize: 11,
                      fontWeight: 700, fontFamily: 'monospace', letterSpacing: 0.3,
                    }}>{d.regimen}</span>
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <Link href={`/appointments/${d.id}`} style={{
                      color: '#2563eb', fontSize: 12, fontWeight: 600,
                      textDecoration: 'none', padding: '4px 10px',
                      background: '#eff6ff', borderRadius: 6,
                    }}>แก้ไข</Link>
                  </td>
                </tr>
              ))}
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
