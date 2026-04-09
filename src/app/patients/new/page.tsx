'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { FormInput, FormSelect, FormTextArea, FormDateThai, SearchableSelect } from '@/components/FormComponents'
import { THAI_HOSPITALS } from '@/data/thai_hospitals'
import { PROVINCES, DISTRICTS_BY_PROVINCE, SUBDISTRICTS_BY_DISTRICT } from '@/data/thai_geography'

// ─── Columns that exist in tb_patients DB table ───────────────────────────────
const DB_COLS = new Set([
  'fiscal_year','tb_no','hn','registered_date','full_name','age','address',
  'icd10','xpert_result','is_ip','is_ep','detected_place','treatment_place',
  'treatment_start_date','patient_type','risk_group','result_m2','result_m3',
  'treatment_outcome','caregiver_name','phone','notes',
  'id_card','birth_date','province','district','subdistrict','village_no',
  'population_type','nationality','medical_right','cxr_date','sputum_lab_no','sputum_date',
])

// ─── Constants ────────────────────────────────────────────────────────────────
const FISCAL_YEARS = Array.from({ length: 15 }, (_, i) => 2561 + i).reverse()
  .map(y => ({ value: String(y), label: `ปีงบ ${y}` }))

const ICD10_OPTIONS = [
  { value: 'A150', label: 'A150: วัณโรคปอด ยืนยันด้วยการตรวจเสมหะโดยใช้กล้องจุลทรรศน์' },
  { value: 'A151', label: 'A151: วัณโรคปอด ยืนยันด้วยการเพาะเชื้อเท่านั้น' },
  { value: 'A152', label: 'A152: วัณโรคปอด ยืนยันด้วยการตรวจทางพยาธิวิทยา' },
  { value: 'A153', label: 'A153: วัณโรคปอด ยืนยันด้วยวิธีอื่นที่ไม่ใช่การเพาะเชื้อ' },
  { value: 'A154', label: 'A154: วัณโรคต่อมน้ำเหลืองในทรวงอก' },
  { value: 'A155', label: 'A155: วัณโรคกล่องเสียง หลอดลม และหลอดลมใหญ่' },
  { value: 'A156', label: 'A156: วัณโรคเยื่อหุ้มปอด' },
  { value: 'A157', label: 'A157: วัณโรคระบบหายใจระยะแรก' },
  { value: 'A158', label: 'A158: วัณโรคระบบหายใจอื่นๆ' },
  { value: 'A159', label: 'A159: วัณโรคระบบหายใจ ไม่ระบุรายละเอียด' },
  { value: 'A160', label: 'A160: วัณโรคปอด ผลตรวจเสมหะและชิ้นเนื้อเป็นลบ' },
  { value: 'A161', label: 'A161: วัณโรคปอด ไม่ได้ตรวจเสมหะหรือชิ้นเนื้อ' },
  { value: 'A162', label: 'A162: วัณโรคปอด ไม่ระบุว่าตรวจยืนยันหรือไม่' },
  { value: 'A163', label: 'A163: วัณโรคของต่อมน้ำเหลืองที่ขั้วปอด' },
  { value: 'A164', label: 'A164: วัณโรคของกล่องเสียง ท่อลม และหลอดลม' },
  { value: 'A165', label: 'A165: วัณโรคเยื่อหุ้มปอด' },
  { value: 'A167', label: 'A167: วัณโรคระบบทางเดินหายใจส่วนต้น' },
  { value: 'A168', label: 'A168: วัณโรคระบบทางเดินหายใจอื่นๆ' },
  { value: 'A169', label: 'A169: วัณโรคระบบทางเดินหายใจ ไม่ระบุรายละเอียด' },
  { value: 'A170', label: 'A170: เยื่อหุ้มสมองอักเสบจากวัณโรค' },
  { value: 'A171', label: 'A171: วัณโรคก้อนสมองบริเวณเยื่อหุ้มสมอง' },
  { value: 'A178', label: 'A178: วัณโรคระบบประสาทอื่นๆ' },
  { value: 'A179', label: 'A179: วัณโรคระบบประสาทที่ไม่ระบุรายละเอียด' },
  { value: 'A180', label: 'A180: วัณโรคกระดูกและข้อ' },
  { value: 'A181', label: 'A181: วัณโรคระบบสืบพันธุ์และทางเดินปัสสาวะ' },
  { value: 'A182', label: 'A182: วัณโรคต่อมน้ำเหลืองส่วนปลาย' },
  { value: 'A183', label: 'A183: วัณโรคลำไส้ ช่องท้อง และต่อมน้ำเหลืองในช่องท้อง' },
  { value: 'A184', label: 'A184: วัณโรคผิวหนังและเนื้อเยื่อใต้ผิวหนัง' },
  { value: 'A185', label: 'A185: วัณโรคตา' },
  { value: 'A186', label: 'A186: วัณโรคหู' },
  { value: 'A187', label: 'A187: วัณโรคต่อมหมวกไต' },
  { value: 'A188', label: 'A188: วัณโรคของอวัยวะอื่นๆ ที่ระบุ' },
  { value: 'A189', label: 'A189: วัณโรคของอวัยวะอื่นๆ ไม่ระบุรายละเอียด' },
  { value: 'A190', label: 'A190: วัณโรคแพร่กระจายเฉียบพลัน บริเวณเดียว' },
  { value: 'A191', label: 'A191: วัณโรคแพร่กระจายเฉียบพลัน หลายบริเวณ' },
  { value: 'A192', label: 'A192: วัณโรคแพร่กระจายเฉียบพลัน ไม่ระบุรายละเอียด' },
  { value: 'A198', label: 'A198: วัณโรคแพร่กระจายแบบอื่น' },
  { value: 'A199', label: 'A199: วัณโรคแพร่กระจาย ไม่ระบุรายละเอียด' },
]

