'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface Staff {
  id: string; fiscal_year: number; seq: number; hn: string
  full_name: string; department: string; cxr_date: string; cxr_result: string
  birth_date: string
}

function calcAge(isoDate: string): number | null {
  if (!isoDate) return null
  const birth = new Date(isoDate)
  if (isNaN(birth.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age >= 0 ? age : null
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
  const now = new Date()
  const currentThaiFY = String((now.getMonth() >= 9 ? now.getFullYear() + 1 : now.getFullYear()) + 543)
  const [year, setYear] = useState('')
  const [filterResult, setFilterResult] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [filterDept, setFilterDept] = useState('')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 10

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
    let q = supabase.from('staff_screening').select('*')
    if (year) q = q.eq('fiscal_year', parseInt(year))
    q = q.order('fiscal_year', { ascending: false }).order('seq')
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

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  useEffect(() => { setPage(1) }, [search, year, filterResult, filterDept])

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9' }}>
      {/* Page header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '20px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, background: '#dbeafe', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="10" r="6" fill="#bfdbfe" stroke="#2563eb" strokeWidth="2"/>
                <path d="M9 36 C9 26 31 26 31 36" fill="#bfdbfe" stroke="#2563eb" strokeWidth="2" strokeLinecap="round"/>
                <path d="M14 22 C13 26 13 30 17 31" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" fill="none"/>
                <path d="M26 22 C27 26 27 30 23 31" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" fill="none"/>
                <path d="M17 31 C17 34 23 34 23 31" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" fill="none"/>
                <circle cx="20" cy="34" r="2.5" fill="#2563eb"/>
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
              <option value="">ปีงบ (ทั้งหมด)</option>
              {[2575,2574,2573,2572,2571,2570,2569,2568,2567,2566,2565].map(y => <option key={y} value={y}>ปีงบ {y}</option>)}
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
              {['กลุ่มการแพทย์','กลุ่มกายภาพบำบัด','กลุ่มการพยาบาล','กลุ่มงานทันตกรรม',
                'กลุ่มงานเทคนิคการแพทย์','กลุ่มงานบริการปฐมภูมิและองค์รวม','กลุ่มงานบริหารทั่วไป',
                'กลุ่มงานประกันสุขภาพ ยุทธศาสตร์และสารสนเทศทางการแพทย์','กลุ่มงานแพทย์แผนไทย','กลุ่มงานเภสัชกรรม',
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
                  { label: 'อายุ', w: 60 },
                  { label: 'กลุ่มงาน / แผนก', w: 230 },
                  { label: 'วันที่ CXR', w: 115 },
                  { label: 'ผล CXR', w: 105 },
                  { label: 'การจัดการ', w: 100 },
                ].map(h => (
                  <th key={h.label} style={{
                    textAlign: 'center', padding: '13px 12px',
                    fontSize: 13, fontWeight: 800, color: '#ffffff',
                    letterSpacing: 0.5, whiteSpace: 'nowrap',
                  }}>{h.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}>⏳ กำลังโหลด...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" style={{ display: 'block', margin: '0 auto 10px' }}><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                  ไม่พบข้อมูล
                </td></tr>
              ) : paginated.map((d, i) => {
                const cc = cxrColor(d.cxr_result)
                const age = calcAge(d.birth_date)
                const rowNum = (page - 1) * PAGE_SIZE + i + 1
                return (
                  <tr key={d.id} style={{
                    borderBottom: '1px solid #f1f5f9',
                    background: i % 2 === 1 ? '#f8fafc' : '#fff',
                  }} className="table-row">
                    <td style={{ padding: '11px 10px', color: '#334155', fontSize: 12, fontWeight: 700, textAlign: 'center', whiteSpace: 'nowrap' }}>{rowNum}</td>
                    <td style={{ padding: '11px 10px', color: '#334155', fontSize: 13, fontWeight: 700, textAlign: 'center', whiteSpace: 'nowrap' }}>{d.fiscal_year || '-'}</td>
                    <td style={{ padding: '11px 10px', fontFamily: 'monospace', fontSize: 12, color: '#334155', fontWeight: 600, textAlign: 'center', whiteSpace: 'nowrap' }}>
                      {d.hn ? String(Math.round(parseFloat(d.hn))).padStart(9, '0') : '-'}
                    </td>
                    <td style={{ padding: '11px 10px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', textAlign: 'left', fontSize: 13 }}>{d.full_name}</td>
                    <td style={{ padding: '11px 10px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      {age !== null
                        ? <span style={{ fontWeight: 700, color: '#334155', fontSize: 13 }}>{age}</span>
                        : <span style={{ color: '#cbd5e1', fontSize: 12 }}>-</span>
                      }
                    </td>
                    <td style={{ padding: '11px 12px', color: '#0f172a', fontSize: 13, fontWeight: 600 }}>{d.department || '-'}</td>
                    <td style={{ padding: '9px 10px', color: '#334155', textAlign: 'center', whiteSpace: 'nowrap', fontSize: 13, fontWeight: 700 }}>
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
          {/* Pagination */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>
              แสดง {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} จาก {filtered.length} รายการ
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid #e2e8f0', background: page === 1 ? '#f8fafc' : '#fff', color: page === 1 ? '#cbd5e1' : '#475569', cursor: page === 1 ? 'default' : 'pointer', fontSize: 12, fontWeight: 600 }}
              >«</button>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: page === 1 ? '#f8fafc' : '#fff', color: page === 1 ? '#cbd5e1' : '#475569', cursor: page === 1 ? 'default' : 'pointer', fontSize: 12, fontWeight: 600 }}
              >‹ ก่อนหน้า</button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 2)
                .reduce<(number | '...')[]>((acc, n, idx, arr) => {
                  if (idx > 0 && n - (arr[idx - 1] as number) > 1) acc.push('...')
                  acc.push(n)
                  return acc
                }, [])
                .map((n, idx) =>
                  n === '...'
                    ? <span key={`ellipsis-${idx}`} style={{ padding: '0 4px', color: '#94a3b8', fontSize: 12 }}>…</span>
                    : <button key={n} onClick={() => setPage(n as number)} style={{
                        padding: '5px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        border: page === n ? '1px solid #2563eb' : '1px solid #e2e8f0',
                        background: page === n ? '#2563eb' : '#fff',
                        color: page === n ? '#fff' : '#475569',
                        minWidth: 34,
                      }}>{n}</button>
                )}

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: page === totalPages ? '#f8fafc' : '#fff', color: page === totalPages ? '#cbd5e1' : '#475569', cursor: page === totalPages ? 'default' : 'pointer', fontSize: 12, fontWeight: 600 }}
              >ถัดไป ›</button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid #e2e8f0', background: page === totalPages ? '#f8fafc' : '#fff', color: page === totalPages ? '#cbd5e1' : '#475569', cursor: page === totalPages ? 'default' : 'pointer', fontSize: 12, fontWeight: 600 }}
              >»</button>
            </div>
          </div>
        </div>
      </div>
      <style>{`.table-row:hover { background: #f0f7ff !important; }`}</style>
    </div>
  )
}
