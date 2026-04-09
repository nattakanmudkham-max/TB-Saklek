'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { FormInput, FormSelect, FormTextArea, FormDateThai, SearchableSelect } from '@/components/FormComponents'
import { THAI_HOSPITALS } from '@/data/thai_hospitals'
import { PROVINCES, DISTRICTS_BY_PROVINCE, SUBDISTRICTS_BY_DISTRICT } from '@/data/thai_geography'

interface LabResult {
  id: string; patient_id: string; lab_no: string; test_date: string
  test_reason: string; smear_1: string; smear_2: string; smear_3: string
  molecular: string; xpert: string; culture: string; dst: string; hospital: string
}
const DEFAULT_LAB = {
  lab_no: '', test_date: '', test_reason: '',
  smear_1: '', smear_2: '', smear_3: '',
  molecular: '', xpert: '', culture: '', dst: '',
  hospital: 'โรงพยาบาลสากเหล็ก',
}

interface CxrResult {
  id: string; patient_id: string; test_date: string
  cxr_result: string; abnormal_result: string; xn: string; hospital: string
}
const DEFAULT_CXR = {
  test_date: '', cxr_result: '', abnormal_result: '', xn: '',
  hospital: 'โรงพยาบาลสากเหล็ก',
}
const CXR_RESULTS = ['Normal', 'Abnormal', 'ไม่ได้เอกซเรย์']
const CXR_ABNORMAL = ['No Cavity', 'Cavity', 'Mild', 'Moderate', 'Far Advanced', 'Pleural effusion', 'อื่นๆ']

function toThaiBE(iso: string): string {
  if (!iso) return '-'
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return iso
  return `${d}/${m}/${parseInt(y) + 543}`
}

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
const TITLES = ['นาย','นาง','นางสาว','เด็กชาย','เด็กหญิง'].map(v => ({ value: v, label: v }))
const MEDICAL_RIGHTS = ['สวัสดิการข้าราชการ','ประกันสังคม','บัตรทอง/30 บาท','ชำระเอง','อื่นๆ'].map(v => ({ value: v, label: v }))
const NATIONALITIES = ['ไทย','พม่า','ลาว','กัมพูชา','เวียดนาม','จีน','อื่นๆ'].map(v => ({ value: v, label: v }))
const POPULATIONS = ['ไทย','ต่างด้าว','แรงงานต่างชาติ'].map(v => ({ value: v, label: v }))
const STEPS = ['ข้อมูลทะเบียน','ข้อมูลผู้ป่วย','การวินิจฉัยและตรวจ','การรักษา','ผลระหว่างการรักษา','ผู้ดูแลและติดต่อ']

// แยกชื่อเต็มเป็น คำนำหน้า ชื่อ นามสกุล
function parseName(full: string) {
  const TITLES = ['นางสาว', 'น.ส.', 'เด็กชาย', 'เด็กหญิง', 'ด.ช.', 'ด.ญ.', 'นาง', 'นาย']
  let title = '', rest = full.trim()
  for (const t of TITLES) {
    if (rest.startsWith(t)) {
      title = t
      rest = rest.slice(t.length).trim()
      break
    }
  }
  const parts = rest.split(/\s+/).filter(Boolean)
  return { title, first_name: parts[0] ?? '', last_name: parts.slice(1).join(' ') }
}

// แยกที่อยู่เป็นส่วนประกอบ
function parseAddress(addr: string, provinces: string[]) {
  if (!addr) return { address: '', village_no: '', subdistrict: '', district: '', province: '' }
  let rest = addr.trim()
  let village_no = '', subdistrict = '', district = '', province = ''

  // หมู่ XX
  const muMatch = rest.match(/หมู่\s*(\d+)/)
  if (muMatch) { village_no = muMatch[1]; rest = rest.replace(muMatch[0], '').trim() }

  // ต.XXX หรือ ตำบลXXX
  const subMatch = rest.match(/(?:ต\.|ตำบล\s*)(\S+)/)
  if (subMatch) { subdistrict = subMatch[1]; rest = rest.replace(subMatch[0], '').trim() }

  // อ.XXX หรือ อำเภอXXX
  const distMatch = rest.match(/(?:อ\.|อำเภอ\s*)(\S+)/)
  if (distMatch) { district = distMatch[1]; rest = rest.replace(distMatch[0], '').trim() }

  // จ.XXX หรือ จังหวัดXXX
  const provMatch = rest.match(/(?:จ\.|จังหวัด\s*)(\S+)/)
  if (provMatch) { province = provMatch[1]; rest = rest.replace(provMatch[0], '').trim() }

  // ถ้ายังไม่เจอจังหวัด ลองจับจากคำสุดท้าย (รูปแบบ new page: "ที่อยู่ หมู่X ตำบล อำเภอ จังหวัด")
  if (!province) {
    const words = rest.split(/\s+/)
    for (let i = words.length - 1; i >= 0; i--) {
      if (provinces.includes(words[i])) {
        province = words[i]
        words.splice(i, 1)
        rest = words.join(' ')
        break
      }
    }
  }

  return { address: rest.trim(), village_no, subdistrict, district, province }
}

