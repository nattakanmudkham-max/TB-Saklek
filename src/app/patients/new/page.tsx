'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { FormInput, FormSelect, FormTextArea, SectionTitle } from '@/components/FormComponents'

const FISCAL_YEARS = [2568, 2567, 2566, 2565, 2564, 2563, 2562, 2561].map(y => ({ value: String(y), label: `ปีงบ ${y}` }))
const PATIENT_TYPES = ['NEW', 'Relapse', 'Transfer In', 'Treatment after failure', 'Treatment after loss to follow up'].map(v => ({ value: v, label: v }))
const RISK_GROUPS = ['DM', 'HIV/B24', 'ผู้สูงอายุ', 'COPD', 'CKD', 'HT', 'ผู้สัมผัสร่วมบ้าน', 'ผู้ต้องขัง', 'จิตเวช', 'อื่นๆ'].map(v => ({ value: v, label: v }))
const RESULTS = ['รักษาหาย', 'รักษาครบ(Completed)', 'เสียชีวิต(Died)', 'โอนออก(Transfered out)', 'ขาดยา', 'ล้มเหลว'].map(v => ({ value: v, label: v }))
const AFB_RESULTS = ['MTB detected', 'MTB Detected Low', 'MTB not detected', 'Neg', '1+', '2+', '3+', 'Error'].map(v => ({ value: v, label: v }))
const CXR_RESULTS = ['ปกติ', 'ผิดปกติ', 'สงสัย TB', 'ไม่ได้ CXR'].map(v => ({ value: v, label: v }))

