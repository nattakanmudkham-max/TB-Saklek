'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { FormInput, FormSelect, FormTextArea, FormDateThai, SearchableSelect } from '@/components/FormComponents'
import { THAI_HOSPITALS } from '@/data/thai_hospitals'
import { PROVINCES, DISTRICTS_BY_PROVINCE, SUBDISTRICTS_BY_DISTRICT } from '@/data/thai_geography'

interface LabResult {
  id: string; patient_id: string; lab_no: string; test_date: string
  test_reason: string; smear_1: string; smear_2: string; smear_3: string
  molecular: string; xpert: string; culture: string; dst: string; hospital: string
}
const DEFAULT_LAB = { lab_no: '', test_date: '', test_reason: '', smear_1: '', smear_2: '', smear_3: '', molecular: '', xpert: '', culture: '', dst: '', hospital: 'โรงพยาบาลสากเหล็ก' }

interface CxrResult {
  id: string; patient_id: string; test_date: string
  cxr_result: string; abnormal_result: string; xn: string; hospital: string
}
const DEFAULT_CXR = { test_date: '', cxr_result: '', abnormal_result: '', xn: '', hospital: 'โรงพยาบาลสากเหล็ก' }
const CXR_RESULTS = ['Normal', 'Abnormal', 'ไม่ได้เอกซเรย์']
const CXR_ABNORMAL = ['No Cavity', 'Cavity', 'Mild', 'Moderate', 'Far Advanced', 'Pleural effusion', 'อื่นๆ']

function toThaiBE(iso: string): string {
  if (!iso) return '-'
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return iso
  return `${d}/${m}/${parseInt(y) + 543}`
}

