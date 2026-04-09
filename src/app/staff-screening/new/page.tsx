'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { FormInput, FormSelect, FormTextArea } from '@/components/FormComponents'

const YEARS = [2575,2574,2573,2572,2571,2570,2569,2568,2567,2566,2565].map(y => ({ value: String(y), label: `ปีงบ ${y}` }))
const CXR = ['ปกติ', 'ผิดปกติ', 'สงสัย TB', 'ไม่ได้ CXR'].map(v => ({ value: v, label: v }))
const TYPES = ['ข้าราชการ', 'พนักงานกระทรวง', 'ลูกจ้างชั่วคราว', 'จ้างเหมาบริการ'].map(v => ({ value: v, label: v }))
const DEPTS = [
  'กลุ่มการแพทย์', 'กลุ่มการพยาบาล', 'กลุ่มงานการพยาบาล', 'กลุ่มงานบริการปฐมภูมิและองค์รวม',
  'กลุ่มงานเภสัชกรรม', 'กลุ่มงานทันตกรรม', 'กลุ่มงานกายภาพบำบัด', 'กลุ่มงานรังสีวิทยา',
  'กลุ่มงานพยาธิวิทยา', 'กลุ่มงานเวชกรรมสังคม', 'กลุ่มงานประกันสุขภาพ',
  'กลุ่มงานบริหารทั่วไป', 'กลุ่มงานโภชนาการ'
].map(v => ({ value: v, label: v }))

const SectionCard = ({ children, header }: { children: React.ReactNode; header: React.ReactNode }) => (
  <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', marginBottom: 20, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
    {header}
    <div style={{ padding: '24px 28px' }}>
      {children}
    </div>
  </div>
)

const FieldGrid = ({ children, cols = 2 }: { children: React.ReactNode; cols?: number }) => (
  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '16px 24px' }}>
    {children}
  </div>
)

