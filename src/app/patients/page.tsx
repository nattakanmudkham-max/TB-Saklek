'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface Patient {
  id: string; fiscal_year: number; tb_no: string; hn: string; full_name: string
  age: number; icd10: string; registered_date: string; treatment_start_date: string
  patient_type: string; treatment_outcome: string; is_ip: boolean; is_ep: boolean
  detected_place: string; treatment_place: string
}

function toThaiBE(iso: string): string {
  if (!iso) return '-'
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return iso
  return `${d}/${m}/${parseInt(y) + 543}`
}

const outcomeColor = (v: string) => {
  if (!v) return { bg: '#f1f5f9', text: '#64748b' }
  if (v.includes('กำลังรักษา')) return { bg: '#dbeafe', text: '#1d4ed8' }
  if (v.includes('หาย') || v.includes('ครบ')) return { bg: '#dcfce7', text: '#15803d' }
  if (v.includes('เสียชีวิต') || v.includes('ล้มเหลว')) return { bg: '#fee2e2', text: '#b91c1c' }
  if (v.includes('ขาดยา') || v.includes('โอน')) return { bg: '#fef9c3', text: '#854d0e' }
  return { bg: '#f1f5f9', text: '#475569' }
}

const selectStyle: React.CSSProperties = {
  border: '1px solid #e2e8f0', borderRadius: 10, padding: '8px 12px',
  fontSize: 13, background: '#fff', color: '#334155', outline: 'none', cursor: 'pointer',
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [year, setYear] = useState('')
  const [filterIP, setFilterIP] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterOutcome, setFilterOutcome] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => { fetchPatients() }, [year])

  async function fetchPatients() {
    setLoading(true)
    let query = supabase.from('tb_patients').select('*').order('registered_date', { ascending: false })
    if (year) query = query.eq('fiscal_year', parseInt(year))
    const { data } = await query
    setPatients(data || [])
    setLoading(false)
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`ยืนยันการลบ "${name}" ?`)) return
    setDeletingId(id)
    await supabase.from('tb_patients').delete().eq('id', id)
    setPatients(prev => prev.filter(p => p.id !== id))
    setDeletingId(null)
  }

  const filtered = patients.filter(p => {
    const matchSearch = p.full_name?.includes(search) ||
      String(p.hn ?? '').includes(search) ||
      String(p.tb_no ?? '').includes(search)
    const matchIP =
      filterIP === '' ? true :
      filterIP === 'IP' ? (p.is_ip && !p.is_ep) :
      filterIP === 'EP' ? (!p.is_ip && p.is_ep) :
      filterIP === 'IP/EP' ? (p.is_ip && p.is_ep) : true
    const matchType = filterType === '' || p.patient_type === filterType
    const matchOutcome = filterOutcome === '' || (p.treatment_outcome || '').includes(filterOutcome)
    return matchSearch && matchIP && matchType && matchOutcome
  })

  const hasFilter = filterIP || filterType || filterOutcome

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9' }}>
      {/* Page header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '20px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, background: '#fee2e2', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🫁</div>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: 0 }}>ทะเบียนผู้ป่วยวัณโรค</h1>
              <p style={{ fontSize: 13, color: '#64748b', margin: '2px 0 0' }}>โรงพยาบาลสากเหล็ก</p>
            </div>
          </div>
          <Link href="/patients/new" style={{
            background: '#2563eb', color: '#fff', padding: '9px 18px',
            borderRadius: 10, fontSize: 13, fontWeight: 600, textDecoration: 'none',
            boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
          }}>+ เพิ่มผู้ป่วย</Link>
        </div>
      </div>

      <div style={{ padding: '20px 32px' }}>
        {/* Filter bar */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '14px 16px', marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Search */}
            <div style={{ position: 'relative', minWidth: 240, flex: 1 }}>
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#94a3b8' }}>🔍</span>
              <input
                placeholder="ค้นหาชื่อ / HN / TB No."
                value={search} onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: '8px 12px 8px 32px', fontSize: 13, background: '#f8fafc', outline: 'none', color: '#334155' }}
              />
            </div>

            {/* Year */}
            <select value={year} onChange={e => setYear(e.target.value)} style={selectStyle}>
              <option value="">ทุกปีงบ</option>
              {[2569, 2568, 2567, 2566, 2565, 2564, 2563, 2562, 2561].map(y => (
                <option key={y} value={y}>ปีงบ {y}</option>
              ))}
            </select>

            {/* IP/EP */}
            <select value={filterIP} onChange={e => setFilterIP(e.target.value)} style={selectStyle}>
              <option value="">ประเภทปอด (ทั้งหมด)</option>
              <option value="IP">ในปอด (IP)</option>
              <option value="EP">นอกปอด (EP)</option>
              <option value="IP/EP">ในปอด(IP) / นอกปอด(EP)</option>
            </select>

            {/* Patient type */}
            <select value={filterType} onChange={e => setFilterType(e.target.value)} style={selectStyle}>
              <option value="">ประเภทผู้ป่วย (ทั้งหมด)</option>
              {['New', 'Relapse', 'Treatment After Failure', 'Treatment After Loss to Follow Up', 'Transfer In'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            {/* Outcome */}
            <select value={filterOutcome} onChange={e => setFilterOutcome(e.target.value)} style={selectStyle}>
              <option value="">ผลการรักษา (ทั้งหมด)</option>
              {['กำลังรักษา', 'รักษาหาย', 'รักษาครบ(Completed)', 'เสียชีวิต(Died)', 'โอนออก(Transfered out)', 'ขาดยา(Loss to follow up)', 'ล้มเหลว(Failure)'].map(o => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>

            {hasFilter && (
              <button onClick={() => { setFilterIP(''); setFilterType(''); setFilterOutcome('') }} style={{
                border: '1px solid #fecaca', borderRadius: 10, padding: '8px 12px',
                fontSize: 12, background: '#fef2f2', color: '#dc2626', cursor: 'pointer', whiteSpace: 'nowrap',
              }}>✕ ล้างตัวกรอง</button>
            )}

            <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 'auto', whiteSpace: 'nowrap' }}>
              {filtered.length} / {patients.length} รายการ
            </span>
          </div>
        </div>

        {/* Table */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'auto', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse', minWidth: 1400 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                {[
                  { label: 'ลำดับ', w: 52 },
                  { label: 'ปีงบ', w: 70 },
                  { label: 'TB No.', w: 110 },
                  { label: 'HN', w: 90 },
                  { label: 'วันที่ขึ้นทะเบียน', w: 120 },
                  { label: 'ชื่อ-สกุล', w: 180 },
                  { label: 'อายุ', w: 52 },
                  { label: 'ICD-10', w: 75 },
                  { label: 'ประเภทปอด', w: 160 },
                  { label: 'สถานที่รักษา', w: 130 },
                  { label: 'วันเริ่มรักษา', w: 110 },
                  { label: 'ประเภทผู้ป่วย', w: 90 },
                  { label: 'ผลการรักษา', w: 130 },
                  { label: 'การจัดการ', w: 100 },
                ].map(h => (
                  <th key={h.label} style={{
                    textAlign: 'center', padding: '10px 12px',
                    fontSize: 11, fontWeight: 700, color: '#64748b',
                    letterSpacing: 0.5, textTransform: 'uppercase',
                    width: h.w, whiteSpace: 'nowrap',
                  }}>{h.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={14} style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}>⏳ กำลังโหลด...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={14} style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>ไม่พบข้อมูล
                </td></tr>
              ) : filtered.map((p, i) => {
                const oc = outcomeColor(p.treatment_outcome)
                const isDeleting = deletingId === p.id
                return (
                  <tr key={p.id} style={{
                    borderBottom: '1px solid #f1f5f9',
                    background: i % 2 === 1 ? '#fafbfc' : '#fff',
                    opacity: isDeleting ? 0.5 : 1,
                  }} className="table-row">
                    <td style={{ padding: '10px 12px', color: '#94a3b8', fontSize: 12, fontWeight: 600, textAlign: 'center', whiteSpace: 'nowrap' }}>{i + 1}</td>
                    <td style={{ padding: '10px 12px', color: '#475569', fontSize: 12, fontWeight: 600, textAlign: 'center', whiteSpace: 'nowrap' }}>
                      {p.fiscal_year ? `${p.fiscal_year}` : '-'}
                    </td>
                    <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 11, color: '#64748b', fontWeight: 600, textAlign: 'center', whiteSpace: 'nowrap' }}>
                      {p.tb_no ? String(Math.round(parseFloat(String(p.tb_no)))) : '-'}
                    </td>
                    <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 11, color: '#64748b', fontWeight: 600, textAlign: 'center', whiteSpace: 'nowrap' }}>
                      {p.hn ? String(p.hn).padStart(9, '0') : '-'}
                    </td>
                    <td style={{ padding: '10px 12px', color: '#64748b', fontSize: 12, textAlign: 'center', whiteSpace: 'nowrap' }}>{toThaiBE(p.registered_date)}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', textAlign: 'center' }}>{p.full_name}</td>
                    <td style={{ padding: '10px 12px', color: '#475569', textAlign: 'center', whiteSpace: 'nowrap' }}>{p.age ?? '-'}</td>
                    <td style={{ padding: '10px 12px', color: '#475569', textAlign: 'center', whiteSpace: 'nowrap' }}>{p.icd10 || '-'}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      {p.is_ip && p.is_ep
                        ? <span style={{ background: '#ede9fe', color: '#7c3aed', padding: '2px 8px', borderRadius: 5, fontSize: 10, fontWeight: 700 }}>ในปอด (IP) / นอกปอด (EP)</span>
                        : p.is_ip
                        ? <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '2px 8px', borderRadius: 5, fontSize: 10, fontWeight: 700 }}>ในปอด (IP)</span>
                        : p.is_ep
                        ? <span style={{ background: '#ffedd5', color: '#c2410c', padding: '2px 8px', borderRadius: 5, fontSize: 10, fontWeight: 700 }}>นอกปอด (EP)</span>
                        : <span style={{ color: '#cbd5e1', fontSize: 11 }}>-</span>}
                    </td>
                    <td style={{ padding: '10px 12px', color: '#475569', fontSize: 12, textAlign: 'center', whiteSpace: 'nowrap', maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.treatment_place || '-'}
                    </td>
                    <td style={{ padding: '10px 12px', color: '#64748b', fontSize: 12, textAlign: 'center', whiteSpace: 'nowrap' }}>{toThaiBE(p.treatment_start_date)}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      {p.patient_type
                        ? <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '2px 7px', borderRadius: 5, fontSize: 10, fontWeight: 700 }}>{p.patient_type}</span>
                        : <span style={{ color: '#cbd5e1', fontSize: 11 }}>-</span>}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <span style={{ background: oc.bg, color: oc.text, padding: '2px 7px', borderRadius: 5, fontSize: 10, fontWeight: 700 }}>
                        {p.treatment_outcome || '-'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Link href={`/patients/${p.id}`} style={{
                          color: '#2563eb', fontSize: 12, fontWeight: 600,
                          textDecoration: 'none', padding: '4px 10px',
                          background: '#eff6ff', borderRadius: 6, whiteSpace: 'nowrap',
                        }}>แก้ไข</Link>
                        <button
                          onClick={() => handleDelete(p.id, p.full_name)}
                          disabled={isDeleting}
                          style={{
                            color: '#dc2626', fontSize: 12, fontWeight: 600,
                            padding: '4px 10px', background: '#fef2f2',
                            borderRadius: 6, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
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
            แสดง {filtered.length} จาก {patients.length} รายการ
          </div>
        </div>
      </div>
      <style>{`.table-row:hover { background: #f0f7ff !important; }`}</style>
    </div>
  )
}