function calcAge(iso: string) {
  if (!iso) return { years: 0, months: 0 }
  const b = new Date(iso), t = new Date()
  let y = t.getFullYear() - b.getFullYear()
  let m = t.getMonth() - b.getMonth()
  if (m < 0) { y--; m += 12 }
  if (t.getDate() < b.getDate() && m > 0) m--
  return { years: y, months: m }
}

function SectionHeader({ num, title, color, border, textColor }: { num: number; title: string; color: string; border: string; textColor: string }) {
  return (
    <div style={{ background: color, borderBottom: `2px solid ${border}`, padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', background: textColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>{num}</div>
      <span style={{ fontSize: 16, fontWeight: 700, color: textColor }}>{title}</span>
    </div>
  )
}

function deriveLung(is_ip: boolean, is_ep: boolean) {
  if (is_ip && is_ep) return 'IP/EP'
  if (is_ip) return 'IP'
  if (is_ep) return 'EP'
  return ''
}

export default function EditPatientPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [msg, setMsg] = useState('')
  const [activeStep, setActiveStep] = useState(0)
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([])

  // Lab results state
  const [labRows, setLabRows] = useState<LabResult[]>([])
  const [labModal, setLabModal] = useState(false)
  const [editingLabId, setEditingLabId] = useState<string | null>(null)
  const [labForm, setLabForm] = useState(DEFAULT_LAB)
  const [savingLab, setSavingLab] = useState(false)
  const [deletingLabId, setDeletingLabId] = useState<string | null>(null)

  // CXR results state
  const [cxrRows, setCxrRows] = useState<CxrResult[]>([])
  const [cxrModal, setCxrModal] = useState(false)
  const [editingCxrId, setEditingCxrId] = useState<string | null>(null)
  const [cxrForm, setCxrForm] = useState(DEFAULT_CXR)
  const [savingCxr, setSavingCxr] = useState(false)
  const [deletingCxrId, setDeletingCxrId] = useState<string | null>(null)

  const [form, setForm] = useState({
    fiscal_year: '2568', tb_no: '', hn: '', registered_date: '',
    title: '', first_name: '', last_name: '', id_card: '', birth_date: '', age: '', age_months: '',
    population_type: '', nationality: '', medical_right: '',
    address: '', village_no: '', province: '', district: '', subdistrict: '',
    icd10: '', xpert_result: '', lung_type: '',
    detected_place: '', treatment_place: '', treatment_start_date: '', patient_type: '',
    risk_has: '', risk_group: '',
    cxr_result: '', cxr_date: '', sputum_result: '', sputum_lab_no: '', sputum_date: '',
    treatment_outcome: '', caregiver_name: '', phone: '', notes: '',
  })

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          const i = sectionRefs.current.findIndex(r => r === e.target)
          if (i >= 0) setActiveStep(i)
        }
      }), { threshold: 0.25 }
    )
    sectionRefs.current.forEach(r => r && obs.observe(r))
    return () => obs.disconnect()
  }, [loading])

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('tb_patients').select('*').eq('id', params.id).single()
      if (data) {
        const riskVal = data.risk_group ?? ''
        const birthIso = data.birth_date ?? ''
        const { years, months } = calcAge(birthIso)
        // แยกชื่อ
        const nameData = data.first_name
          ? { title: data.title ?? '', first_name: data.first_name, last_name: data.last_name ?? '' }
          : parseName(data.full_name ?? '')
        // แยกที่อยู่
        let addrData: { address: string; village_no: string; subdistrict: string; district: string; province: string }
        if (data.province || data.district || data.subdistrict) {
          // มี column แยกแล้ว — ตัดข้อมูลภูมิศาสตร์ออกจาก address ให้เหลือแค่บ้านเลขที่
          let pureAddr = data.address ?? ''
          const vn = data.village_no ?? ''
          if (vn) pureAddr = pureAddr.replace(new RegExp(`หมู่\\s*0*${vn}\\b`), '').trim()
          if (data.subdistrict) pureAddr = pureAddr.replace(data.subdistrict, '').trim()
          if (data.district) pureAddr = pureAddr.replace(data.district, '').trim()
          if (data.province) pureAddr = pureAddr.replace(data.province, '').trim()
          pureAddr = pureAddr.replace(/หมู่\s*\d+/, '').trim()
          addrData = { address: pureAddr, village_no: vn, subdistrict: data.subdistrict ?? '', district: data.district ?? '', province: data.province ?? '' }
        } else {
          addrData = parseAddress(data.address ?? '', PROVINCES)
        }
        setForm({
          fiscal_year: String(data.fiscal_year ?? '2568'),
          tb_no: data.tb_no ?? '',
          hn: data.hn ? String(data.hn).padStart(9, '0') : '',
          registered_date: data.registered_date ?? '',
          title: nameData.title,
          first_name: nameData.first_name,
          last_name: nameData.last_name,
          id_card: data.id_card ?? '',
          birth_date: data.birth_date ?? birthIso,
          age: (data.birth_date || birthIso) ? String(years) : String(data.age ?? ''),
          age_months: (data.birth_date || birthIso) ? String(months) : '',
          population_type: data.population_type ?? '',
          nationality: data.nationality ?? '',
          medical_right: data.medical_right ?? '',
          address: addrData.address,
          village_no: addrData.village_no,
          province: addrData.province,
          district: addrData.district,
          subdistrict: addrData.subdistrict,
          icd10: data.icd10 ?? '',
          xpert_result: data.xpert_result ?? '',
          lung_type: deriveLung(!!data.is_ip, !!data.is_ep),
          detected_place: data.detected_place ?? '',
          treatment_place: data.treatment_place ?? '',
          treatment_start_date: data.treatment_start_date ?? '',
          patient_type: data.patient_type ?? '',
          risk_has: riskVal === 'ไม่มี' ? 'none' : riskVal ? 'yes' : '',
          risk_group: riskVal === 'ไม่มี' ? '' : riskVal,
          cxr_result: data.result_m2 ?? '',
          cxr_date: data.cxr_date ?? '',
          sputum_result: data.result_m3 ?? '',
          sputum_lab_no: data.sputum_lab_no ?? '',
          sputum_date: data.sputum_date ?? '',
          treatment_outcome: data.treatment_outcome ?? '',
          caregiver_name: data.caregiver_name ?? '',
          phone: data.phone ?? '',
          notes: data.notes ?? '',
        })
      }
      // Fetch lab results
      const { data: labs } = await supabase.from('tb_lab_results')
        .select('*').eq('patient_id', params.id).order('test_date', { ascending: false })
      setLabRows(labs || [])

      // Fetch CXR results
      const { data: cxrs } = await supabase.from('tb_cxr_results')
        .select('*').eq('patient_id', params.id).order('test_date', { ascending: false })
      setCxrRows(cxrs || [])

      setLoading(false)
    }
    load()
  }, [params.id])

  function set(field: string, value: string) { setForm(prev => ({ ...prev, [field]: value })) }

  function handleBirthDate(iso: string) {
    const { years, months } = calcAge(iso)
    setForm(prev => ({ ...prev, birth_date: iso, age: String(years), age_months: String(months) }))
  }

  const districts = DISTRICTS_BY_PROVINCE[form.province] ?? []
  const subdistricts = SUBDISTRICTS_BY_DISTRICT[form.district] ?? []

  function goTo(i: number) { sectionRefs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setMsg('')

    const full_name = [form.title, form.first_name, form.last_name].filter(Boolean).join(' ') || undefined
    const is_ip = form.lung_type === 'IP' || form.lung_type === 'IP/EP'
    const is_ep = form.lung_type === 'EP' || form.lung_type === 'IP/EP'
    const risk_group = form.risk_has === 'none' ? 'ไม่มี' : form.risk_group || null
    const address = form.address || null

    const payload: Record<string, unknown> = {
      full_name, is_ip, is_ep,
      fiscal_year: parseInt(form.fiscal_year),
    }
    if (risk_group !== undefined && risk_group !== null) payload.risk_group = risk_group
    if (address) payload.address = address
    if (form.cxr_result) payload.result_m2 = form.cxr_result
    if (form.sputum_result) payload.result_m3 = form.sputum_result

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
      cxr_date: 'cxr_date', sputum_lab_no: 'sputum_lab_no', sputum_date: 'sputum_date',
      phone: 'phone', notes: 'notes',
    }
    for (const [fk, dbk] of Object.entries(fieldMap)) {
      const v = form[fk as keyof typeof form]
      if (v) payload[dbk] = v
    }
    if (form.age) payload.age = parseInt(form.age)

    const { error } = await supabase.from('tb_patients').update(payload).eq('id', params.id)
    setSaving(false)
    if (error) { console.error('UPDATE error:', error); setMsg('❌ ' + error.message) }
    else { setMsg('✅ บันทึกสำเร็จ'); setTimeout(() => router.push('/patients'), 1200) }
  }

  async function handleDelete() {
    if (!confirm('ยืนยันการลบข้อมูลผู้ป่วยรายนี้?')) return
    setDeleting(true)
    await supabase.from('tb_patients').delete().eq('id', params.id)
    router.push('/patients')
  }

  function openAddLab() { setEditingLabId(null); setLabForm(DEFAULT_LAB); setLabModal(true) }
  function openEditLab(row: LabResult) {
    setEditingLabId(row.id)
    setLabForm({ lab_no: row.lab_no || '', test_date: row.test_date || '', test_reason: row.test_reason || '', smear_1: row.smear_1 || '', smear_2: row.smear_2 || '', smear_3: row.smear_3 || '', molecular: row.molecular || '', xpert: row.xpert || '', culture: row.culture || '', dst: row.dst || '', hospital: row.hospital || 'โรงพยาบาลสากเหล็ก' })
    setLabModal(true)
  }
  async function saveLab() {
    setSavingLab(true)
    const payload = { patient_id: params.id, lab_no: labForm.lab_no || null, test_date: labForm.test_date || null, test_reason: labForm.test_reason || null, smear_1: labForm.smear_1 || null, smear_2: labForm.smear_2 || null, smear_3: labForm.smear_3 || null, molecular: labForm.molecular || null, xpert: labForm.xpert || null, culture: labForm.culture || null, dst: labForm.dst || null, hospital: labForm.hospital || null }
    if (editingLabId) {
      const { error } = await supabase.from('tb_lab_results').update(payload).eq('id', editingLabId)
      if (error) { console.error('Lab update error:', error); setMsg('❌ ' + error.message); setSavingLab(false); return }
      setLabRows(prev => prev.map(r => r.id === editingLabId ? { ...r, ...labForm, id: editingLabId, patient_id: params.id } : r))
    } else {
      const { data, error } = await supabase.from('tb_lab_results').insert(payload).select().single()
      if (error) { console.error('Lab insert error:', error); setMsg('❌ ' + error.message); setSavingLab(false); return }
      if (data) setLabRows(prev => [data, ...prev])
    }
    setSavingLab(false); setLabModal(false)
  }
  async function deleteLab(id: string) {
    if (!confirm('ลบรายการนี้?')) return
    setDeletingLabId(id)
    await supabase.from('tb_lab_results').delete().eq('id', id)
    setLabRows(prev => prev.filter(r => r.id !== id))
    setDeletingLabId(null)
  }

  function openAddCxr() { setEditingCxrId(null); setCxrForm(DEFAULT_CXR); setCxrModal(true) }
  function openEditCxr(row: CxrResult) {
    setEditingCxrId(row.id)
    setCxrForm({ test_date: row.test_date || '', cxr_result: row.cxr_result || '', abnormal_result: row.abnormal_result || '', xn: row.xn || '', hospital: row.hospital || 'โรงพยาบาลสากเหล็ก' })
    setCxrModal(true)
  }
  async function saveCxr() {
    setSavingCxr(true)
    const payload = { patient_id: params.id, test_date: cxrForm.test_date || null, cxr_result: cxrForm.cxr_result || null, abnormal_result: cxrForm.abnormal_result || null, xn: cxrForm.xn || null, hospital: cxrForm.hospital || null }
    if (editingCxrId) {
      const { error } = await supabase.from('tb_cxr_results').update(payload).eq('id', editingCxrId)
      if (error) { console.error('CXR update error:', error); setMsg('❌ ' + error.message); setSavingCxr(false); return }
      setCxrRows(prev => prev.map(r => r.id === editingCxrId ? { ...r, ...cxrForm, id: editingCxrId, patient_id: params.id } : r))
    } else {
      const { data, error } = await supabase.from('tb_cxr_results').insert(payload).select().single()
      if (error) { console.error('CXR insert error:', error); setMsg('❌ ' + error.message); setSavingCxr(false); return }
      if (data) setCxrRows(prev => [data, ...prev])
    }
    setSavingCxr(false); setCxrModal(false)
  }
  async function deleteCxr(id: string) {
    if (!confirm('ลบรายการนี้?')) return
    setDeletingCxrId(id)
    await supabase.from('tb_cxr_results').delete().eq('id', id)
    setCxrRows(prev => prev.filter(r => r.id !== id))
    setDeletingCxrId(null)
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#94a3b8', fontSize: 14 }}>⏳ กำลังโหลดข้อมูล...</div>
  )

  const displayName = [form.title, form.first_name, form.last_name].filter(Boolean).join(' ') || form.first_name

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '18px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => router.back()} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 13, color: '#475569', cursor: 'pointer' }}>← กลับ</button>
            <div style={{ width: 1, height: 20, background: '#e2e8f0' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, background: '#fee2e2', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🫁</div>
              <div>
                <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: 0 }}>แก้ไขข้อมูลผู้ป่วย</h1>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0 0' }}>{displayName}</p>
              </div>
            </div>
          </div>
          <button onClick={handleDelete} disabled={deleting} style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>🗑 ลบข้อมูล</button>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '14px 32px', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', overflowX: 'auto' }}>
          {STEPS.map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
              <button type="button" onClick={() => goTo(i)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 10px', borderRadius: 8, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', background: i === activeStep ? '#eff6ff' : 'transparent' }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0, background: i < activeStep ? '#22c55e' : i === activeStep ? '#2563eb' : '#e2e8f0', color: i <= activeStep ? '#fff' : '#94a3b8' }}>
                  {i < activeStep ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: 12, fontWeight: i === activeStep ? 700 : 400, color: i === activeStep ? '#2563eb' : i < activeStep ? '#22c55e' : '#64748b' }}>{step}</span>
              </button>
              {i < STEPS.length - 1 && <div style={{ flex: 1, height: 2, background: i < activeStep ? '#22c55e' : '#e2e8f0', margin: '0 4px', minWidth: 16 }} />}
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '24px 32px', maxWidth: 1000 }}>
        <form onSubmit={handleSubmit}>

          {/* ส่วน 1 */}
          <div ref={el => { sectionRefs.current[0] = el }} style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', marginBottom: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <SectionHeader num={1} title="ข้อมูลทะเบียน" color="#fef2f2" border="#fecaca" textColor="#b91c1c" />
            <div style={{ padding: '24px' }}>
              <div className="grid grid-cols-4 gap-4">
                <FormSelect label="ปีงบประมาณ" options={FISCAL_YEARS} value={form.fiscal_year} onChange={e => set('fiscal_year', e.target.value)} required />
                <FormInput label="รหัส TB No." value={form.tb_no} onChange={e => set('tb_no', e.target.value)} />
                <FormInput label="HN" value={form.hn} onChange={e => set('hn', e.target.value)} />
                <FormDateThai label="วันที่ขึ้นทะเบียน (พ.ศ.)" value={form.registered_date} onChange={v => set('registered_date', v)} />
              </div>
            </div>
          </div>

          {/* ส่วน 2 */}
          <div ref={el => { sectionRefs.current[1] = el }} style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', marginBottom: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <SectionHeader num={2} title="ข้อมูลผู้ป่วย" color="#fff7ed" border="#fed7aa" textColor="#c2410c" />
            <div style={{ padding: '24px' }}>
              <div className="grid grid-cols-5 gap-4">
                <FormSelect label="คำนำหน้า" options={TITLES} value={form.title} onChange={e => set('title', e.target.value)} />
                <div className="col-span-2"><FormInput label="ชื่อ" value={form.first_name} onChange={e => set('first_name', e.target.value)} required /></div>
                <div className="col-span-2"><FormInput label="นามสกุล" value={form.last_name} onChange={e => set('last_name', e.target.value)} /></div>
              </div>
              <div style={{ marginTop: 16 }} className="grid grid-cols-4 gap-4">
                <FormInput label="เลขบัตรประชาชน" value={form.id_card} onChange={e => set('id_card', e.target.value)} />
                <FormDateThai label="วันเกิด (พ.ศ.)" value={form.birth_date} onChange={handleBirthDate} />
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">อายุ (คำนวณอัตโนมัติ)</label>
                  <div style={{ padding: '9px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, color: '#334155', minHeight: 38 }}>
                    {form.age ? `${form.age} ปี ${form.age_months} เดือน` : <span style={{ color: '#94a3b8' }}>กรอกวันเกิด</span>}
                  </div>
                </div>
                <FormSelect label="สิทธิ์การรักษา" options={MEDICAL_RIGHTS} value={form.medical_right} onChange={e => set('medical_right', e.target.value)} />
              </div>
              <div style={{ marginTop: 16 }} className="grid grid-cols-4 gap-4">
                <FormSelect label="ประชากร" options={POPULATIONS} value={form.population_type} onChange={e => set('population_type', e.target.value)} />
                <FormSelect label="สัญชาติ" options={NATIONALITIES} value={form.nationality} onChange={e => set('nationality', e.target.value)} />
                <div className="col-span-2"><FormInput label="ที่อยู่ (บ้านเลขที่ ซอย ถนน)" value={form.address} onChange={e => set('address', e.target.value)} /></div>
              </div>
              <div style={{ marginTop: 16 }} className="grid grid-cols-4 gap-4">
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
            </div>
          </div>

          {/* ส่วน 3 */}
          <div ref={el => { sectionRefs.current[2] = el }} style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', marginBottom: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <SectionHeader num={3} title="การวินิจฉัยและตรวจ" color="#eff6ff" border="#bfdbfe" textColor="#1d4ed8" />
            <div style={{ padding: '24px' }}>
              <div className="grid grid-cols-3 gap-4">
                <FormSelect label="การวินิจฉัย (ICD-10)" options={ICD10_OPTIONS} value={form.icd10} onChange={e => set('icd10', e.target.value)} />
                <FormInput label="ผลการวินิจฉัย" value={form.xpert_result} onChange={e => set('xpert_result', e.target.value)} placeholder="เช่น MTB detected, Neg, 1+" />
                <FormSelect label="ประเภทปอด (IP/EP)" options={LUNG_TYPES} value={form.lung_type} onChange={e => set('lung_type', e.target.value)} />
              </div>
            </div>
          </div>

          {/* ส่วน 4 */}
          <div ref={el => { sectionRefs.current[3] = el }} style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', marginBottom: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <SectionHeader num={4} title="การรักษา" color="#f0fdf4" border="#bbf7d0" textColor="#15803d" />
            <div style={{ padding: '24px' }}>
              <div className="grid grid-cols-2 gap-4">
                <SearchableSelect label="สถานที่ตรวจพบ" options={THAI_HOSPITALS} value={form.detected_place} onChange={v => set('detected_place', v)} />
                <SearchableSelect label="สถานที่รักษา" options={THAI_HOSPITALS} value={form.treatment_place} onChange={v => set('treatment_place', v)} />
              </div>
              <div style={{ marginTop: 16 }} className="grid grid-cols-2 gap-4">
                <FormInput label="วันที่เริ่มรักษา" type="date" value={form.treatment_start_date} onChange={e => set('treatment_start_date', e.target.value)} />
                <FormSelect label="ประเภทผู้ป่วย" options={PATIENT_TYPES} value={form.patient_type} onChange={e => set('patient_type', e.target.value)} />
              </div>
              <div style={{ marginTop: 16 }}>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">โรคประจำตัว</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', fontSize: 14 }}>
                    <input type="radio" name="risk_has" value="none" checked={form.risk_has === 'none'} onChange={e => { set('risk_has', e.target.value); set('risk_group', '') }} style={{ accentColor: '#2563eb' }} />
                    ไม่มี
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', fontSize: 14 }}>
                    <input type="radio" name="risk_has" value="yes" checked={form.risk_has === 'yes'} onChange={e => set('risk_has', e.target.value)} style={{ accentColor: '#2563eb' }} />
                    ระบุ
                  </label>
                  {form.risk_has === 'yes' && (
                    <div style={{ flex: 1, minWidth: 250 }}>
                      <FormInput label="" value={form.risk_group} onChange={e => set('risk_group', e.target.value)} placeholder="เช่น DM, HT, ผู้สูงอายุ" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ส่วน 5 */}
          <div ref={el => { sectionRefs.current[4] = el }} style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', marginBottom: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <SectionHeader num={5} title="ผลระหว่างการรักษา" color="#fefce8" border="#fde68a" textColor="#854d0e" />
            <div style={{ padding: '16px 24px' }}>
              {/* ─── CXR Table ─── */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
                <button type="button" onClick={openAddCxr} style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 6px rgba(220,38,38,0.3)' }}>
                  + เพิ่มรายการ CXR
                </button>
              </div>
              <div style={{ overflowX: 'auto', borderRadius: 10, border: '1px solid #cbd5e1', marginBottom: 20 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 620 }}>
                  <thead>
                    <tr style={{ background: '#1e3a5f', color: '#fff' }}>
                      {['ลำดับ','วันที่ตรวจ','ผล CXR','ผล Abnormal','XN','หน่วยงาน','แก้ไข','ลบ'].map(h => (
                        <th key={h} style={{ padding: '9px 10px', whiteSpace: 'nowrap', textAlign: 'center', fontWeight: 600, fontSize: 11 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cxrRows.length === 0 ? (
                      <tr><td colSpan={8} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8', fontSize: 13 }}>ยังไม่มีข้อมูล CXR — กด <b>+ เพิ่มรายการ CXR</b> เพื่อเพิ่ม</td></tr>
                    ) : cxrRows.map((row, i) => (
                      <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#f8fafc', opacity: deletingCxrId === row.id ? 0.5 : 1 }}>
                        <td style={{ padding: '7px 8px', textAlign: 'center', color: '#94a3b8', fontWeight: 600 }}>{i + 1}</td>
                        <td style={{ padding: '7px 8px', textAlign: 'center', whiteSpace: 'nowrap', color: '#475569' }}>{toThaiBE(row.test_date)}</td>
                        <td style={{ padding: '7px 8px', textAlign: 'center', color: row.cxr_result === 'Abnormal' ? '#dc2626' : row.cxr_result === 'Normal' ? '#15803d' : '#475569', fontWeight: row.cxr_result === 'Abnormal' ? 700 : 400 }}>{row.cxr_result || '-'}</td>
                        <td style={{ padding: '7px 8px', textAlign: 'center', color: '#475569' }}>{row.abnormal_result || '-'}</td>
                        <td style={{ padding: '7px 8px', textAlign: 'center', color: '#475569' }}>{row.xn || '-'}</td>
                        <td style={{ padding: '7px 10px', whiteSpace: 'nowrap', color: '#475569' }}>{row.hospital || '-'}</td>
                        <td style={{ padding: '7px 8px', textAlign: 'center' }}>
                          <button type="button" onClick={() => openEditCxr(row)} style={{ background: '#fef9c3', border: '1px solid #fde68a', borderRadius: 6, padding: '3px 8px', cursor: 'pointer', fontSize: 13 }}>✏️</button>
                        </td>
                        <td style={{ padding: '7px 8px', textAlign: 'center' }}>
                          <button type="button" onClick={() => deleteCxr(row.id)} disabled={deletingCxrId === row.id} style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, padding: '3px 8px', cursor: 'pointer', color: '#dc2626', fontSize: 13 }}>🗑</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ─── Lab Table ─── */}
              {/* Toolbar */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
                <button type="button" onClick={openAddLab} style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 6px rgba(220,38,38,0.3)' }}>
                  + เพิ่มรายการ LAB
                </button>
              </div>
              {/* Lab table */}
              <div style={{ overflowX: 'auto', borderRadius: 10, border: '1px solid #cbd5e1' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 860 }}>
                  <thead>
                    <tr style={{ background: '#1e3a5f', color: '#fff' }}>
                      <th style={{ padding: '9px 10px', whiteSpace: 'nowrap', textAlign: 'center', fontWeight: 600, fontSize: 11 }}>แก้ไข</th>
                      <th style={{ padding: '9px 10px', whiteSpace: 'nowrap', textAlign: 'center', fontWeight: 600, fontSize: 11 }}>ลำดับ</th>
                      <th style={{ padding: '9px 10px', whiteSpace: 'nowrap', textAlign: 'center', fontWeight: 600, fontSize: 11 }}>Lab No.</th>
                      <th style={{ padding: '9px 10px', whiteSpace: 'nowrap', textAlign: 'center', fontWeight: 600, fontSize: 11 }}>วันที่ตรวจ</th>
                      <th style={{ padding: '9px 10px', whiteSpace: 'nowrap', textAlign: 'center', fontWeight: 600, fontSize: 11 }}>สาเหตุการตรวจ</th>
                      <th colSpan={5} style={{ padding: '9px 10px', textAlign: 'center', borderLeft: '1px solid #2d5a8e', fontWeight: 600, fontSize: 11 }}>Lab Result</th>
                      <th style={{ padding: '9px 10px', whiteSpace: 'nowrap', textAlign: 'center', borderLeft: '1px solid #2d5a8e', fontWeight: 600, fontSize: 11 }}>ร.พ.ส่งตรวจ</th>
                      <th style={{ padding: '9px 10px', textAlign: 'center', fontWeight: 600, fontSize: 11 }}>ลบ</th>
                    </tr>
                    <tr style={{ background: '#2d5a8e', color: '#cbd5e1' }}>
                      <th colSpan={5} />
                      {['Smear','Molecular','Xpert MTB/RIF','Culture','DST'].map(h => (
                        <th key={h} style={{ padding: '6px 8px', whiteSpace: 'nowrap', fontSize: 10, fontWeight: 600, textAlign: 'center' }}>{h}</th>
                      ))}
                      <th colSpan={2} />
                    </tr>
                  </thead>
                  <tbody>
                    {labRows.length === 0 ? (
                      <tr><td colSpan={12} style={{ textAlign: 'center', padding: '28px', color: '#94a3b8', fontSize: 13 }}>ยังไม่มีข้อมูล Lab — กด <b>+ เพิ่มรายการ LAB</b> เพื่อเพิ่ม</td></tr>
                    ) : labRows.map((row, i) => (
                      <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#f8fafc', opacity: deletingLabId === row.id ? 0.5 : 1 }}>
                        <td style={{ padding: '7px 8px', textAlign: 'center' }}>
                          <button type="button" onClick={() => openEditLab(row)} style={{ background: '#fef9c3', border: '1px solid #fde68a', borderRadius: 6, padding: '3px 8px', cursor: 'pointer', fontSize: 13 }}>✏️</button>
                        </td>
                        <td style={{ padding: '7px 8px', textAlign: 'center', color: '#94a3b8', fontWeight: 600 }}>{i + 1}</td>
                        <td style={{ padding: '7px 8px', textAlign: 'center', fontFamily: 'monospace', color: '#334155' }}>{row.lab_no || '-'}</td>
                        <td style={{ padding: '7px 8px', textAlign: 'center', whiteSpace: 'nowrap', color: '#475569' }}>{toThaiBE(row.test_date)}</td>
                        <td style={{ padding: '7px 8px', whiteSpace: 'nowrap', color: '#334155', fontWeight: 500 }}>{row.test_reason || '-'}</td>
                        <td style={{ padding: '7px 8px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                          {[row.smear_1, row.smear_2, row.smear_3].map((s, j) => (
                            <span key={j}>
                              {j > 0 && <span style={{ color: '#cbd5e1' }}> | </span>}
                              <span style={{ color: s && s !== 'ไม่ได้ส่ง' && s !== '-' ? (s === 'Neg' ? '#15803d' : '#dc2626') : '#94a3b8' }}>{s || '-'}</span>
                            </span>
                          ))}
                        </td>
                        <td style={{ padding: '7px 8px', textAlign: 'center', color: '#475569' }}>{row.molecular || '-'}</td>
                        <td style={{ padding: '7px 8px', textAlign: 'center', whiteSpace: 'nowrap', color: row.xpert?.toLowerCase().includes('detected') ? '#dc2626' : '#475569', fontWeight: row.xpert?.toLowerCase().includes('detected') ? 700 : 400 }}>{row.xpert || '-'}</td>
                        <td style={{ padding: '7px 8px', textAlign: 'center', color: '#475569' }}>{row.culture || '-'}</td>
                        <td style={{ padding: '7px 8px', textAlign: 'center', color: '#475569' }}>{row.dst || '-'}</td>
                        <td style={{ padding: '7px 10px', whiteSpace: 'nowrap', color: '#475569' }}>{row.hospital || '-'}</td>
                        <td style={{ padding: '7px 8px', textAlign: 'center' }}>
                          <button type="button" onClick={() => deleteLab(row.id)} disabled={deletingLabId === row.id} style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, padding: '3px 8px', cursor: 'pointer', color: '#dc2626', fontSize: 13 }}>🗑</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* ผลการรักษา */}
              <div style={{ marginTop: 16, maxWidth: 280 }}>
                <FormSelect label="ผลการรักษา" options={OUTCOMES} value={form.treatment_outcome} onChange={e => set('treatment_outcome', e.target.value)} />
              </div>
            </div>
          </div>

          {/* ส่วน 6 */}
          <div ref={el => { sectionRefs.current[5] = el }} style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', marginBottom: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <SectionHeader num={6} title="ผู้ดูแลและติดต่อ" color="#f5f3ff" border="#ddd6fe" textColor="#6d28d9" />
            <div style={{ padding: '24px' }}>
              <div className="grid grid-cols-3 gap-4">
                <FormInput label="ญาติผู้ดูแล" value={form.caregiver_name} onChange={e => set('caregiver_name', e.target.value)} />
                <FormInput label="เบอร์โทรศัพท์" value={form.phone} onChange={e => set('phone', e.target.value)} />
              </div>
              <div style={{ marginTop: 16 }}>
                <FormTextArea label="หมายเหตุ" value={form.notes} onChange={e => set('notes', e.target.value)} />
              </div>
            </div>
          </div>

          {msg && (
            <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, padding: '14px 24px', borderRadius: 12, background: msg.includes('✅') ? '#f0fdf4' : '#fef2f2', color: msg.includes('✅') ? '#15803d' : '#b91c1c', fontSize: 13, fontWeight: 600, border: `1px solid ${msg.includes('✅') ? '#bbf7d0' : '#fecaca'}`, boxShadow: '0 4px 20px rgba(0,0,0,0.25)', maxWidth: 600, wordBreak: 'break-word', textAlign: 'center', cursor: 'pointer' }} onClick={() => setMsg('')}>{msg} <span style={{fontSize:11,opacity:0.6}}>(คลิกเพื่อปิด)</span></div>
          )}
          <div style={{ display: 'flex', gap: 10, paddingBottom: 40 }}>
            <button type="submit" disabled={saving} style={{ background: saving ? '#93c5fd' : '#2563eb', color: '#fff', padding: '12px 28px', borderRadius: 10, fontSize: 15, fontWeight: 600, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', boxShadow: '0 2px 8px rgba(37,99,235,0.3)' }}>
              {saving ? '⏳ กำลังบันทึก...' : '💾 บันทึก'}
            </button>
            <button type="button" onClick={() => router.back()} style={{ background: '#fff', color: '#475569', padding: '12px 22px', borderRadius: 10, fontSize: 15, border: '1px solid #e2e8f0', cursor: 'pointer' }}>ยกเลิก</button>
          </div>
        </form>
      </div>

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