export default function NewStaffPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({
    fiscal_year: '2568', hn: '', id_card: '',
    prefix: '', first_name: '', last_name: '',
    position: '', staff_type: '', department: '',
    cxr_date: '', cxr_result: '', notes: ''
  })
  const set = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setMsg('')
    const payload = {
      fiscal_year: parseInt(form.fiscal_year),
      hn: form.hn || null,
      id_card: form.id_card || null,
      prefix: form.prefix || null,
      first_name: form.first_name || null,
      last_name: form.last_name || null,
      full_name: `${form.prefix}${form.prefix ? ' ' : ''}${form.first_name} ${form.last_name}`.trim(),
      position: form.position || null,
      staff_type: form.staff_type || null,
      department: form.department || null,
      cxr_date: form.cxr_date || null,
      cxr_result: form.cxr_result || null,
      notes: form.notes || null,
    }
    const { error } = await supabase.from('staff_screening').insert(payload)
    setSaving(false)
    if (error) setMsg('❌ ' + error.message)
    else { setMsg('✅ บันทึกสำเร็จ'); setTimeout(() => router.push('/staff-screening'), 1200) }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '18px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => router.push('/staff-screening')} style={{
            display: 'flex', alignItems: 'center', gap: 7,
            background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 10,
            padding: '8px 16px', fontSize: 13, fontWeight: 600, color: '#475569', cursor: 'pointer',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}>
            <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round"><path d="M12 5l-5 5 5 5"/></svg>
            กลับหน้าหลัก
          </button>
          <div style={{ width: 1, height: 20, background: '#e2e8f0' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, background: '#dbeafe', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="13" r="7" fill="#bfdbfe" stroke="#2563eb" strokeWidth="2"/>
                <path d="M6 35 C6 26 34 26 34 35" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" fill="#bfdbfe"/>
                <rect x="28" y="22" width="10" height="3" rx="1.5" fill="#2563eb"/>
                <rect x="31.5" y="19" width="3" height="10" rx="1.5" fill="#2563eb"/>
              </svg>
            </div>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>เพิ่มข้อมูลคัดกรองเจ้าหน้าที่</h1>
              <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>กรอกข้อมูลให้ครบถ้วน แล้วกดบันทึก</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '28px 40px', maxWidth: 1200 }}>
        <form onSubmit={handleSubmit}>

          {/* Section 1: ข้อมูลทั่วไป */}
          <SectionCard header={
            <div style={{ background: 'linear-gradient(90deg, #eff6ff 0%, #dbeafe 100%)', padding: '14px 24px', borderBottom: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 34, height: 34, background: '#bfdbfe', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1e40af' }}>ข้อมูลทั่วไป</div>
                <div style={{ fontSize: 11, color: '#60a5fa' }}>General Information</div>
              </div>
              <div style={{ marginLeft: 'auto', background: '#dbeafe', color: '#1e40af', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, border: '1px solid #bfdbfe' }}>ขั้นตอนที่ 1</div>
            </div>
          }>
            <FieldGrid cols={3}>
              <FormSelect label="ปีงบประมาณ" options={YEARS} value={form.fiscal_year} onChange={e => set('fiscal_year', e.target.value)} required />
              <FormInput label="HN (เลขประจำตัวผู้ป่วย)" value={form.hn} onChange={e => set('hn', e.target.value)} placeholder="เช่น 000012345" />
              <div />
            </FieldGrid>
          </SectionCard>

          {/* Section 2: ข้อมูลเจ้าหน้าที่ */}
          <SectionCard header={
            <div style={{ background: 'linear-gradient(90deg, #f0fdf4 0%, #dcfce7 100%)', padding: '14px 24px', borderBottom: '1px solid #86efac', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 34, height: 34, background: '#bbf7d0', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#15803d' }}>ข้อมูลเจ้าหน้าที่</div>
                <div style={{ fontSize: 11, color: '#4ade80' }}>Staff Information</div>
              </div>
              <div style={{ marginLeft: 'auto', background: '#dcfce7', color: '#15803d', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, border: '1px solid #86efac' }}>ขั้นตอนที่ 2</div>
            </div>
          }>
            <FieldGrid cols={3}>
              <FormSelect label="คำนำหน้า" options={['นาย','นาง','นางสาว','ดร.','ผศ.','รศ.'].map(v=>({value:v,label:v}))} value={form.prefix} onChange={e => set('prefix', e.target.value)} />
              <FormInput label="ชื่อ" value={form.first_name} onChange={e => set('first_name', e.target.value)} required />
              <FormInput label="สกุล" value={form.last_name} onChange={e => set('last_name', e.target.value)} required />
              <div style={{ gridColumn: '1 / -1' }}>
                <FormInput label="หมายเลขบัตรประชาชน" value={form.id_card} onChange={e => set('id_card', e.target.value)} placeholder="X-XXXX-XXXXX-XX-X" />
              </div>
              <FormInput label="ตำแหน่ง" value={form.position} onChange={e => set('position', e.target.value)} placeholder="เช่น พยาบาลวิชาชีพชำนาญการ" />
              <FormSelect label="ประเภท" options={TYPES} value={form.staff_type} onChange={e => set('staff_type', e.target.value)} />
              <div />
              <div style={{ gridColumn: '1 / -1' }}>
                <FormSelect label="กลุ่มงาน/แผนก" options={DEPTS} value={form.department} onChange={e => set('department', e.target.value)} />
              </div>
            </FieldGrid>
          </SectionCard>

          {/* Section 3: ผลการคัดกรอง */}
          <SectionCard header={
            <div style={{ background: 'linear-gradient(90deg, #fefce8 0%, #fef9c3 100%)', padding: '14px 24px', borderBottom: '1px solid #fde68a', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 34, height: 34, background: '#fde68a', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2" strokeLinecap="round">
                  <path d="M9 12l2 2 4-4"/><rect x="3" y="3" width="18" height="18" rx="2"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#92400e' }}>ผลการคัดกรอง</div>
                <div style={{ fontSize: 11, color: '#d97706' }}>Screening Results</div>
              </div>
              <div style={{ marginLeft: 'auto', background: '#fef9c3', color: '#92400e', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, border: '1px solid #fde68a' }}>ขั้นตอนที่ 3</div>
            </div>
          }>
            <FieldGrid cols={3}>
              <FormInput label="วันที่ CXR" type="date" value={form.cxr_date} onChange={e => set('cxr_date', e.target.value)} />
              <FormSelect label="ผล CXR" options={CXR} value={form.cxr_result} onChange={e => set('cxr_result', e.target.value)} />
              <div />
              <div style={{ gridColumn: '1 / -1' }}>
                <FormTextArea label="หมายเหตุ / บันทึกเพิ่มเติม" value={form.notes} onChange={e => set('notes', e.target.value)} />
              </div>
            </FieldGrid>
          </SectionCard>

          {msg && (
            <div style={{
              marginBottom: 20, padding: '12px 16px', borderRadius: 10,
              background: msg.includes('✅') ? '#f0fdf4' : '#fef2f2',
              color: msg.includes('✅') ? '#15803d' : '#b91c1c',
              fontSize: 14, fontWeight: 500, border: `1px solid ${msg.includes('✅') ? '#bbf7d0' : '#fecaca'}`,
            }}>{msg}</div>
          )}

          {/* Action buttons */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: '16px 24px', display: 'flex', gap: 10, alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <button type="submit" disabled={saving} style={{
              background: saving ? '#93c5fd' : 'linear-gradient(90deg, #1d4ed8, #2563eb)',
              color: '#fff', padding: '11px 28px', borderRadius: 10,
              fontSize: 14, fontWeight: 700, border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 8px rgba(37,99,235,0.3)', display: 'flex', alignItems: 'center', gap: 7,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
            </button>
            <button type="button" onClick={() => router.push('/staff-screening')} style={{
              background: '#fff', color: '#475569', padding: '11px 22px', borderRadius: 10,
              fontSize: 14, border: '1.5px solid #e2e8f0', cursor: 'pointer', fontWeight: 600,
            }}>ยกเลิก</button>
          </div>

        </form>
      </div>
    </div>
  )
}
