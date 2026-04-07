'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { FormInput, FormSelect, FormTextArea, SectionTitle } from '@/components/FormComponents'

const YEARS = [2569, 2568, 2567, 2566].map(y => ({ value: String(y), label: `ปีงบ ${y}` }))
const REGIMENS = ['2HRZE/4HR', '2HRZE/7HR', '3HRZE/4HR', '3HRZE/6HR', '4HRZE/6HR', '2HRE/7HR', '6RZEL', '12IEL', '12 RZL'].map(v => ({ value: v, label: v }))

export default function NewAppointmentPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({
    fiscal_year: '2568', tb_no: '', hn: '', full_name: '', address: '',
    id_card: '', phone: '', underlying_disease: '',
    treatment_start_date: '', treatment_end_date: '', regimen: '2HRZE/4HR',
    dose_isoniazid: '', dose_rifampicin: '', dose_pyrazinamide: '', dose_ethambutol: '', dose_levofloxacin: '',
    appt_2weeks: '',
    appt_m1: '', appt_m2: '', appt_m3: '', appt_m4: '', appt_m5: '', appt_m6: '',
    appt_m7: '', appt_m8: '', appt_m9: '', appt_m10: '', appt_m11: '', appt_m12: '',
    appt_lab: '', notes: ''
  })
  const set = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setMsg('')
    const payload = { ...form, fiscal_year: parseInt(form.fiscal_year) }
    const { error } = await supabase.from('appointments').insert(payload)
    setSaving(false)
    if (error) setMsg('❌ ' + error.message)
    else { setMsg('✅ บันทึกสำเร็จ'); setTimeout(() => router.push('/appointments'), 1200) }
  }

  return (
    <div className="p-8 max-w-4xl">
      <button onClick={() => router.back()} className="text-sm text-gray-500 mb-3">← กลับ</button>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">เพิ่มตารางนัดรับยาวัณโรค</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="grid grid-cols-2 gap-4">
          <SectionTitle>ข้อมูลผู้ป่วย</SectionTitle>
          <FormSelect label="ปีงบประมาณ" options={YEARS} value={form.fiscal_year} onChange={e => set('fiscal_year', e.target.value)} required />
          <FormInput label="TB No." value={form.tb_no} onChange={e => set('tb_no', e.target.value)} />
          <FormInput label="HN" value={form.hn} onChange={e => set('hn', e.target.value)} />
          <FormInput label="ชื่อ-สกุล" value={form.full_name} onChange={e => set('full_name', e.target.value)} required />
          <FormInput label="เลขบัตรประชาชน" value={form.id_card} onChange={e => set('id_card', e.target.value)} />
          <FormInput label="เบอร์โทรศัพท์" value={form.phone} onChange={e => set('phone', e.target.value)} />
          <div className="col-span-full">
            <FormInput label="ที่อยู่" value={form.address} onChange={e => set('address', e.target.value)} />
          </div>
          <div className="col-span-full">
            <FormInput label="โรคประจำตัว" value={form.underlying_disease} onChange={e => set('underlying_disease', e.target.value)} placeholder="เช่น DM, HT, CKD" />
          </div>

          <SectionTitle>การรักษา</SectionTitle>
          <FormInput label="วันที่เริ่มรักษา" type="date" value={form.treatment_start_date} onChange={e => set('treatment_start_date', e.target.value)} />
          <FormInput label="วันที่สิ้นสุดรักษา" type="date" value={form.treatment_end_date} onChange={e => set('treatment_end_date', e.target.value)} />
          <FormSelect label="สูตรยา" options={REGIMENS} value={form.regimen} onChange={e => set('regimen', e.target.value)} />

          <SectionTitle>ขนาดยา (Dose)</SectionTitle>
          <FormInput label="Isoniazid (H)" value={form.dose_isoniazid} onChange={e => set('dose_isoniazid', e.target.value)} placeholder="เช่น 300 mg. 1x1" />
          <FormInput label="Rifampicin (R)" value={form.dose_rifampicin} onChange={e => set('dose_rifampicin', e.target.value)} placeholder="เช่น 450 mg. 1x1" />
          <FormInput label="Pyrazinamide (Z)" value={form.dose_pyrazinamide} onChange={e => set('dose_pyrazinamide', e.target.value)} placeholder="เช่น 1000 mg. 1x1" />
          <FormInput label="Ethambutol (E)" value={form.dose_ethambutol} onChange={e => set('dose_ethambutol', e.target.value)} placeholder="เช่น 800 mg. 1x1" />
          <FormInput label="Levofloxacin (L)" value={form.dose_levofloxacin} onChange={e => set('dose_levofloxacin', e.target.value)} placeholder="เช่น 500 mg. 1x1 หรือ -" />

          <SectionTitle>วันนัดรับยา</SectionTitle>
          <div className="col-span-full">
            <FormInput label="ครบ 2 สัปดาห์ (นัดรับยาเดือนที่ 1)" value={form.appt_2weeks} onChange={e => set('appt_2weeks', e.target.value)} placeholder="เช่น 19/10/2568+LFT" />
          </div>
          {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
            <FormInput key={m} label={`นัดรับยาเดือนที่ ${m}`} type="date"
              value={(form as Record<string, string>)[`appt_m${m}`]}
              onChange={e => set(`appt_m${m}`, e.target.value)} />
          ))}
          <div className="col-span-full">
            <FormInput label="นัดตรวจ (CXR+AFB)" value={form.appt_lab} onChange={e => set('appt_lab', e.target.value)} placeholder="เช่น 25/12/2568 (CXR+AFB x 3 day)" />
          </div>
          <div className="col-span-full">
            <FormTextArea label="หมายเหตุ" value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>
        </div>
        {msg && <div className="mt-4 text-sm font-medium">{msg}</div>}
        <div className="flex gap-3 mt-6">
          <button type="submit" disabled={saving} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
            {saving ? 'กำลังบันทึก...' : '💾 บันทึก'}
          </button>
          <button type="button" onClick={() => router.back()} className="border border-gray-300 px-4 py-2 rounded-lg text-sm">ยกเลิก</button>
        </div>
      </form>
    </div>
  )
}
