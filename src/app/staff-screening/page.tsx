'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface Staff {
  id: string; fiscal_year: number; seq: number; hn: string
  full_name: string; department: string; cxr_date: string; cxr_result: string
}

function toThaiBE(iso: string): string {
  if (!iso) return '-'
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return iso
  return `${d}/${m}/${parseInt(y) + 543}`
}

const cxrColor = (v: string) => {
  if (v === 'ปกติ') return { bg: '#dcfce7', text: '#15803d', border: '#86efac' }
  if (v === 'ผิดปกติ') return { bg: '#fee2e2', text: '#b91c1c', border: '#fca5a5' }
  if (v === 'สงสัย TB') return { bg: '#fef9c3', text: '#854d0e', border: '#fde68a' }
  return { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' }
}

const selectStyle: React.CSSProperties = {
  border: '1px solid #e2e8f0', borderRadius: 10, padding: '8px 12px',
  fontSize: 13, background: '#fff', color: '#334155', outline: 'none', cursor: 'pointer',
}

export default function StaffScreeningPage() {
  const [data, setData] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [year, setYear] = useState('2568')
  const [filterResult, setFilterResult] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [filterDept, setFilterDept] = useState('')

  useEffect(() => { fetchData() }, [year])

  async function handleDelete(id: string, name: string) {
    if (!confirm(`ยืนยันการลบ "${name}" ?`)) return
    setDeletingId(id)
    await supabase.from('staff_screening').delete().eq('id', id)
    setData(prev => prev.filter(d => d.id !== id))
    setDeletingId(null)
  }

  async function fetchData() {
    setLoading(true)
    let q = supabase.from('staff_screening').select('*').order('seq')
    if (year) q = q.eq('fiscal_year', parseInt(year))
    const { data } = await q
    setData(data || [])
    setLoading(false)
  }

  const filtered = data.filter(d => {
    const matchSearch = d.full_name?.includes(search) || d.hn?.includes(search) || d.department?.includes(search)
    const matchResult = filterResult === '' || d.cxr_result === filterResult
    const matchDept = filterDept === '' || d.department === filterDept
    return matchSearch && matchResult && matchDept
  })

  const hasFilter = !!filterResult || !!filterDept

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
          }}>+ เพิ่มรายการ</Link>
        </div>
      </div>

      <div style={{ padding: '16px 20px' }}>
        {/* Filter bar */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '14px 16px', marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Search */}
            <div style={{ position: 'relative', minWidth: 240, flex: 1 }}>
              <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"><circle cx="9" cy="9" r="6"/><path d="M15 15l3 3"/></svg>
              <input
                placeholder="ค้นหาชื่อ / HN / แผนก"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: '8px 12px 8px 32px', fontSize: 13, background: '#f8fafc', outline: 'none', color: '#334155' }}
              />
            </div>

            {/* Year */}
            <select value={year} onChange={e => setYear(e.target.value)} style={selectStyle}>
              {[2569, 2568, 2567, 2566].map(y => <option key={y} value={y}>ปีงบ {y}</option>)}
            </select>

            {/* CXR Result filter */}
            <select value={filterResult} onChange={e => setFilterResult(e.target.value)} style={selectStyle}>
              <option value="">ผล CXR (ทั้งหมด)</option>
              <option value="ปกติ">ปกติ</option>
              <option value="ผิดปกติ">ผิดปกติ</option>
              <option value="สงสัย TB">สงสัย TB</option>
              <option value="ไม่ได้ CXR">ไม่ได้ CXR</option>
            </select>

            {/* Department filter */}
            <select value={filterDept} onChange={e => setFilterDept(e.target.value)} style={selectStyle}>
              <option value="">กลุ่มงาน (ทั้งหมด)</option>
              {['กลุ่มการแพทย์','กลุ่มการพยาบาล','กลุ่มงานการพยาบาล','กลุ่มงานบริการปฐมภูมิและองค์รวม',
                'กลุ่มงานเภสัชกรรม','กลุ่มงานทันตกรรม','กลุ่มงานกายภาพบำบัด','กลุ่มงานรังสีวิทยา',
                'กลุ่มงานพยาธิวิทยา','กลุ่มงานเวชกรรมสังคม','กลุ่มงานประกันสุขภาพ',
                'กลุ่มงานบริหารทั่วไป','กลุ่มงานโภชนาการ'
              ].map(d => <option key={d} value={d}>{d}</option>)}
            </select>

            {hasFilter && (
              <button onClick={() => { setFilterResult(''); setFilterDept('') }} style={{
                border: '1px solid #fecaca', borderRadius: 10, padding: '8px 12px',
                fontSize: 12, background: '#fef2f2', color: '#dc2626', cursor: 'pointer', whiteSpace: 'nowrap',
              }}>✕ ล้างตัวกรอง</button>
            )}

            <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 'auto', whiteSpace: 'nowrap' }}>
              {filtered.length} / {data.length} รายการ
            </span>
          </div>
        </div>

        {/* Table */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'auto', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse', minWidth: 860 }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #1e3a5f 0%, #1e40af 100%)' }}>
                {[
                  { label: 'ลำดับ', w: 52 },
                  { label: 'ปีงบ', w: 68 },
                  { label: 'HN', w: 105 },
                  { label: 'ชื่อ-สกุล', w: 210 },
                  { label: 'กลุ่มงาน / แผนก', w: 230 },
                  { label: 'วันที่ CXR', w: 115 },
                  { label: 'ผล CXR', w: 105 },
                  { label: 'การจัดการ', w: 100 },
                ].map(h => (
                  <th key={h.label} style={{
                    textAlign: 'center', padding: '13px 12px',
                    fontSize: 12, fontWeight: 700, color: '#e0f2fe',
                    letterSpacing: 0.5, whiteSpace: 'nowrap',
                  }}>{h.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}>⏳ กำลังโหลด...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" style={{ display: 'block', margin: '0 auto 10px' }}><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                  ไม่พบข้อมูล
                </td></tr>
              ) : filtered.map((d, i) => {
                const cc = cxrColor(d.cxr_result)
                return (
                  <tr key={d.id} style={{
                    borderBottom: '1px solid #f1f5f9',
                    background: i % 2 === 1 ? '#f8fafc' : '#fff',
                  }} className="table-row">
                    <td style={{ padding: '11px 10px', color: '#94a3b8', fontSize: 12, fontWeight: 700, textAlign: 'center', whiteSpace: 'nowrap' }}>{i + 1}</td>
                    <td style={{ padding: '11px 10px', color: '#334155', fontSize: 13, fontWeight: 700, textAlign: 'center', whiteSpace: 'nowrap' }}>{d.fiscal_year || '-'}</td>
                    <td style={{ padding: '11px 10px', fontFamily: 'monospace', fontSize: 12, color: '#475569', fontWeight: 600, textAlign: 'center', whiteSpace: 'nowrap' }}>
                      {d.hn ? String(Math.round(parseFloat(d.hn))).padStart(9, '0') : '-'}
                    </td>
                    <td style={{ padding: '11px 10px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', textAlign: 'left', fontSize: 13 }}>{d.full_name}</td>
                    <td style={{ padding: '11px 12px', color: '#0f172a', fontSize: 13, fontWeight: 600 }}>{d.department || '-'}</td>
                    <td style={{ padding: '9px 10px', color: '#475569', textAlign: 'center', whiteSpace: 'nowrap', fontSize: 12 }}>
                      {toThaiBE(d.cxr_date)}
                    </td>
                    <td style={{ padding: '9px 10px', textAlign: 'center' }}>
                      <span style={{
                        background: cc.bg, color: cc.text, border: `1px solid ${cc.border}`,
                        padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: 0.3,
                      }}>{d.cxr_result || '-'}</span>
                    </td>
                    <td style={{ padding: '9px 10px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 5, justifyContent: 'center' }}>
                        <Link href={`/staff-screening/${d.id}`} style={{
                          color: '#2563eb', fontSize: 11, fontWeight: 600,
                          textDecoration: 'none', padding: '4px 10px',
                          background: '#eff6ff', borderRadius: 6, whiteSpace: 'nowrap',
                          border: '1px solid #bfdbfe',
                        }}>แก้ไข</Link>
                        <button
                          onClick={() => handleDelete(d.id, d.full_name)}
                          disabled={deletingId === d.id}
                          style={{
                            color: '#dc2626', fontSize: 11, fontWeight: 600,
                            padding: '4px 10px', background: '#fef2f2',
                            borderRadius: 6, border: '1px solid #fecaca',
                            cursor: 'pointer', whiteSpace: 'nowrap',
                          }}
                        >ลบ</button>
                      </div>
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