export default function NewPatientPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const [form, setForm] = useState({
    fiscal_year: '2568',
    tb_no: '',
    hn: '',
    registered_date: '',
    full_name: '',
    age: '',
    address: '',
    icd10: '',
    xpert_result: '',
    is_ip: 'false',
    is_ep: 'false',
    detected_place: '',
    treatment_place: '',
    treatment_start_date: '',
    patient_type: '',
    risk_group: '',
    result_m2: '',
    result_m3: '',
    result_m5: '',
    result_m6: '',
    result_m7: '',
    result_m9: '',
    result_m10: '',
    result_m12: '',
    treatment_outcome: '',
    caregiver_name: '',
    phone: '',
    notes: '',
  })

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMsg('')
    const payload = {
      ...form,
      fiscal_year: parseInt(form.fiscal_year),
      age: form.age ? parseInt(form.age) : null,
      is_ip: form.is_ip === 'true',
      is_ep: form.is_ep === 'true',
    }
    const { error } = await supabase.from('tb_patients').insert(payload)
    setSaving(false)
    if (error) {
      setMsg('❌ เกิดข้อผิดพลาด: ' + error.message)
    } else {
      setMsg('✅ บันทึกสำเร็จ')
      setTimeout(() => router.push('/patients'), 1200)
    }
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700 mb-2">← กลับ</button>
        <h1 className="text-2xl font-bold text-gray-800">เพิ่มผู้ป่วยวัณโรค</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="grid grid-cols-2 gap-4">
          <SectionTitle>ข้อมูลทะเบียน</SectionTitle>
          <FormSelect label="ปีงบประมาณ" options={FISCAL_YEARS} value={form.fiscal_year} onChange={e => set('fiscal_year', e.target.value)} required />
          <FormInput label="TB No." value={form.tb_no} onChange={e => set('tb_no', e.target.value)} placeholder="เช่น 682797800001" />
          <FormInput label="HN" value={form.hn} onChange={e => set('hn', e.target.value)} />
          <FormInput label="วันที่ขึ้นทะเบียน" type="date" value={form.registered_date} onChange={e => set('registered_date', e.target.value)} />

          <SectionTitle>ข้อมูลผู้ป่วย</SectionTitle>
          <div className="col-span-full">
            <FormInput label="ชื่อ-สกุล" value={form.full_name} onChange={e => set('full_name', e.target.value)} required placeholder="เช่น นายสมชาย ใจดี" />
          </div>
          <FormInput label="อายุ (ปี)" type="number" value={form.age} onChange={e => set('age', e.target.value)} min="0" max="150" />
          <div className="col-span-full">
            <FormInput label="ที่อยู่" value={form.address} onChange={e => set('address', e.target.value)} placeholder="เช่น 99 ม.1 ต.สากเหล็ก อ.สากเหล็ก จ.พิจิตร" />
          </div>

          <SectionTitle>การวินิจฉัยและตรวจ</SectionTitle>
          <FormInput label="การวินิจฉัย (ICD-10)" value={form.icd10} onChange={e => set('icd10', e.target.value)} placeholder="เช่น A150, A151, A169" />
          <FormSelect label="ผล X-pert MTB/RIF" options={AFB_RESULTS} value={form.xpert_result} onChange={e => set('xpert_result', e.target.value)} />
          <FormSelect label="IP (ในปอด)" options={[{value:'true',label:'ใช่'},{value:'false',label:'ไม่ใช่'}]} value={form.is_ip} onChange={e => set('is_ip', e.target.value)} />
          <FormSelect label="EP (นอกปอด)" options={[{value:'true',label:'ใช่'},{value:'false',label:'ไม่ใช่'}]} value={form.is_ep} onChange={e => set('is_ep', e.target.value)} />

          <SectionTitle>การรักษา</SectionTitle>
          <FormInput label="สถานที่ตรวจพบ" value={form.detected_place} onChange={e => set('detected_place', e.target.value)} placeholder="เช่น รพ.สากเหล็ก" />
          <FormInput label="สถานที่รักษา" value={form.treatment_place} onChange={e => set('treatment_place', e.target.value)} placeholder="เช่น รพ.พิจิตร" />
          <FormInput label="วันที่เริ่มรักษา" type="date" value={form.treatment_start_date} onChange={e => set('treatment_start_date', e.target.value)} />
          <FormSelect label="ประเภทผู้ป่วย" options={PATIENT_TYPES} value={form.patient_type} onChange={e => set('patient_type', e.target.value)} />
          <div className="col-span-full">
            <FormInput label="กลุ่มเสี่ยง" value={form.risk_group} onChange={e => set('risk_group', e.target.value)} placeholder="เช่น DM, HT, ผู้สูงอายุ" />
          </div>

          <SectionTitle>ผลระหว่างการรักษา</SectionTitle>
          <FormSelect label="ผลเดือนที่ 2 (M2)" options={CXR_RESULTS} value={form.result_m2} onChange={e => set('result_m2', e.target.value)} />
          <FormSelect label="ผลเดือนที่ 3 (M3)" options={CXR_RESULTS} value={form.result_m3} onChange={e => set('result_m3', e.target.value)} />
          <FormSelect label="ผลเดือนที่ 5 (M5)" options={CXR_RESULTS} value={form.result_m5} onChange={e => set('result_m5', e.target.value)} />
          <FormSelect label="ผลเดือนที่ 6 (M6)" options={CXR_RESULTS} value={form.result_m6} onChange={e => set('result_m6', e.target.value)} />
          <FormSelect label="ผลเดือนที่ 7 (M7)" options={CXR_RESULTS} value={form.result_m7} onChange={e => set('result_m7', e.target.value)} />
          <FormSelect label="ผลเดือนที่ 9 (M9)" options={CXR_RESULTS} value={form.result_m9} onChange={e => set('result_m9', e.target.value)} />
          <FormSelect label="ผลเดือนที่ 10 (M10)" options={CXR_RESULTS} value={form.result_m10} onChange={e => set('result_m10', e.target.value)} />
          <FormSelect label="ผลเดือนที่ 12 (M12)" options={CXR_RESULTS} value={form.result_m12} onChange={e => set('result_m12', e.target.value)} />
          <FormSelect label="ผลการรักษา" options={RESULTS} value={form.treatment_outcome} onChange={e => set('treatment_outcome', e.target.value)} />

          <SectionTitle>ผู้ดูแลและติดต่อ</SectionTitle>
          <FormInput label="ญาติผู้ดูแล" value={form.caregiver_name} onChange={e => set('caregiver_name', e.target.value)} />
          <FormInput label="เบอร์โทรศัพท์" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="0XX-XXXXXXX" />
          <div className="col-span-full">
            <FormTextArea label="หมายเหตุ" value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>
        </div>

        {msg && <div className="mt-4 text-sm font-medium">{msg}</div>}

        <div className="flex gap-3 mt-6">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'กำลังบันทึก...' : '💾 บันทึก'}
          </button>
          <button type="button" onClick={() => router.back()} className="border border-gray-300 px-4 py-2 rounded-lg text-sm">
            ยกเลิก
          </button>
        </div>
      </form>
    </div>
  )
}
