'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { FormInput, FormSelect, FormTextArea, FormDateThai, SearchableSelect } from '@/components/FormComponents'
import { PROVINCES, DISTRICTS_BY_PROVINCE, SUBDISTRICTS_BY_DISTRICT } from '@/data/thai_geography'

function formatIdCard(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 13)
  return [d.slice(0,1), d.slice(1,5), d.slice(5,10), d.slice(10,12), d.slice(12,13)].filter(p => p).join('-')
}

const YEARS = [2575,2574,2573,2572,2571,2570,2569,2568,2567,2566,2565].map(y => ({ value: String(y), label: `ปีงบ ${y}` }))
const CXR = ['ปกติ', 'ผิดปกติ', 'สงสัย TB', 'ไม่ได้ CXR'].map(v => ({ value: v, label: v }))
const TYPES = ['ข้าราชการ', 'พนักงานกระทรวง', 'ลูกจ้างชั่วคราว', 'จ้างเหมาบริการ'].map(v => ({ value: v, label: v }))
const POSITIONS = [
  'ทันตแพทย์ปฏิบัติการ','ทันตแพทย์ชำนาญการ','ทันตแพทย์ชำนาญการพิเศษ',
  'นายแพทย์ปฏิบัติการ','นายแพทย์ชำนาญการ','นายแพทย์ชำนาญการพิเศษ',
  'นักเทคนิคการแพทย์','นักเทคนิคการแพทย์ปฏิบัติการ',
  'นักวิชาการคอมพิวเตอร์','นักวิชาการคอมพิวเตอร์ปฏิบัติการ',
  'นักวิชาการสาธารณสุข','นักวิชาการสาธารณสุขปฏิบัติการ','นักวิชาการสาธารณสุข (ทันตสาธารณสุข)',
  'นักวิชาการพัสดุ','นักวิชาการพัสดุปฏิบัติการ',
  'นักวิชาการเงินและบัญชี','นักวิชาการเงินและบัญชีปฏิบัติการ',
  'พยาบาลวิชาชีพ','พยาบาลวิชาชีพปฏิบัติการ','พยาบาลวิชาชีพชำนาญการ','พยาบาลวิชาชีพชำนาญการพิเศษ',
  'เภสัชกร','เภสัชกรชำนาญการ','เภสัชกรชำนาญการพิเศษ',
  'แพทย์แผนไทย','หมอนวดแผนไทย','นักกายภาพบำบัด',
  'จพ.เภสัชกรรมชำนาญงาน','จพ.ทันตสาธารณสุขชำนาญงาน',
  'เจ้าพนักงานการเงินและบัญชี','เจ้าพนักงานการเงินและบัญชีปฏิบัติการ',
  'เจ้าพนักงานธุรการ','เจ้าพนักงานเวชสถิติปฏิบัติงาน',
  'เจ้าพนักงานสาธารณสุข (เวชกิจฉุกเฉิน)',
  'ผู้ช่วยทันตแพทย์','ผู้ช่วยเหลือคนไข้ (ด้านทันตกรรม)',
  'พนักงานบริการ','พนักงานบริการเอกสารทั่วไป','พนักงานเกษตรขั้นพื้นฐาน',
  'พนักงานขับรถยนต์','พนักงานช่วยเหลือคนไข้','พนักงานซักฟอก',
  'พนักงานบัตรรายงานโรค','พนักงานเปล',
  'พนักงานผู้ช่วยเหลือคนไข้ (ด้านการพยาบาล)',
  'พนักงานบริการ (รปภ.)','พนักงานบริการ (ขับรถยนต์)','พนักงานบริการ (ซักฟอก)',
  'พนักงานบริการ (แม่บ้าน)','พนักงานบริการ (ห้องกายภาพบำบัด)','พนักงานบริการ (ห้องยา)',
]
const DEPTS = [
  'กลุ่มการแพทย์',
  'กลุ่มกายภาพบำบัด',
  'กลุ่มการพยาบาล',
  'กลุ่มงานทันตกรรม',
  'กลุ่มงานเทคนิคการแพทย์',
  'กลุ่มงานบริการปฐมภูมิและองค์รวม',
  'กลุ่มงานบริหารทั่วไป',
  'กลุ่มงานประกันสุขภาพ ยุทธศาสตร์และสารสนเทศทางการแพทย์',
  'กลุ่มงานแพทย์แผนไทย',
  'กลุ่มงานเภสัชกรรม',
].map(v => ({ value: v, label: v }))

