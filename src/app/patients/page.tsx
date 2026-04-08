'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface Patient {
  id: string; fiscal_year: number; tb_no: string; hn: string; full_name: string
  age: number; icd10: string; treatment_start_date: string; patient_type: string
  treatment_outcome: string; is_ip: boolean; is_ep: boolean
}

const outcomeColor = (v: string) => {
  if (!v) return { bg: '#f1f5f9', text: '#64748b' }
  if (v.includes('หาย') || v.includes('ครบ')) return { bg: '#dcfce7', text: '#15803d' }
  if (v.includes('เสียชีวิต') || v.includes('ล้มเหลว')) return { bg: '#fee2e2', text: '#b91c1c' }
  if (v.includes('ขาดยา') || v.includes('โอน')) return { bg: '#fef9c3', text: '#854d0e' }
  return { bg: '#f1f5f9', text: '#475569' }
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [year, setYear] = useState('')

  useEffect(() => { fetchPatients() }, [year])

  async function fetchPatients() {
    setLoading(true)
    let query = supabase.from('tb_patients').select('*').order('registered_date', { ascending: false })
    if (year) query = query.eq('fiscal_year', parseInt(year))
    const { data } = await query
    setPatients(data || [])
    setLoading(false)
  }

  const filtered = patients.filter(p =>
    p.full_name?.includes(search) ||
    String(p.hn ?? '').includes(search) ||
    String(p.tb_no ?? '').includes(search)
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9' }}>
      {/* Page header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '20px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 44, height: 44, background: '#fee2e2', borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
            }}>🫁</div>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: 0 }}>ทะเบียนผู้ป่วยวัณโรค</h1>
              <p style={{ fontSize: 13, color: '#64748b', margin: '2px 0 0' }}>โรงพยาบาลสากเหล็ก</p>
            </div>
          </div>
          <Link href="/patients/new" style={{
            background: '#2563eb', color: '#fff', padding: '9px 18px',
            borderRadius: 10, fontSize: 13, fontWeight: 600, textDecoration: 'none',
            display: 'flex', alignItems: 'center', gap: 6,
            boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
          }}>
            + เพิ่มผู้ป่วย
          </Link>
        </div>
      </div>

      <div style={{ padding: '24px 32px' }}>
        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 340 }}>
            <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#94a3b8' }}>🔍</span>
            <input
              placeholder="ค้นหาชื่อ / HN / TB No."
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
            <option value="">ทุกปีงบ</option>
            {[2568, 2567, 2566, 2565, 2564, 2563].map(y => (
              <option key={y} value={y}>ปีงบ {y}</option>
            ))}
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
                {['ลำดับ', 'TB No.', 'HN', 'ชื่อ-สกุล', 'อายุ', 'การวินิจฉัย (ICD-10)', 'ในปอด / นอกปอด', 'วันเริ่มรักษา', 'ประเภท', 'ผลการรักษา', ''].map(h => (
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
                <tr><td colSpan={11} style={{ textAlign: 'center', padding: '48px', color: '#94a3b8', fontSize: 13 }}>
                  <div>⏳ กำลังโหลด...</div>
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={11} style={{ textAlign: 'center', padding: '48px', color: '#94a3b8', fontSize: 13 }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
                  ไม่พบข้อมูล
                </td></tr>
              ) : filtered.map((p, i) => {
                const oc = outcomeColor(p.treatment_outcome)
                return (
                  <tr key={p.id} style={{
                    borderBottom: '1px solid #f1f5f9',
                    background: i % 2 === 1 ? '#fafbfc' : '#fff',
                    transition: 'background 0.1s',
                  }} className="table-row">
                    <td style={{ padding: '11px 14px', color: '#94a3b8', fontSize: 12, fontWeight: 600, textAlign: 'center' }}>{i + 1}</td>
                    <td style={{ padding: '11px 14px', fontFamily: 'monospace', fontSize: 11, color: '#475569', fontWeight: 600 }}>
                      {p.tb_no ? String(Math.round(parseFloat(String(p.tb_no)))) : '-'}
                    </td>
                    <td style={{ padding: '11px 14px', fontFamily: 'monospace', fontSize: 12, color: '#475569', fontWeight: 600, letterSpacing: 0.5 }}>
                      {p.hn ? String(Math.round(parseFloat(String(p.hn)))).padStart(9, '0') : '-'}
                    </td>
                    <td style={{ padding: '11px 14px', fontWeight: 600, color: '#0f172a' }}>{p.full_name}</td>
                    <td style={{ padding: '11px 14px', color: '#475569' }}>{p.age ?? '-'}</td>
                    <td style={{ padding: '11px 14px', color: '#475569' }}>{p.icd10 || '-'}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {p.is_ip && (
                          <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '2px 7px', borderRadius: 5, fontSize: 11, fontWeight: 600 }}>ในปอด</span>
                        )}
                        {p.is_ep && (
                          <span style={{ background: '#ffedd5', color: '#c2410c', padding: '2px 7px', borderRadius: 5, fontSize: 11, fontWeight: 600 }}>นอกปอด</span>
                        )}
                        {!p.is_ip && !p.is_ep && (
                          <span style={{ color: '#cbd5e1', fontSize: 11 }}>-</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '11px 14px', color: '#475569' }}>{p.treatment_start_date || '-'}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{
                        background: '#dbeafe', color: '#1d4ed8',
                        padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                      }}>{p.patient_type}</span>
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{
                        background: oc.bg, color: oc.text,
                        padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                      }}>{p.treatment_outcome || '-'}</span>
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <Link href={`/patients/${p.id}`} style={{
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
            แสดง {filtered.length} จาก {patients.length} รายการ
          </div>
        </div>
      </div>
      <style>{`.table-row:hover { background: #f0f7ff !important; }`}</style>
    </div>
  )
}