const LUNG_TYPES = [
  { value: 'IP', label: 'ในปอด (IP)' },
  { value: 'EP', label: 'นอกปอด (EP)' },
  { value: 'IP/EP', label: 'ในปอด (IP) และนอกปอด (EP)' },
]

const PATIENT_TYPES = [
  { value: 'NEW', label: 'ผู้ป่วยรายใหม่ (New)' },
  { value: 'Relapse', label: 'ผู้ป่วยกลับเป็นซ้ำ (Relapse)' },
  { value: 'RF', label: 'ผู้ป่วยกลับมารักษาต่อ (RF)' },
  { value: 'Failure', label: 'ผู้ป่วยรักษาล้มเหลว (Failure)' },
  { value: 'Transfer-in', label: 'ผู้ป่วยย้ายมา (Transfer-in)' },
  { value: 'Other', label: 'ผู้ป่วยอื่นๆ (Other)' },
]

const OUTCOMES = ['กำลังรักษา','รักษาหาย','รักษาครบ(Completed)','เสียชีวิต(Died)','โอนออก(Transfered out)','ขาดยา','ล้มเหลว']
  .map(v => ({ value: v, label: v }))

const TITLES = ['นาย', 'นาง', 'นางสาว', 'เด็กชาย', 'เด็กหญิง'].map(v => ({ value: v, label: v }))
const MEDICAL_RIGHTS = ['สวัสดิการข้าราชการ', 'ประกันสังคม', 'บัตรทอง/30 บาท', 'ชำระเอง', 'อื่นๆ'].map(v => ({ value: v, label: v }))
const NATIONALITIES = ['ไทย', 'พม่า', 'ลาว', 'กัมพูชา', 'เวียดนาม', 'จีน', 'อื่นๆ'].map(v => ({ value: v, label: v }))
const POPULATIONS = ['ไทย', 'ต่างด้าว', 'แรงงานต่างชาติ'].map(v => ({ value: v, label: v }))
const STEP_CONFIG = [
  { title: 'ข้อมูลทะเบียน',       icon: '📋', color: '#ef4444', bg: '#fef2f2', border: '#fecaca' },
  { title: 'ข้อมูลผู้ป่วย',        icon: '👤', color: '#f97316', bg: '#fff7ed', border: '#fed7aa' },
  { title: 'การวินิจฉัยและตรวจ',  icon: '🔬', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
  { title: 'การรักษา',            icon: '💊', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  { title: 'ผลระหว่างการรักษา',   icon: '📊', color: '#ca8a04', bg: '#fefce8', border: '#fde68a' },
  { title: 'ผู้ดูแลและติดต่อ',    icon: '📞', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
]

function calcAge(birthIso: string): { years: number; months: number } {
  if (!birthIso) return { years: 0, months: 0 }
  const b = new Date(birthIso), t = new Date()
  let y = t.getFullYear() - b.getFullYear()
  let m = t.getMonth() - b.getMonth()
  if (m < 0) { y--; m += 12 }
  if (t.getDate() < b.getDate() && m > 0) m--
  return { years: y, months: m }
}

export default function NewPatientPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [step, setStep] = useState(0)

  const [form, setForm] = useState({
    fiscal_year: '2568', tb_no: '', hn: '', registered_date: '',
    title: '', first_name: '', last_name: '', id_card: '', birth_date: '', age: '', age_months: '',
    population_type: '', nationality: '', medical_right: '',
    address: '', village_no: '', province: '', district: '', subdistrict: '',
    icd10: '', xpert_result: '', lung_type: '',
    detected_place: '', treatment_place: '', treatment_start_date: '', patient_type: '',
    risk_has: '', risk_group: '',
    treatment_outcome: '', caregiver_name: '', phone: '', notes: '',
  })

  function set(field: string, value: string) { setForm(prev => ({ ...prev, [field]: value })) }

  function handleBirthDate(iso: string) {
    const { years, months } = calcAge(iso)
    setForm(prev => ({ ...prev, birth_date: iso, age: String(years), age_months: String(months) }))
  }

  const districts = DISTRICTS_BY_PROVINCE[form.province] ?? []
  const subdistricts = SUBDISTRICTS_BY_DISTRICT[form.district] ?? []

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setMsg('')

    const full_name = [form.title, form.first_name, form.last_name].filter(Boolean).join(' ') || undefined
    const is_ip = form.lung_type === 'IP' || form.lung_type === 'IP/EP'
    const is_ep = form.lung_type === 'EP' || form.lung_type === 'IP/EP'
    const risk_group = form.risk_has === 'none' ? 'ไม่มี' : form.risk_group || undefined
    // Build address from components
    const address = form.address || undefined

    const payload: Record<string, unknown> = { full_name, is_ip, is_ep }
    if (risk_group !== undefined) payload.risk_group = risk_group
    if (address) payload.address = address

    // Save all confirmed DB columns
    const fieldMap: Record<string, string> = {
      tb_no: 'tb_no', hn: 'hn', registered_date: 'registered_date',
      id_card: 'id_card', birth_date: 'birth_date',
      population_type: 'population_type', nationality: 'nationality', medical_right: 'medical_right',
      province: 'province', district: 'district', subdistrict: 'subdistrict', village_no: 'village_no',
      icd10: 'icd10', xpert_result: 'xpert_result',
      detected_place: 'detected_place', treatment_place: 'treatment_place',
      treatment_start_date: 'treatment_start_date', patient_type: 'patient_type',
      treatment_outcome: 'treatment_outcome', caregiver_name: 'caregiver_name',
      phone: 'phone', notes: 'notes',
    }
    for (const [fk, dbk] of Object.entries(fieldMap)) {
      const v = form[fk as keyof typeof form]
      if (v) payload[dbk] = v
    }
    payload.fiscal_year = parseInt(form.fiscal_year)
    if (form.age) payload.age = parseInt(form.age)

    const { data: inserted, error } = await supabase.from('tb_patients').insert(payload).select('id').single()
    setSaving(false)
    if (error) { console.error('INSERT error:', error); setMsg('❌ ' + error.message) }
    else { setMsg('✅ บันทึกสำเร็จ'); setTimeout(() => router.push(`/patients/${inserted.id}`), 1000) }
  }

  function handleNext() {
    if (step === 0 && !form.fiscal_year) { setMsg('❌ กรุณาเลือกปีงบประมาณ'); return }
    if (step === 1 && !form.first_name.trim()) { setMsg('❌ กรุณากรอกชื่อผู้ป่วย'); return }
    setMsg('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setStep(s => s + 1)
  }

  const sc = STEP_CONFIG[step]

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #f0f4ff 0%, #f8fafc 60%)' }}>

      {/* ── Top Header ── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '14px 24px', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 780, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => router.back()} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 13, color: '#475569', cursor: 'pointer' }}>← กลับ</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, background: '#fee2e2', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>🫁</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', lineHeight: 1.3 }}>เพิ่มผู้ป่วยวัณโรค</div>
                {form.first_name && <div style={{ fontSize: 11, color: '#64748b' }}>{[form.title, form.first_name, form.last_name].filter(Boolean).join(' ')}</div>}
              </div>
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, background: '#f8fafc', padding: '4px 12px', borderRadius: 20, border: '1px solid #e2e8f0' }}>
            {step + 1} / {STEP_CONFIG.length}
          </div>
        </div>
      </div>

      {/* ── Step Progress ── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #f1f5f9', padding: '14px 24px' }}>
        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            {STEP_CONFIG.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', flex: i < STEP_CONFIG.length - 1 ? 1 : 'none' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                  <button type="button" onClick={() => i < step && setStep(i)}
                    style={{ width: 34, height: 34, borderRadius: '50%', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, cursor: i < step ? 'pointer' : 'default', flexShrink: 0, transition: 'all 0.2s', background: i < step ? '#22c55e' : i === step ? s.color : '#e2e8f0', color: i <= step ? '#fff' : '#94a3b8', boxShadow: i === step ? `0 0 0 3px ${s.color}30` : 'none' }}>
                    {i < step ? '✓' : s.icon}
                  </button>
                  <span style={{ fontSize: 10, color: i === step ? s.color : i < step ? '#22c55e' : '#94a3b8', fontWeight: i === step ? 700 : 400, whiteSpace: 'nowrap', textAlign: 'center', maxWidth: 72 }}>{s.title}</span>
                </div>
                {i < STEP_CONFIG.length - 1 && (
                  <div style={{ flex: 1, height: 3, background: i < step ? '#22c55e' : '#e2e8f0', margin: '15px 4px 0', borderRadius: 2, minWidth: 8, transition: 'background 0.3s' }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Card ── */}
      <div style={{ padding: '24px 16px 60px', maxWidth: 780, margin: '0 auto' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>

            {/* Card Header */}
            <div style={{ background: sc.bg, borderBottom: `2px solid ${sc.border}`, padding: '22px 28px', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 54, height: 54, borderRadius: 16, background: sc.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0, boxShadow: `0 4px 12px ${sc.color}40` }}>
                {sc.icon}
              </div>
              <div>
                <div style={{ fontSize: 11, color: sc.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 3 }}>ขั้นตอนที่ {step + 1} จาก {STEP_CONFIG.length}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: -0.5 }}>{sc.title}</div>
              </div>
            </div>

            {/* Card Content */}
            <div style={{ padding: '28px' }}>

              {/* ── Step 1: ข้อมูลทะเบียน ── */}
              {step === 0 && (
                <div className="grid grid-cols-2 gap-5">
                  <FormSelect label="ปีงบประมาณ" options={FISCAL_YEARS} value={form.fiscal_year} onChange={e => set('fiscal_year', e.target.value)} required />
                  <FormInput label="รหัส TB No." value={form.tb_no} onChange={e => set('tb_no', e.target.value)} placeholder="เช่น 682797800001" />
                  <FormInput label="HN" value={form.hn} onChange={e => set('hn', e.target.value)} placeholder="000000000" />
                  <FormDateThai label="วันที่ขึ้นทะเบียน (พ.ศ.)" value={form.registered_date} onChange={v => set('registered_date', v)} />
                </div>
              )}

              {/* ── Step 2: ข้อมูลผู้ป่วย ── */}
              {step === 1 && (<>
                <div className="grid grid-cols-3 gap-5" style={{ marginBottom: 20 }}>
                  <FormSelect label="คำนำหน้า" options={TITLES} value={form.title} onChange={e => set('title', e.target.value)} />
                  <FormInput label="ชื่อ *" value={form.first_name} onChange={e => set('first_name', e.target.value)} placeholder="ชื่อจริง" required />
                  <FormInput label="นามสกุล" value={form.last_name} onChange={e => set('last_name', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-5" style={{ marginBottom: 20 }}>
                  <FormInput label="เลขบัตรประชาชน" value={form.id_card} onChange={e => set('id_card', e.target.value)} placeholder="X-XXXX-XXXXX-XX-X" />
                  <FormDateThai label="วันเกิด (พ.ศ.)" value={form.birth_date} onChange={handleBirthDate} />
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">อายุ (คำนวณอัตโนมัติ)</label>
                    <div style={{ padding: '9px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, color: '#334155', minHeight: 38 }}>
                      {form.age ? `${form.age} ปี ${form.age_months} เดือน` : <span style={{ color: '#94a3b8' }}>กรอกวันเกิด</span>}
                    </div>
                  </div>
                  <FormSelect label="สิทธิ์การรักษา" options={MEDICAL_RIGHTS} value={form.medical_right} onChange={e => set('medical_right', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-5" style={{ marginBottom: 20 }}>
                  <FormSelect label="ประชากร" options={POPULATIONS} value={form.population_type} onChange={e => set('population_type', e.target.value)} />
                  <FormSelect label="สัญชาติ" options={NATIONALITIES} value={form.nationality} onChange={e => set('nationality', e.target.value)} />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <FormInput label="ที่อยู่ (บ้านเลขที่ ซอย ถนน)" value={form.address} onChange={e => set('address', e.target.value)} />
                </div>
                <div className="grid grid-cols-4 gap-5">
                  <FormInput label="หมู่ที่" value={form.village_no} onChange={e => set('village_no', e.target.value)} placeholder="เช่น 1" />
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">จังหวัด</label>
                    <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      value={form.province} onChange={e => setForm(p => ({ ...p, province: e.target.value, district: '', subdistrict: '' }))}>
                      <option value="">-- เลือก --</option>
                      {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">อำเภอ</label>
                    {districts.length > 0
                      ? <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                          value={form.district} onChange={e => setForm(p => ({ ...p, district: e.target.value, subdistrict: '' }))}>
                          <option value="">-- เลือก --</option>
                          {districts.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      : <input type="text" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.district} onChange={e => set('district', e.target.value)} placeholder="พิมพ์อำเภอ" />}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">ตำบล</label>
                    {subdistricts.length > 0
                      ? <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                          value={form.subdistrict} onChange={e => set('subdistrict', e.target.value)}>
                          <option value="">-- เลือก --</option>
                          {subdistricts.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      : <input type="text" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.subdistrict} onChange={e => set('subdistrict', e.target.value)} placeholder="พิมพ์ตำบล" />}
                  </div>
                </div>
              </>)}

              {/* ── Step 3: การวินิจฉัย ── */}
              {step === 2 && (
                <div className="grid grid-cols-1 gap-5">
                  <FormSelect label="การวินิจฉัย (ICD-10)" options={ICD10_OPTIONS} value={form.icd10} onChange={e => set('icd10', e.target.value)} />
                  <div className="grid grid-cols-2 gap-5">
                    <FormInput label="ผลการวินิจฉัย" value={form.xpert_result} onChange={e => set('xpert_result', e.target.value)} placeholder="เช่น MTB detected, Neg, 1+" />
                    <FormSelect label="ประเภทปอด (IP/EP)" options={LUNG_TYPES} value={form.lung_type} onChange={e => set('lung_type', e.target.value)} />
                  </div>
                </div>
              )}

              {/* ── Step 4: การรักษา ── */}
              {step === 3 && (<>
                <div className="grid grid-cols-2 gap-5" style={{ marginBottom: 20 }}>
                  <SearchableSelect label="สถานที่ตรวจพบ" options={THAI_HOSPITALS} value={form.detected_place} onChange={v => set('detected_place', v)} />
                  <SearchableSelect label="สถานที่รักษา" options={THAI_HOSPITALS} value={form.treatment_place} onChange={v => set('treatment_place', v)} />
                </div>
                <div className="grid grid-cols-2 gap-5" style={{ marginBottom: 20 }}>
                  <FormInput label="วันที่เริ่มรักษา" type="date" value={form.treatment_start_date} onChange={e => set('treatment_start_date', e.target.value)} />
                  <FormSelect label="ประเภทผู้ป่วย" options={PATIENT_TYPES} value={form.patient_type} onChange={e => set('patient_type', e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">โรคประจำตัว</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                      <input type="radio" name="risk_has" value="none" checked={form.risk_has === 'none'} onChange={e => { set('risk_has', e.target.value); set('risk_group', '') }} style={{ accentColor: '#2563eb' }} />ไม่มี
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                      <input type="radio" name="risk_has" value="yes" checked={form.risk_has === 'yes'} onChange={e => set('risk_has', e.target.value)} style={{ accentColor: '#2563eb' }} />ระบุ
                    </label>
                    {form.risk_has === 'yes' && (
                      <div style={{ flex: 1, minWidth: 240 }}>
                        <FormInput label="" value={form.risk_group} onChange={e => set('risk_group', e.target.value)} placeholder="เช่น DM, HT, ผู้สูงอายุ" />
                      </div>
                    )}
                  </div>
                </div>
              </>)}

              {/* ── Step 5: ผลระหว่างการรักษา ── */}
              {step === 4 && (<>
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '12px 16px', marginBottom: 18, fontSize: 13, color: '#1d4ed8', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18 }}>💡</span>
                  <span>บันทึกผู้ป่วยก่อน แล้วจะสามารถเพิ่มรายการ CXR และ Lab ได้ทันทีในหน้าแก้ไขข้อมูล</span>
                </div>
                <div style={{ opacity: 0.45, pointerEvents: 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                    <div style={{ background: '#dc2626', color: '#fff', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>+ เพิ่มรายการ CXR</div>
                  </div>
                  <div style={{ border: '1px solid #cbd5e1', borderRadius: 10, overflow: 'hidden', marginBottom: 16 }}>
                    <div style={{ background: '#1e3a5f', padding: '10px', display: 'flex', gap: 24, justifyContent: 'center' }}>
                      {['ลำดับ','วันที่ตรวจ','ผล CXR','ผล Abnormal','XN','หน่วยงาน'].map(h => (
                        <span key={h} style={{ color: '#fff', fontSize: 11, fontWeight: 600 }}>{h}</span>
                      ))}
                    </div>
                    <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8', fontSize: 12 }}>ยังไม่มีข้อมูล CXR</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                    <div style={{ background: '#dc2626', color: '#fff', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>+ เพิ่มรายการ LAB</div>
                  </div>
                  <div style={{ border: '1px solid #cbd5e1', borderRadius: 10, overflow: 'hidden', marginBottom: 16 }}>
                    <div style={{ background: '#1e3a5f', padding: '10px', display: 'flex', gap: 24, justifyContent: 'center' }}>
                      {['Lab No.','วันที่ตรวจ','สาเหตุการตรวจ','Smear','Molecular','Xpert','Culture','DST'].map(h => (
                        <span key={h} style={{ color: '#fff', fontSize: 11, fontWeight: 600 }}>{h}</span>
                      ))}
                    </div>
                    <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8', fontSize: 12 }}>ยังไม่มีข้อมูล Lab</div>
                  </div>
                </div>
                <div style={{ maxWidth: 280 }}>
                  <FormSelect label="ผลการรักษา" options={OUTCOMES} value={form.treatment_outcome} onChange={e => set('treatment_outcome', e.target.value)} />
                </div>
              </>)}

              {/* ── Step 6: ผู้ดูแลและติดต่อ ── */}
              {step === 5 && (<>
                <div className="grid grid-cols-2 gap-5" style={{ marginBottom: 20 }}>
                  <FormInput label="ญาติผู้ดูแล" value={form.caregiver_name} onChange={e => set('caregiver_name', e.target.value)} />
                  <FormInput label="เบอร์โทรศัพท์" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="0XX-XXXXXXX" />
                </div>
                <FormTextArea label="หมายเหตุ" value={form.notes} onChange={e => set('notes', e.target.value)} />
                {/* Summary */}
                <div style={{ marginTop: 24, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0', padding: '18px 20px' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>สรุปข้อมูลที่กรอก</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px', fontSize: 13 }}>
                    {[
                      ['ปีงบ', form.fiscal_year], ['TB No.', form.tb_no || '-'], ['HN', form.hn || '-'],
                      ['ชื่อ-สกุล', [form.title, form.first_name, form.last_name].filter(Boolean).join(' ') || '-'],
                      ['อายุ', form.age ? `${form.age} ปี` : '-'], ['ICD-10', form.icd10 || '-'],
                      ['สถานที่รักษา', form.treatment_place || '-'], ['ประเภทผู้ป่วย', form.patient_type || '-'],
                    ].map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', gap: 6 }}>
                        <span style={{ color: '#94a3b8', minWidth: 90 }}>{k}:</span>
                        <span style={{ color: '#334155', fontWeight: 500 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>)}
            </div>

            {/* ── Card Footer: Navigation ── */}
            <div style={{ padding: '16px 28px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button type="button" onClick={() => { setMsg(''); setStep(s => s - 1); window.scrollTo({ top: 0 }) }}
                disabled={step === 0}
                style={{ background: step === 0 ? 'transparent' : '#f1f5f9', color: '#475569', border: 'none', padding: '10px 20px', borderRadius: 10, fontSize: 14, cursor: step === 0 ? 'default' : 'pointer', opacity: step === 0 ? 0 : 1, fontWeight: 500 }}>
                ← ย้อนกลับ
              </button>
              {step < STEP_CONFIG.length - 1
                ? <button type="button" onClick={handleNext}
                    style={{ background: sc.color, color: '#fff', border: 'none', padding: '11px 28px', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: `0 3px 10px ${sc.color}40`, display: 'flex', alignItems: 'center', gap: 6 }}>
                    ถัดไป →
                  </button>
                : <button type="submit" disabled={saving}
                    style={{ background: saving ? '#93c5fd' : '#2563eb', color: '#fff', border: 'none', padding: '11px 32px', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', boxShadow: '0 3px 10px rgba(37,99,235,0.35)' }}>
                    {saving ? '⏳ กำลังบันทึก...' : '💾 บันทึกข้อมูล'}
                  </button>
              }
            </div>
          </div>
        </form>
      </div>

      {/* Toast */}
      {msg && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, padding: '13px 22px', borderRadius: 12, background: msg.includes('✅') ? '#f0fdf4' : '#fef2f2', color: msg.includes('✅') ? '#15803d' : '#b91c1c', fontSize: 13, fontWeight: 600, border: `1px solid ${msg.includes('✅') ? '#bbf7d0' : '#fecaca'}`, boxShadow: '0 6px 24px rgba(0,0,0,0.18)', maxWidth: 480, wordBreak: 'break-word', textAlign: 'center', cursor: 'pointer', whiteSpace: 'nowrap' }} onClick={() => setMsg('')}>
          {msg}
        </div>
      )}
    </div>
  )
}