// ─── Columns that exist in tb_patients DB table ───────────────────────────────
const DB_COLS = new Set([
  'fiscal_year','tb_no','hn','registered_date','full_name','age','address',
  'icd10','xpert_result','is_ip','is_ep','detected_place','treatment_place',
  'treatment_start_date','patient_type','risk_group','result_m2','result_m3',
  'treatment_outcome','caregiver_name','phone','notes',
  'id_card','birth_date','province','district','subdistrict','village_no',
  'population_type','nationality','medical_right','cxr_date','sputum_lab_no','sputum_date',
  'hiv_tested','hiv_test_date','hiv_result',
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
  const [patientId, setPatientId] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  // Lab state
  const [labRows, setLabRows] = useState<LabResult[]>([])
  const [labModal, setLabModal] = useState(false)
  const [editingLabId, setEditingLabId] = useState<string | null>(null)
  const [labForm, setLabForm] = useState(DEFAULT_LAB)
  const [savingLab, setSavingLab] = useState(false)
  const [deletingLabId, setDeletingLabId] = useState<string | null>(null)

  // CXR state
  const [cxrRows, setCxrRows] = useState<CxrResult[]>([])
  const [cxrModal, setCxrModal] = useState(false)
  const [editingCxrId, setEditingCxrId] = useState<string | null>(null)
  const [cxrForm, setCxrForm] = useState(DEFAULT_CXR)
  const [savingCxr, setSavingCxr] = useState(false)
  const [deletingCxrId, setDeletingCxrId] = useState<string | null>(null)

  const [form, setForm] = useState({
    fiscal_year: '', tb_no: '', hn: '', registered_date: '',
    title: '', first_name: '', last_name: '', id_card: '', birth_date: '', age: '', age_months: '',
    population_type: '', nationality: '', medical_right: '',
    address: '', village_no: '', province: '', district: '', subdistrict: '',
    icd10: '', xpert_result: '', lung_type: '',
    hiv_tested: '', hiv_test_date: '', hiv_result: '',
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

  function buildPayload() {
    const full_name = [form.title, form.first_name, form.last_name].filter(Boolean).join(' ') || undefined
    const is_ip = form.lung_type === 'IP' || form.lung_type === 'IP/EP'
    const is_ep = form.lung_type === 'EP' || form.lung_type === 'IP/EP'
    const risk_group = form.risk_has === 'none' ? 'ไม่มี' : form.risk_group || undefined
    const address = form.address || undefined
    const payload: Record<string, unknown> = { full_name, is_ip, is_ep }
    if (risk_group !== undefined) payload.risk_group = risk_group
    if (address) payload.address = address
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
      hiv_tested: 'hiv_tested', hiv_test_date: 'hiv_test_date', hiv_result: 'hiv_result',
    }
    for (const [fk, dbk] of Object.entries(fieldMap)) {
      const v = form[fk as keyof typeof form]
      if (v) payload[dbk] = v
    }
    payload.fiscal_year = parseInt(form.fiscal_year)
    if (form.age) payload.age = parseInt(form.age)
    return payload
  }

  async function handleNext() {
    if (step === 0 && !form.fiscal_year) { setMsg('❌ กรุณาเลือกปีงบประมาณ'); return }
    if (step === 1 && !form.first_name.trim()) { setMsg('❌ กรุณากรอกชื่อผู้ป่วย'); return }
    // Auto-save before step 5 to enable CXR/Lab
    if (step === 3) {
      setSaving(true); setMsg('')
      const payload = buildPayload()
      let pid = patientId
      if (!pid) {
        const { data, error } = await supabase.from('tb_patients').insert(payload).select('id').single()
        if (error) { console.error(error); setMsg('❌ ' + error.message); setSaving(false); return }
        pid = data.id; setPatientId(pid)
      } else {
        const { error } = await supabase.from('tb_patients').update(payload).eq('id', pid)
        if (error) { console.error(error); setMsg('❌ ' + error.message); setSaving(false); return }
      }
      setSaving(false)
    }
    setMsg('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setStep(s => s + 1)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setMsg('')
    const payload = buildPayload()
    if (patientId) {
      const { error } = await supabase.from('tb_patients').update(payload).eq('id', patientId)
      setSaving(false)
      if (error) { console.error(error); setMsg('❌ ' + error.message); return }
      router.push(`/patients/${patientId}`)
    } else {
      const { data, error } = await supabase.from('tb_patients').insert(payload).select('id').single()
      setSaving(false)
      if (error) { console.error(error); setMsg('❌ ' + error.message); return }
      router.push(`/patients/${data.id}`)
    }
  }

  // Lab CRUD
  function openAddLab() { setEditingLabId(null); setLabForm(DEFAULT_LAB); setLabModal(true) }
  function openEditLab(row: LabResult) {
    setEditingLabId(row.id)
    setLabForm({ lab_no: row.lab_no || '', test_date: row.test_date || '', test_reason: row.test_reason || '', smear_1: row.smear_1 || '', smear_2: row.smear_2 || '', smear_3: row.smear_3 || '', molecular: row.molecular || '', xpert: row.xpert || '', culture: row.culture || '', dst: row.dst || '', hospital: row.hospital || 'โรงพยาบาลสากเหล็ก' })
    setLabModal(true)
  }
  async function saveLab() {
    if (!patientId) return
    setSavingLab(true)
    const payload = { patient_id: patientId, lab_no: labForm.lab_no || null, test_date: labForm.test_date || null, test_reason: labForm.test_reason || null, smear_1: labForm.smear_1 || null, smear_2: labForm.smear_2 || null, smear_3: labForm.smear_3 || null, molecular: labForm.molecular || null, xpert: labForm.xpert || null, culture: labForm.culture || null, dst: labForm.dst || null, hospital: labForm.hospital || null }
    if (editingLabId) {
      const { error } = await supabase.from('tb_lab_results').update(payload).eq('id', editingLabId)
      if (error) { setMsg('❌ ' + error.message); setSavingLab(false); return }
      setLabRows(prev => prev.map(r => r.id === editingLabId ? { ...r, ...labForm, id: editingLabId, patient_id: patientId } : r))
    } else {
      const { data, error } = await supabase.from('tb_lab_results').insert(payload).select().single()
      if (error) { setMsg('❌ ' + error.message); setSavingLab(false); return }
      if (data) setLabRows(prev => [data, ...prev])
    }
    setSavingLab(false); setLabModal(false)
  }
  async function deleteLab(id: string) {
    if (!confirm('ลบรายการนี้?')) return
    setDeletingLabId(id)
    await supabase.from('tb_lab_results').delete().eq('id', id)
    setLabRows(prev => prev.filter(r => r.id !== id)); setDeletingLabId(null)
  }

  // CXR CRUD
  function openAddCxr() { setEditingCxrId(null); setCxrForm(DEFAULT_CXR); setCxrModal(true) }
  function openEditCxr(row: CxrResult) {
    setEditingCxrId(row.id)
    setCxrForm({ test_date: row.test_date || '', cxr_result: row.cxr_result || '', abnormal_result: row.abnormal_result || '', xn: row.xn || '', hospital: row.hospital || 'โรงพยาบาลสากเหล็ก' })
    setCxrModal(true)
  }
  async function saveCxr() {
    if (!patientId) return
    setSavingCxr(true)
    const payload = { patient_id: patientId, test_date: cxrForm.test_date || null, cxr_result: cxrForm.cxr_result || null, abnormal_result: cxrForm.abnormal_result || null, xn: cxrForm.xn || null, hospital: cxrForm.hospital || null }
    if (editingCxrId) {
      const { error } = await supabase.from('tb_cxr_results').update(payload).eq('id', editingCxrId)
      if (error) { setMsg('❌ ' + error.message); setSavingCxr(false); return }
      setCxrRows(prev => prev.map(r => r.id === editingCxrId ? { ...r, ...cxrForm, id: editingCxrId, patient_id: patientId } : r))
    } else {
      const { data, error } = await supabase.from('tb_cxr_results').insert(payload).select().single()
      if (error) { setMsg('❌ ' + error.message); setSavingCxr(false); return }
      if (data) setCxrRows(prev => [data, ...prev])
    }
    setSavingCxr(false); setCxrModal(false)
  }
  async function deleteCxr(id: string) {
    if (!confirm('ลบรายการนี้?')) return
    setDeletingCxrId(id)
    await supabase.from('tb_cxr_results').delete().eq('id', id)
    setCxrRows(prev => prev.filter(r => r.id !== id)); setDeletingCxrId(null)
  }

  const sc = STEP_CONFIG[step]

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #f0f4ff 0%, #f8fafc 60%)' }}>

      {/* ── Top Header ── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '18px 32px', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button onClick={() => router.push('/patients')} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 12, padding: '9px 18px', fontSize: 14, fontWeight: 600, color: '#475569', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', transition: 'all 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#f8fafc'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#cbd5e1' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#fff'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#e2e8f0' }}>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5l-5 5 5 5"/></svg>
              กลับหน้าหลัก
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, background: '#fee2e2', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="28" height="28" viewBox="0 0 40 40" fill="none"><path d="M20 4 L20 14" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round"/><path d="M20 14 L13 19" stroke="#dc2626" strokeWidth="2" strokeLinecap="round"/><path d="M20 14 L27 19" stroke="#dc2626" strokeWidth="2" strokeLinecap="round"/><path d="M13 19 C6 19 4 23 4 27 C4 32 7.5 37 12 37 C14.5 37 16.5 35 16.5 32 L16.5 19 Z" fill="#fca5a5" stroke="#dc2626" strokeWidth="1.8" strokeLinejoin="round"/><path d="M27 19 C34 19 36 23 36 27 C36 32 32.5 37 28 37 C25.5 37 23.5 35 23.5 32 L23.5 19 Z" fill="#fca5a5" stroke="#dc2626" strokeWidth="1.8" strokeLinejoin="round"/></svg>
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', lineHeight: 1.3 }}>เพิ่มผู้ป่วยวัณโรค</div>
                {form.first_name && <div style={{ fontSize: 14, color: '#64748b' }}>{[form.title, form.first_name, form.last_name].filter(Boolean).join(' ')}</div>}
              </div>
            </div>
          </div>
          <div style={{ fontSize: 15, color: '#94a3b8', fontWeight: 600, background: '#f8fafc', padding: '6px 16px', borderRadius: 20, border: '1px solid #e2e8f0' }}>
            {step + 1} / {STEP_CONFIG.length}
          </div>
        </div>
      </div>

      {/* ── Step Progress ── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #f1f5f9', padding: '20px 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            {STEP_CONFIG.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', flex: i < STEP_CONFIG.length - 1 ? 1 : 'none' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
                  <button type="button" onClick={() => i < step && setStep(i)}
                    style={{ width: 48, height: 48, borderRadius: '50%', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, cursor: i < step ? 'pointer' : 'default', flexShrink: 0, transition: 'all 0.2s', background: i < step ? '#22c55e' : i === step ? s.color : '#e2e8f0', color: i <= step ? '#fff' : '#94a3b8', boxShadow: i === step ? `0 0 0 4px ${s.color}30` : 'none' }}>
                    {i < step ? '✓' : s.icon}
                  </button>
                  <span style={{ fontSize: 12, color: i === step ? s.color : i < step ? '#22c55e' : '#94a3b8', fontWeight: i === step ? 700 : 400, whiteSpace: 'nowrap', textAlign: 'center', maxWidth: 90 }}>{s.title}</span>
                </div>
                {i < STEP_CONFIG.length - 1 && (
                  <div style={{ flex: 1, height: 4, background: i < step ? '#22c55e' : '#e2e8f0', margin: '22px 6px 0', borderRadius: 2, minWidth: 10, transition: 'background 0.3s' }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Card ── */}
      <div style={{ padding: '28px 24px 80px', maxWidth: 1200, margin: '0 auto' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ background: '#fff', borderRadius: 24, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>

            {/* Card Header */}
            <div style={{ background: sc.bg, borderBottom: `2px solid ${sc.border}`, padding: '28px 40px', display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ width: 70, height: 70, borderRadius: 20, background: sc.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, flexShrink: 0, boxShadow: `0 4px 12px ${sc.color}40` }}>
                {sc.icon}
              </div>
              <div>
                <div style={{ fontSize: 14, color: sc.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 4 }}>ขั้นตอนที่ {step + 1} จาก {STEP_CONFIG.length}</div>
                <div style={{ fontSize: 30, fontWeight: 800, color: '#0f172a', letterSpacing: -0.5 }}>{sc.title}</div>
              </div>
            </div>

            {/* Card Content */}
            <div style={{ padding: '36px 40px' }}>

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

                  {/* HIV */}
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#be185d' }}>ผลการตรวจ HIV</div>
                    </div>
                    <div className="grid grid-cols-3 gap-5">
                      <FormSelect label="ได้รับการตรวจ HIV" options={['ได้รับการตรวจ','ไม่ได้รับการตรวจ','ปฏิเสธการตรวจ'].map(v=>({value:v,label:v}))} value={form.hiv_tested} onChange={e => set('hiv_tested', e.target.value)} />
                      <FormDateThai label="วันที่ตรวจ HIV (พ.ศ.)" value={form.hiv_test_date} onChange={v => set('hiv_test_date', v)} />
                      <FormSelect label="ผลการตรวจ HIV" options={['Positive','Negative','Indeterminate'].map(v=>({value:v,label:v}))} value={form.hiv_result} onChange={e => set('hiv_result', e.target.value)} />
                    </div>
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
                {/* ─── CXR Sub-section ─── */}
                <div style={{ marginBottom: 28 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%)', border: '1px solid #bfdbfe', borderRadius: 12, padding: '12px 18px', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 38, height: 38, background: '#dbeafe', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="3" width="20" height="18" rx="2"/>
                          <path d="M7 8h2M7 12h2M7 16h2M13 8h4M13 12h4M13 16h4"/>
                        </svg>
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#1e40af', letterSpacing: 0.2 }}>ผล X-Ray (CXR)</div>
                        <div style={{ fontSize: 11, color: '#93c5fd', marginTop: 1 }}>{cxrRows.length} รายการ</div>
                      </div>
                    </div>
                    <button type="button" onClick={openAddCxr} style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 2px 8px rgba(37,99,235,0.35)' }}>
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/></svg>
                      เพิ่มรายการ CXR
                    </button>
                  </div>
                  <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 620 }}>
                      <thead>
                        <tr style={{ background: 'linear-gradient(90deg, #1e3a5f, #1e40af)', color: '#fff' }}>
                          {['แก้ไข','#','วันที่ตรวจ','ผล CXR','ผล Abnormal','XN','หน่วยงาน','ลบ'].map(h => (
                            <th key={h} style={{ padding: '11px 12px', whiteSpace: 'nowrap', textAlign: 'center', fontWeight: 600, fontSize: 11, letterSpacing: 0.5 }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {cxrRows.length === 0 ? (
                          <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px 24px', color: '#94a3b8' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="18" rx="2"/><path d="M9 12h6M12 9v6"/></svg>
                              <span style={{ fontSize: 13 }}>ยังไม่มีข้อมูล CXR</span>
                            </div>
                          </td></tr>
                        ) : cxrRows.map((row, i) => (
                          <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#f8fafc', opacity: deletingCxrId === row.id ? 0.5 : 1 }}>
                            <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                              <button type="button" onClick={() => openEditCxr(row)} style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 7, padding: '5px 9px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11.5 2.5l2 2L5 13H3v-2L11.5 2.5z"/></svg>
                              </button>
                            </td>
                            <td style={{ padding: '8px 10px', textAlign: 'center', color: '#94a3b8', fontWeight: 700, fontSize: 12 }}>{i + 1}</td>
                            <td style={{ padding: '8px 10px', textAlign: 'center', whiteSpace: 'nowrap', color: '#334155', fontWeight: 500 }}>{toThaiBE(row.test_date)}</td>
                            <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                              {row.cxr_result ? (
                                <span style={{ background: row.cxr_result === 'Abnormal' ? '#fef2f2' : row.cxr_result === 'Normal' ? '#f0fdf4' : '#f8fafc', color: row.cxr_result === 'Abnormal' ? '#dc2626' : row.cxr_result === 'Normal' ? '#16a34a' : '#475569', border: `1px solid ${row.cxr_result === 'Abnormal' ? '#fca5a5' : row.cxr_result === 'Normal' ? '#86efac' : '#e2e8f0'}`, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: 0.3 }}>{row.cxr_result}</span>
                              ) : '-'}
                            </td>
                            <td style={{ padding: '8px 10px', textAlign: 'center', color: '#475569', fontSize: 12 }}>{row.abnormal_result || '-'}</td>
                            <td style={{ padding: '8px 10px', textAlign: 'center', color: '#475569', fontSize: 12 }}>{row.xn || '-'}</td>
                            <td style={{ padding: '8px 12px', whiteSpace: 'nowrap', color: '#334155', fontSize: 12 }}>{row.hospital || '-'}</td>
                            <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                              <button type="button" onClick={() => deleteCxr(row.id)} disabled={deletingCxrId === row.id} style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 7, padding: '5px 9px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="#dc2626" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4h12M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1M6 7v5M10 7v5M3 4l1 9a1 1 0 001 1h6a1 1 0 001-1l1-9"/></svg>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* ─── Lab Sub-section ─── */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)', border: '1px solid #86efac', borderRadius: 12, padding: '12px 18px', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 38, height: 38, background: '#dcfce7', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M8 3h8l1 5H7L8 3z"/>
                          <path d="M7 8l-3 9a2 2 0 002 2h10a2 2 0 002-2l-3-9"/>
                          <circle cx="12" cy="16" r="1.5" fill="#16a34a" stroke="none"/>
                        </svg>
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#15803d', letterSpacing: 0.2 }}>ผล Laboratory</div>
                        <div style={{ fontSize: 11, color: '#4ade80', marginTop: 1 }}>{labRows.length} รายการ</div>
                      </div>
                    </div>
                    <button type="button" onClick={openAddLab} style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 2px 8px rgba(22,163,74,0.35)' }}>
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/></svg>
                      เพิ่มรายการ LAB
                    </button>
                  </div>
                  <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 16 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 860 }}>
                      <thead>
                        <tr style={{ background: 'linear-gradient(90deg, #1e3a5f, #1e40af)', color: '#fff' }}>
                          <th style={{ padding: '11px 12px', whiteSpace: 'nowrap', textAlign: 'center', fontWeight: 600, fontSize: 11, letterSpacing: 0.5 }}>แก้ไข</th>
                          <th style={{ padding: '11px 12px', whiteSpace: 'nowrap', textAlign: 'center', fontWeight: 600, fontSize: 11, letterSpacing: 0.5 }}>#</th>
                          <th style={{ padding: '11px 12px', whiteSpace: 'nowrap', textAlign: 'center', fontWeight: 600, fontSize: 11, letterSpacing: 0.5 }}>Lab No.</th>
                          <th style={{ padding: '11px 12px', whiteSpace: 'nowrap', textAlign: 'center', fontWeight: 600, fontSize: 11, letterSpacing: 0.5 }}>วันที่ตรวจ</th>
                          <th style={{ padding: '11px 12px', whiteSpace: 'nowrap', textAlign: 'center', fontWeight: 600, fontSize: 11, letterSpacing: 0.5 }}>สาเหตุการตรวจ</th>
                          <th colSpan={5} style={{ padding: '11px 12px', textAlign: 'center', borderLeft: '1px solid #2d5a8e', fontWeight: 600, fontSize: 11, letterSpacing: 0.5 }}>Lab Result</th>
                          <th style={{ padding: '11px 12px', whiteSpace: 'nowrap', textAlign: 'center', borderLeft: '1px solid #2d5a8e', fontWeight: 600, fontSize: 11, letterSpacing: 0.5 }}>ร.พ.ส่งตรวจ</th>
                          <th style={{ padding: '11px 12px', textAlign: 'center', fontWeight: 600, fontSize: 11, letterSpacing: 0.5 }}>ลบ</th>
                        </tr>
                        <tr style={{ background: '#2d5a8e', color: '#bfdbfe' }}>
                          <th colSpan={5} />
                          {['Smear','Molecular','Xpert MTB/RIF','Culture','DST'].map(h => (
                            <th key={h} style={{ padding: '7px 10px', whiteSpace: 'nowrap', fontSize: 10, fontWeight: 600, textAlign: 'center', letterSpacing: 0.5 }}>{h}</th>
                          ))}
                          <th colSpan={2} />
                        </tr>
                      </thead>
                      <tbody>
                        {labRows.length === 0 ? (
                          <tr><td colSpan={12} style={{ textAlign: 'center', padding: '40px 24px', color: '#94a3b8' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3h8l1 5H7L8 3z"/><path d="M7 8l-3 9a2 2 0 002 2h10a2 2 0 002-2l-3-9"/></svg>
                              <span style={{ fontSize: 13 }}>ยังไม่มีข้อมูล Lab</span>
                            </div>
                          </td></tr>
                        ) : labRows.map((row, i) => (
                          <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#f8fafc', opacity: deletingLabId === row.id ? 0.5 : 1 }}>
                            <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                              <button type="button" onClick={() => openEditLab(row)} style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 7, padding: '5px 9px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11.5 2.5l2 2L5 13H3v-2L11.5 2.5z"/></svg>
                              </button>
                            </td>
                            <td style={{ padding: '8px 10px', textAlign: 'center', color: '#94a3b8', fontWeight: 700, fontSize: 12 }}>{i + 1}</td>
                            <td style={{ padding: '8px 10px', textAlign: 'center', fontFamily: 'monospace', color: '#334155', fontWeight: 600 }}>{row.lab_no || '-'}</td>
                            <td style={{ padding: '8px 10px', textAlign: 'center', whiteSpace: 'nowrap', color: '#334155', fontWeight: 500 }}>{toThaiBE(row.test_date)}</td>
                            <td style={{ padding: '8px 10px', whiteSpace: 'nowrap', color: '#334155', fontWeight: 500 }}>{row.test_reason || '-'}</td>
                            <td style={{ padding: '8px 10px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                              {[row.smear_1, row.smear_2, row.smear_3].map((s, j) => (
                                <span key={j}>
                                  {j > 0 && <span style={{ color: '#e2e8f0' }}> | </span>}
                                  <span style={{ color: s && s !== 'ไม่ได้ส่ง' && s !== '-' ? (s === 'Neg' ? '#16a34a' : '#dc2626') : '#94a3b8', fontWeight: s && s !== 'ไม่ได้ส่ง' && s !== '-' && s !== 'Neg' ? 700 : 400 }}>{s || '-'}</span>
                                </span>
                              ))}
                            </td>
                            <td style={{ padding: '8px 10px', textAlign: 'center', color: '#475569' }}>{row.molecular || '-'}</td>
                            <td style={{ padding: '8px 10px', textAlign: 'center', whiteSpace: 'nowrap', color: row.xpert?.toLowerCase().includes('detected') ? '#dc2626' : '#475569', fontWeight: row.xpert?.toLowerCase().includes('detected') ? 700 : 400 }}>{row.xpert || '-'}</td>
                            <td style={{ padding: '8px 10px', textAlign: 'center', color: '#475569' }}>{row.culture || '-'}</td>
                            <td style={{ padding: '8px 10px', textAlign: 'center', color: '#475569' }}>{row.dst || '-'}</td>
                            <td style={{ padding: '8px 12px', whiteSpace: 'nowrap', color: '#334155', fontSize: 12 }}>{row.hospital || '-'}</td>
                            <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                              <button type="button" onClick={() => deleteLab(row.id)} disabled={deletingLabId === row.id} style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 7, padding: '5px 9px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="#dc2626" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4h12M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1M6 7v5M10 7v5M3 4l1 9a1 1 0 001 1h6a1 1 0 001-1l1-9"/></svg>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
            <div style={{ padding: '22px 40px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button type="button" onClick={() => { setMsg(''); setStep(s => s - 1); window.scrollTo({ top: 0 }) }}
                disabled={step === 0 || saving}
                style={{ background: step === 0 ? 'transparent' : '#f1f5f9', color: '#475569', border: 'none', padding: '13px 26px', borderRadius: 12, fontSize: 16, cursor: (step === 0 || saving) ? 'default' : 'pointer', opacity: step === 0 ? 0 : 1, fontWeight: 500 }}>
                ← ย้อนกลับ
              </button>
              {saved && step === STEP_CONFIG.length - 1
                ? <div style={{ display: 'flex', gap: 12 }}>
                    <button type="button" onClick={() => router.push('/patients')}
                      style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', padding: '13px 28px', borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>
                      📋 กลับหน้าหลัก
                    </button>
                    <button type="submit" disabled={saving}
                      style={{ background: saving ? '#93c5fd' : '#2563eb', color: '#fff', border: 'none', padding: '13px 38px', borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', boxShadow: '0 3px 10px rgba(37,99,235,0.35)' }}>
                      {saving ? '⏳ กำลังบันทึก...' : '💾 บันทึก'}
                    </button>
                  </div>
                : step < STEP_CONFIG.length - 1
                ? <button type="button" onClick={handleNext} disabled={saving}
                    style={{ background: saving ? '#93c5fd' : sc.color, color: '#fff', border: 'none', padding: '13px 36px', borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', boxShadow: `0 3px 10px ${sc.color}40`, display: 'flex', alignItems: 'center', gap: 8 }}>
                    {saving ? '⏳ กำลังบันทึก...' : 'ถัดไป →'}
                  </button>
                : <button type="submit" disabled={saving}
                    style={{ background: saving ? '#93c5fd' : '#2563eb', color: '#fff', border: 'none', padding: '13px 42px', borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', boxShadow: '0 3px 10px rgba(37,99,235,0.35)' }}>
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

      {/* CXR Modal */}
      {cxrModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 520, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
              {editingCxrId ? '✏️ แก้ไขรายการ CXR' : '+ เพิ่มรายการ CXR'}
            </h3>
            <div className="grid grid-cols-2 gap-4" style={{ marginBottom: 14 }}>
              <FormDateThai label="วันที่ตรวจ (พ.ศ.)" value={cxrForm.test_date} onChange={v => setCxrForm(p => ({ ...p, test_date: v }))} />
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">ผล CXR</label>
                <select value={cxrForm.cxr_result} onChange={e => setCxrForm(p => ({ ...p, cxr_result: e.target.value, abnormal_result: e.target.value !== 'Abnormal' ? '' : p.abnormal_result }))}
                  style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 10px', fontSize: 13, background: '#fff', outline: 'none' }}>
                  <option value="">-- เลือก --</option>
                  {CXR_RESULTS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>
            {cxrForm.cxr_result === 'Abnormal' && (
              <div style={{ marginBottom: 14 }}>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">ผล Abnormal</label>
                <select value={cxrForm.abnormal_result} onChange={e => setCxrForm(p => ({ ...p, abnormal_result: e.target.value }))}
                  style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 10px', fontSize: 13, background: '#fff', outline: 'none' }}>
                  <option value="">-- เลือก --</option>
                  {CXR_ABNORMAL.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4" style={{ marginBottom: 14 }}>
              <FormInput label="XN" value={cxrForm.xn} onChange={e => setCxrForm(p => ({ ...p, xn: e.target.value }))} placeholder="-" />
            </div>
            <div style={{ marginBottom: 20 }}>
              <SearchableSelect label="หน่วยงาน" options={THAI_HOSPITALS} value={cxrForm.hospital} onChange={v => setCxrForm(p => ({ ...p, hospital: v }))} />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setCxrModal(false)} style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>ยกเลิก</button>
              <button type="button" onClick={saveCxr} disabled={savingCxr} style={{ background: savingCxr ? '#93c5fd' : '#2563eb', color: '#fff', border: 'none', padding: '10px 22px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                {savingCxr ? '⏳ กำลังบันทึก...' : '💾 บันทึก'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lab Modal */}
      {labModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 660, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
              {editingLabId ? '✏️ แก้ไขรายการ LAB' : '+ เพิ่มรายการ LAB'}
            </h3>
            <div className="grid grid-cols-3 gap-4" style={{ marginBottom: 14 }}>
              <FormInput label="Lab No." value={labForm.lab_no} onChange={e => setLabForm(p => ({ ...p, lab_no: e.target.value }))} />
              <FormDateThai label="วันที่ตรวจ (พ.ศ.)" value={labForm.test_date} onChange={v => setLabForm(p => ({ ...p, test_date: v }))} />
              <FormSelect label="สาเหตุการตรวจ" value={labForm.test_reason} onChange={e => setLabForm(p => ({ ...p, test_reason: e.target.value }))} options={[
                { value: 'วินิจฉัยTB', label: 'วินิจฉัยTB' },
                ...Array.from({ length: 12 }, (_, i) => ({ value: `TB F/U เดือน ${String(i + 1).padStart(2, '0')}`, label: `TB F/U เดือน ${i + 1}` }))
              ]} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Smear (ครั้งที่ 1, 2, 3)</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {(['smear_1', 'smear_2', 'smear_3'] as const).map((k, i) => (
                  <select key={k} value={labForm[k]} onChange={e => setLabForm(p => ({ ...p, [k]: e.target.value }))}
                    style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 10px', fontSize: 13, background: '#fff', outline: 'none' }}>
                    <option value="">- ครั้งที่ {i + 1} -</option>
                    {['Neg', 'Pos', '1+', '2+', '3+', 'ไม่ได้ส่ง'].map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4" style={{ marginBottom: 14 }}>
              <FormInput label="Molecular" value={labForm.molecular} onChange={e => setLabForm(p => ({ ...p, molecular: e.target.value }))} placeholder="-" />
              <FormInput label="Xpert MTB/RIF" value={labForm.xpert} onChange={e => setLabForm(p => ({ ...p, xpert: e.target.value }))} placeholder="เช่น MTB detected, Neg" />
            </div>
            <div className="grid grid-cols-2 gap-4" style={{ marginBottom: 14 }}>
              <FormInput label="Culture" value={labForm.culture} onChange={e => setLabForm(p => ({ ...p, culture: e.target.value }))} placeholder="-" />
              <FormInput label="DST" value={labForm.dst} onChange={e => setLabForm(p => ({ ...p, dst: e.target.value }))} placeholder="-" />
            </div>
            <div style={{ marginBottom: 20 }}>
              <SearchableSelect label="ร.พ.ส่งตรวจ" options={THAI_HOSPITALS} value={labForm.hospital} onChange={v => setLabForm(p => ({ ...p, hospital: v }))} />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setLabModal(false)} style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>ยกเลิก</button>
              <button type="button" onClick={saveLab} disabled={savingLab} style={{ background: savingLab ? '#93c5fd' : '#2563eb', color: '#fff', border: 'none', padding: '10px 22px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                {savingLab ? '⏳ กำลังบันทึก...' : '💾 บันทึก'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
