'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { FormInput, FormSelect, FormTextArea, FormDateThai, SearchableSelect } from '@/components/FormComponents'
import { THAI_HOSPITALS } from '@/data/thai_hospitals'
import { PROVINCES, DISTRICTS_BY_PROVINCE, SUBDISTRICTS_BY_DISTRICT } from '@/data/thai_geography'

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
const CXR_MONTHS = Array.from({ length: 12 }, (_, i) => ({ value: `CXR เดือนที่ ${i + 1}`, label: `CXR เดือนที่ ${i + 1}` }))
const AFB_MONTHS = Array.from({ length: 12 }, (_, i) => ({ value: `AFB เดือนที่ ${i + 1}`, label: `AFB เดือนที่ ${i + 1}` }))
const TITLES = ['นาย','นาง','นางสาว','เด็กชาย','เด็กหญิง'].map(v => ({ value: v, label: v }))
const MEDICAL_RIGHTS = ['สวัสดิการข้าราชการ','ประกันสังคม','บัตรทอง/30 บาท','ชำระเอง','อื่นๆ'].map(v => ({ value: v, label: v }))
const NATIONALITIES = ['ไทย','พม่า','ลาว','กัมพูชา','เวียดนาม','จีน','อื่นๆ'].map(v => ({ value: v, label: v }))
const POPULATIONS = ['ไทย','ต่างด้าว','แรงงานต่างชาติ'].map(v => ({ value: v, label: v }))
const STEPS = ['ข้อมูลทะเบียน','ข้อมูลผู้ป่วย','การวินิจฉัยและตรวจ','การรักษา','ผลระหว่างการรักษา','ผู้ดูแลและติดต่อ']

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
        setForm({
          fiscal_year: String(data.fiscal_year ?? '2568'),
          tb_no: String(data.tb_no ?? ''),
          hn: String(data.hn ?? ''),
          registered_date: data.registered_date ?? '',
          title: data.title ?? '',
          first_name: data.first_name ?? (data.title ? '' : (data.full_name ?? '')),
          last_name: data.last_name ?? '',
          id_card: data.id_card ?? '',
          birth_date: birthIso,
          age: birthIso ? String(years) : String(data.age ?? ''),
          age_months: birthIso ? String(months) : '',
          population_type: data.population_type ?? '',
          nationality: data.nationality ?? '',
          medical_right: data.medical_right ?? '',
          address: data.address ?? '',
          village_no: data.village_no ?? '',
          province: data.province ?? '',
          district: data.district ?? '',
          subdistrict: data.subdistrict ?? '',
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

    // Only send confirmed DB columns — omit potentially missing columns instead of sending null
    const fieldMap: Record<string, string> = {
      hn: 'hn', registered_date: 'registered_date',
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
    if (form.age) payload.age = parseInt(form.age)

    const { error } = await supabase.from('tb_patients').update(payload).eq('id', params.id)
    setSaving(false)
    if (error) setMsg('❌ เกิดข้อผิดพลาด: ' + error.message)
    else { setMsg('✅ บันทึกสำเร็จ'); setTimeout(() => router.push('/patients'), 1200) }
  }

  async function handleDelete() {
    if (!confirm('ยืนยันการลบข้อมูลผู้ป่วยรายนี้?')) return
    setDeleting(true)
    await supabase.from('tb_patients').delete().eq('id', params.id)
    router.push('/patients')
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
            <div style={{ padding: '24px' }}>
              <div className="grid grid-cols-2 gap-4" style={{ marginBottom: 16 }}>
                <FormSelect label="ผล CXR (เดือนที่)" options={CXR_MONTHS} value={form.cxr_result} onChange={e => set('cxr_result', e.target.value)} />
                <FormDateThai label="วันที่ CXR (พ.ศ.)" value={form.cxr_date} onChange={v => set('cxr_date', v)} />
              </div>
              <div className="grid grid-cols-3 gap-4" style={{ marginBottom: 16 }}>
                <FormSelect label="ผลเสมหะ (เดือนที่)" options={AFB_MONTHS} value={form.sputum_result} onChange={e => set('sputum_result', e.target.value)} />
                <FormInput label="เลข Lab TB." value={form.sputum_lab_no} onChange={e => set('sputum_lab_no', e.target.value)} placeholder="หมายเลขตัวอย่าง" />
                <FormDateThai label="วันที่ตรวจเสมหะ (พ.ศ.)" value={form.sputum_date} onChange={v => set('sputum_date', v)} />
              </div>
              <div className="grid grid-cols-3 gap-4">
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
            <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', zIndex: 999, padding: '14px 24px', borderRadius: 12, background: msg.includes('✅') ? '#f0fdf4' : '#fef2f2', color: msg.includes('✅') ? '#15803d' : '#b91c1c', fontSize: 14, fontWeight: 600, border: `1px solid ${msg.includes('✅') ? '#bbf7d0' : '#fecaca'}`, boxShadow: '0 4px 20px rgba(0,0,0,0.15)', whiteSpace: 'nowrap' }}>{msg}</div>
          )}
          <div style={{ display: 'flex', gap: 10, paddingBottom: 40 }}>
            <button type="submit" disabled={saving} style={{ background: saving ? '#93c5fd' : '#2563eb', color: '#fff', padding: '12px 28px', borderRadius: 10, fontSize: 15, fontWeight: 600, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', boxShadow: '0 2px 8px rgba(37,99,235,0.3)' }}>
              {saving ? '⏳ กำลังบันทึก...' : '💾 บันทึก'}
            </button>
            <button type="button" onClick={() => router.back()} style={{ background: '#fff', color: '#475569', padding: '12px 22px', borderRadius: 10, fontSize: 15, border: '1px solid #e2e8f0', cursor: 'pointer' }}>ยกเลิก</button>
          </div>
        </form>
      </div>
    </div>
  )
}