const SectionCard = ({ children, header }: { children: React.ReactNode; header: React.ReactNode }) => (
  <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', marginBottom: 20, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
    {header}
    <div style={{ padding: '24px 28px' }}>{children}</div>
  </div>
)

const FieldGrid = ({ children, cols = 3 }: { children: React.ReactNode; cols?: number }) => (
  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '16px 24px' }}>
    {children}
  </div>
)

function calcAge(isoDate: string): string {
  if (!isoDate) return ''
  const birth = new Date(isoDate)
  if (isNaN(birth.getTime())) return ''
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age >= 0 ? String(age) : ''
}

export default function EditStaffPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const [form, setForm] = useState<Record<string, string>>({
    fiscal_year: '2568', hn: '', id_card: '',
    prefix: '', first_name: '', last_name: '', full_name: '',
    position: '', staff_type: '', department: '',
    birth_date: '',
    address: '', moo: '', province: '', district: '', subdistrict: '',
    cxr_date: '', cxr_result: '', notes: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('staff_screening').select('*').eq('id', params.id).single()
      if (data) {
        setForm({
          fiscal_year: String(data.fiscal_year ?? '2568'),
          hn: String(data.hn ?? ''),
          id_card: data.id_card ?? '',
          prefix: data.prefix ?? '',
          first_name: data.first_name ?? '',
          last_name: data.last_name ?? '',
          full_name: data.full_name ?? '',
          position: data.position ?? '',
          staff_type: data.staff_type ?? '',
          department: data.department ?? '',
          birth_date: data.birth_date ?? '',
          address: data.address ?? '',
          moo: data.moo ?? '',
          province: data.province ?? '',
          district: data.district ?? '',
          subdistrict: data.subdistrict ?? '',
          cxr_date: data.cxr_date ?? '',
          cxr_result: data.cxr_result ?? '',
          notes: data.notes ?? '',
        })
      }
      setLoading(false)
    }
    load()
  }, [params.id])

  const set = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }))
  const age = calcAge(form.birth_date)

  function handleHnBlur() {
    if (!form.hn) return
    const digits = form.hn.replace(/\D/g, '')
    set('hn', digits.padStart(9, '0'))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setMsg('')
    const payload = {
      fiscal_year: parseInt(form.fiscal_year),
      hn: form.hn || null,
      id_card: form.id_card || null,
      prefix: form.prefix || null,
      first_name: form.first_name || null,
      last_name: form.last_name || null,
      full_name: form.full_name || `${form.prefix}${form.prefix ? ' ' : ''}${form.first_name} ${form.last_name}`.trim(),
      position: form.position || null,
      staff_type: form.staff_type || null,
      department: form.department || null,
      birth_date: form.birth_date || null,
      address: form.address || null,
      moo: form.moo || null,
      province: form.province || null,
      district: form.district || null,
      subdistrict: form.subdistrict || null,
      cxr_date: form.cxr_date || null,
      cxr_result: form.cxr_result || null,
      notes: form.notes || null,
    }
    const { error } = await supabase.from('staff_screening').update(payload).eq('id', params.id)
    setSaving(false)
    if (error) { setMsg('❌ ' + error.message); return }
    router.push('/staff-screening')
  }

  async function handleDelete() {
    if (!confirm('ยืนยันการลบข้อมูลรายนี้?')) return
    await supabase.from('staff_screening').delete().eq('id', params.id)
    router.push('/staff-screening')
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#94a3b8', fontSize: 14 }}>
      ⏳ กำลังโหลดข้อมูล...
    </div>
  )

  const displayName = form.full_name || `${form.prefix} ${form.first_name} ${form.last_name}`.trim()

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '18px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
                  <circle cx="20" cy="10" r="6" fill="#bfdbfe" stroke="#2563eb" strokeWidth="2"/>
                  <path d="M9 36 C9 26 31 26 31 36" fill="#bfdbfe" stroke="#2563eb" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M14 22 C13 26 13 30 17 31" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" fill="none"/>
                  <path d="M26 22 C27 26 27 30 23 31" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" fill="none"/>
                  <path d="M17 31 C17 34 23 34 23 31" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" fill="none"/>
                  <circle cx="20" cy="34" r="2.5" fill="#2563eb"/>
                </svg>
              </div>
              <div>
                <h1 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>แก้ไขข้อมูลเจ้าหน้าที่</h1>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#1e40af', margin: '3px 0 0' }}>{displayName}</p>
              </div>
            </div>
          </div>
          <button onClick={handleDelete} style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            ลบข้อมูล
          </button>
        </div>
      </div>

      <div style={{ padding: '28px 40px' }}>
        <form onSubmit={handleSubmit} onKeyDown={e => { if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') e.preventDefault() }}>

          {/* Section 1: ข้อมูลทั่วไป */}
          <SectionCard header={
            <div style={{ background: 'linear-gradient(90deg, #eff6ff 0%, #dbeafe 100%)', padding: '18px 28px', borderBottom: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 52, height: 52, background: '#bfdbfe', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#1e40af' }}>ข้อมูลทั่วไป</div>
                <div style={{ fontSize: 14, color: '#60a5fa' }}>General Information</div>
              </div>
              <div style={{ marginLeft: 'auto', background: '#dbeafe', color: '#1e40af', fontSize: 13, fontWeight: 700, padding: '5px 14px', borderRadius: 20, border: '1px solid #bfdbfe', whiteSpace: 'nowrap' }}>ขั้นตอนที่ 1</div>
            </div>
          }>
            <FieldGrid>
              <FormSelect label="ปีงบประมาณ" options={YEARS} value={form.fiscal_year} onChange={e => set('fiscal_year', e.target.value)} required />
              <FormInput
                label="HN (เลขประจำตัวผู้ป่วย)"
                value={form.hn}
                onChange={e => set('hn', e.target.value)}
                onBlur={handleHnBlur}
                placeholder="เช่น 000012345"
              />
              <div />
            </FieldGrid>
          </SectionCard>

          {/* Section 2: ข้อมูลเจ้าหน้าที่ */}
          <SectionCard header={
            <div style={{ background: 'linear-gradient(90deg, #f0fdf4 0%, #dcfce7 100%)', padding: '18px 28px', borderBottom: '1px solid #86efac', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 52, height: 52, background: '#bbf7d0', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#15803d' }}>ข้อมูลเจ้าหน้าที่</div>
                <div style={{ fontSize: 14, color: '#4ade80' }}>Staff Information</div>
              </div>
              <div style={{ marginLeft: 'auto', background: '#dcfce7', color: '#15803d', fontSize: 13, fontWeight: 700, padding: '5px 14px', borderRadius: 20, border: '1px solid #86efac', whiteSpace: 'nowrap' }}>ขั้นตอนที่ 2</div>
            </div>
          }>
            <FieldGrid>
              <FormSelect label="คำนำหน้า" options={['นาย','นาง','นางสาว','ดร.','ผศ.','รศ.'].map(v=>({value:v,label:v}))} value={form.prefix} onChange={e => set('prefix', e.target.value)} />
              <FormInput label="ชื่อ" value={form.first_name} onChange={e => set('first_name', e.target.value)} />
              <FormInput label="สกุล" value={form.last_name} onChange={e => set('last_name', e.target.value)} />
              <div style={{ gridColumn: '1 / -1' }}>
                <FormInput label="ชื่อ-สกุล (เต็ม)" value={form.full_name} onChange={e => set('full_name', e.target.value)} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <FormInput
                  label="หมายเลขบัตรประชาชน"
                  value={form.id_card}
                  onChange={e => set('id_card', formatIdCard(e.target.value))}
                  placeholder="X-XXXX-XXXXX-XX-X"
                  maxLength={17}
                  error={form.id_card && form.id_card.replace(/\D/g, '').length !== 13 ? 'กรุณากรอกเลขบัตรประชาชน 13 หลัก' : undefined}
                />
              </div>
              {/* วันเกิด + อายุ */}
              <FormDateThai
                label="วันเดือนปีเกิด (พ.ศ.)"
                value={form.birth_date}
                onChange={v => set('birth_date', v)}
              />
              <div>
                <label className="block text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">อายุ (คำนวณอัตโนมัติ)</label>
                <div style={{
                  border: '1px solid #e2e8f0', borderRadius: 8, padding: '12px 16px',
                  background: '#f8fafc', fontSize: 16, fontWeight: 700,
                  color: age ? '#0f172a' : '#94a3b8', minHeight: 46, display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  {age ? (
                    <>
                      <span style={{ fontSize: 22, color: '#2563eb' }}>{age}</span>
                      <span style={{ fontSize: 14, color: '#64748b' }}>ปี</span>
                    </>
                  ) : '—'}
                </div>
              </div>
              <div />
              <SearchableSelect label="ตำแหน่ง" options={POSITIONS} value={form.position} onChange={v => set('position', v)} />
              <FormSelect label="ประเภท" options={TYPES} value={form.staff_type} onChange={e => set('staff_type', e.target.value)} />
              <div />
              <div style={{ gridColumn: '1 / -1' }}>
                <FormSelect label="กลุ่มงาน/แผนก" options={DEPTS} value={form.department} onChange={e => set('department', e.target.value)} />
              </div>
              {/* ที่อยู่ */}
              <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #f1f5f9', paddingTop: 16, marginTop: 4 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 }}>ที่อยู่</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: '16px 24px', marginBottom: 16 }}>
                  <FormInput label="ที่อยู่ (บ้านเลขที่ / ถนน / ซอย)" value={form.address} onChange={e => set('address', e.target.value)} placeholder="เช่น 123 ถ.พิจิตร-ตะพานหิน" />
                  <FormInput label="หมู่" value={form.moo} onChange={e => set('moo', e.target.value)} placeholder="เช่น 1" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px 24px' }}>
                  <SearchableSelect
                    label="จังหวัด"
                    options={PROVINCES}
                    value={form.province}
                    onChange={v => { set('province', v); set('district', ''); set('subdistrict', '') }}
                  />
                  <SearchableSelect
                    label="อำเภอ"
                    options={form.province ? (DISTRICTS_BY_PROVINCE[form.province] ?? []) : []}
                    value={form.district}
                    onChange={v => { set('district', v); set('subdistrict', '') }}
                  />
                  <SearchableSelect
                    label="ตำบล"
                    options={form.district ? (SUBDISTRICTS_BY_DISTRICT[form.district] ?? []) : []}
                    value={form.subdistrict}
                    onChange={v => set('subdistrict', v)}
                  />
                </div>
              </div>
            </FieldGrid>
          </SectionCard>

          {/* Section 3: ผลการคัดกรอง */}
          <SectionCard header={
            <div style={{ background: 'linear-gradient(90deg, #fefce8 0%, #fef9c3 100%)', padding: '18px 28px', borderBottom: '1px solid #fde68a', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 52, height: 52, background: '#fde68a', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2" strokeLinecap="round">
                  <path d="M9 12l2 2 4-4"/><rect x="3" y="3" width="18" height="18" rx="2"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#92400e' }}>ผลการคัดกรอง</div>
                <div style={{ fontSize: 14, color: '#d97706' }}>Screening Results</div>
              </div>
              <div style={{ marginLeft: 'auto', background: '#fef9c3', color: '#92400e', fontSize: 13, fontWeight: 700, padding: '5px 14px', borderRadius: 20, border: '1px solid #fde68a', whiteSpace: 'nowrap' }}>ขั้นตอนที่ 3</div>
            </div>
          }>
            <FieldGrid>
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
